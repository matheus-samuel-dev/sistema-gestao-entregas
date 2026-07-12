import { useCallback, useState } from 'react';

export function usePersistentState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      localStorage.removeItem(key);
      return initialValue;
    }
  });

  const update = useCallback(
    (next: T | ((current: T) => T)) => {
      setValue((current) => {
        const resolved = typeof next === 'function' ? (next as (current: T) => T)(current) : next;
        localStorage.setItem(key, JSON.stringify(resolved));
        return resolved;
      });
    },
    [key]
  );

  return [value, update] as const;
}
