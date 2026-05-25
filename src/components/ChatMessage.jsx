import { useState, useEffect, useMemo } from 'react';
import { useSpeechReveal } from '../contexts/SpeechRevealContext';
import ImageLightbox from './ImageLightbox';

const CHAR_MS = 22;

export default function ChatMessage({
  message,
  animateTypewriter,
  onStreamTick,
  variant = 'default',
}) {
  const isSpeech = variant === 'speech';
  const isUser = message.type === 'user';
  const isTyping = message.type === 'typing';
  const { setSpeechReveal } = useSpeechReveal();

  const fullText = typeof message.text === 'string' ? message.text : '';
  const graphemes = useMemo(() => Array.from(fullText), [fullText]);

  const shouldAnimate =
    Boolean(animateTypewriter) && graphemes.length > 0 && !isUser && !isTyping;

  const [revealedLen, setRevealedLen] = useState(() =>
    shouldAnimate ? 0 : graphemes.length,
  );

  const visibleText =
    graphemes.slice(0, Math.min(revealedLen, graphemes.length)).join('');

  useEffect(() => {
    if (!shouldAnimate) {
      setRevealedLen(graphemes.length);
      return undefined;
    }

    setRevealedLen(0);
    setSpeechReveal(true);

    let len = 0;
    const id = setInterval(() => {
      len += 1;
      if (len >= graphemes.length) {
        clearInterval(id);
        setRevealedLen(graphemes.length);
        setSpeechReveal(false);
        return;
      }
      setRevealedLen(len);
    }, CHAR_MS);

    return () => {
      clearInterval(id);
      setSpeechReveal(false);
    };
  }, [message.id, shouldAnimate, graphemes.length, setSpeechReveal]);

  useEffect(() => {
    if (!shouldAnimate) return;
    onStreamTick?.();
  }, [visibleText, shouldAnimate, onStreamTick]);

  const showTypingCaret = shouldAnimate && revealedLen < graphemes.length;
  const showImage =
    Boolean(message.image) && (!shouldAnimate || revealedLen >= graphemes.length);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (isTyping) {
    const typingClass = isSpeech
      ? 'speech-bubble-inner msg-animate'
      : 'msg-bot msg-animate';
    return (
      <div className={typingClass}>
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
        {fullText}
      </div>
    );
  }

  const botShellClass = isSpeech
    ? 'speech-bubble-inner msg-animate'
    : `msg-bot msg-animate${message.tone === 'profanity' ? ' msg-bot-stern' : ''}`;

  return (
    <div className={botShellClass}>
      <div>
        {message.category && (
          <span className="block font-[League_Spartan] text-[10px] uppercase tracking-widest text-turquoise mb-2.5 font-semibold">
            {message.category}
          </span>
        )}
        {message.matchedQuestion && (
          <p className="text-xs text-muted italic mb-3 leading-relaxed">{message.matchedQuestion}</p>
        )}
        <p className="msg-typewriter-text whitespace-pre-wrap">
          {visibleText}
          {showTypingCaret && <span className="msg-typewriter-caret" aria-hidden />}
        </p>
        {showImage && (
          <>
            <button
              type="button"
              className="msg-image-frame msg-image-trigger"
              onClick={() => setLightboxOpen(true)}
              aria-label="View larger image"
            >
              <img
                src={encodeURI(message.image)}
                alt={message.imageAlt || 'Nakhil'}
                className="msg-image"
                loading="lazy"
                decoding="async"
              />
            </button>
            {lightboxOpen && (
              <ImageLightbox
                src={message.image}
                alt={message.imageAlt}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
