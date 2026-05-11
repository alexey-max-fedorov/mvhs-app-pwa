import React from 'react';
import { cn } from '../utils/cn';

export default function Card({ children, className }) {
  return (
    <div className={cn('glass rounded-glass p-4', className)}>
      {children}
    </div>
  );
}
