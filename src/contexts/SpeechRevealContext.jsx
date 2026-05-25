import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const SpeechRevealContext = createContext(null);

export function SpeechRevealProvider({ children }) {
  const [speechReveal, setSpeechRevealState] = useState(false);

  const setSpeechReveal = useCallback((next) => {
    setSpeechRevealState(Boolean(next));
  }, []);

  const value = useMemo(
    () => ({ speechReveal, setSpeechReveal }),
    [speechReveal, setSpeechReveal],
  );

  return (
    <SpeechRevealContext.Provider value={value}>
      {children}
    </SpeechRevealContext.Provider>
  );
}

export function useSpeechReveal() {
  const ctx = useContext(SpeechRevealContext);
  if (!ctx) {
    throw new Error('useSpeechReveal must be used within SpeechRevealProvider');
  }
  return ctx;
}
