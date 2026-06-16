import SchedulePageContainer from '../containers/SchedulePageContainer';

export const metadata = {
  title: 'Bell Schedule',
  description:
    "View today's bell schedule for Mountain View High School. See current and upcoming periods in real time.",
  openGraph: {
    title: 'Bell Schedule | MVHS App',
    description:
      "View today's bell schedule for Mountain View High School in real time.",
    url: 'https://mvhs.pro',
  },
};

export default function SchedulePage() {
  return <SchedulePageContainer />;
}
