'use client';
import React, { useState, useEffect } from 'react';
import Weather from '../components/Weather/Weather.js';

const url = 'https://api.weather.gov/gridpoints/MTR/96,105/forecast/hourly';
const request = new Request(url, { method: 'GET', headers: { Accept: 'application/json' } });

let cache;

async function fetchWeatherPeriods() {
  if (!cache) cache = await caches.open('weather');
  let response = await cache.match(request);
  if (!response || new Date(response.headers.get('expires')) < Date.now()) {
    try {
      await cache.add(request);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      return null;
    }
    response = await cache.match(request);
  }
  if (!response) return null;
  const json = await response.json();
  return json?.properties?.periods ?? null;
}

function pickCurrentPeriod(periods) {
  if (!periods || periods.length === 0) return null;
  const now = new Date();
  // Find the period whose window contains now, else take the nearest upcoming
  return (
    periods.find((p) => new Date(p.startTime) <= now && now < new Date(p.endTime)) ||
    periods.find((p) => new Date(p.startTime) > now) ||
    periods[0]
  );
}

export default function WeatherContainer() {
  const [weatherProps, setWeatherProps] = useState(null);

  useEffect(() => {
    fetchWeatherPeriods().then((periods) => {
      if (!periods) return;
      const period = pickCurrentPeriod(periods);
      if (!period) return;

      // Find day high/low from today's periods
      const today = new Date().toISOString().slice(0, 10);
      const todayPeriods = periods.filter((p) => p.startTime.slice(0, 10) === today);
      const temps = todayPeriods.map((p) => p.temperature);
      const high = temps.length ? Math.max(...temps) : null;
      const low = temps.length ? Math.min(...temps) : null;

      setWeatherProps({
        temp: period.temperature,
        description: period.shortForecast,
        icon: period.shortForecast,
        high,
        low,
      });
    });
  }, []);

  return <Weather {...(weatherProps || {})} />;
}
