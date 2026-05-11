import React from 'react';
import { ExternalLink, Bot } from 'lucide-react';
import { cn } from '../utils/cn';

const PINNED = [
  {
    title: 'Install Claude Skill',
    description: 'Fetch the MVHS bell schedule directly in Claude Chat — no extra setup needed.',
    url: 'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill',
    Icon: Bot,
  },
];

function LinkCard({ title, description, url, Icon, featured }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'glass rounded-glass p-4 flex items-start gap-3 transition-all duration-150',
        'hover:border-primary/30 hover:shadow-amber-glow active:scale-[0.98]',
        featured && 'border-primary/20'
      )}
    >
      <div className={cn('p-2 rounded-lg mt-0.5 shrink-0', featured ? 'bg-primary/15' : 'bg-white/5')}>
        {Icon ? (
          <Icon size={18} className={featured ? 'text-primary' : 'text-muted-foreground'} />
        ) : (
          <ExternalLink size={18} className="text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('font-medium text-sm leading-snug', featured && 'text-primary')}>
          {title}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      <ExternalLink size={13} className="text-muted-foreground/40 mt-1 shrink-0" />
    </a>
  );
}

export default function Links({ links = [] }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      {/* Featured / pinned */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
          Featured
        </h2>
        <div className="space-y-2">
          {PINNED.map((link) => (
            <LinkCard key={link.url} {...link} featured />
          ))}
        </div>
      </section>

      {/* Dynamic school links from Firebase */}
      {links.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2 px-1">
            School Links
          </h2>
          <div className="space-y-2">
            {links.map((link) => (
              <LinkCard key={link.url} title={link.title} url={link.url} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
