'use client';
import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

function MapLightbox({ src, alt, onClose }) {
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const state = useRef({
    scale: 1, x: 0, y: 0,
    dragging: false, startX: 0, startY: 0, startOX: 0, startOY: 0,
    pinching: false, startDist: 0, startScale: 1, midX: 0, midY: 0, startPinchOX: 0, startPinchOY: 0,
    lastTap: 0,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const s = state.current;

    const clampScale = (v) => Math.max(1, Math.min(10, v));
    const getDist = (t1, t2) => Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const getMid = (t1, t2) => ({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 });

    const applyTransform = (scale, x, y, animate = false) => {
      s.scale = scale; s.x = x; s.y = y;
      if (!imgRef.current) return;
      imgRef.current.style.transition = animate ? 'transform 0.25s ease' : 'none';
      imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
      if (animate) setTimeout(() => { if (imgRef.current) imgRef.current.style.transition = 'none'; }, 260);
    };

    const onWheel = (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.9;
      applyTransform(clampScale(s.scale * factor), s.x, s.y);
    };

    const onMouseDown = (e) => {
      if (e.button !== 0) return;
      s.dragging = true;
      s.startX = e.clientX; s.startY = e.clientY;
      s.startOX = s.x; s.startOY = s.y;
      el.style.cursor = 'grabbing';
    };

    const onMouseMove = (e) => {
      if (!s.dragging) return;
      applyTransform(s.scale, s.startOX + e.clientX - s.startX, s.startOY + e.clientY - s.startY);
    };

    const onMouseUp = () => { s.dragging = false; el.style.cursor = 'grab'; };

    const onTouchStart = (e) => {
      if (e.touches.length === 2) {
        s.pinching = true; s.dragging = false;
        s.startDist = getDist(e.touches[0], e.touches[1]);
        s.startScale = s.scale;
        const m = getMid(e.touches[0], e.touches[1]);
        s.midX = m.x; s.midY = m.y;
        s.startPinchOX = s.x; s.startPinchOY = s.y;
      } else if (e.touches.length === 1 && !s.pinching) {
        s.dragging = true;
        s.startX = e.touches[0].clientX; s.startY = e.touches[0].clientY;
        s.startOX = s.x; s.startOY = s.y;
      }
    };

    const onTouchMove = (e) => {
      e.preventDefault();
      if (e.touches.length === 2 && s.pinching) {
        const d = getDist(e.touches[0], e.touches[1]);
        const m = getMid(e.touches[0], e.touches[1]);
        applyTransform(
          clampScale(s.startScale * (d / s.startDist)),
          s.startPinchOX + m.x - s.midX,
          s.startPinchOY + m.y - s.midY,
        );
      } else if (e.touches.length === 1 && s.dragging) {
        applyTransform(
          s.scale,
          s.startOX + e.touches[0].clientX - s.startX,
          s.startOY + e.touches[0].clientY - s.startY,
        );
      }
    };

    const onTouchEnd = (e) => {
      if (e.touches.length < 2) s.pinching = false;
      if (e.touches.length < 1) {
        s.dragging = false;
        const now = Date.now();
        if (now - s.lastTap < 300) {
          applyTransform(s.scale > 1 ? 1 : 2.5, 0, 0, true);
          s.lastTap = 0;
        } else {
          s.lastTap = now;
          if (s.scale < 1.05) applyTransform(1, 0, 0);
        }
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mouseleave', onMouseUp);
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mouseleave', onMouseUp);
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-black/95">
      <button
        onClick={onClose}
        style={{ touchAction: 'manipulation' }}
        className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/35 text-xs pointer-events-none whitespace-nowrap">
        Pinch or scroll to zoom · Double-tap to toggle
      </p>
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center"
        style={{ cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          draggable={false}
          className="max-w-full max-h-full object-contain"
          style={{ transformOrigin: 'center center', pointerEvents: 'none', userSelect: 'none' }}
        />
      </div>
    </div>
  );
}

export default function Map({ imageUrl, loading }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-base font-semibold mb-4">Campus Map</h1>
      <div className="glass rounded-glass overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground text-sm animate-pulse">
            Loading map…
          </div>
        ) : imageUrl ? (
          <button
            onClick={() => setOpen(true)}
            className="w-full relative group block"
            aria-label="Open campus map fullscreen"
          >
            <img
              src={imageUrl}
              alt="MVHS campus map"
              className="w-full h-auto block"
              loading="lazy"
            />
            <div className="absolute bottom-2 right-2 p-2 rounded-full bg-black/40 backdrop-blur-sm text-white/60 group-hover:text-white group-hover:bg-black/60 transition-colors">
              <ZoomIn size={16} />
            </div>
          </button>
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Map unavailable
          </div>
        )}
      </div>
      {open && <MapLightbox src={imageUrl} alt="MVHS campus map" onClose={() => setOpen(false)} />}
    </div>
  );
}
