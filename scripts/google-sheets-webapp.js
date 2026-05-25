/**
 * Paste this into Google Sheets → Extensions → Apps Script
 * Sheet: https://docs.google.com/spreadsheets/d/1UYb1WAN6OwtOiV5Dmg9hQPSc87DsZ4qJKzrA4kylhqs/edit
 *
 * Deploy: Deploy → New deployment → Web app
 * - Execute as: Me
 * - Who has access: Anyone
 *
 * Copy the Web App URL into .env as VITE_GOOGLE_SHEETS_URL
 */

const SPREADSHEET_ID = '1UYb1WAN6OwtOiV5Dmg9hQPSc87DsZ4qJKzrA4kylhqs';

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
