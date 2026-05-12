import { describe, it, expect, beforeEach } from 'vitest';
import { getInitialTheme } from './useTheme.js';

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
});

describe('getInitialTheme', () => {
  it('returns dark when localStorage is empty', () => {
    expect(getInitialTheme()).toBe('dark');
  });

  it('returns stored theme when localStorage has "theme" key set to "light"', () => {
    localStorage.setItem('theme', 'light');
    expect(getInitialTheme()).toBe('light');
  });

  it('returns stored theme when localStorage has "theme" key set to "dark"', () => {
    localStorage.setItem('theme', 'dark');
    expect(getInitialTheme()).toBe('dark');
  });
});
