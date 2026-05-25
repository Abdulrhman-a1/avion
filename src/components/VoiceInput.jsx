import { useState, useRef, useCallback, useEffect } from 'react';

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null;
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access denied',
  'no-speech': 'No speech detected — try again',
  network: 'Voice input needs an internet connection',
  'audio-capture': 'No microphone found',
  'service-not-allowed': 'Voice input is blocked in this browser',
};

export default function VoiceInput({ onResult, onInterim, disabled }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);
  const onInterimRef = useRef(onInterim);

  const SpeechRecognition = getSpeechRecognition();
  const isSupported = Boolean(SpeechRecognition);
  const isSecure = typeof window !== 'undefined' && window.isSecureContext;

  useEffect(() => {
    onResultRef.current = onResult;
    onInterimRef.current = onInterim;
  }, [onResult, onInterim]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!status) return undefined;
    const timer = setTimeout(() => setStatus(null), 4000);
    return () => clearTimeout(timer);
  }, [status]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const requestMicAccess = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    if (disabled || isListening) return;

    if (!isSecure) {
      setStatus('Voice input requires HTTPS or localhost');
      return;
    }

    if (!SpeechRecognition) {
      setStatus('Voice input is not supported in this browser');
      return;
    }

    setStatus(null);

    const hasMic = await requestMicAccess();
    if (!hasMic) {
      setStatus(ERROR_MESSAGES['not-allowed']);
      return;
    }

    try {
      recognitionRef.current?.abort();

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        let interim = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0]?.transcript ?? '';
          if (event.results[i].isFinal) {
            finalText += transcript;
          } else {
            interim += transcript;
          }
        }

        const display = (finalText || interim).trim();

        if (display && !finalText.trim()) {
          onInterimRef.current?.(display);
        }

        if (finalText.trim()) {
          onResultRef.current?.(finalText.trim());
        }
      };

      recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
          setStatus(ERROR_MESSAGES[event.error] ?? 'Voice input failed');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setStatus('Could not start voice input');
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [SpeechRecognition, disabled, isListening, isSecure, requestMicAccess]);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  return (
    <button
      type="button"
      className={`voice-btn ${isListening ? 'voice-btn-active' : ''} ${status ? 'voice-btn-error' : ''}`}
      onClick={toggleListening}
      disabled={disabled || !isSupported || !isSecure}
      title={
        !isSecure
          ? 'Open the site over HTTPS or localhost to use voice input'
          : !isSupported
            ? 'Use Chrome, Edge, or Safari for voice input'
            : undefined
      }
    >
      {isListening && <span className="voice-btn-ring" aria-hidden />}

      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={isListening ? 'voice-mic-icon' : undefined}
      >
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>

      <span className="voice-btn-label">
        {isListening ? 'Listening…' : status ?? (isSupported ? 'Voice Input' : 'Voice unavailable')}
      </span>

      {isListening && (
        <span className="voice-level" aria-hidden>
          <span /><span /><span /><span />
        </span>
      )}
    </button>
  );
}
