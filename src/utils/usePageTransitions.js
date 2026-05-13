'use client';
import { useState, useEffect } from 'react';

export function usePageTransitions() {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('page-transitions') === 'on';
  });

  useEffect(() => {
    if (enabled) {
      document.documentElement.setAttribute('data-transitions', 'on');
    } else {
      document.documentElement.removeAttribute('data-transitions');
    }
    localStorage.setItem('page-transitions', enabled ? 'on' : 'off');
  }, [enabled]);

  return { enabled, toggle: () => setEnabled((e) => !e) };
}
