import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useMutation } from '@apollo/client';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { UPDATESAVINGTRANSACTION } from '../../../queries/mutations/Savings/UpdateSavingTransaction';
import { GET_SAVING_DEPOTS_QUERY } from '../../../graphql/finance';
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
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  transaction: Transaction | null;
  currency?: string;
}) {
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');

  const [updateTransaction, { loading: updating }] = useMutation(
    UPDATESAVINGTRANSACTION,
  );

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
      const prevAmount = Number(transaction.amount || 0);
      const nextAmount = Number(amount);
      const prevCreatedAt = transaction.createdAt;
      await updateTransaction({
        variables: {
          id: Number(transaction.id),
          amount: nextAmount,
          describtion,
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateSavingTransaction: {
            __typename: 'SavingTransaction',
            id: transaction.id,
            amount: nextAmount,
            describtion,
            createdAt: prevCreatedAt || new Date().toISOString(),
          },
        },
        update: (cache, { data }) => {
          try {
            const updatedTx: any = data?.updateSavingTransaction;
            const existing: any = cache.readQuery({
              query: GET_SAVING_DEPOTS_QUERY,
            });
            if (existing?.getSavingDepots) {
              let found = false;
              const updatedDepots = existing.getSavingDepots.map((d: any) => {
                const txs = Array.isArray(d.transactions) ? d.transactions : [];
                const has = txs.some((t: any) => t.id === transaction.id);
                if (!has) return d;
                found = true;
                const nextTxs = txs.map((t: any) =>
                  t.id === transaction.id ? { ...t, ...updatedTx } : t,
                );
                const delta = (updatedTx?.amount || 0) - prevAmount;
                return { ...d, transactions: nextTxs, sum: (d.sum || 0) + delta };
              });
              if (found) {
                cache.writeQuery({
                  query: GET_SAVING_DEPOTS_QUERY,
                  data: { getSavingDepots: updatedDepots },
                });
              }
            }
          } catch {}
        },
      });

      // Zustand mirror removed

      // Reset form
      setAmount('');
      setDescribtion('');

      onClose();
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
