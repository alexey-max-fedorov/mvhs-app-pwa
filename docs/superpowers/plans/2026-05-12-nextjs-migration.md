# MVHS App: React Native Removal & Next.js Migration

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all React Native dead code and migrate the web app from Vite + React Router to Next.js 15 App Router, keeping the existing Tailwind/glassmorphism design system, PWA support, and all page logic intact.

**Architecture:** Five pages (Schedule, Map, Links, Barcode, About) move from React Router v6 to file-based routes under `src/app/`. A new client `Shell` component handles the header, bottom nav, and theme toggle (previously in `App.jsx`). All data-fetching containers stay client-side with `'use client'` directives. Pure presentation components (BellSchedule, Calendar, Links, About) remain server components.

**Tech Stack:** Next.js 15 (App Router), React 18, Tailwind CSS 3, `@ducanh2912/next-pwa`, Vitest (31 existing tests unchanged), pnpm.

---

## File Map

**Delete:**
- `src/App.jsx`, `src/index.js`, `index.html` — Vite entry files replaced by Next.js
- `vite.config.js` — replaced by `next.config.js` + `vitest.config.js`
- `app.json` — Expo config, dead
- `src/assets/SchoolMap.png` — only used in deleted `Map.native.js`; web build fetches from GitHub
- All `*.native.js` files — React Native dead code
- `native/`, `web/` — dead RN/legacy build directories

**Create:**
- `next.config.js` — Next.js config with PWA plugin
- `vitest.config.js` — extracted from vite.config.js test block
- `src/app/layout.jsx` — root layout (Server Component)
- `src/app/manifest.js` — PWA manifest via Next.js Metadata API
- `src/app/page.jsx` — Schedule route (`/`)
- `src/app/map/page.jsx`, `src/app/links/page.jsx`, `src/app/barcode/page.jsx`, `src/app/about/page.jsx` — remaining routes
- `src/components/Shell.jsx` — client component: header, bottom nav, theme toggle
- `public/outlinelogo.svg` — moved from `src/assets/` for Next.js static serving

**Modify:**
- `package.json` — remove all RN/Expo/Vite packages; add `next`; add `@ducanh2912/next-pwa`
- `pnpm-workspace.yaml` — remove dead `allowBuilds` entries for removed packages
- `tailwind.config.js` — update content paths to cover `src/app/`
- `vercel.json` — switch to Next.js framework config
- `.env.local` — rename `VITE_GOOGLE_CALENDAR_API_KEY` → `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY`
- `src/containers/CalendarContainer.js` — update env var reference
- `src/utils/useTheme.js` — add `'use client'` + SSR guard on `localStorage` read
- `src/containers/BellScheduleContainer.js`, `src/containers/CalendarContainer.js`, `src/containers/SchedulePageContainer.js`, `src/containers/WeatherContainer.js` — add `'use client'`
- `src/components/Map.js`, `src/components/SchedulePage.js`, `src/components/Settings.js` — add `'use client'`

**Leave unchanged:** `BellSchedule.js`, `Calendar.js`, `Links.js`, `AboutPage.js`, `Weather.js`, `WeatherIcon.js`, `cn.js`, `firebase.js`, `storage.js`, `calendarUrls.js`, `sanitizeHtml.js`, `parseScheduleFromEvents.js` (all pure JS — no hooks, no browser APIs).

---

### Task 1: Delete React Native Dead Files and Directories

**Files:** delete 16 `.native.js` files, `native/`, `web/`, `app.json`, `src/assets/SchoolMap.png`

- [ ] **Step 1: Delete all .native.js files**

```bash
git rm \
  src/App.native.js \
  src/assets/schoolMap.native.js \
  src/components/BellSchedule.native.js \
  src/components/Calendar.native.js \
  src/components/Credits.native.js \
  src/components/DatePicker.native.js \
  src/components/Disclaimer.native.js \
  src/components/Icon.native.js \
  src/components/Link.native.js \
  src/components/Map.native.js \
  src/components/SchedulePage.native.js \
  src/components/SVGImage.native.js \
  src/index.native.js \
  src/theme.native.js \
  src/utils/appstate.native.js \
  src/utils/storage.native.js
```

- [ ] **Step 2: Delete dead root directories and files**

```bash
git rm -r native/ web/ app.json src/assets/SchoolMap.png
```

- [ ] **Step 3: Verify no .native. files remain**

```bash
find src/ -name "*.native.*"
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore: delete React Native dead files, app.json, and dead asset"
```

---

### Task 2: Overhaul package.json and Reinstall

**Files:**
- Modify: `package.json`
- Modify: `pnpm-workspace.yaml`

- [ ] **Step 1: Verify nothing in src/ imports the packages being removed**

```bash
grep -r \
  "react-native\|react-redux\|react-virtualized\|react-easy-swipe\|react-ga\|react-hooks-barcode\|react-scripts\|class-variance-authority\|@radix-ui\|@react-navigation\|expo\|prop-types\|react-router-dom\|react-router" \
  src/ --include="*.js" --include="*.jsx" -l
```
Expected: no output (all dead).

- [ ] **Step 2: Replace package.json**

```json
{
  "name": "mvhs-app-pwa",
  "version": "0.2.0",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@11.0.9",
  "dependencies": {
    "clsx": "^2.1.1",
    "jsbarcode": "^3.11.5",
    "lucide-react": "^1.14.0",
    "moment": "^2.18.1",
    "next": "^15.0.0",
    "react": "18",
    "react-dom": "^18.3.1",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@ducanh2912/next-pwa": "^10.0.0",
    "autoprefixer": "^10.5.0",
    "postcss": "^8.5.14",
    "tailwindcss": "^3.4.19",
    "vitest": "^2.0.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 3: Slim down pnpm-workspace.yaml**

The current `allowBuilds` entries are for packages being removed. Replace with only what Next.js and Tailwind need:

```yaml
allowBuilds:
  esbuild: true
  fsevents: true
```

- [ ] **Step 4: Install**

```bash
pnpm install
```
Expected: resolves without errors. `node_modules` updates, lockfile changes.

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml
git commit -m "chore: remove RN/Vite packages, install next.js and next-pwa"
```

---

### Task 3: Create next.config.js, vitest.config.js; Update tailwind and vercel

**Files:**
- Create: `next.config.js`
- Create: `vitest.config.js`
- Delete: `vite.config.js`
- Modify: `tailwind.config.js`
- Modify: `vercel.json`

- [ ] **Step 1: Create next.config.js**

```js
import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: { disableDevLogs: true },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPWA(nextConfig);
```

- [ ] **Step 2: Create vitest.config.js**

The test config was embedded in `vite.config.js`. Extract it:

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: false,
  },
});
```

- [ ] **Step 3: Run tests to confirm vitest picks up the new config**

```bash
pnpm test
```
Expected:
```
✓ src/utils/sanitizeHtml.test.js (10 tests)
✓ src/utils/parseScheduleFromEvents.test.js (18 tests)
✓ src/utils/useTheme.test.js (3 tests)
Test Files  3 passed (3)
Tests  31 passed (31)
```

- [ ] **Step 4: Update tailwind.config.js content paths**

Change the `content` array to cover `src/app/` (Next.js routes) instead of `index.html`:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/app/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/containers/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
          foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        card: 'rgb(var(--card) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { glass: '1rem' },
      backdropBlur: { glass: '12px', nav: '20px' },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'amber-glow': '0 0 20px rgba(245,158,11,0.25)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 5: Update vercel.json for Next.js**

Next.js is auto-detected by Vercel — no SPA rewrite needed:

```json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install",
  "framework": "nextjs"
}
```

- [ ] **Step 6: Delete vite.config.js**

```bash
git rm vite.config.js
```

- [ ] **Step 7: Commit**

```bash
git add next.config.js vitest.config.js tailwind.config.js vercel.json
git commit -m "feat: add next.config.js and vitest.config.js, update tailwind and vercel"
```

---

### Task 4: Update Environment Variable

**Files:**
- Modify: `.env.local`
- Modify: `src/containers/CalendarContainer.js`

`VITE_*` prefix is Vite-specific. Next.js uses `NEXT_PUBLIC_*` to expose variables to client-side code.

- [ ] **Step 1: Update .env.local**

Replace the existing `VITE_GOOGLE_CALENDAR_API_KEY` line with:

```
NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY=AIzaSyCfRrWtuQjgV2ekSGkmDn_BROYje60T61c
```

- [ ] **Step 2: Update CalendarContainer.js**

Find in `src/containers/CalendarContainer.js`:
```js
`key=${import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY}&` +
```
Replace with:
```js
`key=${process.env.NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY}&` +
```

- [ ] **Step 3: Commit the source change only**

`.env.local` is gitignored and must not be committed.

```bash
git add src/containers/CalendarContainer.js
git commit -m "chore: rename env var from VITE_ to NEXT_PUBLIC_ prefix"
```

---

### Task 5: Add 'use client' to Interactive Modules

**Files:**
- Modify: `src/utils/useTheme.js`
- Modify: `src/containers/BellScheduleContainer.js`
- Modify: `src/containers/CalendarContainer.js`
- Modify: `src/containers/SchedulePageContainer.js`
- Modify: `src/containers/WeatherContainer.js`
- Modify: `src/components/Map.js`
- Modify: `src/components/SchedulePage.js`
- Modify: `src/components/Settings.js`

In Next.js App Router, components are Server Components by default. Any file that uses browser APIs (`localStorage`, `caches`, DOM event listeners) or React hooks (`useState`, `useEffect`, `useRef`) must declare `'use client'` as its very first line. Components without hooks (BellSchedule, Calendar, Links, AboutPage) stay as server components.

- [ ] **Step 1: Update useTheme.js with 'use client' and SSR guard**

`getInitialTheme` reads `localStorage` outside a `useEffect`, which would crash on the server. Add a guard:

Full new content of `src/utils/useTheme.js`:
```js
'use client';
import { useState, useEffect } from 'react';

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
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

- [ ] **Step 2: Run tests to confirm useTheme change is safe**

```bash
pnpm test
```
Expected: 31 tests pass. (jsdom provides `window`, so the `typeof window` guard is transparent in tests.)

- [ ] **Step 3: Add 'use client' to remaining interactive files**

Add `'use client';` as the very first line of each of these files (before any imports):

- `src/containers/BellScheduleContainer.js` — uses class state, `window.setInterval`, `localStorage`, Firebase
- `src/containers/CalendarContainer.js` — uses class state, `fetch`, `navigator.onLine`
- `src/containers/SchedulePageContainer.js` — uses `useState`, `useRef`, `useCallback`, touch events
- `src/containers/WeatherContainer.js` — uses `useState`, `useEffect`, `caches` API
- `src/components/Map.js` — uses `useState`, `useRef`, `useEffect`, DOM event listeners, `document.body`
- `src/components/SchedulePage.js` — uses `useState` for mini calendar picker
- `src/components/Settings.js` — uses `useState`, `useEffect`, `localStorage`, `JsBarcode` DOM mutation

For each file, add `'use client';` before the first import. Example — `BellScheduleContainer.js` becomes:
```js
'use client';
import React from 'react';
import moment from 'moment';
// ... rest of file unchanged
```

- [ ] **Step 4: Verify all 8 files have the directive**

```bash
grep -L "'use client'" \
  src/utils/useTheme.js \
  src/containers/BellScheduleContainer.js \
  src/containers/CalendarContainer.js \
  src/containers/SchedulePageContainer.js \
  src/containers/WeatherContainer.js \
  src/components/Map.js \
  src/components/SchedulePage.js \
  src/components/Settings.js
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/utils/useTheme.js src/containers/ src/components/Map.js src/components/SchedulePage.js src/components/Settings.js
git commit -m "feat: add 'use client' directives for next.js app router"
```

---

### Task 6: Move SVG Asset and Create Shell.jsx

**Files:**
- Move: `src/assets/outlinelogo.svg` → `public/outlinelogo.svg`
- Create: `src/components/Shell.jsx`

Next.js serves files in `public/` as static assets at the root URL (e.g. `/outlinelogo.svg`). Importing SVGs from `src/assets/` via ES import is not guaranteed to work the same way as in Vite. Moving to `public/` is unambiguous.

`Shell.jsx` replaces everything in `App.jsx` except the route definitions: the header (logo, theme toggle, Claude skill button) and the bottom nav. It uses `usePathname` from `next/navigation` instead of `NavLink` from react-router-dom.

- [ ] **Step 1: Move outlinelogo.svg to public/**

```bash
mkdir -p public
git mv src/assets/outlinelogo.svg public/outlinelogo.svg
```

If `src/assets/` is now empty, remove it:
```bash
rmdir src/assets/ 2>/dev/null; true
```

- [ ] **Step 2: Create src/components/Shell.jsx**

```jsx
'use client';
import { usePathname } from 'next/navigation';
import NextLink from 'next/link';
import { Bell, Map, Link as LinkIcon, Info, Barcode, Bot, Sun, Moon } from 'lucide-react';
import { useTheme } from '../utils/useTheme';

const CLAUDE_SKILL_URL =
  'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill';

const NAV = [
  { to: '/', icon: Bell, label: 'Schedule' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/links', icon: LinkIcon, label: 'Links' },
  { to: '/barcode', icon: Barcode, label: 'Barcode' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Shell({ children }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname === to;
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
        <img src="/outlinelogo.svg" className="h-7 w-7" alt="MVHS Logo" />
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

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-white/[.08] safe-area-pb">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NextLink
            key={to}
            href={to}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-[11px] transition-colors duration-150 ${
              isActive(to) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NextLink>
        ))}
      </nav>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add public/outlinelogo.svg src/components/Shell.jsx
git commit -m "feat: move SVG to public/ and create Shell client layout component"
```

---

### Task 7: Create All App Router Files

**Files:**
- Create: `src/app/layout.jsx`
- Create: `src/app/manifest.js`
- Create: `src/app/page.jsx`
- Create: `src/app/map/page.jsx`
- Create: `src/app/links/page.jsx`
- Create: `src/app/barcode/page.jsx`
- Create: `src/app/about/page.jsx`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p src/app/map src/app/links src/app/barcode src/app/about
```

- [ ] **Step 2: Create src/app/layout.jsx**

The root layout is a Server Component. `suppressHydrationWarning` on `<html>` silences the React hydration mismatch warning caused by the theme class: the server always renders `class="dark"`, but Shell.jsx may add or remove the `dark` class on the client before React finishes hydrating.

```jsx
import Shell from '../components/Shell';
import '../index.css';

export const metadata = {
  title: 'MVHS App',
  description: 'Mountain View High School student app',
  themeColor: '#050506',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Create src/app/manifest.js**

Next.js 13.3+ generates `/manifest.webmanifest` automatically from this file:

```js
export default function manifest() {
  return {
    name: 'MVHS App',
    short_name: 'MVHS',
    theme_color: '#050506',
    background_color: '#050506',
    display: 'standalone',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
```

- [ ] **Step 4: Create src/app/page.jsx (Schedule — root route)**

```jsx
import SchedulePageContainer from '../containers/SchedulePageContainer';

export default function SchedulePage() {
  return <SchedulePageContainer />;
}
```

- [ ] **Step 5: Create src/app/map/page.jsx**

```jsx
import MapContainer from '../../containers/MapContainer';

export default function MapPage() {
  return <MapContainer />;
}
```

- [ ] **Step 6: Create src/app/links/page.jsx**

```jsx
import Links from '../../components/Links';

export default function LinksPage() {
  return <Links />;
}
```

- [ ] **Step 7: Create src/app/barcode/page.jsx**

```jsx
import Settings from '../../components/Settings';

export default function BarcodePage() {
  return <Settings />;
}
```

- [ ] **Step 8: Create src/app/about/page.jsx**

```jsx
import AboutPage from '../../components/AboutPage';

export default function About() {
  return <AboutPage />;
}
```

- [ ] **Step 9: Commit**

```bash
git add src/app/
git commit -m "feat: add Next.js App Router layout and page routes"
```

---

### Task 8: Delete Vite-Era Entry Files

**Files:**
- Delete: `src/App.jsx`
- Delete: `src/index.js`
- Delete: `index.html`

Next.js provides its own entry point, HTML shell, and root renderer. These files are replaced entirely by `src/app/layout.jsx` and the `src/app/**/page.jsx` routes.

- [ ] **Step 1: Delete the files**

```bash
git rm src/App.jsx src/index.js index.html
```

- [ ] **Step 2: Commit**

```bash
git commit -m "chore: remove vite-era entry files (App.jsx, index.js, index.html)"
```

---

### Task 9: Build Verification and Smoke Test

- [ ] **Step 1: Run tests**

```bash
pnpm test
```
Expected: 31 tests pass.

- [ ] **Step 2: Run Next.js production build**

```bash
pnpm build
```

Expected: build succeeds with output like:
```
Route (app)                  Size
┌ ○ /                       ...
├ ○ /about                  ...
├ ○ /barcode                ...
├ ○ /links                  ...
└ ○ /map                    ...
```

**If the build fails**, common causes and fixes:

| Error | Fix |
|-------|-----|
| `You're importing a component that needs X. It only works in a Client Component...` | Add `'use client'` to the named file |
| `localStorage is not defined` | Add `typeof window === 'undefined'` guard in the function reading localStorage |
| `Cannot find module '../assets/outlinelogo.svg'` | Verify `public/outlinelogo.svg` exists and Shell.jsx uses `src="/outlinelogo.svg"` (string, not import) |
| `import.meta.env is not defined` | Find remaining `import.meta.env.VITE_*` references with `grep -r "import.meta.env" src/` and replace with `process.env.NEXT_PUBLIC_*` |

- [ ] **Step 3: Start dev server and smoke-test all routes**

```bash
pnpm dev
```

Open http://localhost:3000. Verify each route:

| Route | Expected |
|-------|----------|
| `/` | Bell schedule for today loads; calendar events section shows |
| `/map` | Campus map image renders; zoom/pan and lightbox work |
| `/links` | All 8 link cards render |
| `/barcode` | Type a student ID ≥4 digits → barcode renders below |
| `/about` | CS Club card + all credits cards render |
| Nav | Active tab highlights correctly on each page |
| Theme | Sun/Moon toggle switches light/dark; preference persists on refresh |
| Touch | Swipe left/right on schedule page changes the date |

- [ ] **Step 4: Commit any fixes needed during smoke test**

```bash
git add -A
git commit -m "fix: resolve issues found during next.js migration smoke test"
```
