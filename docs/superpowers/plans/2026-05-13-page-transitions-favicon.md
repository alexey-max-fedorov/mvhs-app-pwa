# Page Transitions + Favicon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add scale+fade View Transitions API animations between the five tab pages, and add a missing favicon using the amber-colored outline logo.

**Architecture:** `next-view-transitions` intercepts Next.js navigation and calls `document.startViewTransition()` before each route change. CSS `::view-transition-new/old` pseudo-elements drive the animation. The favicon is the existing `outlinelogo.svg` recolored to amber (`#f59e0b`), converted to ICO via ImageMagick, and wired into Next.js `metadata.icons`.

**Tech Stack:** Next.js 15 App Router, `next-view-transitions`, CSS View Transitions API, ImageMagick (`magick` CLI)

---

## File Map

| File | Action | Purpose |
|---|---|---|
| `package.json` | modify | add `next-view-transitions` dependency |
| `src/app/layout.jsx` | modify | add `<ViewTransitions>` wrapper + `metadata.icons` |
| `src/components/Shell.jsx` | modify | swap `next/link` → `next-view-transitions` Link |
| `src/index.css` | modify | add `::view-transition-new/old` keyframes |
| `public/favicon.svg` | create | amber-recolored copy of `outlinelogo.svg` |
| `public/favicon.ico` | create | 32×32 ICO generated from `favicon.svg` via ImageMagick |

---

### Task 1: Install next-view-transitions

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install the package**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa && pnpm add next-view-transitions
```

Expected: package installs, `package.json` now lists `"next-view-transitions"` in `dependencies`.

- [ ] **Step 2: Verify**

```bash
grep "next-view-transitions" /Users/alexey/Projects/mvhs-app-pwa/package.json
```

Expected: line like `"next-view-transitions": "^0.x.x"`

- [ ] **Step 3: Commit**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
git add package.json pnpm-lock.yaml
git commit -m "chore: add next-view-transitions"
```

---

### Task 2: Add CSS view transition animations

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Append the keyframes and pseudo-element rules at the end of `src/index.css`**

Open `src/index.css` and append after the last closing `}`:

```css
@keyframes page-scale-in {
  from { opacity: 0; transform: scale(0.885); }
  to   { opacity: 1; transform: scale(1); }
}
@keyframes page-fade-out {
  from { opacity: 1; }
  to   { opacity: 0; }
}

::view-transition-new(root) {
  animation: page-scale-in 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}
::view-transition-old(root) {
  animation: page-fade-out 150ms ease both;
}

@media (prefers-reduced-motion: reduce) {
  ::view-transition-new(root),
  ::view-transition-old(root) { animation: none; }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
git add src/index.css
git commit -m "feat: add view transition CSS keyframes"
```

---

### Task 3: Wire ViewTransitions into layout and swap Link in Shell

**Files:**
- Modify: `src/app/layout.jsx`
- Modify: `src/components/Shell.jsx`

- [ ] **Step 1: Update `src/app/layout.jsx`**

Replace the entire file with:

```jsx
import { ViewTransitions } from 'next-view-transitions';
import Shell from '../components/Shell';
import '../index.css';

export const metadata = {
  title: 'MVHS App',
  description: 'Mountain View High School student app',
};

export const viewport = {
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
        <ViewTransitions>
          <Shell>{children}</Shell>
        </ViewTransitions>
      </body>
    </html>
  );
}
```

Note: `metadata.icons` will be added in Task 5 once the favicon files exist.

- [ ] **Step 2: Update the import in `src/components/Shell.jsx`**

Change line 4 from:

```jsx
import NextLink from 'next/link';
```

to:

```jsx
import { Link as NextLink } from 'next-view-transitions';
```

No other changes to Shell.jsx are needed — `NextLink` is already used correctly throughout.

- [ ] **Step 3: Commit**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
git add src/app/layout.jsx src/components/Shell.jsx
git commit -m "feat: wire view transitions into layout and Shell nav"
```

---

### Task 4: Create favicon.svg

**Files:**
- Create: `public/favicon.svg`

The source SVG (`public/outlinelogo.svg`) uses `fill="#424242"` on its main shape group and has white overlay layers with `mix-blend-mode:multiply`. For the favicon, replace `#424242` with `#f59e0b` (amber brand color). The white multiply layers are harmless at small sizes.

- [ ] **Step 1: Create `public/favicon.svg`**

Create `public/favicon.svg` with the following content (same paths as `outlinelogo.svg`, amber fill substituted):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 107.9 124.5"><title>favicon</title><g data-name="Layer 3" style="isolation:isolate"><g fill="#f59e0b"><path d="M25.3 46.4l11.5 8-1.7 2-13-4.7a35.8 35.8 0 0 1 3.3-5.3zm6-6.7a49.5 49.5 0 0 0-4.2 4.4L39 52l2.2-2zm7.2-6l-5 4 9.8 10.6a32.7 32.7 0 0 1 3.6-2zM19.3 59.6l13.2 1.2 1-1.6-12.7-4.5a36.2 36.2 0 0 0-1.5 5zM28.6 37c22.4-22.4 55.2-12.4 63-9l10.6-20.2s-42.2-20.5-76.8 5C-19.5 44.7 9 84.5 9 98.3S2.8 115 2.8 115c-.2.4 13-3 12.6-26.2S8.6 57 28.6 37zm-9.8 25.5a55.4 55.4 0 0 0-.2 13.5s3-8.6 11.7-9.7a22 22 0 0 1 1-2.7zm28.7-33a31.8 31.8 0 0 0-6.5 2.8L49.6 45l2-.7zM108 95a36.8 36.8 0 0 1-7-11c-3-7-7.4-35.4-39.4-36-16.6-.3-29 13.7-27.4 31.4.8 9.4 4 11.8 4 19.2a100.6 100.6 0 0 1-1.6 15c.2-.2 26.7-7 26.7-7s20.5 15.6 31.3 18c-.4 0-4.7-34-3.2-37-3.2.3-10.5.4-16.5-8.3 0 0 14.8-11 22 4.4v11.6zM67 33.6c3.5-3 11.6-4.7 11.6-4.7a76.3 76.3 0 0 0-18.3-1.6v15.3l3-.3s.3-5.8 3.8-8.7zm-9.6-6a49.7 49.7 0 0 0-7 1l4 15 3-.6z"/><path d="M25.3 46.4l11.5 8-1.7 2-13-4.7a35.8 35.8 0 0 1 3.3-5.3zm6-6.7a49.5 49.5 0 0 0-4.2 4.4L39 52l2.2-2zm7.2-6l-5 4 9.8 10.6a32.7 32.7 0 0 1 3.6-2zM19.3 59.6l13.2 1.2 1-1.6-12.7-4.5a36.2 36.2 0 0 0-1.5 5zM28.6 37c22.4-22.4 55.2-12.4 63-9l10.6-20.2s-42.2-20.5-76.8 5C-19.5 44.7 9 84.5 9 98.3S2.8 115 2.8 115c-.2.4 13-3 12.6-26.2S8.6 57 28.6 37zm-9.8 25.5a55.4 55.4 0 0 0-.2 13.5s3-8.6 11.7-9.7a22 22 0 0 1 1-2.7zm28.7-33a31.8 31.8 0 0 0-6.5 2.8L49.6 45l2-.7zM108 95a36.8 36.8 0 0 1-7-11c-3-7-7.4-35.4-39.4-36-16.6-.3-29 13.7-27.4 31.4.8 9.4 4 11.8 4 19.2a100.6 100.6 0 0 1-1.6 15c.2-.2 26.7-7 26.7-7s20.5 15.6 31.3 18c-.4 0-4.7-34-3.2-37-3.2.3-10.5.4-16.5-8.3 0 0 14.8-11 22 4.4v11.6zM67 33.6c3.5-3 11.6-4.7 11.6-4.7a76.3 76.3 0 0 0-18.3-1.6v15.3l3-.3s.3-5.8 3.8-8.7zm-9.6-6a49.7 49.7 0 0 0-7 1l4 15 3-.6z"/></g></g></svg>
```

(This is `outlinelogo.svg` with the `fill="#424242"` group changed to `fill="#f59e0b"` and the white `mix-blend-mode:multiply` overlay groups removed, since they serve no purpose in a solid-color favicon.)

- [ ] **Step 2: Commit**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
git add public/favicon.svg
git commit -m "feat: add amber favicon SVG"
```

---

### Task 5: Generate favicon.ico and wire metadata

**Files:**
- Create: `public/favicon.ico`
- Modify: `src/app/layout.jsx`

- [ ] **Step 1: Generate 32×32 favicon.ico using ImageMagick**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
magick -background none public/favicon.svg -resize 32x32 /tmp/fav32.png
magick -background none public/favicon.svg -resize 16x16 /tmp/fav16.png
magick /tmp/fav16.png /tmp/fav32.png public/favicon.ico
```

- [ ] **Step 2: Verify the ICO was created**

```bash
ls -lh /Users/alexey/Projects/mvhs-app-pwa/public/favicon.ico
magick identify /Users/alexey/Projects/mvhs-app-pwa/public/favicon.ico
```

Expected: file exists, `identify` shows two frames (16×16 and 32×32).

- [ ] **Step 3: Add `metadata.icons` to `src/app/layout.jsx`**

Update the `metadata` export (lines 4–8 of `src/app/layout.jsx`) to:

```jsx
export const metadata = {
  title: 'MVHS App',
  description: 'Mountain View High School student app',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
};
```

- [ ] **Step 4: Commit**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa
git add public/favicon.ico src/app/layout.jsx
git commit -m "feat: add favicon ICO and wire metadata.icons"
```

---

### Task 6: Start dev server and verify

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/alexey/Projects/mvhs-app-pwa && pnpm dev
```

Expected: server starts on `http://localhost:3000` (or 3001/3002 if ports are taken — check terminal output).

- [ ] **Step 2: Verify transitions**

Open the URL in a browser (Chrome or Safari — View Transitions API required). Navigate between tabs using the bottom nav bar. You should see:
- New page scales in from 0.885 → 1.0 over 300ms with a spring easing
- Old page fades out over 150ms
- On rapid taps, transitions complete cleanly without visual glitches

- [ ] **Step 3: Verify favicon**

Check the browser tab — the MVHS amber logo should appear as the favicon. In Chrome DevTools → Application → Manifest, the icon should be listed.

- [ ] **Step 4: Verify reduced-motion fallback**

In Chrome DevTools → Rendering → Emulate CSS media feature → `prefers-reduced-motion: reduce`. Navigate between tabs — transitions should be instant (no animation).

- [ ] **Step 5: Check for console errors**

Open DevTools console and navigate between all 5 tabs. No errors should appear.
