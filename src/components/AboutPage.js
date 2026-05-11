import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      <h1 className="text-base font-semibold">About</h1>
      <div className="glass rounded-glass p-4 space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          MVHS App is an unofficial Progressive Web App for Mountain View High School,
          providing quick access to bell schedules, the campus map, and school events.
        </p>
        <div className="border-t border-white/[.08] pt-3">
          <p className="text-xs text-muted-foreground">
            Built by students, for students.{' '}
            <a
              href="https://github.com/mvhs-apps/mvhs-app-pwa"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              View source on GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
