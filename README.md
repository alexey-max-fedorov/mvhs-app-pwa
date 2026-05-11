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
