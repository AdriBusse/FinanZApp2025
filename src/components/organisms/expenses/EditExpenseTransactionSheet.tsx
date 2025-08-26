import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import Dropdown from '../../atoms/Dropdown';
import Calendar from '../../atoms/Calendar';
import { UPDATEEXPENSETRANSACTION } from '../../../queries/mutations/Expenses/UpdateExpenseTransaction';
import { useCategoriesStore } from '../../../store/categories';
import { GET_EXPENSES_QUERY } from '../../../graphql/finance';
import { useFinanceStore } from '../../../store/finance';

interface Transaction {
  id: string;
  amount: number;
  describtion: string;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
  createdAt?: string;
}

export default function EditExpenseTransactionSheet({
  open,
  onClose,
  onUpdate,
  transaction,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  transaction: Transaction | null;
  currency?: string;
}) {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  // Date state
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [day, setDay] = useState(now.getDate());
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { categories, loading, fetchCategories } = useCategoriesStore();
  const [updateTransaction, { loading: updating }] = useMutation(
    UPDATEEXPENSETRANSACTION,
  );

  // Initialize form with transaction data when modal opens
  useEffect(() => {
    if (open && transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescribtion(transaction.describtion || '');
      // Prefer nested category.id (present in ExpenseTransaction), fallback to categoryId if provided
      setSelectedCategoryId(
        (transaction.category && transaction.category.id) ||
          transaction.categoryId ||
          null,
      );
      fetchCategories();
      const base = transaction?.createdAt
        ? new Date(transaction.createdAt)
        : new Date();
      setYear(base.getFullYear());
      setMonth(base.getMonth());
      setDay(base.getDate());
    }
  }, [open, transaction, fetchCategories]);

  // Clamp day when month/year changes
  useEffect(() => {
    const max = new Date(year, month + 1, 0).getDate();
    if (day > max) setDay(max);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  // Transform categories for dropdown
  const dropdownOptions = useMemo(() => {
    const categoryOptions = categories.map(cat => ({
      id: cat.id,
      label: cat.name,
      icon: cat.icon || undefined,
      color: cat.color || undefined,
    }));

    // Add "Create New Category" option if no categories exist
    if (categories.length === 0 && !loading) {
      categoryOptions.push({
        id: 'create_new',
        label: 'Create New Category',
        icon: '➕',
        color: '#2e7d32',
      });
    }

    return categoryOptions;
  }, [categories, loading]);

  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount));

  const selectedDate = useMemo(
    () => new Date(year, month, day, 12, 0, 0),
    [year, month, day],
  );

  const handleSubmit = async () => {
    if (!isValid || !transaction) return;

    // snapshot for rollback
    let prevExpensesSnapshot: any[] | null = null;
    try {
      const newAmount = Number(amount);
      const newDateIso = selectedDate.toISOString();
      const cat = (useCategoriesStore.getState().categories || []).find(
        c => c.id === selectedCategoryId,
      );

      // Optimistically update Zustand store for immediate UI
      try {
        const st = useFinanceStore.getState();
        prevExpensesSnapshot = st.expenses ? [...(st.expenses as any[])] : null;
        const next = (st.expenses || []).map(e => {
          const txs = Array.isArray(e.transactions) ? e.transactions : [];
          const idx = txs.findIndex((t: any) => t.id === transaction.id);
          if (idx < 0) return e as any;
          const oldTx: any = txs[idx];
          const delta = (newAmount || 0) - (oldTx?.amount || 0);
          const updatedTx = {
            ...oldTx,
            amount: newAmount,
            describtion,
            createdAt: newDateIso,
            category: selectedCategoryId
              ? {
                  __typename: 'ExpenseCategory',
                  id: selectedCategoryId,
                  name: cat?.name || 'Category',
                }
              : null,
          } as any;
          const newTxs = [...txs];
          newTxs[idx] = updatedTx;
          return { ...e, transactions: newTxs, sum: (e.sum || 0) + delta } as any;
        });
        useFinanceStore.setState({ expenses: next as any });
      } catch {}

      await updateTransaction({
        variables: {
          transactionId: transaction.id,
          amount: newAmount,
          describtion,
          categoryId: selectedCategoryId || null,
          // Backend expects date as String for update mutation
          date: newDateIso,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateExpenseTransaction: {
            __typename: 'ExpenseTransaction',
            id: transaction.id,
            amount: newAmount,
            createdAt: newDateIso,
            describtion,
            category: selectedCategoryId
              ? {
                  __typename: 'ExpenseCategory',
                  id: selectedCategoryId,
                  name: cat?.name || 'Category',
                }
              : null,
          },
        },
        update: (cache, { data }) => {
          try {
            const updatedTx: any = (data as any)?.updateExpenseTransaction;
            const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
            if (existing?.getExpenses) {
              let oldAmountC = 0;
              const updatedExpenses = existing.getExpenses.map((e: any) => {
                const txs = Array.isArray(e.transactions) ? e.transactions : [];
                const idx = txs.findIndex((t: any) => t.id === transaction.id);
                if (idx < 0) return e;
                const oldTx = txs[idx];
                oldAmountC = oldTx?.amount || 0;
                const delta = (updatedTx?.amount || 0) - oldAmountC;
                const newTxs = [...txs];
                newTxs[idx] = { ...oldTx, ...updatedTx };
                return { ...e, transactions: newTxs, sum: (e.sum || 0) + delta };
              });
              cache.writeQuery({
                query: GET_EXPENSES_QUERY,
                data: { getExpenses: updatedExpenses },
              });
            }
          } catch {}

          // Ensure Zustand mirrors server response (no additional sum changes)
          try {
            const st = useFinanceStore.getState();
            const updatedTx: any = (data as any)?.updateExpenseTransaction;
            const next = (st.expenses || []).map(e => {
              const txs = Array.isArray(e.transactions) ? e.transactions : [];
              const idx = txs.findIndex((t: any) => t.id === transaction.id);
              if (idx < 0) return e as any;
              const oldTx = txs[idx];
              const delta = (updatedTx?.amount || 0) - (oldTx?.amount || 0);
              const newTxs = [...txs];
              newTxs[idx] = { ...oldTx, ...updatedTx } as any;
              return { ...e, transactions: newTxs, sum: (e.sum || 0) + delta } as any;
            });
            useFinanceStore.setState({ expenses: next as any });
          } catch {}
        },
      });

      // Reset form
      setAmount('');
      setDescribtion('');
      setSelectedCategoryId(null);
      const t = new Date();
      setYear(t.getFullYear());
      setMonth(t.getMonth());
      setDay(t.getDate());

      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
      // rollback Zustand on error using previously captured snapshot
      try {
        if (prevExpensesSnapshot) {
          useFinanceStore.setState({ expenses: prevExpensesSnapshot as any });
        }
      } catch {}
    }
  };

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="Edit Transaction"
      submitDisabled={!isValid || updating}
      heightPercent={0.7}
      onSubmit={handleSubmit}
    >
      <View style={styles.container}>
        <Text style={commonFormStyles.modalLabel}>Description</Text>
        <Input
          value={describtion}
          onChangeText={setDescribtion}
          placeholder="What is this?"
          returnKeyType="next"
          onFocus={e =>
            e.target.setNativeProps({
              selection: { start: 0, end: describtion.length },
            })
          }
        />

        <Text style={commonFormStyles.modalLabel}>Amount</Text>
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 12.50"
          returnKeyType="done"
          leftAdornment={<Text style={{ color: '#cbd5e1', fontSize: 16 }}>{currency || '€'}</Text>}
          onFocus={e =>
            e.target.setNativeProps({
              selection: { start: 0, end: amount.length },
            })
          }
          onSubmitEditing={() => {
            // Focus next input or submit if valid
            if (isValid) {
              handleSubmit();
            }
          }}
        />

        <Dropdown
          label="Category (Optional)"
          value={selectedCategoryId}
          options={dropdownOptions}
          onSelect={option => {
            if (option.id === 'create_new') {
              // Navigate to create category screen
              onClose();
              navigation.navigate('CreateCategory');
            } else {
              setSelectedCategoryId(option.id || null);
            }
          }}
          placeholder="Select a category (optional)"
          loading={loading}
          disabled={loading}
        />

        {/* Category preview removed per request — dropdown selection is sufficient */}

        {/* Date moved below category */}
        <Text style={commonFormStyles.modalLabel}>Date</Text>
        <View style={styles.pressWrapper}>
          <Input
            value={`${String(selectedDate.getDate()).padStart(2, '0')}.${String(
              selectedDate.getMonth() + 1,
            ).padStart(2, '0')}.${selectedDate.getFullYear()}`}
            editable={false}
            placeholder="Select a date"
          />
          <TouchableOpacity
            style={styles.pressOverlay}
            activeOpacity={0.8}
            onPress={() => setCalendarOpen(true)}
          />
        </View>
        <Modal
          visible={calendarOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCalendarOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCalendarOpen(false)}
          >
            <View style={styles.modalContent}>
              <Calendar
                value={selectedDate}
                onChange={d => {
                  setYear(d.getFullYear());
                  setMonth(d.getMonth());
                  setDay(d.getDate());
                  setCalendarOpen(false);
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateText: {
    color: '#cbd5e1',
    fontSize: 12,
    marginTop: 6,
    marginBottom: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
    padding: 12,
  },
  pressWrapper: {
    position: 'relative',
  },
  pressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dateCol: {
    flex: 1,
  },
  categoryPreview: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#1e212b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  previewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  previewIcon: {
    fontSize: 20,
    marginRight: 5,
  },
  previewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#f8fafc',
  },
  previewColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
