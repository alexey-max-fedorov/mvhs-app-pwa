import React from 'react';
import WeatherIcon from './WeatherIcon';

export default function Weather({ temp, description, icon, high, low }) {
  if (!temp) return null;

  return (
    <div className="glass rounded-glass px-4 py-3 flex items-center gap-3">
      <WeatherIcon icon={icon} className="w-8 h-8 text-primary shrink-0" />
      <div className="min-w-0">
        <p className="text-xl font-semibold leading-none tabular-nums">{temp}°F</p>
        <p className="text-xs text-muted-foreground mt-1 capitalize truncate">{description}</p>
      </div>
      {(high != null || low != null) && (
        <div className="ml-auto text-right shrink-0">
          <p className="text-xs text-muted-foreground">
            <span className="text-foreground font-medium">{high}°</span> / {low}°
          </p>
        </div>
      )}
    </div>
  );
}
