import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { submitRating } from '../utils/submitRating';

const RATING_LABELS = ['Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function Evaluation({ messageCount, onSubmitted, onClose, onGoHome }) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const activeRating = hoveredStar || rating;
  const canClose = status !== 'loading';

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleClose = () => {
    if (!canClose) return;
    onClose?.();
  };

  const handleSubmit = async () => {
    if (rating === 0 || status === 'loading') return;

    setStatus('loading');
    setError('');

    try {
      await submitRating({ rating, feedback, messageCount });
      setStatus('success');
      setTimeout(() => onSubmitted?.(), 1800);
    } catch (err) {
      setStatus('idle');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  return (
    <motion.div
      className="evaluation-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evaluation-title"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <button
        type="button"
        className="evaluation-backdrop"
        aria-label="Close rating"
        onClick={handleClose}
        disabled={!canClose}
      />

      <motion.div
        className="evaluation-panel"
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.32, ease: 'easeOut' }}
      >
        <div className="evaluation-panel-glow" aria-hidden />

        <button
          type="button"
          className="evaluation-close"
          onClick={handleClose}
          disabled={!canClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="evaluation-header">
          <span className="evaluation-badge">Feedback</span>
          <h3 id="evaluation-title" className="evaluation-title">
            Rate your experience
          </h3>
          <p className="evaluation-subtitle">
            Your rating helps us improve Nakhil.
          </p>
        </div>

        <div className="evaluation-stars" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`evaluation-star ${activeRating >= star ? 'evaluation-star-active' : ''}`}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              onClick={() => setRating(star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              disabled={status === 'success'}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" aria-hidden>
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={activeRating >= star ? '#3BFAD2' : 'none'}
                  stroke={activeRating >= star ? '#3BFAD2' : '#6E7587'}
                  strokeWidth="1.5"
                />
              </svg>
            </button>
          ))}
        </div>

        {activeRating > 0 && (
          <p className="evaluation-rating-label">{RATING_LABELS[activeRating - 1]}</p>
        )}

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Tell us more (optional)..."
          className="evaluation-feedback"
          disabled={status === 'success'}
        />

        {error && <p className="evaluation-error">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={rating === 0 || status === 'loading' || status === 'success'}
          className="evaluation-submit"
        >
          {status === 'loading' && 'Saving…'}
          {status === 'success' && 'Thank you!'}
          {status === 'idle' && 'Submit rating'}
        </button>

        {status === 'success' ? (
          <button
            type="button"
            className="home-back-btn home-back-btn--evaluation"
            onClick={onGoHome}
          >
            Back to Home
          </button>
        ) : (
          <button
            type="button"
            className="evaluation-skip-home"
            onClick={onGoHome}
            disabled={!canClose}
          >
            Back to Home without rating
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}
