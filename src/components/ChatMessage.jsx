import { BotAvatar } from './AvionLogo';

export default function ChatMessage({ message }) {
  const isUser = message.type === 'user';
  const isTyping = message.type === 'typing';

  if (isTyping) {
    return (
      <div className="msg-bot msg-animate">
        <BotAvatar />
        <div className="inline-flex gap-1 py-1">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div className="msg-user msg-animate whitespace-pre-wrap">
        {message.text}
      </div>
    );
  }

  return (
    <div className={`msg-bot msg-animate${message.tone === 'profanity' ? ' msg-bot-stern' : ''}`}>
      <BotAvatar />
      <div>
        {message.category && (
          <span className="block font-[League_Spartan] text-[10px] uppercase tracking-widest text-turquoise mb-2.5 font-semibold">
            {message.category}
          </span>
        )}
        {message.matchedQuestion && (
          <p className="text-xs text-muted italic mb-3 leading-relaxed">{message.matchedQuestion}</p>
        )}
        {message.image && (
          <img
            src={encodeURI(message.image)}
            alt={message.imageAlt || 'AVION'}
            className="msg-image"
            loading="lazy"
          />
        )}
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
    </div>
  );
}
