'use client';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link as NextLink } from 'next-view-transitions';
import { Bell, Map, Link as LinkIcon, Info, Barcode, Bot, Sun, Moon } from 'lucide-react';
import { useTheme } from '../utils/useTheme';
import ClaudeSkillModal from './ClaudeSkillModal';

const NAV = [
  { to: '/', icon: Bell, label: 'Schedule' },
  { to: '/map', icon: Map, label: 'Map' },
  { to: '/links', icon: LinkIcon, label: 'Links' },
  { to: '/barcode', icon: Barcode, label: 'Barcode' },
  { to: '/about', icon: Info, label: 'About' },
];

export default function Shell({ children }) {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const [skillModalOpen, setSkillModalOpen] = useState(false);

  const isActive = (to) => {
    if (to === '/') return pathname === '/';
    return pathname === to;
  };

  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      <header className="glass-nav sticky top-0 z-40 flex items-center gap-3 px-4 py-3 border-b border-white/[.08]">
        <img src={theme === 'dark' ? '/favicon.svg' : '/outlinelogo.svg'} className="h-7 w-7" alt="MVHS Logo" />
        <span className="text-base font-semibold tracking-tight">MVHS</span>
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="ml-auto p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          {theme === 'dark' ? (
            <Sun size={20} strokeWidth={1.75} />
          ) : (
            <Moon size={20} strokeWidth={1.75} />
          )}
        </button>
        <button
          onClick={() => setSkillModalOpen(true)}
          title="Install Claude Skill"
          aria-label="Install Claude Skill"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
        >
          <Bot size={20} strokeWidth={1.75} />
        </button>
      </header>
      <ClaudeSkillModal isOpen={skillModalOpen} onClose={() => setSkillModalOpen(false)} />

      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      <nav aria-label="Main" className="glass-nav fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-white/[.08] safe-area-pb">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NextLink
            key={to}
            href={to}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 text-[11px] transition-colors duration-150 ${
              isActive(to) ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            <Icon size={22} strokeWidth={1.75} />
            <span>{label}</span>
          </NextLink>
        ))}
      </nav>
    </div>
  );
}
