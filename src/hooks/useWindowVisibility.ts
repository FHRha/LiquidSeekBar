import { useState, useEffect } from 'react';

let globalIsWindowVisible = true;
const visibilityListeners = new Set<(visible: boolean) => void>();

export function getIsWindowVisible(): boolean {
  return typeof document !== 'undefined' ? !document.hidden && globalIsWindowVisible : true;
}

export function setGlobalWindowVisible(visible: boolean): void {
  if (globalIsWindowVisible !== visible) {
    globalIsWindowVisible = visible;
    visibilityListeners.forEach((listener) => listener(visible));
  }
}

export function subscribeWindowVisibility(listener: (visible: boolean) => void): () => void {
  visibilityListeners.add(listener);
  return () => {
    visibilityListeners.delete(listener);
  };
}

export function useWindowVisibility(): boolean {
  const [isVisible, setIsVisible] = useState<boolean>(getIsWindowVisible());

  useEffect(() => {
    const handler = (v: boolean) => setIsVisible(v);
    const unsubscribe = subscribeWindowVisibility(handler);

    const handleVisibilityChange = () => {
      setGlobalWindowVisible(!document.hidden);
    };

    const handleFocus = () => {
      setGlobalWindowVisible(true);
    };

    const handleBlur = () => {
      if (document.hidden) {
        setGlobalWindowVisible(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return isVisible;
}
