import React from 'react';

export default function Disclaimer({ message }) {
  if (!message) return null;
  return (
    <p className="text-xs text-muted-foreground text-center px-4 py-2 leading-relaxed">{message}</p>
  );
}
