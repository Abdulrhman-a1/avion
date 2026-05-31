import { useRef, useState } from 'react';
import { uploadFile } from '../utils/uploadFile';

const IMGBB_KEY = import.meta.env.VITE_IMGBB_API_KEY;

async function uploadImage(file) {
  // Prefer imgBB if key is set (image-optimised CDN)
  if (IMGBB_KEY) {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const body = new FormData();
    body.append('key', IMGBB_KEY);
    body.append('image', base64);
    body.append('name', file.name.replace(/\.[^.]+$/, ''));
    const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body });
    const json = await res.json();
    if (!json.success) throw new Error(json.error?.message || 'Upload failed');
    return json.data.url;
  }
  // Fallback: our proxy → Catbox
  return uploadFile(file);
}

export default function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('url'); // 'url' | 'upload'

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="community-field image-upload-field">
      <div className="image-upload-label-row">
        <span className="community-field-label">Cover image</span>
        <div className="image-upload-tabs">
          <button
            type="button"
            className={`image-upload-tab${tab === 'url' ? ' image-upload-tab--active' : ''}`}
            onClick={() => setTab('url')}
          >
            URL
          </button>
          <button
            type="button"
            className={`image-upload-tab${tab === 'upload' ? ' image-upload-tab--active' : ''}`}
            onClick={() => setTab('upload')}
            disabled={false}
          >
            Upload
          </button>
        </div>
      </div>

      {tab === 'url' ? (
        <input
          className="community-input"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          type="url"
          placeholder="https://…  (optional)"
        />
      ) : (
        <div className="image-upload-drop" onClick={() => inputRef.current?.click()}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="image-upload-input"
            onChange={handleFile}
            disabled={uploading}
          />
          {uploading ? (
            <span className="image-upload-status">
              <span className="image-upload-spinner" /> Uploading…
            </span>
          ) : (
            <span className="image-upload-status">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Tap to choose a photo
            </span>
          )}
        </div>
      )}

      {!IMGBB_KEY && tab === 'upload' && (
        <p className="image-upload-notice">
          Tip: add <code>VITE_IMGBB_API_KEY</code> to <code>.env</code> for faster image hosting via imgBB.
          Without it, images upload via the built-in proxy.
        </p>
      )}

      {error && <p className="community-alert community-alert--error" style={{ marginTop: 8 }}>{error}</p>}

      {value && (
        <div className="image-upload-preview-wrap">
          <img
            src={value}
            alt="Cover preview"
            className="admin-image-preview"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <button
            type="button"
            className="image-upload-clear"
            onClick={() => onChange('')}
            aria-label="Remove image"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
