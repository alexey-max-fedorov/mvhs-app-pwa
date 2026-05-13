'use client';
import { useEffect, useState } from 'react';
import { Bot, X } from 'lucide-react';

const CLAUDE_SKILL_URL =
  'https://claude.ai/new?q=Install%20the%20skill%20from%20https%3A%2F%2Fgithub.com%2Falexey-max-fedorov%2Fmvhs-bellschedule-skill';

export default function ClaudeSkillModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 250);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mounted) return;
    // Double RAF: first fires after React commits, second fires after the browser paints
    // the invisible state — giving CSS a real starting point to transition from.
    let id2;
    const id1 = requestAnimationFrame(() => {
      id2 = requestAnimationFrame(() => setVisible(true));
    });
    return () => {
      cancelAnimationFrame(id1);
      cancelAnimationFrame(id2);
    };
  }, [mounted]);

  if (!mounted) return null;

  const handleInstall = () => {
    window.open(CLAUDE_SKILL_URL, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-150 motion-reduce:transition-none ${visible ? 'opacity-100' : 'opacity-0'}`}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative glass rounded-glass p-6 max-w-sm w-full space-y-5 transition-all duration-200 ease-out motion-reduce:transition-none ${visible ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-primary/15 shrink-0">
            <Bot size={22} className="text-primary" />
          </div>
          <h2 className="text-base font-semibold leading-tight">
            Install Claude Bell Schedule Skill
          </h2>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">
          This opens <span className="text-foreground font-medium">claude.ai</span> and
          installs a skill that lets you ask Claude for the MVHS bell schedule directly
          inside any conversation.
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-medium bg-white/8 hover:bg-white/12 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 hover:border-primary/50 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
