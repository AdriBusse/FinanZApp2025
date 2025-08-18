import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface CalendarProps {
  value: Date;
  onChange: (date: Date) => void;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function addMonths(base: Date, delta: number) {
  return new Date(base.getFullYear(), base.getMonth() + delta, 1);
}

function formatMonthTitle(d: Date) {
  return d.toLocaleString(undefined, { month: 'long', year: 'numeric' });
}

export default function Calendar({ value, onChange }: CalendarProps) {
  const today = new Date();
  const [cursor, setCursor] = useState<Date>(startOfMonth(value ?? today));

  const weeks = useMemo(() => {
    // Monday-first grid
    const firstDay = startOfMonth(cursor);
    let startIdx = firstDay.getDay(); // 0 Sun ... 6 Sat
    startIdx = (startIdx + 6) % 7; // convert to Mon=0
    const gridStart = new Date(firstDay);
    gridStart.setDate(firstDay.getDate() - startIdx);

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      days.push(d);
    }

    const chunks: Date[][] = [];
    for (let i = 0; i < 42; i += 7) chunks.push(days.slice(i, i + 7));
    return chunks;
  }, [cursor]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setCursor(c => addMonths(c, -1))}>
          <Text style={styles.nav}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{formatMonthTitle(cursor)}</Text>
        <TouchableOpacity onPress={() => setCursor(c => addMonths(c, 1))}>
          <Text style={styles.nav}>{'›'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdays}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
          <Text key={d} style={styles.weekday}>
            {d}
          </Text>
        ))}
      </View>

      {weeks.map((week, wi) => (
        <View key={wi} style={styles.weekRow}>
          {week.map((d, di) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const selected = value && isSameDay(d, value);
            const isToday = isSameDay(d, today);
            return (
              <TouchableOpacity
                key={di}
                style={[
                  styles.dayCell,
                  selected && styles.daySelected,
                  isToday && styles.todayBorder,
                ]}
                onPress={() => {
                  onChange(
                    new Date(
                      d.getFullYear(),
                      d.getMonth(),
                      d.getDate(),
                      12,
                      0,
                      0,
                    ),
                  );
                  setCursor(startOfMonth(d));
                }}
              >
                <Text
                  style={[
                    styles.dayText,
                    !inMonth && styles.dayOutside,
                    selected && styles.daySelectedText,
                  ]}
                >
                  {d.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e212b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  nav: { color: '#cbd5e1', fontSize: 22, paddingHorizontal: 8 },
  weekdays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  weekday: { width: 36, textAlign: 'center', color: '#94a3b8', fontSize: 12 },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#11131a',
  },
  todayBorder: {
    borderWidth: 1,
    borderColor: '#2e7d32',
  },
  daySelected: {
    backgroundColor: '#2e7d32',
  },
  dayText: { color: '#cbd5e1', fontSize: 14, fontWeight: '600' },
  daySelectedText: { color: '#ffffff' },
  dayOutside: { color: '#64748b' },
});
