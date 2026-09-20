# Kingdom 1391 — Two Separate Google Sheets Setup

The website is configured to use **two completely separate Google Sheets**:

1. **Details Sheet (CMS Content)**: Holds public kingdom information (`Settings`, `Alliances`, `Alliance_Leaders`, `Team`, `KVK_Records`, `News`, `FAQ`).
2. **Enquiries Sheet (Private Submissions)**: Stores sensitive player transfer applications submitted from the `/apply` page.

This separation keeps player applications private while allowing alliance leaders and staff to view and edit kingdom content without seeing personal application data.

---

## 1. Create Your Two Google Sheets

1. Go to [Google Sheets](https://sheets.google.com) and create two sheets:
   - **Sheet 1**: Name it `Kingdom 1391 - Details`
   - **Sheet 2**: Name it `Kingdom 1391 - Enquiries`

2. Copy the **Spreadsheet ID** from the URL of each sheet:
   - URL format: `https://docs.google.com/spreadsheets/d/`**`YOUR_SPREADSHEET_ID`**`/edit`

---

## 2. Configure Google Apps Script

1. Open either sheet (e.g. `Kingdom 1391 - Details`) and go to **Extensions → Apps Script**.
2. Replace all the code in `Code.gs` with [`google-apps-script/Code.gs`](file:///c:/Users/Utkarsh/Documents/Codex/2026-09-06/files-mentioned-by-the-user-codex/google-apps-script/Code.gs).
3. Near lines 20-23, paste your two IDs:
   ```javascript
   const DETAILS_SPREADSHEET_ID = 'PASTE_YOUR_DETAILS_SHEET_ID_HERE';
   const ENQUIRIES_SPREADSHEET_ID = 'PASTE_YOUR_ENQUIRIES_SHEET_ID_HERE';
   ```
4. Click **Save** (disk icon).

---

## 3. Auto-Initialize Both Sheets in One Click

1. In the Apps Script toolbar function dropdown, select **`setupKingdomSheets`**.
2. Click **Run** ▶️ and grant the requested permissions.
3. Both Google Sheets will automatically be populated:
   - Your **Details Sheet** will have: `Settings`, `Alliances`, `Alliance_Leaders`, `Team`, `KVK_Records`, `News`, and `FAQ`.
   - Your **Enquiries Sheet** will have: `Enquiries` (with bold column headers ready for applications).

---

## 4. Deploy the Web App

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Under "Select type" (gear icon), select **Web app**.
3. Set:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
4. Click **Deploy**.
5. Copy the **Web app URL** (ending with `/exec`).

---

## 5. Add URL to Your Project

1. In your project `.env.local`:
   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
   ```
2. If using **Vercel**: Add `VITE_GOOGLE_APPS_SCRIPT_URL` to Vercel Project Settings → Environment Variables.

---

## Details Sheet Tabs Summary

### `Settings`
Site name, kingdom number, Discord invite link, hero titles.

### `Alliances`
Alliance IDs, descriptions, playstyles, banner colors, crest symbols, transfer status (`OPEN` / `CLOSED`), and Bear/Vikings/Swordland/3Alliance event times.

### `Alliance_Leaders`
The contact cards displayed in "CONTACT THE LEADERS" on each alliance page:
| Alliance ID | Leader Name | Player ID | Role / Notes |
|---|---|---|---|
| `HOT` | `Sally` | `208885630` | `Leader` |
| `HOT` | `MoonLight` | `202703263` | `Leader` |

### `Team`
Team roster (`Transfer Managers`, `Alliance R5s`, `Staff`).

### `KVK_Records`
Campaign match history. Tallies (e.g. 8–0, 6–2) calculate automatically.

### `News`
Bulletin board dispatches.

### `FAQ`
Interactive accordion questions and answers.
