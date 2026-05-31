import { handleCommunityRequest } from '../lib/handleCommunityRequest.js';

function readBody(req) {
  if (typeof req.body === 'object' && req.body !== null) return req.body;
  if (typeof req.body === 'string' && req.body) {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Token');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const query = req.query || {};
  const body = req.method === 'POST' ? readBody(req) : {};
  const action = body.action || query.action || 'health';
  const adminToken = req.headers['x-admin-token'] || body.adminToken || query.adminToken || '';

  const result = await handleCommunityRequest({
    method: req.method,
    action,
    query,
    body: req.method === 'POST' ? body : null,
    adminToken,
  });

  if (!result.ok) {
    return res.status(result.status || 502).json({
      success: false,
      error: result.error || 'Request failed',
    });
  }

  return res.status(200).json(result.data);
}
