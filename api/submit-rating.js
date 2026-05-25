import { forwardRatingToSheets } from '../lib/forwardRatingToSheets.js';

function getSheetsUrl() {
  return process.env.GOOGLE_SHEETS_URL || process.env.VITE_GOOGLE_SHEETS_URL || '';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sheetsUrl = getSheetsUrl();
  if (!sheetsUrl) {
    return res.status(503).json({
      error: 'Rating service is not configured. Set GOOGLE_SHEETS_URL on the server.',
    });
  }

  const result = await forwardRatingToSheets(sheetsUrl, req.body ?? {});

  if (!result.ok) {
    return res.status(502).json({ error: result.error });
  }

  return res.status(200).json(result.data);
}
