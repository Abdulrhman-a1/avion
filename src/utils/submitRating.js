export async function submitRating({ rating, feedback, messageCount }) {
  const response = await fetch('/api/submit-rating', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rating,
      feedback: feedback.trim(),
      messageCount,
      submittedAt: new Date().toISOString(),
    }),
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    throw new Error(
      data.error || 'Could not save your rating. Please try again.',
    );
  }

  return data;
}
