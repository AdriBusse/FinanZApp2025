import React, { useEffect, useRef, useState } from 'react';
import { Text, Alert, View, TextInput, StyleSheet } from 'react-native';
import FormBottomSheet from '../../FormBottomSheet';

export default function CreateTransactionSheet({
  open,
  onClose,
  onCreate,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (amount: number, describtion: string) => Promise<void>;
  currency?: string;
}) {
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const submittingRef = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const amountInputRef = useRef<TextInput | null>(null);
  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount));

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setAmount('');
      setDescribtion('');
    } else {
      setTimeout(() => amountInputRef.current?.focus(), 50);
    }
  }, [open]);
  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="New Transaction"
      submitLabel="Save"
      submitDisabled={!isValid || submitting}
      onSubmit={async () => {
        if (!isValid || submittingRef.current) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
          await onCreate(Number(amount), describtion);
          setAmount('');
          setDescribtion('');
        } catch (e) {
          Alert.alert('Error', 'Failed to create transaction.');
        } finally {
          submittingRef.current = false;
          setSubmitting(false);
        }
      }}
    >
      <View style={styles.sheetContent}>
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
              style={styles.titleInput}
            />
          </View>
        </View>
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetContent: {
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
