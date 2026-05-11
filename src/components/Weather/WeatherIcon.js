import React from 'react';
import Rainy from './icons/cloud-rain.svg';
import AcUnit from './icons/cloud-snow.svg';
import WbSunny from './icons/day-sunny.svg';
import WbCloudy from './icons/cloud.svg';
import Thunder from './icons/cloud-rain-lightning.svg';

function iconForForecast(forecast) {
  if (!forecast) return null;
  if (forecast.includes('Snow')) return <img alt="snow" src={AcUnit} />;
  if (forecast.includes('Thunder')) return <img alt="thunder" src={Thunder} />;
  if (forecast.includes('Rain') || forecast.includes('Shower')) return <img alt="rain" src={Rainy} />;
  if (forecast.includes('Sun') || forecast.includes('Clear')) return <img alt="sunny" src={WbSunny} />;
  if (forecast.includes('Cloud') || forecast.includes('Overcast')) return <img alt="cloudy" src={WbCloudy} />;
  return null;
}

export default function WeatherIcon({ icon, className }) {
  const img = iconForForecast(icon);
  if (!img) return null;
  return React.cloneElement(img, { className });
}
