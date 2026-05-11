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
