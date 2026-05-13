import React from 'react';

function iconForForecast(forecast) {
  if (!forecast) return null;
  if (forecast.includes('Snow')) return <img alt="snow" src="/icons/cloud-snow.svg" />;
  if (forecast.includes('Thunder')) return <img alt="thunder" src="/icons/cloud-rain-lightning.svg" />;
  if (forecast.includes('Rain') || forecast.includes('Shower')) return <img alt="rain" src="/icons/cloud-rain.svg" />;
  if (forecast.includes('Sun') || forecast.includes('Clear')) return <img alt="sunny" src="/icons/day-sunny.svg" />;
  if (forecast.includes('Cloud') || forecast.includes('Overcast')) return <img alt="cloudy" src="/icons/cloud.svg" />;
  return null;
}

export default function WeatherIcon({ icon, className }) {
  const img = iconForForecast(icon);
  if (!img) return null;
  return React.cloneElement(img, { className });
}
