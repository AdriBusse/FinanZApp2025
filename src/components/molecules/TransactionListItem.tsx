import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';

export interface TransactionListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export default function TransactionListItem({
  id,
  title,
  subtitle,
  amount,
  onPress,
  onDelete,
}: TransactionListItemProps) {
  return (
    <TouchableOpacity 
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {typeof amount === 'number' && (
        <Text style={styles.rowAmount}>
          {Math.round(amount).toLocaleString()} d
        </Text>
      )}
      {!!onDelete && (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
          onPress={() => onDelete(id)}
          style={{ marginLeft: 12, padding: 6 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 color="#ef4444" size={20} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e212b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  rowTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#94a3b8', marginTop: 4 },
  rowAmount: { color: '#f1f5f9', fontWeight: '800' },
});
