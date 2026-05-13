# Page Transition Animations — Design Spec
_2026-05-13_

## Overview

Add a scale+fade animation when navigating between the five bottom-tab pages in the MVHS PWA. Uses the native View Transitions API via the `next-view-transitions` package.

## Animation Spec

- **Style:** Scale + fade (new page scales up from 0.885 → 1, old page fades out)
- **Enter duration:** 300ms, `cubic-bezier(0.22, 1, 0.36, 1)` (spring-like)
- **Exit duration:** 150ms, `ease` (old page out quickly before new page arrives)
- **Reduced motion:** Both animations disabled via `prefers-reduced-motion: reduce`

## Implementation

### Dependency

```
next-view-transitions  (~2KB)
```

### Files Changed

| File | Change |
|---|---|
| `package.json` | add `next-view-transitions` |
| `src/app/layout.jsx` | add `<ViewTransitions />` component inside `<body>` |
| `src/components/Shell.jsx` | swap `import NextLink from 'next/link'` → `import { Link as NextLink } from 'next-view-transitions'` |
| `src/index.css` | add `::view-transition-new/old` keyframes + `prefers-reduced-motion` guard |

### CSS

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

## Favicon Fix

The app currently has no favicon. Add a standard set:

- `public/favicon.ico` — 32×32, classic browser tab icon
- `public/favicon.svg` — vector version for modern browsers
- Wire into `src/app/layout.jsx` via Next.js `metadata.icons`

Create `public/favicon.svg` by copying `public/outlinelogo.svg` and setting `fill="#f59e0b"` (amber brand color) on the root SVG element. Generate `public/favicon.ico` (32×32) from that SVG using a CLI tool (e.g. `sharp-cli` or `svgexport` + ImageMagick).

## Scope

- Transitions apply to all five bottom-tab navigations (Schedule, Map, Links, Barcode, About)
- No per-route directional logic — same animation for all tab switches
- No exit animation complexity — old page fades out simply while new page enters
- Browser support: Chrome 111+, Safari 18+. Unsupported browsers (Firefox) get instant navigation (graceful degradation, no JS errors)
