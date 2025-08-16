import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

export interface HorizontalBarProps {
  value: number; // current amount
  max: number;   // goal / limit
  height?: number;
  fillColor?: string; // default light blue
  trackColor?: string; // default slate/dark gray
  style?: ViewStyle;
  showLabel?: boolean;
  // If not provided, label defaults to "value / max"
  labelText?: string;
  labelColor?: string;
}

export default function HorizontalBar({
  value,
  max,
  height = 10,
  fillColor = '#60a5fa',
  trackColor = '#334155',
  style,
  showLabel = true,
  labelText,
  labelColor = '#cbd5e1',
}: HorizontalBarProps) {
  if (!Number.isFinite(max) || max <= 0) return null;
  const ratio = Math.max(0, Math.min(1, (Number(value) || 0) / max));
  const percent = `${Math.round(ratio * 100)}%`;
  const label =
    labelText ?? `${Math.round(Number(value) || 0).toLocaleString()} / ${Math.round(max).toLocaleString()}`;

  return (
    <View style={[styles.container, { height }, style]}>
      <View style={[styles.track, { backgroundColor: trackColor, borderRadius: height / 2 }]} />
      <View style={[styles.fill, { width: percent as any, backgroundColor: fillColor, borderRadius: height / 2 }]} />
      {showLabel && (
        <View pointerEvents="none" style={styles.labelWrap}>
          <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
            {label}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
    overflow: 'hidden',
    borderRadius: 999,
  },
  track: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  fill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
  },
  labelWrap: {
    position: 'absolute',
    top: 0,
    left: 8,
    right: 8,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
  },
});
