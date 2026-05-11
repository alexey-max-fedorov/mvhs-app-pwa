import React from 'react';

import BellSchedule from '../components/BellSchedule';
import moment from 'moment';
import { getFirebaseVal } from '../utils/firebase';
import * as storage from '../utils/storage';
import * as appstate from '../utils/appstate';

const pad = (num, size) => {
  let s = num + '';
  while (s.length < size) s = '0' + s;
  return s;
};

const to12Hour = (hour) => {
  const hourInt = parseInt(hour, 10);
  return pad(hourInt > 12 ? hourInt - 12 : hourInt, 2);
};

const fbTimestampKey = 'fbTimestamp';

class BellScheduleContainer extends React.PureComponent {
  state = {
    periods: [],
    loading: true,
    error: '',
    scheduleName: '',
    refreshed: moment()
  };

  componentDidMount() {
    this.loadBellSchedule().then();

    this.timeRefreshInterval = window.setInterval(() => {
      if (this.state.refreshed.diff(moment(), 'minutes') < -1) {
        this.loadBellSchedule().then();
      }
    }, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.timeRefreshInterval);
  }

  componentDidUpdate(prevProps) {
    if (this.props.date && !this.props.date.isSame(prevProps.date)) {
      this.loadBellSchedule().then();
    }
  }

  async loadBellSchedule() {
    this.setState({
      loading: true,
      refreshed: moment()
    });

    try {
      const result = await this.getBellSchedule();
      this.setState({
        scheduleName: result.scheduleName,
        periods: result.periods,
        error: '',
        loading: false
      });
    } catch (err) {
      console.error(err);

      let errorMessage = err;
      if (!navigator.onLine) {
        errorMessage = 'No Internet connection';
      }
      this.setState({
        error: errorMessage,
        loading: false
      });
    }
  }

  async getBellSchedule() {
    const fbTimestampString = await storage.getItem(fbTimestampKey);
    const forceFetch =
      !fbTimestampString || Date.now() - JSON.parse(fbTimestampString) > 1.8e6;

    if (!fbTimestampString || forceFetch) {
      await storage.setItem(fbTimestampKey, JSON.stringify(Date.now()));
    }

    const selectedDate = this.props.date.toDate();
    const dayOfWeek = selectedDate.getDay();

    let schedule = '';
    let special = false;
    const specialDays = await getFirebaseVal(`/days`, forceFetch);
    for (const specDay in specialDays) {
      const start = specDay.substr(0, 8);
      const end = specDay.substr(9, 8);
      const startDate = moment(start, 'MMDDYYYY');
      const endDate = moment(end, 'MMDDYYYY').endOf('day');
      if (
        selectedDate.getTime() >= startDate.valueOf() &&
        selectedDate.getTime() < endDate.valueOf()
      ) {
        schedule = specialDays[specDay];
        special = true;
        break;
      }
    }

    if (!special) {
      const weekdayMap = await getFirebaseVal('/weekday-map', forceFetch);
      schedule = weekdayMap[dayOfWeek];
    }

    const periods = [];

    if (schedule !== 'none') {
      const scheduleData = await getFirebaseVal(
        `/schedules/${schedule}`,
        false
      );

      const now = this.state.refreshed;
      for (const periodTime in scheduleData) {
        const startHour = periodTime.substr(0, 2);
        const startMin = periodTime.substr(2, 2);
        const endHour = periodTime.substr(5, 2);
        const endMin = periodTime.substr(7, 2);

        const start = this.props.date
          .clone()
          .hour(startHour)
          .minute(startMin);
        const end = this.props.date
          .clone()
          .hour(endHour)
          .minute(endMin);
        const current = now.diff(start) >= 0 && now.diff(end) < 0;
        const progress = now.diff(start) / end.diff(start);

        periods.push({
          period: scheduleData[periodTime],
          time: `${to12Hour(startHour)}:${startMin} - ${to12Hour(
            endHour
          )}:${endMin}`,
          current: current,
          progress: progress
        });
      }
    }

    if (special) {
      schedule += '*';
    }

    getFirebaseVal(`/schedules`, forceFetch).then();

    return {
      scheduleName: schedule,
      periods: periods
    };
  }

  render() {
    return (
      <BellSchedule
        periods={this.state.periods}
        loading={this.state.loading}
        scheduleName={this.state.scheduleName}
        error={this.state.error.toString()}
        date={this.props.date}
      />
    );
  }
}

export default BellScheduleContainer;
