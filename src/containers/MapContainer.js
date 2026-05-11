import React from 'react';
import Map from '../components/Map';

const MAP_URL = 'https://raw.githubusercontent.com/mvhs-apps/mvhs-app-pwa/refs/heads/master/src/assets/SchoolMap.png';

export default function MapContainer() {
  return <Map imageUrl={MAP_URL} loading={false} />;
}
