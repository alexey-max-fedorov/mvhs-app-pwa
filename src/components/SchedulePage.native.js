import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme.native';

export default function SchedulePage({ date, onDateChange, bellSchedule, calendar, weather }) {
  const isToday = date.isSame(new Date(), 'day');
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.dateNav}>
        <TouchableOpacity
          onPress={() => onDateChange(date.clone().subtract(1, 'day'))}
          style={styles.navBtn}
          accessibilityLabel="Previous day"
        >
          <Text style={{ color: colors.foreground, fontSize: 18 }}>‹</Text>
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.dateTitle}>{isToday ? 'Today' : date.format('dddd')}</Text>
          <Text style={styles.dateSub}>{date.format('MMMM D, YYYY')}</Text>
        </View>
        <TouchableOpacity
          onPress={() => onDateChange(date.clone().add(1, 'day'))}
          style={styles.navBtn}
          accessibilityLabel="Next day"
        >
          <Text style={{ color: colors.foreground, fontSize: 18 }}>›</Text>
        </TouchableOpacity>
      </View>
      {weather}
      <Text style={styles.sectionLabel}>Bell Schedule</Text>
      {bellSchedule}
      <Text style={styles.sectionLabel}>Events</Text>
      {calendar}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md },
  dateNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  navBtn: {
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateTitle: { color: colors.foreground, fontWeight: '600', fontSize: 16 },
  dateSub: { color: colors.muted, fontSize: 12, marginTop: 2 },
  sectionLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
