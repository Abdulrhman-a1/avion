import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ImageLightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div className="image-lightbox" role="dialog" aria-modal="true" aria-label={alt || 'Image preview'}>
      <button
        type="button"
        className="image-lightbox-backdrop"
        onClick={onClose}
        aria-label="Close image"
      />
      <div className="image-lightbox-panel">
        <button
          type="button"
          className="image-lightbox-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <img
          src={encodeURI(src)}
          alt={alt || ''}
          className="image-lightbox-img"
          decoding="async"
        />
      </div>
    </div>,
    document.body,
  );
}
