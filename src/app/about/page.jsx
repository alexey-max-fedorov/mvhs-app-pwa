import AboutPage from '../../components/AboutPage';

export const metadata = {
  title: 'About',
  description:
    'Learn about the MVHS App – a student-built progressive web app for Mountain View High School.',
  openGraph: {
    title: 'About | MVHS App',
    description:
      'Learn about the MVHS App, a student-built progressive web app for Mountain View High School.',
    url: 'https://mvhs.pro/about',
  },
};

export default function About() {
  return <AboutPage />;
}
