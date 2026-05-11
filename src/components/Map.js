import React from 'react';

export default function Map({ imageUrl }) {
  return (
    <div className="max-w-lg mx-auto px-4 py-4">
      <h1 className="text-base font-semibold mb-4">Campus Map</h1>
      <div className="glass rounded-glass overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="MVHS campus map"
            className="w-full h-auto"
            loading="lazy"
          />
        ) : (
          <div className="p-12 text-center text-muted-foreground text-sm">
            Map unavailable
          </div>
        )}
      </div>
    </div>
  );
}
