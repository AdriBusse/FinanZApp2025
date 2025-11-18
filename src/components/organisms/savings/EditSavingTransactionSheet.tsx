import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { useSavings } from '../../../hooks/useSavings';
// Legacy finance store removed; rely on Apollo cache only

interface Transaction {
  id: string;
  amount: number;
  describtion: string;
  createdAt?: string;
}

export default function EditSavingTransactionSheet({
  open,
  onClose,
  onUpdate,
  transaction,
  currency,
  depotId,
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  transaction: Transaction | null;
  currency?: string;
  depotId: string;
}) {
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const { updateSavingTransaction } = useSavings({ depotId });
  const [updating, setUpdating] = useState(false);

  // Initialize form with transaction data when modal opens
  useEffect(() => {
    if (open && transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescribtion(transaction.describtion || '');
    }
  }, [open, transaction]);

  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount));

  const handleSubmit = async () => {
    if (!isValid || !transaction) return;

    try {
      setUpdating(true);
      const nextAmount = Number(amount);
      await updateSavingTransaction(
        transaction.id,
        depotId,
        nextAmount,
        describtion,
      );

      // Zustand mirror removed

      // Reset form
      setAmount('');
      setDescribtion('');

      await onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating transaction:', error);
    } finally {
      setUpdating(false);
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
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
