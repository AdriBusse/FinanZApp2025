import React, { useEffect, useRef, useState } from 'react';
import { Text, Alert } from 'react-native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';

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
  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount));

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setAmount('');
      setDescribtion('');
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
      <Text style={commonFormStyles.modalLabel}>Description</Text>
      <Input
        value={describtion}
        onChangeText={setDescribtion}
        placeholder="What is this?"
      />
      <Text style={commonFormStyles.modalLabel}>
        Amount (+ deposit / - withdrawal)
      </Text>
      <Input
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="e.g. 50"
        leftAdornment={<Text style={{ color: '#cbd5e1', fontSize: 16 }}>{currency || '€'}</Text>}
      />
    </FormBottomSheet>
  );
}
