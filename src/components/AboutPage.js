'use client';
import React from 'react';
import { Globe, Mail, ExternalLink } from 'lucide-react';
import { usePageTransitions } from '../utils/usePageTransitions';

const CREDITS = [
  {
    name: 'Daniel Ciao',
    role: 'CS Club VP of Tech · Class of 2018',
    desc: 'Project Lead, overall app framework and design',
    links: {
      Website: 'http://pluscubed.com',
      GitHub: 'http://github.com/pluscubed',
      Email: 'mailto:pluscubed@gmail.com',
      LinkedIn: 'https://www.linkedin.com/in/dciao/',
    },
  },
  {
    name: 'Marc Bacvanski',
    role: 'CS Club President · Class of 2019',
    desc: 'Project Lead',
    links: {
      GitHub: 'http://github.com/mbacvanski',
      Email: 'mailto:marc.bacvanski@gmail.com',
      LinkedIn: 'https://www.linkedin.com/in/mbacvanski/',
    },
  },
  {
    name: 'Alexey Fedorov',
    role: 'Class of 2026',
    desc: 'Redesign',
    links: {
      Website: 'https://alexey-fedorov.com',
      GitHub: 'https://github.com/alexey-max-fedorov',
      Email: 'mailto:alexey.max.fedorov@gmail.com',
      LinkedIn: 'https://www.linkedin.com/in/alexey-fedorov/',
    },
  },
  {
    name: 'Patrick Brown',
    role: 'Class of 2019',
    links: {},
  },
  {
    name: 'Ron Arel',
    role: 'Class of 2021',
    desc: 'Links and design maintenance',
    links: {
      GitHub: 'http://github.com/OverAny',
      Email: 'mailto:ronarel123@gmail.com',
      LinkedIn: 'https://www.linkedin.com/in/ron-arel-58b684140/',
    },
  },
  {
    name: 'John Park',
    role: 'Class of 2021',
    desc: 'Map Search',
    links: {},
  },
  {
    name: 'Andrew Runke',
    role: 'Class of 2021',
    links: {},
  },
  {
    name: 'Atulya Weise',
    role: 'Class of 2025',
    desc: 'School Map',
    links: {
      GitHub: 'https://github.com/atultw',
    },
  },
  {
    name: 'Zephiris Evergreen',
    role: 'Class of 2022',
    desc: 'Periods, Page Progress Bar, COVID Tracker, & Weather',
    links: {
      Website: 'http://zephiris.me',
      GitHub: 'https://github.com/zphrs',
    },
  },
  {
    name: 'Ava Seto',
    role: 'Class of 2025',
    desc: 'School Map',
    links: {},
  },
  {
    name: 'Nathan Leong, Katie Liu',
    role: 'Class of 2025',
    desc: 'School Map',
    links: {},
  },
  {
    name: 'Ilan Gerber, Yash Maheshwari, Arjun Shankar, Nikita Narang',
    role: 'Class of 2027 / 2026',
    desc: 'School Map',
    links: {},
  },
  {
    name: 'Ly Nguyen',
    role: 'CS Club Advisor · Computer Science Teacher',
    links: {
      Email: 'mailto:ly.nguyen@mvla.net',
    },
  },
];

const LINK_ICONS = { Website: Globe, Email: Mail };

function initials(name) {
  const words = name.trim().split(/[\s,]+/).filter(Boolean);
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
}

function CreditCard({ name, role, desc, links }) {
  const init = initials(name);
  const linkEntries = Object.entries(links ?? {});

  return (
    <div className="glass rounded-glass p-4 flex gap-3">
      <div className="shrink-0 w-9 h-9 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center">
        <span className="text-[11px] font-semibold text-primary">{init}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm leading-tight">{name}</p>
        {role && <p className="text-xs text-muted-foreground mt-0.5">{role}</p>}
        {desc && <p className="text-xs text-muted-foreground/60 mt-0.5">{desc}</p>}
        {linkEntries.length > 0 && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            {linkEntries.map(([label, url]) => {
              const Icon = LINK_ICONS[label] ?? ExternalLink;
              return (
                <a
                  key={label}
                  href={url}
                  target={url.startsWith('mailto:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon size={11} />
                  <span>{label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AboutPage() {
  const { enabled, toggle } = usePageTransitions();

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <h1 className="text-base font-semibold">About</h1>

      <div className="glass rounded-glass p-4 space-y-3 text-center">
        <p className="text-base font-semibold">MVHS Computer Science Club</p>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Join us to help develop this app and others for the MVHS community! No programming experience necessary.
        </p>
        <a
          href="https://github.com/mvhs-apps/mvhs-app-pwa"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs font-semibold uppercase tracking-widest text-primary hover:underline"
        >
          GitHub
        </a>
        <div className="border-t border-white/[.08] pt-3">
          <p className="text-xs text-muted-foreground">
            Information on this page may not be current. Please see the{' '}
            <a
              href="https://mvhs.mvla.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              official school website
            </a>{' '}
            for authoritative info.
          </p>
        </div>
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Credits
      </p>

      <div className="space-y-2">
        {CREDITS.map((c) => (
          <CreditCard key={c.name} {...c} />
        ))}
      </div>

      <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground px-1">
        Display
      </p>

      <div className="glass rounded-glass p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium">Page transitions</p>
            <p className="text-xs text-muted-foreground mt-0.5">Animate when switching tabs</p>
          </div>
          <button
            role="switch"
            aria-checked={enabled}
            onClick={toggle}
            className={`relative shrink-0 w-11 h-6 rounded-full transition-colors duration-200 ${enabled ? 'bg-primary' : 'bg-white/10'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
