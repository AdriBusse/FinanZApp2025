import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Trash2 } from 'lucide-react-native';

export interface TransactionListItemProps {
  id: string;
  title: string;
  subtitle?: string;
  amount?: number;
  currency?: string;
  loading?: boolean;
  onPress?: () => void;
  onDelete?: (id: string) => void;
}

export default function TransactionListItem({
  id,
  title,
  subtitle,
  amount,
  currency,
  loading,
  onPress,
  onDelete,
}: TransactionListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.row, loading && styles.rowLoading]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        {!!subtitle && <Text style={styles.rowSub}>{subtitle}</Text>}
      </View>
      {typeof amount === 'number' && (
        <Text style={styles.rowAmount}>
          {`${Math.round(amount).toLocaleString()}${
            currency ? ` ${currency}` : ''
          }`}
        </Text>
      )}
      {loading ? (
        <ActivityIndicator size="small" color="#60a5fa" />
      ) : !!onDelete ? (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Delete transaction"
          onPress={() => onDelete(id)}
          style={{ marginLeft: 8, padding: 4 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Trash2 color="#ef4444" size={20} style={{ opacity: 0.8 }} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e212b',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
  },
  rowLoading: {
    opacity: 0.7,
  },
  rowTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#94a3b8', marginTop: 2 },
  rowAmount: { color: '#f1f5f9', fontWeight: '800' },
});
