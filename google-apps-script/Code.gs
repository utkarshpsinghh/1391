/**
 * Kingdom 1391 enquiry receiver.
 *
 * Setup:
 * 1. Create a Google Sheet and open Extensions > Apps Script.
 * 2. Replace the default code with this file.
 * 3. Deploy > New deployment > Web app.
 * 4. Set Execute as: Me, and Who has access: Anyone.
 * 5. Copy the Web app URL into VITE_GOOGLE_APPS_SCRIPT_URL in .env.local.
 */
const SPREADSHEET_ID = '1SrLixgBdTwK1jnU0zu5hwx1b5rn4Lv-eH_-Gx45kJ0A';
const SHEET_NAME = 'Enquiries';
const DUPLICATE_WINDOW_HOURS = 24;

function doGet() {
  return json_({ ok: true, message: 'Kingdom 1391 enquiry receiver is ready.' });
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || '{}');
    if (payload.website || !payload.playerName) {
      return json_({ ok: true }); // Silent honeypot rejection.
    }

    // A real user needs at least a few seconds to complete the form.
    if (!payload.formStartedAt || Date.now() - Number(payload.formStartedAt) < 2500) {
      return json_({ ok: true });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    const sheet = getEnquiriesSheet_();
    if (hasRecentDuplicate_(sheet, payload)) {
      lock.releaseLock();
      return json_({ ok: true, duplicate: true });
    }
    sheet.appendRow([
      new Date(),
      payload.playerName || '',
      payload.playerId || '',
      payload.power || '',
      payload.stats || '',
      payload.currentKingdom || '',
      payload.preferredAlliance || '',
      payload.preferredEventTime || '',
      payload.playstyle || '',
      payload.discordUsername || '',
      payload.message || '',
    ]);
    lock.releaseLock();
    return json_({ ok: true });
  } catch (error) {
    return json_({ ok: false, error: String(error) });
  }
}

function hasRecentDuplicate_(sheet, payload) {
  const identifier = normalize_(payload.playerId) ||
    (normalize_(payload.playerName) + '|' + normalize_(payload.discordUsername));
  if (!identifier || identifier === '|') return false;

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;
  const firstDataRow = Math.max(2, lastRow - 499);
  const rows = sheet.getRange(firstDataRow, 1, lastRow - firstDataRow + 1, 10).getValues();
  const cutoff = Date.now() - DUPLICATE_WINDOW_HOURS * 60 * 60 * 1000;
  return rows.some(function (row) {
    const submittedAt = new Date(row[0]).getTime();
    const existingId = normalize_(row[2]) || (normalize_(row[1]) + '|' + normalize_(row[9]));
    return submittedAt >= cutoff && existingId === identifier;
  });
}

function normalize_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function getEnquiriesSheet_() {
  const workbook = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = workbook.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = workbook.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Submitted at', 'Player name', 'Player ID', 'Power', 'FC / Key stats',
      'Current kingdom', 'Preferred alliance', 'Preferred event time',
      'Playstyle', 'Discord username', 'Message'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }
  return sheet;
}

function json_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON);
}
