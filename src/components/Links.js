'use client';
import { useState } from 'react';
import { ExternalLink, Bot } from 'lucide-react';
import ClaudeSkillModal from './ClaudeSkillModal';

const LINKS = [
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
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-2">
      <button
        onClick={() => setModalOpen(true)}
        className="w-full glass rounded-glass p-4 flex items-center gap-3 transition-all duration-150 hover:border-primary/30 hover:shadow-amber-glow active:scale-[0.98] text-left"
      >
        <div className="p-2 rounded-lg bg-white/5 shrink-0">
          <Bot size={18} className="text-muted-foreground" />
        </div>
        <p className="font-medium text-sm flex-1">Install Claude Bell Schedule Skill</p>
        <ExternalLink size={13} className="text-muted-foreground/40 shrink-0" />
      </button>

      {LINKS.map((link) => (
        <LinkCard key={link.url} title={link.title} url={link.url} />
      ))}

      <ClaudeSkillModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
