import Links from '../../components/Links';

export const metadata = {
  title: 'Student Links',
  description:
    'Quick access to important Mountain View High School student resources, portals, and external links.',
  openGraph: {
    title: 'Student Links | MVHS App',
    description:
      'Quick access to important MVHS student resources, portals, and external links.',
    url: 'https://mvhs.pro/links',
  },
};

export default function LinksPage() {
  return <Links />;
}
