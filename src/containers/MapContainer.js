import React from 'react';
import Map from '../components/Map';

const MAP_URL = '/SchoolMap.png';

export default function MapContainer() {
  return <Map imageUrl={MAP_URL} loading={false} />;
}
