import { useCallback } from "react";

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

function useLocalCache<T>(key: string, ttl: number = 5 * 60 * 1000) {
  const read = useCallback((): T | null => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const entry: CacheEntry<T> = JSON.parse(raw);
      return entry.data;
    } catch {
      return null;
    }
  }, [key]);

  const write = useCallback(
    (data: T) => {
      try {
        const entry: CacheEntry<T> = { data, timestamp: Date.now() };
        localStorage.setItem(key, JSON.stringify(entry));
      } catch {}
    },
    [key],
  );

  const isFresh = useCallback((): boolean => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return false;
      const entry: CacheEntry<T> = JSON.parse(raw);
      if (!entry.data) return false;
      return Date.now() - entry.timestamp < ttl;
    } catch {
      return false;
    }
  }, [key, ttl]);

  const clear = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  return { read, write, isFresh, clear };
}

export default useLocalCache;
