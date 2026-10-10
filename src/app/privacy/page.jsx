export const metadata = {
  title: 'Privacy Policy',
  description:
    'How the MVHS App handles data: no accounts, no cookies, and only cookieless aggregate website analytics.',
  openGraph: {
    title: 'Privacy Policy | MVHS App',
    description: 'How the MVHS App handles data.',
    url: 'https://mvhs.pro/privacy',
  },
};

const SECTIONS = [
  {
    heading: 'The short version',
    body: 'The MVHS App has no accounts, no sign-in, and no advertising. It sets no cookies and does not identify you. The website uses cookieless, aggregate analytics to count page views.',
  },
  {
    heading: 'What is stored on your device',
    body: 'The app saves your theme preference (light or dark) and cached schedule data in your browser so it works quickly and offline. This stays on your device and is never sent to us.',
  },
  {
    heading: 'Website analytics',
    body: 'mvhs.pro is hosted on GitHub Pages behind Cloudflare and uses Cloudflare Web Analytics, a cookieless, privacy-first service that reports aggregate page views and basic performance metrics. It does not use cookies or local storage for analytics, does not fingerprint visitors, and does not track you across sites.',
  },
  {
    heading: 'Third-party services',
    body: 'To show the bell schedule and calendar, the app requests public data from a Firebase database and the Google Calendar API. Weather and map features may load public data from their providers. Those requests are made directly from your browser and are covered by each provider\'s own privacy policy. GitHub and Cloudflare may also process standard request data, such as IP addresses, to serve the site.',
  },
  {
    heading: 'Children',
    body: 'The app is made by students for students and collects no personal information from anyone, including children.',
  },
  {
    heading: 'Changes',
    body: 'If this ever changes, this page will be updated first. Questions? Open an issue at github.com/mvhs-apps/mvhs-app-pwa or email alexey.max.fedorov@gmail.com.',
  },
];

export default function PrivacyPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <h1 className="text-base font-semibold">Privacy Policy</h1>
      <p className="text-xs text-muted-foreground">Effective date: October 10, 2026</p>
      {SECTIONS.map((s) => (
        <div key={s.heading} className="glass rounded-glass p-4 space-y-2">
          <h2 className="text-sm font-semibold">{s.heading}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
        </div>
      ))}
    </div>
  );
}
