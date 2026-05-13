# Dark/Light Mode Toggle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a sun/moon toggle button to the header that switches between the existing dark glassmorphism theme and a new light glassmorphism theme, persisted in localStorage.

**Architecture:** CSS custom properties on `:root` define the light palette; `.dark` on `<html>` overrides them with the existing dark palette. A `useTheme` React hook reads/writes localStorage and applies the class to `document.documentElement`. The toggle button lives in `App.jsx`'s header, left of the existing Bot icon.

**Tech Stack:** React 18, Tailwind CSS v3 (CSS variable theming), lucide-react (Sun/Moon icons), localStorage (persistence), Vitest + jsdom (tests)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/App.jsx` | Modify | Add toggle button, swap NAV order (About ↔ Barcode) |
| `src/index.css` | Modify | Add light-mode `:root` vars, dark-mode `.dark` overrides, update `.glass` / `.glass-nav` for both themes |
| `src/utils/useTheme.js` | Create | Hook: reads localStorage, applies `.dark` class, exposes `{ theme, toggle }` |
| `src/utils/useTheme.test.js` | Create | Tests for `getInitialTheme` logic and localStorage round-trip |
| `vite.config.js` | Modify | Change test environment from `'node'` to `'jsdom'` (required for localStorage + DOM in tests) |

---

### Task 1: Swap About and Barcode in bottom nav

This is a single-line change in the NAV array — no logic to test.

**Files:**
- Modify: `src/App.jsx:15-21`

- [ ] **Step 1: Swap the nav entries**

In `src/App.jsx`, find the NAV array and swap the `about` and `barcode` entries:

```js
const NAV = [
  { to: '/', icon: Bell, label: 'Schedule', end: true },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/links', icon: Link, label: 'Links' },
  { to: '/barcode', icon: Barcode, label: 'Barcode' },
  { to: '/about', icon: Info, label: 'About' },
];
```

- [ ] **Step 2: Start dev server and verify visually**

```bash
pnpm start
```

Open http://localhost:5173. Confirm the bottom nav now shows: Schedule | Map | Links | Barcode | About (Barcode is 4th, About is 5th/rightmost).

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "feat: swap About and Barcode positions in bottom nav"
```

---

### Task 2: Add light/dark CSS variables and update glass components

**Files:**
- Modify: `src/index.css`

Current state: `:root` contains only dark-mode vars. After this task, `:root` defines light-mode vars and `.dark` defines dark-mode vars (current values). The `.glass` and `.glass-nav` components get light/dark variants.

- [ ] **Step 1: Replace `src/index.css` with the new theme system**

Replace the entire file with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  /* Light mode (default) */
  :root {
    --background: 248 248 250;
    --foreground: 15 15 18;
    --card: 0 0 0;            /* used at low opacity via bg-card/5 */
    --border: 0 0 0;          /* used at low opacity via border-border/[.08] */
    --primary: 245 158 11;    /* amber */
    --primary-foreground: 0 0 0;
    --secondary: 59 130 246;  /* blue */
    --secondary-foreground: 255 255 255;
    --muted: 230 231 236;
    --muted-foreground: 90 95 108;
  }

  /* Dark mode */
  .dark {
    --background: 5 5 6;
    --foreground: 237 237 239;
    --card: 255 255 255;
    --border: 255 255 255;
    --primary: 245 158 11;
    --primary-foreground: 0 0 0;
    --secondary: 59 130 246;
    --secondary-foreground: 255 255 255;
    --muted: 31 31 35;
    --muted-foreground: 138 143 152;
  }

  * {
    box-sizing: border-box;
  }

  body {
    background-color: rgb(var(--background));
    color: rgb(var(--foreground));
    font-family: 'Inter', system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    min-height: 100dvh;
  }
}

@layer components {
  /* Glassmorphism card — light mode */
  .glass {
    background: rgba(255, 255, 255, 0.65);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(0, 0, 0, 0.08);
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.06);
  }

  /* Glassmorphism card — dark mode */
  .dark .glass {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: none;
  }

  /* Frosted nav bar — light mode */
  .glass-nav {
    background: rgba(248, 248, 250, 0.88);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-color: rgba(0, 0, 0, 0.08);
  }

  /* Frosted nav bar — dark mode */
  .dark .glass-nav {
    background: rgba(5, 5, 6, 0.8);
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Safe area padding for bottom nav (iOS notch) */
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

- [ ] **Step 2: Add `dark` class to `<html>` in index.html so the app starts in dark mode**

In `index.html`, change:
```html
<html lang="en">
```
to:
```html
<html lang="en" class="dark">
```

- [ ] **Step 3: Verify dev server — app should look identical to before (dark mode)**

```bash
pnpm start
```

Open http://localhost:5173. The app must look exactly the same as before this task. If anything changed visually, inspect which CSS var is wrong.

- [ ] **Step 4: Temporarily test light mode by removing `class="dark"` from `<html>`**

Edit `index.html` temporarily: remove `class="dark"` from `<html>`. Reload. Confirm:
- Background becomes light gray (not white, not dark)
- Cards have a frosted white appearance
- Text is dark/readable
- Amber primary color (Schedule page active tab, period times) still visible
- Nav bars are frosted light

Restore `class="dark"` to index.html after verifying.

- [ ] **Step 5: Commit**

```bash
git add src/index.css index.html
git commit -m "feat: add light/dark CSS variable theming system"
```

---

### Task 3: useTheme hook with tests

**Files:**
- Modify: `vite.config.js` (test environment → jsdom)
- Create: `src/utils/useTheme.js`
- Create: `src/utils/useTheme.test.js`

- [ ] **Step 1: Change test environment to jsdom in vite.config.js**

In `vite.config.js`, find:
```js
  test: {
    environment: 'node',
    globals: false,
  },
```

Replace with:
```js
  test: {
    environment: 'jsdom',
    globals: false,
  },
```

- [ ] **Step 2: Verify existing tests still pass with jsdom**

```bash
pnpm test
```

Expected: all existing tests in `sanitizeHtml.test.js` and `parseScheduleFromEvents.test.js` still pass. jsdom is a superset of node for pure JS tests.

- [ ] **Step 3: Write failing tests for useTheme**

Create `src/utils/useTheme.test.js`:

```js
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
```

- [ ] **Step 4: Run tests — confirm they fail**

```bash
pnpm test
```

Expected: 3 failures with "Cannot find module './useTheme.js'" or similar.

- [ ] **Step 5: Implement useTheme.js**

Create `src/utils/useTheme.js`:

```js
import { useState, useEffect } from 'react';

export function getInitialTheme() {
  return localStorage.getItem('theme') ?? 'dark';
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
```

- [ ] **Step 6: Run tests — confirm all pass**

```bash
pnpm test
```

Expected output:
```
✓ src/utils/useTheme.test.js (3)
  ✓ getInitialTheme > returns dark when localStorage is empty
  ✓ getInitialTheme > returns stored theme when localStorage has "theme" key set to "light"
  ✓ getInitialTheme > returns stored theme when localStorage has "theme" key set to "dark"
```

All other tests must still pass too.

- [ ] **Step 7: Commit**

```bash
git add vite.config.js src/utils/useTheme.js src/utils/useTheme.test.js
git commit -m "feat: add useTheme hook with localStorage persistence and tests"
```

---

### Task 4: Theme toggle button in App.jsx header

**Files:**
- Modify: `src/App.jsx`

The button goes **left of the existing Bot icon** in the header. When dark mode is active: show Sun icon (clicking switches to light). When light mode is active: show Moon icon (clicking switches to dark).

- [ ] **Step 1: Update imports in App.jsx**

Change the lucide-react import line to add `Sun` and `Moon`:

```js
import { Bell, Map, Link, Info, Barcode, Bot, Sun, Moon } from 'lucide-react';
```

Add the useTheme import below the React import:

```js
import { useTheme } from './utils/useTheme.js';
```

- [ ] **Step 2: Wire up useTheme in the App component**

Inside `export default function App()`, add at the top of the function body:

```js
const { theme, toggle } = useTheme();
```

- [ ] **Step 3: Add the toggle button to the header**

The current header looks like:
```jsx
<header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
  <img src={logo} className="h-7 w-7" alt="MVHS Logo" />
  <span className="text-base font-semibold tracking-tight">MVHS</span>
  <a
    href={CLAUDE_SKILL_URL}
    target="_blank"
    rel="noopener noreferrer"
    title="Install Claude Skill"
    className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
  >
    <Bot size={20} strokeWidth={1.75} />
  </a>
</header>
```

Replace with:
```jsx
<header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
  <img src={logo} className="h-7 w-7" alt="MVHS Logo" />
  <span className="text-base font-semibold tracking-tight">MVHS</span>
  <button
    onClick={toggle}
    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
  >
    {theme === 'dark' ? (
      <Sun size={20} strokeWidth={1.75} />
    ) : (
      <Moon size={20} strokeWidth={1.75} />
    )}
  </button>
  <a
    href={CLAUDE_SKILL_URL}
    target="_blank"
    rel="noopener noreferrer"
    title="Install Claude Skill"
    className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
  >
    <Bot size={20} strokeWidth={1.75} />
  </a>
</header>
```

Note: `ml-auto` moved to the toggle button; the Bot link no longer needs it (it follows the toggle naturally).

- [ ] **Step 4: Verify on dev server**

```bash
pnpm start
```

Open http://localhost:5173. Verify:
1. App starts in dark mode (Sun icon visible in header, right side)
2. Click Sun → app switches to light mode, icon changes to Moon
3. Click Moon → app switches back to dark mode, icon changes to Sun
4. Refresh page → theme is preserved (localStorage persists it)
5. Both themes look correct (dark: current look, light: frosted white cards on light bg)
6. Bottom nav order is: Schedule | Map | Links | Barcode | About

- [ ] **Step 5: Run full test suite**

```bash
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/App.jsx
git commit -m "feat: add dark/light mode toggle button to header"
```
