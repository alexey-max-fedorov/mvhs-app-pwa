import React from 'react';
import { ExternalLink, Bot } from 'lucide-react';

const CLAUDE_SKILL_URL =
  'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill';

const LINKS = [
  { title: 'Install Claude Bell Schedule Skill', url: CLAUDE_SKILL_URL, icon: Bot },
  { title: 'Home Page', url: 'https://mvhs.mvla.net' },
  { title: 'Daily Bulletin', url: 'https://mvhs.mvla.net/daily-bulletin-home' },
  { title: 'MVHS Staff', url: 'https://mvhs.mvla.net/Staff-Directory/index.html' },
  { title: 'Canvas', url: 'https://mvla.instructure.com/login/canvas' },
  { title: 'Aeries Portal', url: 'https://mvla.asp.aeries.net/student/' },
  { title: 'Mental Health Access', url: 'https://www.mvla.net/mental-health-and-wellness' },
  { title: 'Sexual Harassment Help', url: 'https://www.mvla.net/sexual-harassment-and-resources' },
];

function LinkCard({ title, url, icon: Icon = ExternalLink }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass rounded-glass p-4 flex items-center gap-3 transition-all duration-150 hover:border-primary/30 hover:shadow-amber-glow active:scale-[0.98]"
    >
      <div className="p-2 rounded-lg bg-white/5 shrink-0">
        <Icon size={18} className="text-muted-foreground" />
      </div>
      <p className="font-medium text-sm flex-1">{title}</p>
      <ExternalLink size={13} className="text-muted-foreground/40 shrink-0" />
    </a>
  );
}

export default function Links() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
      {LINKS.map((link) => (
        <LinkCard key={link.url} title={link.title} url={link.url} icon={link.icon} />
      ))}
    </div>
  );
}
