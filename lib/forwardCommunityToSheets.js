/**
 * Server-side proxy to Google Apps Script community API.
 */
export async function forwardCommunityToSheets(sheetsUrl, { method = 'GET', action, query = {}, body = null, adminToken = '' } = {}) {
  const url = new URL(sheetsUrl);
  url.searchParams.set('action', action);
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers = { Accept: 'application/json' };
  if (adminToken) headers['X-Admin-Token'] = adminToken;

  const init = { method, headers, redirect: 'follow' };

  if (method === 'POST') {
    headers['Content-Type'] = 'text/plain;charset=utf-8';
    init.body = JSON.stringify({ action, ...body, adminToken: adminToken || body?.adminToken });
  }

  const upstream = await fetch(url.toString(), init);
  const text = await upstream.text();

  if (!upstream.ok) {
    const needsAnyone =
      upstream.status === 401 ||
      upstream.status === 403 ||
      text.includes('ServiceLogin') ||
      text.includes('Sign in');

    return {
      ok: false,
      status: upstream.status,
      error: needsAnyone
        ? 'Google Apps Script must use Deploy → Who has access: Anyone.'
        : 'Community API request failed. Check GOOGLE_COMMUNITY_SHEETS_URL.',
    };
  }

  try {
    const data = JSON.parse(text);
    if (data.success === false) {
      return { ok: false, status: 502, error: data.error || 'Community API error.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, status: 502, error: 'Invalid response from community API.' };
  }
}
