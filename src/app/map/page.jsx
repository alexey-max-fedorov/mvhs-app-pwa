import MapContainer from '../../containers/MapContainer';

export const metadata = {
  title: 'Campus Map',
  description:
    'Interactive campus map for Mountain View High School. Find classrooms, buildings, and facilities on the MVHS campus.',
  openGraph: {
    title: 'Campus Map | MVHS App',
    description:
      'Interactive campus map for Mountain View High School. Find classrooms and buildings.',
    url: 'https://mvhs.pro/map',
  },
};

export default function MapPage() {
  return <MapContainer />;
}
