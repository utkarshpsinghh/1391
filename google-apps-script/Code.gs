/**
 * Kingdom 1391 Content Management & Enquiry Receiver
 * 
 * Optimized for high-speed delivery with single-batch sheet reads.
 * Enhanced with multi-layered anti-spam shields & dynamic column mapping.
 */

// Paste the Spreadsheet ID of your DETAILS sheet:
const DETAILS_SPREADSHEET_ID = '1-f8iKPpN7Leshbf_JzVL3QwbTpvU0j_3HlurXVI4nNY';

// Paste the Spreadsheet ID of your ENQUIRIES sheet:
const ENQUIRIES_SPREADSHEET_ID = '1NI7nsi0Zy23mndt7NzI2r4qog3TNE6r5s-Mc1b90Hd8';

// Paste your Google reCAPTCHA v2 Secret Key here:
const RECAPTCHA_SECRET_KEY = '6LeBsfgtAAAAAARQQmq2qacMjQ1y8jM8eg0-l128';

const DUPLICATE_WINDOW_HOURS = 24;

/**
 * Adds a custom menu to Google Sheets for easy one-click setup & spam cleaning
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Kingdom 1391')
    .addItem('🧹 Clean & Reorganize Sheet (New 10-Col Format)', 'cleanAndMigrateSheetToNewFormat')
    .addItem('Delete Spam Rows Only 🗑️', 'cleanSpamEnquiries')
    .addSeparator()
    .addItem('Initialize Details Sheet', 'setupDetailsSheet')
    .addItem('Initialize Enquiries Sheet', 'setupEnquiriesSheet')
    .addSeparator()
    .addItem('Initialize Both Sheets', 'setupKingdomSheets')
    .addToUi();
}

/**
 * Gets the Details Workbook (CMS content)
 */
function getDetailsWorkbook_() {
  try {
    if (DETAILS_SPREADSHEET_ID && DETAILS_SPREADSHEET_ID !== 'YOUR_DETAILS_SPREADSHEET_ID_HERE') {
      return SpreadsheetApp.openById(DETAILS_SPREADSHEET_ID);
    }
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(DETAILS_SPREADSHEET_ID);
}

/**
 * Gets the Enquiries Workbook (Application submissions)
 */
function getEnquiriesWorkbook_() {
  try {
    if (ENQUIRIES_SPREADSHEET_ID && ENQUIRIES_SPREADSHEET_ID !== 'YOUR_ENQUIRIES_SPREADSHEET_ID_HERE') {
      return SpreadsheetApp.openById(ENQUIRIES_SPREADSHEET_ID);
    }
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(ENQUIRIES_SPREADSHEET_ID);
}

/**
 * Fast GET handler: Reads all sheets in a single batch for maximum speed
 */
function doGet(e) {
  try {
    const wb = getDetailsWorkbook_();
    let sheets = wb.getSheets();
    let sheetMap = {};
    for (var i = 0; i < sheets.length; i++) {
      sheetMap[sheets[i].getName()] = sheets[i];
    }

    // Auto-create Leaderboard sheet if not created yet
    if (!sheetMap['Leaderboard']) {
      initDetailsSheetsIfMissing_(wb);
      sheets = wb.getSheets();
      sheetMap = {};
      for (var j = 0; j < sheets.length; j++) {
        sheetMap[sheets[j].getName()] = sheets[j];
      }
    }

    const settings = getSettingsDataFromSheet_(sheetMap['Settings']);
    const leadersMap = getAllianceLeadersMapFromSheet_(sheetMap['Alliance_Leaders']);
    const alliances = getAlliancesDataFromSheet_(sheetMap['Alliances'], leadersMap);
    const team = getTeamDataFromSheet_(sheetMap['Team']);
    const kvkRecords = getKvkDataFromSheet_(sheetMap['KVK_Records']);
    const news = getNewsDataFromSheet_(sheetMap['News']);
    const faq = getFaqDataFromSheet_(sheetMap['FAQ']);
    const leaderboard = getLeaderboardDataFromSheet_(sheetMap['Leaderboard']);
    const lastSyncedAt = getLeaderboardLastSyncedAt_(sheetMap['Leaderboard']);

    const payload = {
      ok: true,
      updatedAt: new Date().toISOString(),
      data: {
        settings: settings,
        alliances: alliances,
        team: team,
        kvkRecords: kvkRecords,
        news: news,
        faq: faq,
        leaderboard: leaderboard,
        lastSyncedAt: lastSyncedAt
      }
    };

    // Support JSONP if requested by client
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(payload) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }

    return json_(payload);
  } catch (err) {
    const errPayload = { ok: false, error: String(err) };
    const callback = e && e.parameter && e.parameter.callback;
    if (callback) {
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(errPayload) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return json_(errPayload);
  }
}

/**
 * Handle POST requests for transfer application submissions into ENQUIRIES sheet
 * Fortified with multi-layer anti-spam validation
 */
function doPost(event) {
  try {
    const payload = JSON.parse((event && event.postData && event.postData.contents) || '{}');
    
    // 0. Google reCAPTCHA verification check (if configured)
    if (RECAPTCHA_SECRET_KEY && RECAPTCHA_SECRET_KEY.trim() !== '') {
      if (!verifyGoogleRecaptcha_(payload.recaptchaToken)) {
        return json_({ ok: false, error: 'Google reCAPTCHA verification failed. Please complete the verification challenge.' });
      }
    }

    // 1. Mandatory application secret token check (drops direct automated script hits)
    const REQUIRED_TOKEN = 'K1391_ROYAL_LEDGER_AUTH_2026';
    if (!payload.securityToken || payload.securityToken !== REQUIRED_TOKEN) {
      return json_({ ok: true, ignored: true, reason: 'unauthorized_client' });
    }

    // 2. Kingdom verification code challenge (optional legacy fallback)
    if (payload.securityCode && String(payload.securityCode).trim() !== '1391') {
      return json_({ ok: true, ignored: true, reason: 'invalid_security_code' });
    }

    // 3. Honeypot check (hidden field)
    if (payload.website || !payload.playerName) {
      return json_({ ok: true, ignored: true, reason: 'honeypot' });
    }

    // 4. Minimum completion time check (must take at least 1.5 seconds)
    if (!payload.formStartedAt || Date.now() - Number(payload.formStartedAt) < 1500) {
      return json_({ ok: true, ignored: true, reason: 'too_fast' });
    }

    // 5. Pattern-based bot filters (specifically stops automated spam bots)
    const playerName = String(payload.playerName || '').trim();
    const playerId = String(payload.playerId || '').trim();
    const discord = String(payload.discordUsername || '').trim();
    const message = String(payload.message || '').trim();

    if (/^PLAYER\s*\d+$/i.test(playerName) || /^TEST\s*\d+$/i.test(playerName)) {
      return json_({ ok: true, ignored: true, reason: 'spam_name_pattern' });
    }
    if (/^\d{4}\s*1414$/.test(playerId)) {
      return json_({ ok: true, ignored: true, reason: 'spam_id_pattern' });
    }
    if (/stop\s*spam/i.test(discord) || /stop\s*spam/i.test(message) || /stop\s*spam/i.test(playerName)) {
      return json_({ ok: true, ignored: true, reason: 'spam_message' });
    }

    // 6. Global submission rate limiter using CacheService
    const cache = CacheService.getScriptCache();
    // 15-second cooldown lock between any two submissions
    if (cache.get('enquiry_lock')) {
      return json_({ ok: true, ignored: true, reason: 'cooldown_active' });
    }
    cache.put('enquiry_lock', '1', 15);

    // Hourly cap (maximum 15 submissions per hour)
    const hourBucket = 'enquiry_h_' + Math.floor(Date.now() / 3600000);
    const hourlyCount = Number(cache.get(hourBucket) || '0');
    if (hourlyCount >= 15) {
      return json_({ ok: true, ignored: true, reason: 'hourly_cap_exceeded' });
    }
    cache.put(hourBucket, String(hourlyCount + 1), 3600);

    // 7. Concurrency lock & duplicate check
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const wb = getEnquiriesWorkbook_();
    const sheet = getEnquiriesSheet_(wb);

    if (hasRecentDuplicate_(sheet, payload)) {
      lock.releaseLock();
      return json_({ ok: true, duplicate: true });
    }

    // 8. Column-aware dynamic row appending (matches headers dynamically so columns never shift)
    appendEnquiryRowDynamically_(sheet, payload);

    lock.releaseLock();
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

/**
 * Dynamically appends enquiry based on current sheet header names
 * Prevents column misalignments even if user adds or reorders columns like "FC / Key stats"
 */
function appendEnquiryRowDynamically_(sheet, payload) {
  const lastCol = Math.max(sheet.getLastColumn(), 16);
  const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const newRow = new Array(headers.length).fill('');

  for (var col = 0; col < headers.length; col++) {
    const h = String(headers[col] || '').toLowerCase().trim();
    if (!h) continue;

    if (h.includes('submitted')) {
      newRow[col] = new Date();
    } else if (h.includes('player name') || h === 'name') {
      newRow[col] = payload.playerName || '';
    } else if (h.includes('player id') || h === 'id' || h.includes('game id')) {
      newRow[col] = payload.playerId || '';
    } else if (h.includes('power')) {
      newRow[col] = payload.power || '';
    } else if (h.includes('fc') || h.includes('tg') || h.includes('center') || h.includes('stats')) {
      newRow[col] = payload.tgCenterLevel || payload.fcLevel || '';
    } else if (h.includes('current kingdom') || h.includes('kingdom')) {
      newRow[col] = payload.currentKingdom || '';
    } else if (h.includes('current alliance')) {
      newRow[col] = payload.currentAlliance || '';
    } else if (h.includes('archer')) {
      newRow[col] = payload.archersLevel || '';
    } else if (h.includes('infantry')) {
      newRow[col] = payload.infantryLevel || '';
    } else if (h.includes('cavalry')) {
      newRow[col] = payload.cavalryLevel || '';
    } else if (h.includes('preferred allian')) {
      newRow[col] = payload.preferredAlliance || '';
    } else if (h.includes('event time') || h.includes('preferred event')) {
      newRow[col] = payload.preferredEventTime || '';
    } else if (h.includes('playstyle')) {
      newRow[col] = payload.playstyle || '';
    } else if (h.includes('discord')) {
      newRow[col] = payload.discordUsername || '';
    } else if (h.includes('message')) {
      newRow[col] = payload.message || '';
    }
  }

  sheet.appendRow(newRow);
}

/**
 * Checks for recent duplicate enquiries within the duplicate window
 */
function hasRecentDuplicate_(sheet, payload) {
  const normPlayerId = normalize_(payload.playerId);
  const normName = normalize_(payload.playerName);
  const normDiscord = normalize_(payload.discordUsername);

  const identifier = normPlayerId || (normName && normDiscord ? normName + '|' + normDiscord : '');
  if (!identifier) return false;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const firstDataRow = Math.max(2, lastRow - 499);
  const rows = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, sheet.getLastColumn()).getValues();
  const cutoff = Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;

  return rows.some(function (row) {
    const submittedAt = new Date(row[0]).getTime();
    if (submittedAt < cutoff) return false;

    const rowPlayerId = normalize_(row[2]);
    const rowPlayerName = normalize_(row[1]);
    const rowDiscord = normalize_(row[13] || row[14]);

    if (normPlayerId && rowPlayerId && normPlayerId === rowPlayerId) {
      return true;
    }
    if (normName && normDiscord && rowPlayerName === normName && rowDiscord === normDiscord) {
      return true;
    }
    return false;
  });
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

/**
 * One-click helper function to clean spam rows from Enquiries sheet
 * Run this from the "Kingdom 1391" -> "Clean Spam Enquiries 🧹" menu in Google Sheets
 */
/**
 * One-click helper: Cleans all spam rows and restructures Enquiries sheet
 * to match the new 10-column Application page:
 * [Submitted at, Player Name, Game ID, Current Kingdom, Power, Current Alliance, Preferred Alliance, TG Center Level, Discord Username, Message]
 * Safely preserves genuine applicant rows and automatically backs up previous sheet data.
 */
function cleanAndMigrateSheetToNewFormat() {
  const ui = SpreadsheetApp.getUi();
  const wb = getEnquiriesWorkbook_();
  let sheet = wb.getSheetByName('Enquiries');
  if (!sheet) {
    sheet = getEnquiriesSheet_(wb);
    ui.alert('Created new Enquiries sheet with the clean 10-column layout.');
    return;
  }

  const lastRow = sheet.getLastRow();
  const lastCol = Math.max(sheet.getLastColumn(), 16);
  const oldHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  // Backup current sheet so no genuine data can ever be lost
  const tz = Session.getScriptTimeZone() || 'GMT';
  const backupName = 'Enquiries_Backup_' + Utilities.formatDate(new Date(), tz, 'yyyyMMdd_HHmmss');
  let backupSheet = wb.getSheetByName(backupName);
  if (!backupSheet) {
    backupSheet = sheet.copyTo(wb);
    backupSheet.setName(backupName);
  }

  // Find column indexes in current sheet dynamically
  const colMap = {};
  for (var c = 0; c < oldHeaders.length; c++) {
    const h = String(oldHeaders[c] || '').toLowerCase().trim();
    if (!h) continue;
    if (h.includes('submitted')) colMap.submitted = c;
    else if (h.includes('player name') || h === 'name') colMap.name = c;
    else if (h.includes('player id') || h === 'id' || h.includes('game id')) colMap.id = c;
    else if (h.includes('power')) colMap.power = c;
    else if (h.includes('current kingdom') || h.includes('kingdom')) colMap.kingdom = c;
    else if (h.includes('current alliance')) colMap.currAlliance = c;
    else if (h.includes('preferred allian')) colMap.prefAlliance = c;
    else if (h.includes('tg') || h.includes('center')) colMap.tgCenter = c;
    else if (h.includes('fc') || h.includes('stats')) colMap.fcStats = c;
    else if (h.includes('discord')) colMap.discord = c;
    else if (h.includes('message')) colMap.message = c;
  }

  const newHeaders = [
    'Submitted at',
    'Player Name',
    'Game ID',
    'Current Kingdom',
    'Power',
    'Current Alliance',
    'Preferred Alliance',
    'TG Center Level',
    'Discord Username',
    'Message'
  ];

  let cleanedRows = [];
  let spamCount = 0;

  if (lastRow >= 2) {
    const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    for (var i = 0; i < data.length; i++) {
      const row = data[i];
      const rowStr = row.map(function(cell) { return String(cell || ''); }).join(' ').toLowerCase();
      const name = String(colMap.name !== undefined ? row[colMap.name] : row[1] || '').trim();
      const id = String(colMap.id !== undefined ? row[colMap.id] : row[2] || '').trim();

      // Check if empty row
      if (!name && !id && !rowStr.trim()) {
        continue;
      }

      // Detect spam patterns
      const isSpam = 
        /^PLAYER\s*\d+$/i.test(name) ||
        /^TEST\s*\d+$/i.test(name) ||
        /^\d{4}\s*1414$/.test(id) ||
        rowStr.includes('stop spam') ||
        rowStr.includes('stopspam') ||
        rowStr.includes('spamming my sheets');

      if (isSpam) {
        spamCount++;
        continue;
      }

      // Map genuine applicant data to clean 10 columns
      const submitted = (colMap.submitted !== undefined ? row[colMap.submitted] : row[0]) || new Date();
      const kingdom = (colMap.kingdom !== undefined ? row[colMap.kingdom] : row[5]) || '';
      const power = (colMap.power !== undefined ? row[colMap.power] : row[3]) || '';
      const currAlliance = (colMap.currAlliance !== undefined ? row[colMap.currAlliance] : row[6]) || '';
      const prefAlliance = (colMap.prefAlliance !== undefined ? row[colMap.prefAlliance] : row[11]) || '';

      // For TG Center Level, check TG column first, then FC/stats column
      let tgLevel = '';
      if (colMap.tgCenter !== undefined && row[colMap.tgCenter]) {
        tgLevel = row[colMap.tgCenter];
      } else if (colMap.fcStats !== undefined && row[colMap.fcStats]) {
        tgLevel = row[colMap.fcStats];
      } else if (row[7]) {
        tgLevel = row[7];
      } else if (row[4]) {
        tgLevel = row[4];
      }

      const discord = (colMap.discord !== undefined ? row[colMap.discord] : (row[14] || row[13])) || '';
      const message = (colMap.message !== undefined ? row[colMap.message] : (row[15] || row[14])) || '';

      cleanedRows.push([
        submitted,
        name,
        id,
        kingdom,
        power,
        currAlliance,
        prefAlliance,
        tgLevel,
        discord,
        message
      ]);
    }
  }

  // Clear sheet content and format
  sheet.clear();
  sheet.clearFormats();

  // Write new headers
  sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
  sheet.getRange(1, 1, 1, newHeaders.length)
    .setFontWeight('bold')
    .setBackground('#1e4620')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');

  // Write cleaned genuine applicant rows
  if (cleanedRows.length > 0) {
    sheet.getRange(2, 1, cleanedRows.length, newHeaders.length).setValues(cleanedRows);
    sheet.getRange(2, 1, cleanedRows.length, newHeaders.length).setVerticalAlignment('middle');
  }

  // Trim excess columns
  const totalCols = sheet.getMaxColumns();
  if (totalCols > newHeaders.length) {
    sheet.deleteColumns(newHeaders.length + 1, totalCols - newHeaders.length);
  }

  sheet.setFrozenRows(1);
  for (var c = 1; c <= newHeaders.length; c++) {
    sheet.autoResizeColumn(c);
  }

  ui.alert(
    '✨ Enquiries Sheet Successfully Cleaned & Modernized!\n\n' +
    '• Removed ' + spamCount + ' spam rows.\n' +
    '• Preserved ' + cleanedRows.length + ' genuine applicants.\n' +
    '• Reorganized into 10 clean columns matching your new application form.\n' +
    '• Created safety backup in tab: "' + backupName + '".'
  );
}

function cleanSpamEnquiries() {
  const ui = SpreadsheetApp.getUi();
  const wb = getEnquiriesWorkbook_();
  const sheet = getEnquiriesSheet_(wb);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    ui.alert('Enquiries sheet is already clean.');
    return;
  }

  const lastCol = Math.max(sheet.getLastColumn(), 16);
  const data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  let deletedCount = 0;

  // Scan backwards so row indexes remain correct when deleting
  for (var i = data.length - 1; i >= 0; i--) {
    const row = data[i];
    const rowNum = i + 2;

    const rowStr = row.map(function(c) { return String(c || ''); }).join(' ').toLowerCase();
    const name = String(row[1] || '').trim();
    const id = String(row[2] || '').trim();

    const isSpam = 
      /^PLAYER\s*\d+$/i.test(name) ||
      /^TEST\s*\d+$/i.test(name) ||
      /^\d{4}\s*1414$/.test(id) ||
      rowStr.includes('stop spam') ||
      rowStr.includes('stopspam') ||
      rowStr.includes('spamming my sheets');

    if (isSpam) {
      sheet.deleteRow(rowNum);
      deletedCount++;
    }
  }

  ui.alert('🧹 Anti-Spam Cleanup Complete!\n\nDeleted ' + deletedCount + ' spam rows.');
}

/**
 * Validates Google reCAPTCHA token with Google's siteverify API
 */
function verifyGoogleRecaptcha_(token) {
  if (!RECAPTCHA_SECRET_KEY || RECAPTCHA_SECRET_KEY.trim() === '') {
    return true; // Not configured yet, pass through
  }
  if (!token) return false;

  try {
    const url = 'https://www.google.com/recaptcha/api/siteverify';
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      payload: {
        secret: RECAPTCHA_SECRET_KEY.trim(),
        response: token
      },
      muteHttpExceptions: true
    });
    const result = JSON.parse(response.getContentText() || '{}');
    if (!result.success) {
      Logger.log('reCAPTCHA failed: ' + JSON.stringify(result));
      return false;
    }
    // For v3, score is between 0.0 (bot) and 1.0 (human). 0.3+ is verified human.
    if (result.score !== undefined && result.score < 0.3) {
      Logger.log('reCAPTCHA bot score detected: ' + result.score);
      return false;
    }
    return true;
  } catch (err) {
    Logger.log('Google reCAPTCHA verification error: ' + err);
    return false;
  }
}

/**
 * Formats time values safely in case Google Sheets auto-parses them as Date objects
 */
function formatTimeValue_(val) {
  if (!val) return '';
  if (val instanceof Date) {
    var h = val.getHours();
    var m = val.getMinutes();
    return (h < 10 ? '0' + h : '' + h) + ':' + (m < 10 ? '0' + m : '' + m);
  }
  return String(val);
}

/**
 * Reads Alliance Leaders from the dedicated 'Alliance_Leaders' sheet
 */
function getAllianceLeadersMapFromSheet_(sheet) {
  const map = {};
  if (!sheet) return map;

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return map;

  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const allianceId = String(r[0] || '').trim().toUpperCase();
    const name = String(r[1] || '').trim();
    const playerId = String(r[2] || '').trim();

    if (!allianceId || !name) continue;

    if (!map[allianceId]) {
      map[allianceId] = [];
    }

    map[allianceId].push({
      name: name,
      playerId: playerId
    });
  }

  return map;
}

/**
 * Reads Alliances sheet and merges contacts from Alliance_Leaders
 * Supports column 14 "Flag URL" to add or remove flags via Google Sheets
 */
function getAlliancesDataFromSheet_(sheet, leadersMap) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];

  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const id = String(r[0] || '').trim().toUpperCase();
    if (!id) continue;

    const parseTimes = function (raw) {
      const val = formatTimeValue_(raw);
      if (!val) return [];
      return String(val)
        .split(/[,/]/)
        .map(function (s) { return s.trim(); })
        .filter(Boolean);
    };

    let contacts = (leadersMap && leadersMap[id]) || [];
    if (contacts.length === 0) {
      const contactNames = String(r[9] || '').split(/[,/]/).map(function(s){ return s.trim(); });
      const contactIds = String(r[10] || '').split(/[,/]/).map(function(s){ return s.trim(); });
      for (var c = 0; c < Math.max(contactNames.length, contactIds.length); c++) {
        if (contactNames[c] || contactIds[c]) {
          contacts.push({
            name: contactNames[c] || '',
            playerId: contactIds[c] || ''
          });
        }
      }
    }

    list.push({
      id: id,
      name: String(r[1] || (id + ' Alliance')).trim(),
      description: String(r[2] || '').trim(),
      playstyle: String(r[3] || '').trim(),
      transferStatus: String(r[4] || 'OPEN').trim().toUpperCase(),
      color: String(r[5] || '#8b5128').trim(),
      crest: String(r[6] || '✦').trim(),
      events: {
        bear: parseTimes(r[7]),
        vikings: parseTimes(r[8]),
        swordland: parseTimes(r[11]),
        threeAlliance: parseTimes(r[12])
      },
      flagUrl: String(r[13] || '').trim(),
      contacts: contacts
    });
  }
  return list;
}

/**
 * Reads Team sheet
 */
function getTeamDataFromSheet_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const name = String(r[0] || '').trim();
    if (!name) continue;

    list.push({
      name: name,
      playerId: String(r[1] || '').trim(),
      category: String(r[2] || 'Staff').trim(),
      role: String(r[3] || '').trim(),
      alliance: String(r[4] || '').trim(),
      rank: String(r[5] || 'STAFF').trim(),
      pfp: String(r[6] || '').trim(),
      crest: String(r[7] || '✦').trim()
    });
  }
  return list;
}

/**
 * Reads KVK Records sheet
 */
function getKvkDataFromSheet_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const kvk = String(r[0] || '').trim();
    if (!kvk) continue;

    list.push({
      kvk: kvk.padStart(2, '0'),
      opponent: String(r[1] || '').trim(),
      prep: String(r[2] || 'WIN').trim().toUpperCase(),
      battle: String(r[3] || 'WIN').trim().toUpperCase()
    });
  }
  return list;
}

/**
 * Reads News sheet
 */
function getNewsDataFromSheet_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const title = String(r[1] || '').trim();
    if (!title) continue;

    list.push({
      icon: String(r[0] || '📜').trim(),
      title: title,
      copy: String(r[2] || '').trim(),
      cta: String(r[3] || 'LEARN MORE').trim(),
      to: String(r[4] || '/').trim()
    });
  }
  return list;
}

/**
 * Reads FAQ sheet
 */
function getFaqDataFromSheet_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const q = String(r[0] || '').trim();
    if (!q) continue;

    list.push({
      question: q,
      answer: String(r[1] || '').trim()
    });
  }
  return list;
}

/**
 * Reads Leaderboard sheet
 */
function getLeaderboardDataFromSheet_(sheet) {
  if (!sheet) return [];
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const list = [];
  for (var i = 1; i < rows.length; i++) {
    const r = rows[i];
    const cat = String(r[0] || '').trim();
    if (!cat) continue;

    list.push({
      category: cat,
      rank: Number(r[1]) || 1,
      playerName: String(r[2] || '').trim(),
      alliance: String(r[3] || '').trim().toUpperCase(),
      scoreValue: String(r[4] || '').trim(),
      scoreLabel: String(r[5] || 'Power').trim(),
      avatarUrl: String(r[6] || '').trim(),
      updatedAt: r[7] ? String(r[7]) : ''
    });
  }
  return list;
}

/**
 * Returns latest sync timestamp from Leaderboard sheet
 */
function getLeaderboardLastSyncedAt_(sheet) {
  if (!sheet) return new Date().toISOString();
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return new Date().toISOString();

  // Check last column (col 8) for custom date, else fallback
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][7]) {
      const d = new Date(rows[i][7]);
      if (!isNaN(d.getTime())) return d.toISOString();
    }
  }
  return new Date().toISOString();
}

/**
 * Reads Settings sheet
 */
function getSettingsDataFromSheet_(sheet) {
  const defaultSet = {
    kingdomNumber: '1391',
    kingdomName: 'KINGSHOT KINGDOM 1391',
    discordUrl: '',
    heroTitle: 'FIND YOUR\nFOREVER HOME',
    heroSubtitle: 'in K1391',
    heroCopy: 'A friendly kingdom for active players,\nstrong alliances and unforgettable battles.'
  };

  if (!sheet) return defaultSet;
  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return defaultSet;

  const map = {};
  for (var i = 1; i < rows.length; i++) {
    const key = String(rows[i][0] || '').trim();
    if (key) map[key] = String(rows[i][1] || '').trim();
  }

  return {
    kingdomNumber: map['kingdomNumber'] || defaultSet.kingdomNumber,
    kingdomName: map['kingdomName'] || defaultSet.kingdomName,
    discordUrl: map['discordUrl'] || defaultSet.discordUrl,
    heroTitle: map['heroTitle'] || defaultSet.heroTitle,
    heroSubtitle: map['heroSubtitle'] || defaultSet.heroSubtitle,
    heroCopy: map['heroCopy'] || defaultSet.heroCopy
  };
}

/**
 * Get or create Enquiries sheet in the Enquiries workbook
 */
function getEnquiriesSheet_(wb) {
  let sheet = wb.getSheetByName('Enquiries');
  if (!sheet) {
    sheet = wb.insertSheet('Enquiries');
    sheet.appendRow([
      'Submitted at', 'Player Name', 'Game ID', 'Current Kingdom', 'Power',
      'Current Alliance', 'Preferred Alliance', 'TG Center Level',
      'Discord Username', 'Message'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10)
      .setFontWeight('bold')
      .setBackground('#1e4620')
      .setFontColor('#ffffff');
  }
  return sheet;
}

/**
 * Setup functions callable from menu or script runner
 */
function setupKingdomSheets() {
  setupDetailsSheet();
  setupEnquiriesSheet();
}

function setupDetailsSheet() {
  const wb = getDetailsWorkbook_();
  initDetailsSheetsIfMissing_(wb);
}

function setupEnquiriesSheet() {
  const wb = getEnquiriesWorkbook_();
  getEnquiriesSheet_(wb);
}

/**
 * Initializes all content tabs with headers and initial values in the Details sheet
 */
function initDetailsSheetsIfMissing_(wb) {
  // 1. Settings Sheet
  let sSheet = wb.getSheetByName('Settings');
  if (!sSheet) {
    sSheet = wb.insertSheet('Settings');
    sSheet.appendRow(['Setting Key', 'Value', 'Description']);
    sSheet.appendRow(['kingdomNumber', '1391', 'Kingdom number']);
    sSheet.appendRow(['kingdomName', 'KINGSHOT KINGDOM 1391', 'Full kingdom brand name']);
    sSheet.appendRow(['discordUrl', 'https://discord.com/channels/1461962057346846762/1461962057938108439/1546087990416117813', 'Discord invite URL']);
    sSheet.appendRow(['heroTitle', 'FIND YOUR\nFOREVER HOME', 'Main hero title']);
    sSheet.appendRow(['heroSubtitle', 'in K1391', 'Hero subtitle']);
    sSheet.appendRow(['heroCopy', 'A friendly kingdom for active players,\nstrong alliances and unforgettable battles.', 'Hero description']);
    sSheet.setFrozenRows(1);
    sSheet.getRange(1, 1, 1, 3).setFontWeight('bold');
  }

  // 2. Alliances Sheet (Supports column 14: Flag URL or 'none' to hide)
  let aSheet = wb.getSheetByName('Alliances');
  if (!aSheet) {
    aSheet = wb.insertSheet('Alliances');
    aSheet.appendRow([
      'Alliance ID', 'Full Name', 'Description', 'Playstyle', 'Transfer Status (OPEN/CLOSED)',
      'Banner Color', 'Crest Symbol', 'Bear Event Times (UTC)', 'Vikings Event Times (UTC)',
      'Contact Names (fallback)', 'Contact IDs (fallback)',
      'Swordland Event Times (UTC)', '3Alliance Event Times (UTC)',
      'Flag URL (or "none" to hide)'
    ]);
    aSheet.appendRow([
      'HOT', 'HOT Alliance', 'Warm welcome. Serious fun.', 'Active · Friendly · Competitive', 'OPEN',
      '#bd4c2d', '✦', '00:30, 16:00', '01:00, 16:30', 'Sally, MoonLight', '208885630, 202703263', '02:00, 12:00', '02:00, 12:00', ''
    ]);
    aSheet.appendRow([
      'VIK', 'VIK Alliance', 'Organised, active and battle-ready.', 'Active · Battle-ready · Organised', 'OPEN',
      '#315d93', 'ᛉ', '00:30, 16:30', '19:00', 'Sigurd', '202736204', '02:00, 19:00', '02:00, 19:00', ''
    ]);
    aSheet.appendRow([
      'NAT', 'NAT Alliance', 'A balanced home for active players.', 'Active · Balanced · Social', 'OPEN',
      '#5f873b', '❖', '14:00, 19:00, 23:00', '14:00', 'Madara Uchiha', '204128952', '19:00', '02:00, 19:00', ''
    ]);
    aSheet.appendRow([
      'MAD', 'MAD Alliance', 'Competitive spirit with a chaotic charm.', 'Competitive · Active · War-focused', 'OPEN',
      '#bd681a', '⚡', '02:30, 20:00', '01:00, 20:00', 'Valkyrie, Ernie', '205439578, 205079469', '02:00, 19:00', '02:00, 19:00', ''
    ]);
    aSheet.appendRow([
      'SDB', 'SDB Alliance', 'Find your squad and settle in.', 'Social · Friendly · Active', 'OPEN',
      '#76518d', '☾', '12:00, 18:00', '02:00, 13:00', 'Maddawg', '202720532', '02:00, 12:00', '02:00, 12:00', ''
    ]);
    aSheet.setFrozenRows(1);
    aSheet.getRange(1, 1, 1, 14).setFontWeight('bold');
  }

  // 3. Dedicated Alliance Leaders Sheet (CONTACT THE LEADERS)
  let alSheet = wb.getSheetByName('Alliance_Leaders');
  if (!alSheet) {
    alSheet = wb.insertSheet('Alliance_Leaders');
    alSheet.appendRow(['Alliance ID', 'Leader Name', 'Player ID', 'Role / Notes']);
    alSheet.appendRow(['HOT', 'Sally', '208885630', 'Leader']);
    alSheet.appendRow(['HOT', 'MoonLight', '202703263', 'Leader']);
    alSheet.appendRow(['VIK', 'Sigurd', '202736204', 'Leader']);
    alSheet.appendRow(['NAT', 'Madara Uchiha', '204128952', 'Leader']);
    alSheet.appendRow(['MAD', 'Valkyrie', '205439578', 'Leader']);
    alSheet.appendRow(['MAD', 'Ernie', '205079469', 'Leader']);
    alSheet.appendRow(['SDB', 'Maddawg', '202720532', 'Leader']);
    alSheet.setFrozenRows(1);
    alSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  // 4. Team Sheet
  let tSheet = wb.getSheetByName('Team');
  if (!tSheet) {
    tSheet = wb.insertSheet('Team');
    tSheet.appendRow([
      'Name', 'Player ID', 'Category (Transfer Managers / Alliance R5s / Staff)',
      'Role Title', 'Alliance (optional)', 'Rank Badge', 'Avatar PFP URL', 'Crest'
    ]);
    tSheet.appendRow(['[HOT] Sally', '208885630', 'Transfer Managers', 'TRANSFER MANAGER', '', 'TM', 'https://jeabslist.com/avatars/ef7b38b33b02bfc2a7c118a01251ada7.png', '⚔']);
    tSheet.appendRow(['[VIK] Hayate Beeshida', '203818078', 'Transfer Managers', 'TRANSFER MANAGER', '', 'TM', 'https://jeabslist.com/avatars/01892610373cfd0ad24bfd1b7f91f1b1.png', '⚔']);
    tSheet.appendRow(['Bee of ᴰᴱᴬᵀᴴ', '205063171', 'Alliance R5s', 'R5 LEADER', 'HOT', 'R5', 'https://jeabslist.com/avatars/9bf0135dbf3ddcebb85fe1a76cb0914d.png', '🛡']);
    tSheet.appendRow(['Sigurd McSting', '202736204', 'Alliance R5s', 'R5 LEADER', 'VIK', 'R5', 'https://jeabslist.com/avatars/1eaa46ec192edb7bb64bce3161ca8b2f.png', '🛡']);
    tSheet.appendRow(['EhMoose', '207314613', 'Alliance R5s', 'Alliance R5s', 'NAT', 'R5', 'https://jeabslist.com/avatars/cfe3a4cdf0928f712e3b45eec18d44d0.png', '🛡']);
    tSheet.appendRow(['valkyrie', '205439578', 'Alliance R5s', 'Alliance R5s', 'MAD', 'R5', 'https://jeabslist.com/avatars/5e591f24e3e7e4437b79eb49218a2fad.png', '🛡']);
    tSheet.appendRow(['Maddawgg', '202720532', 'Alliance R5s', 'Alliance R5s', 'SDB', 'R5', 'https://jeabslist.com/avatars/014311400002621eb4bb048711b9bd7f.png', '🛡']);
    tSheet.appendRow(['[HOT] MoonLight', '202703263', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/assets/preset_avatars/1031.png', '✦']);
    tSheet.appendRow(['[MAD] Ernie', '205079469', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/a24249d7b04d0619c379774a0d7f930f.png', '✦']);
    tSheet.appendRow(['[VIK] Crab', '204751680', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/f9f1ffd19e83e76327ef9f1fa04a2b19.png', '✦']);
    tSheet.appendRow(['[GRF] ᴍᴀᴅᴀʀᴀ々ᴜᴄʜɪʜᴀ', '204128952', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/ac0c34ec8c1b9c4b0742b785423255b5.png', '✦']);
    tSheet.appendRow(['[HOT] Chucky', '202638148', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/1d4ae55c730698bbaca6f355ae1a7291.png', '✦']);
    tSheet.appendRow(['nenedono', 'kimetakara', 'Staff', 'DISCORD', '', 'STAFF', 'https://cdn.discordapp.com/avatars/673514649852968977/dbe93e1a3b27079e8eec9bca22781462.png?size=3072', '✦']);
    tSheet.appendRow(['[GRF] EhM4tko', '209231997', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/c7c7bf05d19d4eddc4eec6399c07ef02.png', '✦']);
    tSheet.appendRow(['[GRF] LovinᴾᴵᴳDaddy', '183851500', 'Staff', '', '', 'STAFF', 'https://jeabslist.com/avatars/cf542b6c9df38d893ffa69df88d78a76.png', '✦']);
    tSheet.setFrozenRows(1);
    tSheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }

  // 5. KVK Records Sheet
  let kSheet = wb.getSheetByName('KVK_Records');
  if (!kSheet) {
    kSheet = wb.insertSheet('KVK_Records');
    kSheet.appendRow(['Campaign Number', 'Opponent Kingdom', 'Preparation Result (WIN/LOSS)', 'Battle Result (WIN/LOSS)']);
    kSheet.appendRow(['08', '1385', 'WIN', 'WIN']);
    kSheet.appendRow(['07', '1419', 'WIN', 'WIN']);
    kSheet.appendRow(['06', '1386', 'WIN', 'WIN']);
    kSheet.appendRow(['05', '1404', 'WIN', 'LOSS']);
    kSheet.appendRow(['04', '1410', 'WIN', 'WIN']);
    kSheet.appendRow(['03', '1387', 'WIN', 'WIN']);
    kSheet.appendRow(['02', '1396', 'WIN', 'WIN']);
    kSheet.appendRow(['01', '1400', 'WIN', 'LOSS']);
    kSheet.setFrozenRows(1);
    kSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
  }

  // 6. News Sheet
  let nSheet = wb.getSheetByName('News');
  if (!nSheet) {
    nSheet = wb.insertSheet('News');
    nSheet.appendRow(['Icon', 'Title', 'Description', 'CTA Button Text', 'Target Link']);
    nSheet.appendRow(['⚔', 'KVK CAMPAIGN RECORD', 'Kingdom 1391 stands strong in Preparation and Battle Phases across recorded campaigns.', 'VIEW KVK RECORDS', '/records']);
    nSheet.appendRow(['🕐', 'ALLIANCE EVENT SCHEDULES', 'Compare Bear, Vikings, Swordland and 3Alliance times to find the alliance rhythm that fits you.', 'VIEW SCHEDULE', '/schedule']);
    nSheet.appendRow(['🛡', 'ALLIANCE HALL OPEN', 'Explore the alliance halls, meet their listed representatives, and ask about joining.', 'EXPLORE ALLIANCES', '/alliances']);
    nSheet.appendRow(['💬', 'COMMUNITY GATE', 'Ask questions, meet the kingdom, and join the official Discord server.', 'VISIT COMMUNITY', '/community']);
    nSheet.setFrozenRows(1);
    nSheet.getRange(1, 1, 1, 5).setFontWeight('bold');
  }

  // 7. FAQ Sheet
  let fSheet = wb.getSheetByName('FAQ');
  if (!fSheet) {
    fSheet = wb.insertSheet('FAQ');
    fSheet.appendRow(['Question', 'Answer']);
    fSheet.appendRow(['What is Kingdom 1391?', 'A player community where you can explore alliance options, event schedules and transfer contacts.']);
    fSheet.appendRow(['How does kingdom transfer work?', 'Transfer details can change, so review the checklist and confirm the latest requirements with alliance leadership.']);
    fSheet.appendRow(['Which alliances are recruiting?', 'The available alliance halls listed here are the current sample information. Contact a leader to confirm availability.']);
    fSheet.appendRow(['What are the alliance event times?', 'Each alliance page and the schedule board show event times in Kingshot time (UTC).']);
    fSheet.appendRow(['How do I contact an alliance leader?', 'Open an alliance hall to find the listed contact name and player ID.']);
    fSheet.appendRow(["Can I apply if I don't know which alliance I want?", 'Absolutely. Select “Not Sure Yet” on the application scroll.']);
    fSheet.appendRow(['What timezone are schedules in?', 'Schedules default to Kingshot time (UTC); use the schedule switch to see browser-local conversions.']);
    fSheet.appendRow(['How long does it take to receive a response?', 'Response times vary. A leader will share the next steps when they can.']);
    fSheet.setFrozenRows(1);
    fSheet.getRange(1, 1, 1, 2).setFontWeight('bold');
  }

  // 8. Leaderboard Sheet
  let lbSheet = wb.getSheetByName('Leaderboard');
  if (!lbSheet) {
    lbSheet = wb.insertSheet('Leaderboard');
    lbSheet.appendRow(['Category', 'Rank', 'Player Name', 'Alliance', 'Score / Power', 'Score Label', 'Avatar URL', 'Updated At']);
    
    // Alliance Rankings
    lbSheet.appendRow(['Alliance Power', 1, 'OneForAll', 'HOT', '18,450,000,000', 'Alliance Power', '', new Date()]);
    lbSheet.appendRow(['Alliance Power', 2, 'NastyAzzTroops', 'NAT', '16,920,000,000', 'Alliance Power', '', new Date()]);
    lbSheet.appendRow(['Alliance Power', 3, 'VikingsValhalla', 'VIK', '14,210,000,000', 'Alliance Power', '', new Date()]);
    lbSheet.appendRow(['Alliance Power', 4, 'MadChaos', 'MAD', '12,800,000,000', 'Alliance Power', '', new Date()]);
    lbSheet.appendRow(['Alliance Power', 5, 'SquadDownBad', 'SDB', '10,500,000,000', 'Alliance Power', '', new Date()]);

    lbSheet.appendRow(['Alliance Kills', 1, 'NastyAzzTroops', 'NAT', '4,820,000,000', 'Alliance Kills', '', new Date()]);
    lbSheet.appendRow(['Alliance Kills', 2, 'OneForAll', 'HOT', '4,150,000,000', 'Alliance Kills', '', new Date()]);
    lbSheet.appendRow(['Alliance Kills', 3, 'VikingsValhalla', 'VIK', '3,600,000,000', 'Alliance Kills', '', new Date()]);
    lbSheet.appendRow(['Alliance Kills', 4, 'MadChaos', 'MAD', '2,950,000,000', 'Alliance Kills', '', new Date()]);
    lbSheet.appendRow(['Alliance Kills', 5, 'SquadDownBad', 'SDB', '2,400,000,000', 'Alliance Kills', '', new Date()]);

    // Top 10 Personal Power (From in-game screenshot)
    lbSheet.appendRow(['Personal Power', 1, 'PIGTATORDADDy', 'NAT', '671,030,304', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 2, 'EhMoose', 'NAT', '642,252,053', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 3, 'KLITlicker', 'VIK', '509,439,874', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 4, 'SuperBumbleBeep', 'HOT', '488,208,722', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 5, 'Moha HOT', 'HOT', '453,022,202', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 6, 'P@nd@', 'HOT', '433,211,587', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 7, 'OL DAWG', 'VIK', '428,787,600', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 8, 'King_Slayer', 'NAT', '412,550,120', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 9, 'Valkyrie', 'MAD', '405,190,400', 'Power', '', new Date()]);
    lbSheet.appendRow(['Personal Power', 10, 'Maddawg', 'SDB', '398,420,950', 'Power', '', new Date()]);

    // Private categories from screenshots
    lbSheet.appendRow(['Town Center Level', 1, 'East_666', 'NAT', 'TG 30 (FC 5)', 'TG Level', '', new Date()]);
    lbSheet.appendRow(['Kill Count', 1, 'PIGTATORDADDy', 'NAT', '1,420,550,230', 'Kills', '', new Date()]);
    lbSheet.appendRow(['Rebel Conquest Stage', 1, 'PIGTATORDADDy', 'NAT', 'Stage 420', 'Stage', '', new Date()]);
    lbSheet.appendRow(['Hero Power', 1, 'PIGTATORDADDy', 'NAT', '85,420,000', 'Hero Power', '', new Date()]);
    lbSheet.appendRow(['Hero\'s Total Power', 1, 'PIGTATORDADDy', 'NAT', '195,800,000', 'Total Hero Power', '', new Date()]);
    lbSheet.appendRow(['Total Pet Power', 1, 'SuperBumbleBeep', 'HOT', '68,230,000', 'Pet Power', '', new Date()]);
    lbSheet.appendRow(['Island Prosperity', 1, 'EhMoose', 'NAT', '14,850', 'Prosperity', '', new Date()]);
    lbSheet.appendRow(['Mystic Trial', 1, 'EhMoose', 'NAT', 'Floor 850', 'Floor', '', new Date()]);
    lbSheet.appendRow(['Master Total Power', 1, 'SuperBumbleBeep', 'HOT', '312,400,000', 'Master Power', '', new Date()]);

    lbSheet.setFrozenRows(1);
    lbSheet.getRange(1, 1, 1, 8).setFontWeight('bold');
  }
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
