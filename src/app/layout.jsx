import { ViewTransitions } from 'next-view-transitions';
import Shell from '../components/Shell';
import '../index.css';

const BASE_URL = 'https://mvhs.pro';

export const metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'MVHS App – Mountain View High School',
    template: '%s | MVHS App',
  },
  description:
    'The official student app for Mountain View High School. Check your bell schedule, view the campus map, access student links, and more.',
  keywords: [
    'Mountain View High School',
    'MVHS',
    'bell schedule',
    'campus map',
    'MVHS App',
    'Mountain View CA',
    'student app',
    'high school schedule',
  ],
  authors: [{ name: 'MVHS App' }],
  creator: 'MVHS App',
  applicationName: 'MVHS App',
  referrer: 'origin-when-cross-origin',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: 'MVHS App',
    title: 'MVHS App – Mountain View High School',
    description:
      'The official student app for Mountain View High School. Check your bell schedule, view the campus map, access student links, and more.',
    images: [
      {
        url: '/icons/icon-512.png',
        width: 512,
        height: 512,
        alt: 'MVHS App logo',
      },
    ],
  },
  twitter: {
    card: 'summary',
    title: 'MVHS App – Mountain View High School',
    description:
      'The official student app for Mountain View High School. Check your bell schedule, view the campus map, and more.',
    images: ['/icons/icon-512.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icons/icon-192.png',
  },
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
