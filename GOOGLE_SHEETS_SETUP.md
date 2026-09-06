# Google Sheets enquiry connection

1. Create the Google Sheet that should store enquiries.
2. In that Sheet, select **Extensions → Apps Script**.
3. Paste the contents of `google-apps-script/Code.gs`, then save. The script opens the target Sheet by its ID, so it also works when the Apps Script project is standalone.
4. Select **Deploy → New deployment → Web app**.
5. Choose **Execute as: Me** and **Who has access: Anyone**, then deploy. Google may ask you to authorize the script.
6. Copy the Web app URL. Create `.env.local` from `.env.example` and set:

   ```env
   VITE_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbw9N-0xSorYmFgLWP4yEvZ-Y5wWkRfeYJLwtG-RiQAOzkSIzWBgYqBfkgY7sHcYSoFP/exec
   ```

7. Restart `npm run dev` or rebuild the site.

The form sends the player name, player ID, power, stats, current kingdom, selected alliance and time, playstyle, Discord username, and message. Do not commit `.env.local`.
