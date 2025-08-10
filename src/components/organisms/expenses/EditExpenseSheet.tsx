import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useMutation } from '@apollo/client';
import FormBottomSheet, { formStyles as commonFormStyles } from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { UPDATEEXPENSE } from '../../../queries/mutations/Expenses/UpdateExpense';

interface Expense {
  id: string;
  title: string;
  currency?: string | null;
  archived?: boolean | null;
}

export default function EditExpenseSheet({
  open,
  onClose,
  onUpdate,
  expense,
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  expense: Expense | null;
}) {
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('');
  const [archived, setArchived] = useState(false);

  const [updateExpense, { loading: updating }] = useMutation(UPDATEEXPENSE);

  // Initialize form when opening
  useEffect(() => {
    if (open && expense) {
      setTitle(expense.title || '');
      setCurrency(expense.currency || '');
      setArchived(!!expense.archived);
    }
  }, [open, expense]);

  const isValid = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !expense) return;
    try {
      await updateExpense({
        variables: {
          id: expense.id,
          title: title.trim(),
          currency: currency.trim() || null,
          archived,
        },
      });
      await onUpdate();
      onClose();
    } catch (e) {
      console.error('Error updating expense:', e);
    }
  };

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="Edit Expense"
      submitDisabled={!isValid || updating}
      heightPercent={0.6}
      onSubmit={handleSubmit}
    >
      <View style={styles.container}>
        <Text style={commonFormStyles.modalLabel}>Name</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Groceries"
          returnKeyType="next"
          onFocus={(e) => (e.target as any).setNativeProps?.({ selection: { start: 0, end: title.length } })}
        />

        <Text style={commonFormStyles.modalLabel}>Currency</Text>
        <Input
          value={currency}
          onChangeText={setCurrency}
          placeholder="e.g. EUR"
          maxLength={6}
        />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Archived</Text>
          <Switch value={archived} onValueChange={setArchived} />
        </View>
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  rowLabel: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
});
