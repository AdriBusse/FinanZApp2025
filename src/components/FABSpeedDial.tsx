import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import FloatingActionButton from './atoms/FloatingActionButton';

export type SpeedDialAction = {
  label: string;
  onPress: () => void;
  color?: string; // background color for the small action button
};

interface FABSpeedDialProps {
  isOpen: boolean;
  onToggle: () => void;
  actions?: SpeedDialAction[];
  position?: 'left' | 'right';
  style?: ViewStyle;
}

export default function FABSpeedDial({
  isOpen,
  onToggle,
  actions = [],
  position = 'left',
  style,
}: FABSpeedDialProps) {
  return (
    <View
      style={[
        styles.fabContainer,
        position === 'left'
          ? { left: 16, alignItems: 'flex-start' }
          : { right: 16, alignItems: 'flex-end' },
        style,
      ]}
      pointerEvents="box-none"
    >
      {isOpen && actions.length > 0 && (
        <View
          style={[
            styles.speedDialMenu,
            position === 'right' && { alignItems: 'flex-end' },
          ]}
        >
          {actions.map((a, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.smallButton,
                { backgroundColor: a.color ?? '#2563eb' },
              ]}
              onPress={a.onPress}
            >
              <Text style={styles.smallButtonText}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <FloatingActionButton
        onPress={onToggle}
        accessibilityLabel="Floating action button"
      >
        <Text style={styles.fabText}>{isOpen ? '×' : '+'}</Text>
      </FloatingActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: { position: 'absolute', bottom: 24 },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
  speedDialMenu: { marginBottom: 8 },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  smallButtonText: { color: '#fff', fontWeight: '700' },
});
