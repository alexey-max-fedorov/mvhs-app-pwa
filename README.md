# MVHS App PWA

An unofficial Progressive Web App for Mountain View High School — bell schedules, campus maps, and school events.

Live: [mvhs.pro](https://mvhs.pro)

## Development

Requires Node.js 18+ and [pnpm](https://pnpm.io) 8+.

```bash
# Install pnpm if needed
npm install -g pnpm

# Install dependencies
pnpm install

# Start dev server (http://localhost:3000)
pnpm dev

# Static export → out/
pnpm build
```

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY` | Google Calendar API key for the school calendar |

## Deploy (GitHub Pages)

Pushes to `master` run `.github/workflows/deploy-website.yml`, which builds the static export (`output: 'export'`) and deploys `out/` to GitHub Pages. The custom domain is set via `public/CNAME` (`mvhs.pro`). The calendar API key is a public browser key, set as `NEXT_PUBLIC_GOOGLE_CALENDAR_API_KEY` in the workflow env.
