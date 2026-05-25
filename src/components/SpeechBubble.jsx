import { useCallback } from 'react';
import ChatMessage from './ChatMessage';

export default function SpeechBubble({
  message,
  isTyping,
  animateTypewriter,
  onStreamTick,
  onSelectSuggestion,
}) {
  const bumpScroll = useCallback(() => {
    onStreamTick?.();
  }, [onStreamTick]);

  if (!message && !isTyping) {
    return (
      <div className="speech-bubble-wrap speech-bubble-wrap--empty">
        <div className="speech-bubble speech-bubble--placeholder">
          <p className="speech-bubble-placeholder-text">Ask Nakhil anything…</p>
        </div>
      </div>
    );
  }

  const displayMessage = message ?? { id: 'typing', type: 'typing' };

  const showSuggestions =
    message?.suggestions?.length > 0 && message.type === 'bot';

  return (
    <div className="speech-bubble-wrap">
      <div
        className={`speech-bubble${message?.tone === 'profanity' ? ' speech-bubble--stern' : ''}${isTyping || message?.type === 'typing' ? ' speech-bubble--thinking' : ''}`}
      >
        <ChatMessage
          message={displayMessage}
          variant="speech"
          animateTypewriter={animateTypewriter}
          onStreamTick={bumpScroll}
        />
      </div>
      {showSuggestions && (
        <div className="speech-suggestions-wrap">
          <p className="suggestions-label">Pick a question:</p>
          {message.suggestions.map((s) => (
            <button
              key={s.id}
              type="button"
              className="suggestion-chip"
              onClick={() => onSelectSuggestion(s)}
            >
              {s.question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
