import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import FormBottomSheet from '../../FormBottomSheet';
// Legacy finance store removed; rely on Apollo cache only

interface Transaction {
  id: string;
  amount: number;
  describtion: string;
  createdAt?: string;
}

type EditSavingTransactionSheetProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: {
    id: string;
    amount: number;
    describtion: string;
  }) => void | Promise<void>;
  transaction: Transaction | null;
  currency?: string;
  depotId: string;
};

export default function EditSavingTransactionSheet(
  props: EditSavingTransactionSheetProps,
) {
  const { open, onClose, onSave, transaction, currency } = props;
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const amountInputRef = useRef<TextInput | null>(null);
  const [updating, setUpdating] = useState(false);

  // Initialize form with transaction data when modal opens
  useEffect(() => {
    if (open && transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescribtion(transaction.describtion || '');
      setTimeout(() => amountInputRef.current?.focus(), 50);
    }
  }, [open, transaction]);

  useEffect(() => {
    if (!open) {
      setUpdating(false);
    }
  }, [open]);

  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount));

  const handleSubmit = async () => {
    if (!isValid || !transaction) return;

    try {
      setUpdating(true);
      const nextAmount = Number(amount);
      onClose();
      void (async () => {
        try {
          await onSave({
            id: transaction.id,
            amount: nextAmount,
            describtion,
          });
        } finally {
          setAmount('');
          setDescribtion('');
          setUpdating(false);
        }
      })();
    } catch (error) {
      console.error('Error updating transaction:', error);
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
        <View>
          <Text style={styles.amountLabel}>Amount</Text>
          <View style={styles.amountRow}>
            <Text style={styles.amountCurrency}>{currency || '€'}</Text>
            <TextInput
              ref={amountInputRef}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              style={styles.amountInput}
            />
          </View>
        </View>

        <View>
          <Text style={styles.sectionLabel}>Title</Text>
          <View style={styles.titleRow}>
            <TextInput
              value={describtion}
              onChangeText={setDescribtion}
              placeholder="What is this?"
              placeholderTextColor="#6b7280"
              returnKeyType="next"
              onFocus={e =>
                e.target.setNativeProps({
                  selection: { start: 0, end: describtion.length },
                })
              }
              style={styles.titleInput}
            />
          </View>
        </View>
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  sectionLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  amountLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 2,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  amountCurrency: {
    color: '#9ca3af',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    color: '#f8fafc',
    fontSize: 40,
    fontWeight: '800',
  },
  titleRow: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  titleInput: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
  },
});
