import React, { useState, useEffect } from 'react';
import Map from '../components/Map';
import { getFirebaseVal } from '../utils/firebase';

export default function MapContainer() {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    getFirebaseVal('/map', false).then((val) => {
      if (val?.url) setImageUrl(val.url);
    });
  }, []);

  return <Map imageUrl={imageUrl} />;
}
