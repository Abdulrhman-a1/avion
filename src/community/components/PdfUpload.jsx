import { useRef, useState } from 'react';
import { uploadFile } from '../utils/uploadFile';

export default function PdfUpload({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const filename = value
    ? decodeURIComponent(value.split('/').pop()).replace(/^[a-z0-9]{6}\./, '') || 'attachment.pdf'
    : null;

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please select a PDF file.');
      e.target.value = '';
      return;
    }
    setError('');
    setUploading(true);
    try {
      const url = await uploadFile(file);
      onChange(url);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="community-field pdf-upload-field">
      <span className="community-field-label">PDF attachment <span className="pdf-upload-opt">(optional)</span></span>

      {value ? (
        <div className="pdf-upload-preview">
          <span className="pdf-upload-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="pdf-upload-name">
            {filename}
          </a>
          <button
            type="button"
            className="image-upload-clear pdf-upload-clear"
            onClick={() => onChange('')}
            aria-label="Remove PDF"
          >
            ✕
          </button>
        </div>
      ) : (
        <div
          className={`image-upload-drop pdf-upload-drop${uploading ? ' pdf-upload-drop--busy' : ''}`}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="image-upload-input"
            onChange={handleFile}
            disabled={uploading}
          />
          {uploading ? (
            <span className="image-upload-status">
              <span className="image-upload-spinner" /> Uploading PDF…
            </span>
          ) : (
            <span className="image-upload-status">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/>
                <line x1="9" y1="15" x2="12" y2="12"/>
                <line x1="15" y1="15" x2="12" y2="12"/>
              </svg>
              Tap to upload PDF &mdash; max 10 MB
            </span>
          )}
        </div>
      )}

      {error && (
        <p className="community-alert community-alert--error" style={{ marginTop: 8 }}>
          {error}
        </p>
      )}
    </div>
  );
}
