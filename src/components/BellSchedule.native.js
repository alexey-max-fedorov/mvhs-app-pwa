import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme.native';

function PeriodCard({ name, start, end, isCurrent, progress }) {
  return (
    <View style={[styles.card, isCurrent && styles.cardActive]}>
      <View style={styles.row}>
        <Text style={[styles.name, isCurrent && { color: colors.primary }]}>{name}</Text>
        <Text style={styles.time}>{start} – {end}</Text>
      </View>
      {isCurrent && (
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.max(1, progress)}%` }]} />
        </View>
      )}
    </View>
  );
}

export default function BellSchedule({ periods, currentPeriod, scheduleName }) {
  if (!periods?.length) {
    return (
      <View style={styles.card}>
        <Text style={{ color: colors.muted, textAlign: 'center', fontSize: 14 }}>No school today</Text>
      </View>
    );
  }
  return (
    <View style={{ gap: spacing.sm }}>
      {scheduleName && (
        <Text style={{ color: colors.muted, fontSize: 12, marginBottom: spacing.xs }}>
          Schedule: <Text style={{ color: colors.foreground, fontWeight: '500' }}>{scheduleName}</Text>
        </Text>
      )}
      {periods.map((p) => (
        <PeriodCard
          key={p.name}
          name={p.name}
          start={p.start}
          end={p.end}
          isCurrent={currentPeriod?.name === p.name}
          progress={currentPeriod?.name === p.name ? currentPeriod.progress : 0}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  cardActive: { borderColor: 'rgba(245,158,11,0.3)' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: colors.foreground, fontWeight: '500', fontSize: 14 },
  time: { color: colors.muted, fontSize: 12 },
  progressBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 2 },
});
