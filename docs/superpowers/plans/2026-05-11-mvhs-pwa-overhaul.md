# MVHS App PWA Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the MVHS PWA from a 2017-era custom-webpack React app to a Vite + shadcn/ui + Tailwind glassmorphism-dark PWA deployed on Vercel, with pnpm, env-var secrets, code cleanup, and a React Native dark-theme overhaul.

**Architecture:** React 18 SPA built with Vite 5, styled with Tailwind CSS 3 + glassmorphism design tokens, routed with React Router v6 (`Routes`/`NavLink`, no `Switch`/`withRouter`). Firebase Realtime DB stays as data source; Vercel replaces Firebase Hosting. The native Expo app gets a parallel dark-theme redesign using React Navigation v6 + shared theme tokens.

**Tech Stack:** React 18, Vite 5, Tailwind CSS 3, shadcn/ui primitives (Radix UI), React Router v6, pnpm 8, Vercel, Expo SDK 50, React Navigation v6

---

## File Map

**Deleted:**
- `web/config/` — entire webpack config folder
- `web/scripts/` — custom webpack build scripts
- `src/components/Calendar-DESKTOP-2M7KSN7.js` — stale desktop-synced file
- `src/containers/CovidLinksContainer.js` — outdated COVID page
- `src/containers/CovidLinks.css`
- `src/components/Analytics.js` — react-ga v2, incompatible
- `src/components/SimpleSnackbar.js` — replaced by Vite PWA update prompt
- `*.css` files in `src/components/` and `src/components/Weather/` — all replaced by Tailwind
- `package-lock.json`, `yarn.lock`
- `.babelrc` — webpack-era Babel config, not needed for Vite
- `config/` — root webpack/jest config folder (polyfills.js, jest transforms, etc.)

**Created:**
- `vite.config.js` — Vite build + PWA plugin config
- `vercel.json` — SPA routing rewrites + build/output config
- `.env.example` — documents `VITE_GOOGLE_CALENDAR_API_KEY`
- `index.html` — Vite entry point (moved from `web/public/index.html`)
- `tailwind.config.js` — design tokens (colors, fonts, glass effects)
- `postcss.config.js` — PostCSS for Tailwind
- `src/utils/cn.js` — `clsx` + `tailwind-merge` helper
- `src/theme.native.js` — shared dark-theme tokens for native components

**Modified:**
- `package.json` — pnpm, all deps updated, scripts simplified
- `.npmrc` — new pnpm config
- `firebase.json` — public dir changed from `web/build` → `dist`
- `src/index.css` — Tailwind directives + CSS variables (glassmorphism tokens)
- `src/App.jsx` — React Router v6, `React.lazy`, bottom nav shell
- `src/index.js` — React 18 `createRoot`
- `src/utils/firebase.js` — remove `console.log` statements
- `src/containers/CalendarContainer.js` — `import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY`
- All web components in `src/components/` — rewritten with Tailwind
- Native components in `src/components/*.native.js` — dark theme applied
- `src/App.native.js` — React Navigation v6 bottom tabs
- `README.md` — pnpm setup, Vercel deploy button, env var table

---

### Task 1: Migrate npm → pnpm

**Files:**
- Modify: `package.json`
- Delete: `package-lock.json`, `yarn.lock`
- Create: `.npmrc`

- [ ] **Step 1: Install pnpm globally (if not already)**

```bash
npm install -g pnpm@8
pnpm --version
```
Expected: `8.x.x`

- [ ] **Step 2: Delete old lock files**

```bash
rm -f package-lock.json yarn.lock
```

- [ ] **Step 3: Create `.npmrc`**

```ini
engine-strict=false
shamefully-hoist=true
```

(`shamefully-hoist=true` is required for React Native peer deps that expect flat `node_modules`)

- [ ] **Step 4: Install with pnpm**

```bash
pnpm install
```
Expected: Creates `pnpm-lock.yaml` and `node_modules/`

- [ ] **Step 5: Verify the existing dev server still starts**

```bash
pnpm run start:web
```
Expected: webpack dev server starts on port 3000 (will be replaced in Task 2, but must not break here). Kill it with Ctrl+C.

- [ ] **Step 6: Commit**

```bash
git add pnpm-lock.yaml .npmrc
git rm --cached package-lock.json 2>/dev/null; true
git commit -m "chore: migrate npm to pnpm"
```

---

### Task 2: Replace custom Webpack with Vite

**Files:**
- Create: `vite.config.js`, `index.html`
- Modify: `package.json` (scripts + remove webpack devDeps)
- Modify: `firebase.json`
- Delete: `web/scripts/`, `web/config/`, `.babelrc`, `config/`

- [ ] **Step 1: Install Vite and plugins**

```bash
pnpm add -D vite@5 @vitejs/plugin-react vite-plugin-pwa
```

- [ ] **Step 2: Create `vite.config.js` at project root**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'MVHS App',
        short_name: 'MVHS',
        theme_color: '#050506',
        background_color: '#050506',
        display: 'standalone',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
  },
});
```

- [ ] **Step 3: Create root `index.html`**

Copy `web/public/index.html` to project root, then replace its contents entirely:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#050506" />
    <title>MVHS App</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

- [ ] **Step 4: Replace scripts in `package.json`**

In the `"scripts"` block, replace the web scripts with Vite commands:

```json
{
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start:expo": "react-native-scripts start",
    "start:android": "react-native-scripts android",
    "deploy:expo": "exp publish"
  }
}
```

- [ ] **Step 5: Update `firebase.json` to point to `dist/`**

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

- [ ] **Step 6: Delete webpack artifacts**

```bash
rm -rf web/scripts web/config .babelrc config
```

- [ ] **Step 7: Start Vite dev server**

```bash
pnpm start
```
Expected: Vite dev server starts at `http://localhost:5173`. App may show errors (Material UI imports will break after Task 4 dep swap — that's expected).

- [ ] **Step 8: Commit**

```bash
git add vite.config.js index.html package.json firebase.json
git rm -r web/scripts web/config 2>/dev/null; true
git rm .babelrc 2>/dev/null; true
git commit -m "chore: replace custom webpack with Vite 5"
```

---

### Task 3: Add Vercel deployment config + README

**Files:**
- Create: `vercel.json`, `.env.example`
- Modify: `README.md`, `.gitignore`

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install",
  "framework": null,
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Google Calendar API key — get one at https://console.cloud.google.com
VITE_GOOGLE_CALENDAR_API_KEY=your_key_here
```

- [ ] **Step 3: Add `.env.local` to `.gitignore`**

```bash
echo ".env.local" >> .gitignore
```

- [ ] **Step 4: Rewrite `README.md`**

```markdown
# MVHS App PWA

An unofficial Progressive Web App for Mountain View High School — bell schedules, campus maps, and school events.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmvhs-apps%2Fmvhs-app-pwa&env=VITE_GOOGLE_CALENDAR_API_KEY&envDescription=Google%20Calendar%20API%20key%20for%20the%20school%20calendar)

Live: [mvhs.io](https://mvhs.io)

## Development

Requires Node.js 18+ and [pnpm](https://pnpm.io) 8+.

```bash
# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install

# Start dev server (http://localhost:5173)
pnpm start

# Production build → dist/
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|---|---|
| `VITE_GOOGLE_CALENDAR_API_KEY` | Google Calendar API key for the school calendar |

## Deploy to Vercel

Click the **Deploy with Vercel** button above. During setup, set the `VITE_GOOGLE_CALENDAR_API_KEY` environment variable in the Vercel dashboard.

## Deploy to Firebase

```bash
pnpm build
firebase deploy
```
```

- [ ] **Step 5: Commit**

```bash
git add vercel.json .env.example README.md .gitignore
git commit -m "chore: add Vercel config, deploy button, and pnpm docs"
```

---

### Task 4: Replace all dependencies

**Files:**
- Modify: `package.json`, `pnpm-lock.yaml`

- [ ] **Step 1: Remove Material UI and all webpack/babel devDeps**

```bash
pnpm remove material-ui material-ui-icons react-loadable react-inline-css react-dates html-pdf enzyme flow-bin flow-typed react-addons-shallow-compare babel-plugin-transform-remove-console
pnpm remove -D autoprefixer babel-core babel-eslint babel-jest babel-loader babel-preset-react-app babel-preset-react-native babel-runtime case-sensitive-paths-webpack-plugin css-loader dotenv eslint eslint-config-airbnb eslint-config-prettier eslint-config-react-app eslint-loader eslint-plugin-flowtype eslint-plugin-import eslint-plugin-jsx-a11y eslint-plugin-react extract-text-webpack-plugin file-loader flow-bin flow-typed fs-extra html-webpack-plugin husky jest lint-staged object-assign offline-plugin postcss-flexbugs-fixes postcss-loader preload-webpack-plugin prettier promise react-dev-utils react-error-overlay react-native-cli react-native-scripts script-ext-html-webpack-plugin style-loader sw-precache-webpack-plugin uglifyjs-webpack-plugin url-loader webpack webpack-bundle-analyzer webpack-common-shake webpack-dev-server webpack-manifest-plugin whatwg-fetch
```

- [ ] **Step 2: Fix React version mismatch (React 18 + react-dom 16 → both 18)**

```bash
pnpm add react@18 react-dom@18
```

- [ ] **Step 3: Add new UI and routing deps**

```bash
pnpm add react-router-dom@6 lucide-react clsx tailwind-merge class-variance-authority
pnpm add @radix-ui/react-slot @radix-ui/react-tabs
```

- [ ] **Step 4: Add Tailwind + PostCSS**

```bash
pnpm add -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```
Expected: Creates `tailwind.config.js` and `postcss.config.js`

- [ ] **Step 5: Verify clean install**

```bash
pnpm install
```
Expected: No unresolved peer dep errors

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tailwind.config.js postcss.config.js
git commit -m "chore: replace Material UI + webpack deps with Tailwind + Radix UI"
```

---

### Task 5: Clean up dead files and move API key to env var

**Files:**
- Delete: `src/components/Calendar-DESKTOP-2M7KSN7.js`, `src/containers/CovidLinksContainer.js`, `src/containers/CovidLinks.css`, `src/components/Analytics.js`, `src/components/SimpleSnackbar.js`
- Modify: `src/containers/CalendarContainer.js` (line 70)
- Modify: `src/utils/firebase.js` (remove console.logs)
- Create: `src/utils/cn.js`, `.env.local`

- [ ] **Step 1: Delete dead files**

```bash
git rm src/components/Calendar-DESKTOP-2M7KSN7.js
git rm src/containers/CovidLinksContainer.js src/containers/CovidLinks.css
git rm src/components/Analytics.js src/components/SimpleSnackbar.js
```

- [ ] **Step 2: Move Google Calendar API key to env var**

In `src/containers/CalendarContainer.js`, find line 70:
```js
`key=AIzaSyCfRrWtuQjgV2ekSGkmDn_BROYje60T61c&` +
```
Replace with:
```js
`key=${import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY}&` +
```

- [ ] **Step 3: Create `.env.local` with the real key**

```bash
echo "VITE_GOOGLE_CALENDAR_API_KEY=AIzaSyCfRrWtuQjgV2ekSGkmDn_BROYje60T61c" > .env.local
```

- [ ] **Step 4: Remove console.logs from `src/utils/firebase.js`**

Delete these two lines from `src/utils/firebase.js`:
```js
console.log(`Fetching "${ref}" from web`);
```
```js
console.log(`Fetching "${ref}" from cache`);
```

- [ ] **Step 5: Create `src/utils/cn.js`**

```js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 6: Commit**

```bash
git add src/utils/cn.js src/utils/firebase.js src/containers/CalendarContainer.js .env.local
git commit -m "fix: move Calendar API key to env var, remove dead files and console.logs"
```

---

### Task 6: Design tokens — Tailwind config + global CSS

**Files:**
- Modify: `tailwind.config.js`
- Modify: `src/index.css`

- [ ] **Step 1: Replace `tailwind.config.js`**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
      borderRadius: {
        glass: '1rem',
      },
      backdropBlur: {
        glass: '12px',
        nav: '20px',
      },
      boxShadow: {
        glass: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
        'amber-glow': '0 0 20px rgba(245,158,11,0.25)',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Replace `src/index.css` with Tailwind directives + CSS variables**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* dark glassmorphism palette */
    --background: 5 5 6;
    --foreground: 237 237 239;
    --card: 255 255 255;       /* used at low opacity via bg-card/5 */
    --border: 255 255 255;     /* used at low opacity via border-border/[.08] */
    --primary: 245 158 11;     /* amber */
    --primary-foreground: 0 0 0;
    --secondary: 59 130 246;   /* blue */
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
  /* Glassmorphism card */
  .glass {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  /* Frosted nav bar */
  .glass-nav {
    background: rgba(5, 5, 6, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-color: rgba(255, 255, 255, 0.08);
  }

  /* Safe area padding for bottom nav (iOS notch) */
  .safe-area-pb {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}
```

- [ ] **Step 3: Verify Tailwind output is correct**

```bash
pnpm build 2>&1 | grep -i error
```
Expected: No errors. `dist/assets/index-*.css` exists and contains `.glass` class.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.js src/index.css
git commit -m "feat: add glassmorphism dark design tokens to Tailwind"
```

---

### Task 7: Rewrite App.jsx — Router v6 + glassmorphism nav shell

**Files:**
- Rename: `src/App.js` → `src/App.jsx`
- Modify: `src/index.js`

- [ ] **Step 1: Rename file**

```bash
git mv src/App.js src/App.jsx
```

- [ ] **Step 2: Rewrite `src/App.jsx`**

```jsx
import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Bell, Map, Link, Info, Settings } from 'lucide-react';
import logo from './assets/outlinelogo.svg';

const SchedulePage = React.lazy(() => import('./containers/SchedulePageContainer'));
const MapPage = React.lazy(() => import('./containers/MapContainer'));
const LinksPage = React.lazy(() => import('./components/Links'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const SettingsPage = React.lazy(() => import('./components/Settings'));

const NAV = [
  { to: '/', icon: Bell, label: 'Schedule', end: true },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/links', icon: Link, label: 'Links' },
  { to: '/about', icon: Info, label: 'About' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-dvh bg-background text-foreground">
        {/* Top header */}
        <header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
          <img src={logo} className="h-7 w-7" alt="MVHS Logo" />
          <span className="text-base font-semibold tracking-tight">MVHS</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<SchedulePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Bottom navigation */}
        <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-white/[.08] safe-area-pb">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-[11px] transition-colors duration-150 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              <Icon size={22} strokeWidth={1.75} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </BrowserRouter>
  );
}
```

- [ ] **Step 3: Update `src/index.js` to React 18 createRoot**

```js
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(<App />);
```

- [ ] **Step 4: Start dev server and verify nav renders**

```bash
pnpm start
```
Open `http://localhost:5173`. Expected: dark background, top bar with MVHS logo, bottom nav with 5 icons. Tapping each tab navigates between routes.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx src/index.js
git commit -m "feat: rewrite App with React Router v6 and glassmorphism nav shell"
```

---

### Task 8: Rewrite BellSchedule component

**Files:**
- Modify: `src/components/BellSchedule.js`
- Delete: `src/components/BellSchedule.css`

The period card for the active period gets an amber progress bar and a subtle glow border.

- [ ] **Step 1: Rewrite `src/components/BellSchedule.js`**

```jsx
import React from 'react';
import { cn } from '../utils/cn';

function PeriodCard({ name, start, end, isCurrent, progress }) {
  return (
    <div
      className={cn(
        'glass rounded-glass p-3 transition-all duration-200',
        isCurrent && 'border-primary/30 shadow-amber-glow'
      )}
    >
      <div className="flex items-center justify-between">
        <span className={cn('font-medium text-sm', isCurrent ? 'text-primary' : 'text-foreground')}>
          {name}
        </span>
        <span className="text-xs font-mono text-muted-foreground tabular-nums">
          {start} – {end}
        </span>
      </div>
      {isCurrent && (
        <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-2">
          <div
            className="h-full bg-primary rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${Math.max(1, progress)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BellSchedule({ periods, currentPeriod, scheduleName }) {
  if (!periods || periods.length === 0) {
    return (
      <div className="glass rounded-glass p-6 text-center text-muted-foreground text-sm">
        No school today
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {scheduleName && (
        <p className="text-xs text-muted-foreground px-1 mb-3">
          Schedule:{' '}
          <span className="text-foreground font-medium">{scheduleName}</span>
        </p>
      )}
      {periods.map((period) => (
        <PeriodCard
          key={period.name}
          name={period.name}
          start={period.start}
          end={period.end}
          isCurrent={currentPeriod?.name === period.name}
          progress={currentPeriod?.name === period.name ? currentPeriod.progress : 0}
        />
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Delete old CSS**

```bash
git rm src/components/BellSchedule.css
```

- [ ] **Step 3: Verify bell schedule renders**

```bash
pnpm start
```
Navigate to `/`. Expected: period cards with glassmorphism, active period has amber title + progress bar filling from left.

- [ ] **Step 4: Commit**

```bash
git add src/components/BellSchedule.js
git commit -m "feat: rewrite BellSchedule with glassmorphism cards and amber progress bar"
```

---

### Task 9: Rewrite Weather component

**Files:**
- Modify: `src/components/Weather/Weather.js`, `src/components/Weather/WeatherIcon.js`
- Delete: `src/components/Weather/Weather.css`, `src/components/Weather/WeatherIcon.css`

- [ ] **Step 1: Rewrite `src/components/Weather/Weather.js`**

```jsx
import React from 'react';
import WeatherIcon from './WeatherIcon';

export default function Weather({ temp, description, icon, high, low }) {
  if (!temp) return null;

  return (
    <div className="glass rounded-glass px-4 py-3 flex items-center gap-3">
      <WeatherIcon icon={icon} className="w-8 h-8 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none tabular-nums">{temp}°F</p>
        <p className="text-xs text-muted-foreground mt-1 capitalize truncate">{description}</p>
      </div>
      {(high != null || low != null) && (
        <div className="ml-auto text-right shrink-0">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{high}°</span> / {low}°
          </p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Remove CSS import from `src/components/Weather/WeatherIcon.js`**

Delete this line from `WeatherIcon.js`:
```js
import './WeatherIcon.css';
```
The icons are SVGs — add `className` prop forwarding to the root element so callers can pass Tailwind classes.

- [ ] **Step 3: Delete old CSS**

```bash
git rm src/components/Weather/Weather.css src/components/Weather/WeatherIcon.css
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Weather/Weather.js src/components/Weather/WeatherIcon.js
git commit -m "feat: rewrite Weather with glassmorphism card"
```

---

### Task 10: Rewrite SchedulePage + container

**Files:**
- Modify: `src/components/SchedulePage.js`
- Delete: `src/components/SchedulePage.css`
- Modify: `src/containers/SchedulePageContainer.js`

- [ ] **Step 1: Rewrite `src/components/SchedulePage.js`**

```jsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function SchedulePage({ date, onDateChange, bellSchedule, calendar, weather }) {
  const isToday = date.isSame(new Date(), 'day');

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* Date navigator */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onDateChange(date.clone().subtract(1, 'day'))}
          className="p-2 rounded-full glass transition-colors hover:text-primary"
          aria-label="Previous day"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="text-center">
          <p className="font-semibold">
            {isToday ? 'Today' : date.format('dddd')}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{date.format('MMMM D, YYYY')}</p>
        </div>
        <button
          onClick={() => onDateChange(date.clone().add(1, 'day'))}
          className="p-2 rounded-full glass transition-colors hover:text-primary"
          aria-label="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Weather */}
      {weather}

      {/* Bell schedule */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Bell Schedule
        </h2>
        {bellSchedule}
      </section>

      {/* Calendar events */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Events
        </h2>
        {calendar}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Rewrite `src/containers/SchedulePageContainer.js`**

Replace `react-easy-swipe` with native pointer events (no extra dep):

```jsx
import React, { useState, useRef } from 'react';
import moment from 'moment';
import SchedulePage from '../components/SchedulePage';
import BellScheduleContainer from './BellScheduleContainer';
import CalendarContainer from './CalendarContainer';
import WeatherContainer from './WeatherContainer';

export default function SchedulePageContainer() {
  const [date, setDate] = useState(() => moment());
  const touchStartX = useRef(null);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      setDate((d) => d.clone().add(delta < 0 ? 1 : -1, 'day'));
    }
    touchStartX.current = null;
  };

  return (
    <div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <SchedulePage
        date={date}
        onDateChange={setDate}
        bellSchedule={<BellScheduleContainer date={date} />}
        calendar={<CalendarContainer date={date} />}
        weather={<WeatherContainer />}
      />
    </div>
  );
}
```

- [ ] **Step 3: Delete old CSS**

```bash
git rm src/components/SchedulePage.css
```

- [ ] **Step 4: Verify schedule page end-to-end**

```bash
pnpm start
```
Navigate to `/`. Expected: date navigator with chevron buttons, weather card, bell schedule cards. Swiping left advances the day, right goes back.

- [ ] **Step 5: Commit**

```bash
git add src/components/SchedulePage.js src/containers/SchedulePageContainer.js
git commit -m "feat: rewrite SchedulePage — glassmorphism layout, swipe nav, no react-easy-swipe"
```

---

### Task 11: Rewrite Map page

**Files:**
- Modify: `src/components/Map.js`, `src/containers/MapContainer.js`
- Delete: `src/components/Map.css`

- [ ] **Step 1: Rewrite `src/components/Map.js`**

```jsx
import React from 'react';

export default function Map({ imageUrl }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-base font-semibold mb-4">Campus Map</h1>
      <div className="glass rounded-glass overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="MVHS campus map"
            className="w-full h-auto"
            loading="lazy"
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Map unavailable
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Simplify `src/containers/MapContainer.js`**

```jsx
import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import { getFirebaseVal } from '../utils/firebase';

export default function MapContainer() {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    getFirebaseVal('/map', false).then((val) => {
      if (val?.url) setImageUrl(val.url);
    });
  }, []);

  return <Map imageUrl={imageUrl} />;
}
```

- [ ] **Step 3: Delete old CSS**

```bash
git rm src/components/Map.css
```

- [ ] **Step 4: Commit**

```bash
git add src/components/Map.js src/containers/MapContainer.js
git commit -m "feat: rewrite Map page with glassmorphism card"
```

---

### Task 12: Rewrite Links page — add "Install Claude Skill" link

**Files:**
- Modify: `src/components/Links.js`
- Delete: `src/components/Links.css`, `src/components/LinksCss.css`, `src/components/LinksCss.js`, `src/components/Link.css`

The Claude skill link is pinned at the top as a featured card with amber accent and a Bot icon.

- [ ] **Step 1: Rewrite `src/components/Links.js`**

```jsx
import React from 'react';
import { ExternalLink, Bot } from 'lucide-react';
import { cn } from '../utils/cn';

const PINNED = [
  {
    title: 'Install Claude Skill',
    description: 'Fetch the MVHS bell schedule directly in Claude Chat — no extra setup needed.',
    url: 'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill',
    Icon: Bot,
  },
];

function LinkCard({ title, description, url, Icon, featured }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'glass rounded-glass p-4 flex items-start gap-3 transition-all duration-150',
        'hover:border-primary/30 hover:shadow-amber-glow active:scale-[0.98]',
        featured && 'border-primary/20'
      )}
    >
      <div className={cn('p-2 rounded-lg mt-0.5 shrink-0', featured ? 'bg-primary/15' : 'bg-white/5')}>
        {Icon ? (
          <Icon size={18} className={featured ? 'text-primary' : 'text-muted-foreground'} />
        ) : (
          <ExternalLink size={18} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm leading-snug', featured && 'text-primary')}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <ExternalLink size={13} className="text-muted-foreground/40 mt-1 shrink-0" />
    </a>
  );
}

export default function Links({ links = [] }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      {/* Featured / pinned */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Featured
        </h2>
        <div className="space-y-2">
          {PINNED.map((link) => (
            <LinkCard key={link.url} {...link} featured />
          ))}
        </div>
      </section>

      {/* Dynamic school links from Firebase */}
      {links.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            School Links
          </h2>
          <div className="space-y-2">
            {links.map((link) => (
              <LinkCard key={link.url} title={link.title} url={link.url} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Delete old Link/Links CSS**

```bash
git rm src/components/Links.css src/components/LinksCss.css src/components/LinksCss.js src/components/Link.css 2>/dev/null; true
```

- [ ] **Step 3: Verify Links page**

```bash
pnpm start
```
Navigate to `/links`. Expected: "Install Claude Skill" card at top with amber Bot icon, description text, and amber border glow on hover.

- [ ] **Step 4: Commit**

```bash
git add src/components/Links.js
git commit -m "feat: rewrite Links page, add 'Install Claude Skill' featured card"
```

---

### Task 13: Rewrite Settings page

**Files:**
- Modify: `src/components/Settings.js`
- Delete: `src/components/Settings.css`

- [ ] **Step 1: Rewrite `src/components/Settings.js`**

```jsx
import React, { useState, useEffect } from 'react';
import { useBarcode } from 'react-hooks-barcode';
import * as storage from '../utils/storage';

function Barcode({ value }) {
  const { inputRef } = useBarcode({
    value,
    options: {
      displayValue: false,
      background: 'transparent',
      lineColor: '#F59E0B',
    },
  });
  return <svg ref={inputRef} className="w-full max-w-xs mx-auto block" />;
}

export default function Settings() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.getItem('studentName').then((v) => v && setName(v));
    storage.getItem('studentId').then((v) => v && setStudentId(v));
  }, []);

  const handleSave = async () => {
    await storage.setItem('studentName', name);
    await storage.setItem('studentId', studentId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      <h1 className="text-base font-semibold">Settings</h1>

      {/* Profile form */}
      <div className="glass rounded-glass p-4 space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Profile
        </h2>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/[.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="text"
            inputMode="numeric"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student ID number"
            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/[.08] text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full h-10 rounded-lg bg-primary text-black font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Library barcode */}
      {studentId.length > 0 && (
        <div className="glass rounded-glass p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Library Barcode
          </h2>
          <Barcode value={studentId} />
          <p className="text-xs text-center text-muted-foreground mt-2 font-mono">{studentId}</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Delete old CSS**

```bash
git rm src/components/Settings.css
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Settings.js
git commit -m "feat: rewrite Settings with glassmorphism card and styled inputs"
```

---

### Task 14: Rewrite About page + clean up remaining CSS

**Files:**
- Modify: `src/components/AboutPage.js`
- Modify: `src/components/Card.js`, `src/components/Disclaimer.js`
- Delete: `src/components/AboutPage.css`, `src/components/Credits.css`, `src/components/Card.css`, `src/components/Disclaimer.css`, `src/components/DatePicker.css`, `src/components/Calendar.css`

- [ ] **Step 1: Rewrite `src/components/AboutPage.js`**

```jsx
import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <h1 className="text-base font-semibold">About</h1>
      <div className="glass rounded-glass p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          MVHS App is an unofficial Progressive Web App for Mountain View High School,
          providing quick access to bell schedules, the campus map, and school events.
        </p>
        <div className="border-t border-white/[.08] pt-3">
          <p className="text-xs text-muted-foreground">
            Built by students, for students.{' '}
            <a
              href="https://github.com/mvhs-apps/mvhs-app-pwa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View source on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Update `src/components/Card.js`**

```jsx
import React from 'react';
import { cn } from '../utils/cn';

export default function Card({ children, className }) {
  return (
    <div className={cn('glass rounded-glass p-4', className)}>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Update `src/components/Disclaimer.js`**

```jsx
import React from 'react';

export default function Disclaimer({ message }) {
  if (!message) return null;
  return (
    <p className="text-xs text-muted-foreground text-center px-4 py-2 leading-relaxed">{message}</p>
  );
}
```

- [ ] **Step 4: Delete remaining old CSS**

```bash
git rm src/components/AboutPage.css src/components/Credits.css src/components/Card.css src/components/Disclaimer.css src/components/DatePicker.css src/components/Calendar.css 2>/dev/null; true
```

- [ ] **Step 5: Final build verification**

```bash
pnpm build
```
Expected: Clean build to `dist/`, no CSS import errors, no missing module errors.

- [ ] **Step 6: Preview full app**

```bash
pnpm preview
```
Open `http://localhost:4173`. Verify all 5 pages render: dark glassmorphism theme throughout, amber accents on active nav item and current bell period.

- [ ] **Step 7: Commit**

```bash
git add src/components/AboutPage.js src/components/Card.js src/components/Disclaimer.js
git commit -m "feat: rewrite About + utility components, remove all legacy CSS files"
```

---

### Task 15: React Native dark-theme overhaul

**Files:**
- Modify: `package.json`
- Create: `src/theme.native.js`
- Modify: `src/App.native.js`, `src/components/BellSchedule.native.js`, `src/components/SchedulePage.native.js`

> **Note:** Expo SDK 50 is a major upgrade from v23. The `pnpm install` step here may surface breaking-change peer dep warnings in other native packages; address them before the commit.

- [ ] **Step 1: Update Expo and React Navigation deps**

```bash
pnpm add expo@~50.0.0 react-native@0.73.0
pnpm add @react-navigation/native@6 @react-navigation/bottom-tabs@6
pnpm add react-native-safe-area-context react-native-screens
```

- [ ] **Step 2: Create `src/theme.native.js`**

```js
export const colors = {
  background: '#050506',
  surface: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  primary: '#F59E0B',
  secondary: '#3B82F6',
  foreground: '#EDEDEF',
  muted: '#8A8F98',
};

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
export const radius = { sm: 8, md: 12, lg: 16 };
```

- [ ] **Step 3: Rewrite `src/App.native.js`**

```jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Bell, Map, Link, Info, Settings } from 'lucide-react-native';
import { colors } from './theme.native';

import SchedulePageContainer from './containers/SchedulePageContainer';
import MapContainer from './containers/MapContainer';
import Links from './components/Links';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/Settings';

const Tab = createBottomTabNavigator();

const ICONS = { Schedule: Bell, Map, Links: Link, About: Info, Settings };

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: { backgroundColor: colors.background, borderBottomColor: colors.border, borderBottomWidth: 1 },
            headerTintColor: colors.foreground,
            headerTitleStyle: { fontWeight: '600', fontSize: 16 },
            tabBarStyle: { backgroundColor: 'rgba(5,5,6,0.85)', borderTopColor: colors.border, borderTopWidth: 1 },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 11 },
            tabBarIcon: ({ color, size }) => {
              const Icon = ICONS[route.name];
              return <Icon size={size} color={color} />;
            },
          })}
        >
          <Tab.Screen name="Schedule" component={SchedulePageContainer} />
          <Tab.Screen name="Map" component={MapContainer} />
          <Tab.Screen name="Links" component={Links} />
          <Tab.Screen name="About" component={AboutPage} />
          <Tab.Screen name="Settings" component={SettingsPage} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
```

- [ ] **Step 4: Rewrite `src/components/BellSchedule.native.js`**

```jsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme.native';

function PeriodCard({ name, start, end, isCurrent, progress }) {
  return (
    <View style={[styles.card, isCurrent && styles.cardActive]}>
      <View style={styles.row}>
        <Text style={[styles.name, isCurrent && { color: colors.primary }]}>{name}</Text>
        <Text style={styles.time}>{start} – {end}</Text>
      </View>
      {isCurrent && (
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.max(1, progress)}%` }]} />
        </View>
      )}
    </View>
  );
}

export default function BellSchedule({ periods, currentPeriod, scheduleName }) {
  if (!periods?.length) {
    return (
      <View style={styles.card}>
        <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 14 }}>No school today</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: spacing.sm }}>
      {scheduleName && (
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: spacing.xs }}>
          Schedule: <Text style={{ color: colors.foreground, fontWeight: '500' }}>{scheduleName}</Text>
        </Text>
      )}
      {periods.map((p) => (
        <PeriodCard
          key={p.name}
          name={p.name}
          start={p.start}
          end={p.end}
          isCurrent={currentPeriod?.name === p.name}
          progress={currentPeriod?.name === p.name ? currentPeriod.progress : 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md },
  cardActive: { borderColor: 'rgba(245,158,11,0.3)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.foreground, fontWeight: '500', fontSize: 14 },
  time: { color: colors.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  progressBg: { height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: spacing.sm, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
});
```

- [ ] **Step 5: Rewrite `src/components/SchedulePage.native.js`**

```jsx
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, spacing, radius } from '../theme.native';

export default function SchedulePage({ date, onDateChange, bellSchedule, calendar, weather }) {
  const isToday = date.isSame(new Date(), 'day');
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => onDateChange(date.clone().subtract(1, 'day'))} style={styles.navBtn} accessibilityLabel="Previous day">
          <ChevronLeft size={20} color={colors.foreground} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.dateTitle}>{isToday ? 'Today' : date.format('dddd')}</Text>
          <Text style={styles.dateSub}>{date.format('MMMM D, YYYY')}</Text>
        </View>
        <TouchableOpacity onPress={() => onDateChange(date.clone().add(1, 'day'))} style={styles.navBtn} accessibilityLabel="Next day">
          <ChevronRight size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>
      {weather}
      <Text style={styles.sectionLabel}>Bell Schedule</Text>
      {bellSchedule}
      <Text style={styles.sectionLabel}>Events</Text>
      {calendar}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: { padding: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border },
  dateTitle: { color: colors.foreground, fontWeight: '600', fontSize: 16 },
  dateSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionLabel: { color: colors.muted, fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1.2 },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/theme.native.js src/App.native.js src/components/BellSchedule.native.js src/components/SchedulePage.native.js package.json pnpm-lock.yaml
git commit -m "feat: overhaul React Native app — dark theme tokens, React Navigation v6 bottom tabs"
```

---

### Task 16: Final verification

**Files:**
- No changes — verification only

- [ ] **Step 1: Full production build**

```bash
pnpm build
```
Expected: Exits 0, `dist/` contains `index.html`, hashed JS/CSS bundles, no build errors.

- [ ] **Step 2: Preview and smoke-test all 5 pages**

```bash
pnpm preview
```
Open `http://localhost:4173` and verify:
- `/` — dark background loads, bottom nav visible, bell schedule renders with period cards, active period has amber progress bar
- `/map` — glassmorphism card wrapping campus map image
- `/links` — "Install Claude Skill" featured card at top with amber Bot icon; hover shows amber border glow
- `/about` — glassmorphism card with description and GitHub link
- `/settings` — profile inputs with styled dark fields; entering a student ID shows barcode

- [ ] **Step 3: Verify Vercel config is correct**

```bash
cat vercel.json
```
Confirm: `"buildCommand": "pnpm build"`, `"outputDirectory": "dist"`, SPA rewrite present.

- [ ] **Step 4: Verify env var is not committed**

```bash
git grep -r "AIzaSy" -- ':!.env.local' ':!.env.example'
```
Expected: no output (API key must not appear in any tracked file)

- [ ] **Step 5: Final commit**

```bash
git add .
git status
git commit -m "feat: complete MVHS App PWA overhaul — glassmorphism dark UI, Vite, pnpm, Vercel deploy"
```

---

## Self-Review

**Spec coverage:**
| Requirement | Task |
|---|---|
| npm → pnpm | Task 1 |
| Vercel deploy button + compatibility | Tasks 2, 3 |
| Glassmorphism dark UI (shadcn/Tailwind) | Tasks 6–14 |
| Google Calendar API key → env var | Task 5 |
| React Native overhaul | Task 15 |
| "Install Claude Skill" link | Task 12 |
| README pnpm instructions | Task 3 |

**Code improvements beyond the API key:**
- `console.log` removed from `firebase.js` (Task 5)
- React DOM version mismatch fixed: react-dom 16 → 18 (Task 4)
- `react-loadable` → `React.lazy` + `Suspense` (Task 7)
- `react-easy-swipe` → native `TouchEvent` refs (Task 10)
- Dead files removed: `Calendar-DESKTOP-2M7KSN7.js`, `CovidLinksContainer.js` (Task 5)
- Outdated `react-ga` analytics removed (Task 14)
- Flow type annotations removed — Vite handles JSX natively (Tasks 4, 7)
- Root `.babelrc` removed (Task 2)

**Placeholder scan:** No "TBD", "TODO", or "similar to Task N" references found.

**Token consistency:** `colors`, `spacing`, `radius` defined in Task 15 Step 2 (`src/theme.native.js`) and used identically across Tasks 15 Steps 4–5. CSS variables defined once in `src/index.css` (Task 6) and referenced via Tailwind tokens throughout Tasks 7–14.
