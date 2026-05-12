import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Bell, Map, Link, Info, Barcode, Bot, Sun, Moon } from 'lucide-react';
import { useTheme } from './utils/useTheme.js';
import logo from './assets/outlinelogo.svg';

const CLAUDE_SKILL_URL =
  'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill';

const SchedulePage = React.lazy(() => import('./containers/SchedulePageContainer'));
const MapPage = React.lazy(() => import('./containers/MapContainer'));
const LinksPage = React.lazy(() => import('./components/Links'));
const AboutPage = React.lazy(() => import('./components/AboutPage'));
const SettingsPage = React.lazy(() => import('./components/Settings'));

const NAV = [
  { to: '/', icon: Bell, label: 'Schedule', end: true },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/links', icon: Link, label: 'Links' },
  { to: '/barcode', icon: Barcode, label: 'Barcode' },
  { to: '/about', icon: Info, label: 'About' },
];

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-dvh bg-background text-foreground">
        {/* Top header */}
        <header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
          <img src={logo} className="h-7 w-7" alt="MVHS Logo" />
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

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pb-20">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<SchedulePage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/links" element={<LinksPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/barcode" element={<SettingsPage />} />
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
