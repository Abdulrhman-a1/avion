/**
 * Upload any file (image or PDF) through our /api/upload proxy → Catbox.moe.
 * Returns the hosted URL.
 */
export async function uploadFile(file, { onProgress } = {}) {
  const MAX_MB = 10;
  if (file.size > MAX_MB * 1024 * 1024) {
    throw new Error(`File is too large. Maximum size is ${MAX_MB} MB.`);
  }

  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  onProgress?.('uploading');

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64,
      filename: file.name,
      mimetype: file.type,
    }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.url) throw new Error(json.error || 'Upload failed');
  return json.url;
}
