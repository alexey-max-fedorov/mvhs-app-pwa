import React, { useState, useEffect } from 'react';
import { useBarcode } from 'react-hooks-barcode';
import * as storage from '../utils/storage';

function Barcode({ value }) {
  const { inputRef } = useBarcode({
    value,
    options: {
      displayValue: false,
      background: 'transparent',
      lineColor: '#F59E0B',
    },
  });
  return <svg ref={inputRef} className="w-full max-w-xs mx-auto block" />;
}

export default function Settings() {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    storage.getItem('studentName').then((v) => v && setName(v));
    storage.getItem('studentId').then((v) => v && setStudentId(v));
  }, []);

  const handleSave = async () => {
    await storage.setItem('studentName', name);
    await storage.setItem('studentId', studentId);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      <h1 className="text-base font-semibold">Settings</h1>

      {/* Profile form */}
      <div className="glass rounded-glass p-4 space-y-4">
        <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Profile
        </h2>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/[.08] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground" htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="text"
            inputMode="numeric"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Student ID number"
            className="w-full h-10 px-3 rounded-lg bg-white/5 border border-white/[.08] text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
        <button
          onClick={handleSave}
          className="w-full h-10 rounded-lg bg-primary text-black font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98]"
        >
          {saved ? 'Saved ✓' : 'Save'}
        </button>
      </div>

      {/* Library barcode */}
      {studentId.length > 0 && (
        <div className="glass rounded-glass p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Library Barcode
          </h2>
          <Barcode value={studentId} />
          <p className="text-xs text-center text-muted-foreground mt-2 font-mono">{studentId}</p>
        </div>
      )}
    </div>
  );
}
