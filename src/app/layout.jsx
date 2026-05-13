import { ViewTransitions } from 'next-view-transitions';
import Shell from '../components/Shell';
import '../index.css';

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
