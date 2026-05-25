import { useState } from 'react';
import VoiceInput from './VoiceInput';

export default function InputBar({
  onSend,
  onEndChat,
  onBackToHome,
  onComposerFocus,
  showEndChat,
  showBackToHome,
  disabled,
}) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  };

  return (
    <section className="composer">
      <div className="composer-header">
        <div className="composer-badge">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 2l1.6 4.4L18 8l-4.4 1.6L12 14l-1.6-4.4L6 8l4.4-1.6L12 2z" fill="#6742E2"/>
            <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="#3BFAD2" opacity="0.8"/>
          </svg>
          <span>Ask <span className="composer-badge-name">Nakhil</span></span>
        </div>
        <div className="composer-header-actions">
          {showBackToHome && (
            <button
              type="button"
              className="home-back-btn home-back-btn--composer"
              onClick={onBackToHome}
            >
              Back to Home
            </button>
          )}
          {showEndChat && (
            <button
              type="button"
              className="composer-end-chat"
              onClick={onEndChat}
              disabled={disabled}
            >
              End Chat
            </button>
          )}
        </div>
      </div>

      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onFocus={onComposerFocus}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Ask me anything......."
        disabled={disabled}
        className="composer-input"
      />

      <div className="composer-actions">
        <VoiceInput
          onInterim={setText}
          onResult={(t) => {
            if (!t) return;
            setText(t);
          }}
          disabled={disabled}
        />

        <button
          type="button"
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          aria-label="Send"
          className="composer-send"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="19" x2="12" y2="5"/>
            <polyline points="5 12 12 5 19 12"/>
          </svg>
        </button>
      </div>
    </section>
  );
}
