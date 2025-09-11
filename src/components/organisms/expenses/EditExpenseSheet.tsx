import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { useMutation } from '@apollo/client';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { UPDATEEXPENSE } from '../../../queries/mutations/Expenses/UpdateExpense';
import { GET_EXPENSES_QUERY } from '../../../graphql/finance';
// Legacy finance store removed; rely on Apollo cache only

interface Expense {
  id: string;
  title: string;
  currency?: string | null;
  archived?: boolean | null;
  monthlyRecurring?: boolean | null;
  spendingLimit?: number | null;
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
  const [monthlyRecurring, setMonthlyRecurring] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState('');

  const [updateExpense, { loading: updating }] = useMutation(UPDATEEXPENSE);

  // Initialize form when opening
  useEffect(() => {
    if (open && expense) {
      setTitle(expense.title || '');
      setCurrency(expense.currency || '');
      setArchived(!!expense.archived);
      setMonthlyRecurring(!!expense.monthlyRecurring);
      setSpendingLimit(
        typeof expense.spendingLimit === 'number' &&
          !Number.isNaN(expense.spendingLimit)
          ? String(expense.spendingLimit)
          : '',
      );
    }
  }, [open, expense]);

  const isValid = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !expense) return;
    // legacy snapshot removed with store
    const updatedFields = {
      title: title.trim(),
      currency: currency.trim() || null,
      archived,
      monthlyRecurring,
      spendingLimit:
        spendingLimit.trim().length > 0 && !Number.isNaN(Number(spendingLimit))
          ? parseInt(spendingLimit, 10)
          : null,
    };
    try {
      // Optimistic UI via Apollo only

      await updateExpense({
        variables: { id: expense.id, ...updatedFields },
        optimisticResponse: {
          __typename: 'Mutation',
          updateExpense: {
            __typename: 'Expense',
            id: expense.id,
            ...updatedFields,
          },
        },
        update: (cache, { data }) => {
          // Update Apollo cache list
          try {
            const updated: any = (data as any)?.updateExpense;
            const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
            if (existing?.getExpenses) {
              const list = existing.getExpenses.map((e: any) =>
                e.id === expense.id ? { ...e, ...updated } : e,
              );
              cache.writeQuery({
                query: GET_EXPENSES_QUERY,
                data: { getExpenses: list },
              });
            }
          } catch {}

          // Zustand mirror removed
        },
      });

      onClose();
    } catch (e) {
      console.error('Error updating expense:', e);
      // No rollback needed
    }
  };

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="Edit Expense"
      submitDisabled={!isValid || updating}
      heightPercent={0.75}
      onSubmit={handleSubmit}
    >
      <View style={styles.container}>
        <Text style={commonFormStyles.modalLabel}>Name</Text>
        <Input
          value={title}
          onChangeText={setTitle}
          placeholder="e.g. Groceries"
          returnKeyType="next"
          onFocus={e =>
            (e.target as any).setNativeProps?.({
              selection: { start: 0, end: title.length },
            })
          }
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
        <Text style={commonFormStyles.modalLabel}>Spending Limit</Text>
        <Input
          value={spendingLimit}
          onChangeText={setSpendingLimit}
          placeholder="e.g. 300"
          keyboardType="numeric"
        />

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Monthly recurring</Text>
          <Switch
            value={monthlyRecurring}
            onValueChange={setMonthlyRecurring}
          />
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
