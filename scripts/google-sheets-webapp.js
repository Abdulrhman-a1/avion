/**
 * Paste into Google Sheets → Extensions → Apps Script
 *
 * 1. Set SPREADSHEET_ID to your sheet ID (from the sheet URL /d/ID/edit).
 * 2. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone  (required — not "Anyone with Google account")
 * 3. After any code change: Manage deployments → Edit → New version → Deploy
 * 4. Copy the /exec URL into Vercel/local env as GOOGLE_SHEETS_URL
 *
 * Test: open the /exec URL in a browser — you should see {"ok":true,...}, not Sign in.
 */

const SPREADSHEET_ID = '15YtjyiFGUhbv1-EDVBnZIYaNjXuc1Ln-V6AGkn3BW0c';

function doGet() {
  return ContentService.createTextOutput(
    JSON.stringify({ ok: true, message: 'Rating endpoint is live' }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
    ensureHeaderRow(sheet);

    const data = JSON.parse(e.postData.contents);
    sheet.appendRow([
      data.submittedAt ? new Date(data.submittedAt) : new Date(),
      Number(data.rating) || 0,
      data.feedback || '',
      Number(data.messageCount) || 0,
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureHeaderRow(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Rating', 'Feedback', 'Messages']);
  }
}
