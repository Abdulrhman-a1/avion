export const config = {
  api: { bodyParser: { sizeLimit: '12mb' } },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { base64, filename, mimetype } = req.body || {};
  if (!base64 || !filename) {
    res.status(400).json({ error: 'Missing base64 or filename' });
    return;
  }

  try {
    const buffer = Buffer.from(base64, 'base64');
    const blob = new Blob([buffer], { type: mimetype || 'application/octet-stream' });

    const form = new FormData();
    form.append('reqtype', 'fileupload');
    form.append('fileToUpload', blob, filename);

    const catRes = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: form,
    });

    const url = await catRes.text();
    if (!url.startsWith('https://')) {
      res.status(502).json({ error: 'Unexpected response from file host.' });
      return;
    }

    res.json({ url: url.trim() });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
}
