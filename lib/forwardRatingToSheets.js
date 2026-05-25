/**
 * Server-side POST to Google Apps Script Web App (avoids browser CORS).
 */
export async function forwardRatingToSheets(sheetsUrl, payload) {
  const body = JSON.stringify({
    rating: Number(payload.rating) || 0,
    feedback: String(payload.feedback ?? '').trim(),
    messageCount: Number(payload.messageCount) || 0,
    submittedAt: payload.submittedAt || new Date().toISOString(),
  });

  const upstream = await fetch(sheetsUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body,
    redirect: 'follow',
  });

  const text = await upstream.text();

  if (!upstream.ok) {
    const needsAnyone =
      upstream.status === 401 ||
      upstream.status === 403 ||
      text.includes('ServiceLogin') ||
      text.includes('لم يتم العثور') ||
      text.includes('يتعذر فتح الملف');

    const error = needsAnyone
      ? 'Google Apps Script must use Deploy → Who has access: Anyone, then New version → Deploy.'
      : 'Google Sheets rejected the request. Check the Web App URL and spreadsheet permissions.';

    return { ok: false, status: upstream.status, error };
  }

  try {
    const data = JSON.parse(text);
    if (data.success === false) {
      return { ok: false, status: 502, error: data.error || 'Could not save rating.' };
    }
    return { ok: true, data };
  } catch {
    return { ok: true, data: { success: true } };
  }
}
