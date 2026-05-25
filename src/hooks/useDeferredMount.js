import { useEffect, useState } from 'react';

/** Defer heavy UI until after first paint so the page stays interactive. */
export function useDeferredMount({ idleTimeoutMs = 1500 } = {}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (!cancelled) setReady(true);
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(run, { timeout: idleTimeoutMs });
      return () => {
        cancelled = true;
        window.cancelIdleCallback(idleId);
      };
    }

    const fallbackId = window.setTimeout(run, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(fallbackId);
    };
  }, [idleTimeoutMs]);

  return ready;
}
