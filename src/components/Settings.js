'use client';
import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import * as storage from '../utils/storage';

const BARCODE_MIN_LENGTH = 4;

function Barcode({ value }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, value, {
        format: 'CODE128',
        displayValue: false,
        background: 'transparent',
        lineColor: '#F59E0B',
        margin: 8,
      });
    } catch {
      // invalid barcode value — error boundary handles display
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full max-w-xs mx-auto block" />;
}

class BarcodeErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) this.setState({ error: false });
  }
  render() {
    if (this.state.error) {
      return (
        <p className="text-xs text-center text-muted-foreground py-4">
          Could not generate barcode for this ID.
        </p>
      );
    }
    return this.props.children;
  }
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

  const showBarcode = studentId.length >= BARCODE_MIN_LENGTH;

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-5">
      <h1 className="text-base font-semibold">Settings</h1>

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

      {showBarcode && (
        <div className="glass rounded-glass p-4">
          <h2 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Barcode
          </h2>
          <BarcodeErrorBoundary value={studentId}>
            <Barcode value={studentId} />
          </BarcodeErrorBoundary>
          <p className="text-xs text-center text-muted-foreground mt-2 font-mono">{studentId}</p>
        </div>
      )}
    </div>
  );
}
