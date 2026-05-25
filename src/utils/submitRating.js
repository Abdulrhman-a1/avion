const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

export async function submitRating({ rating, feedback, messageCount }) {
  if (!SHEETS_URL) {
    throw new Error(
      'Google Sheets URL is not configured. Add VITE_GOOGLE_SHEETS_URL to your .env file.',
    );
  }

  const payload = {
    rating,
    feedback: feedback.trim(),
    messageCount,
    submittedAt: new Date().toISOString(),
  };

  const response = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Could not save your rating. Please try again.');
  }

  try {
    return await response.json();
  } catch {
    return { success: true };
  }
}
