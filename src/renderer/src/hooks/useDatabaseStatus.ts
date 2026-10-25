import { useState, useEffect, useCallback, useRef } from 'react';
import { DatabaseHealthStatus } from '@shared/types/models';

export function useDatabaseStatus() {
  const [status, setStatus] = useState<DatabaseHealthStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isCheckingRef = useRef<boolean>(false);

  const checkStatus = useCallback(async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      if (window.classflowAPI?.database?.checkHealth) {
        const res = await window.classflowAPI.database.checkHealth();
        if (res.success) {
          setStatus(res.data);
        } else {
          setStatus({
            connected: false,
            provider: 'postgresql',
            urlConfigured: false,
            tablesInitialized: false,
            error: res.error.message,
          });
        }
      }
    } catch (err: unknown) {
      setStatus({
        connected: false,
        provider: 'postgresql',
        urlConfigured: false,
        tablesInitialized: false,
        error: String(err),
      });
    } finally {
      isCheckingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Poll health every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  return { status, loading, refreshStatus: checkStatus };
}
