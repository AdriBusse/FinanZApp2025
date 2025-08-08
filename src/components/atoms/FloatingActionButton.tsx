import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

export interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string; // if label provided, shows text, otherwise shows +/× provided via children
  style?: ViewStyle;
  color?: string;
  text?: string;
  accessibilityLabel?: string;
  children?: React.ReactNode; // allows custom icon
}

export default function FloatingActionButton({ onPress, label, style, color = '#22c55e', text, accessibilityLabel = 'Floating action button', children }: FloatingActionButtonProps) {
  return (
    <TouchableOpacity style={[styles.fab, { backgroundColor: color }, style]} onPress={onPress} accessibilityLabel={accessibilityLabel}>
      {children ?? <Text style={styles.fabText}>{text ?? (label ?? '+')}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', elevation: 6 },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
});
