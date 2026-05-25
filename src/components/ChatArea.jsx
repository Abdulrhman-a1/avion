import { useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';

function rowClass(type) {
  if (type === 'user') return 'chat-row chat-row-user';
  return 'chat-row chat-row-bot';
}

export default function ChatArea({
  messages,
  collapsed,
  onToggleCollapse,
  onSelectSuggestion,
}) {
  const chatScrollRef = useRef(null);
  const messageCount = messages.length;

  const bumpScrollEnd = useCallback(() => {
    const container = chatScrollRef.current;
    if (!container) return;
    requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'auto',
      });
    });
  }, []);

  useEffect(() => {
    if (collapsed) return undefined;

    const container = chatScrollRef.current;
    if (!container) return undefined;

    const scrollToBottom = (behavior = 'smooth') => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
    };

    scrollToBottom('auto');

    const raf = requestAnimationFrame(() => scrollToBottom('smooth'));
    const timer = setTimeout(() => scrollToBottom('smooth'), 500);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [messages, collapsed]);

  if (messageCount === 0) {
    return null;
  }

  return (
    <div className={`history-section${collapsed ? ' history-section--collapsed' : ''}`}>
      <button
        type="button"
        className="history-toggle"
        onClick={onToggleCollapse}
        aria-expanded={!collapsed}
      >
        <span className="history-toggle-label">
          Previous messages ({messageCount})
        </span>
        <span className="history-toggle-chevron" aria-hidden />
      </button>

      <section
        ref={chatScrollRef}
        className={`chat-section chat-section--history visible${collapsed ? ' chat-section--hidden' : ''}`}
      >
        {messages.map((msg) => (
          <div key={msg.id} className={rowClass(msg.type)}>
            <ChatMessage message={msg} animateTypewriter={false} />
            {msg.suggestions?.length > 0 && (
              <div className="suggestions-wrap">
                <p className="suggestions-label">Pick a question:</p>
                {msg.suggestions.map((s) => (
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
        ))}
      </section>
    </div>
  );
}
