import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';

function rowClass(type) {
  if (type === 'user') return 'chat-row chat-row-user';
  return 'chat-row chat-row-bot';
}

export default function ChatArea({
  messages,
  isTyping,
  onSelectSuggestion,
}) {
  const chatScrollRef = useRef(null);

  useEffect(() => {
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
  }, [messages, isTyping]);

  return (
    <section ref={chatScrollRef} className="chat-section visible">
      {messages.map((msg, i) => (
        <div key={msg.id || i} className={rowClass(msg.type)}>
          <ChatMessage message={msg} />
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
  );
}
