import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { useSavings } from '../../../hooks/useSavings';
// Legacy finance store removed; rely on Apollo cache only

interface Depot {
  id: string;
  name: string;
  short: string;
  currency?: string | null;
  savinggoal?: number | null;
}

export default function EditSavingDepotSheet({
  open,
  onClose,
  onUpdate,
  depot,
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  depot: Depot | null;
}) {
  const [name, setName] = useState('');
  const [short, setShort] = useState('');
  const [currency, setCurrency] = useState('');
  const [savingGoal, setSavingGoal] = useState('');
  const { updateSavingDepot } = useSavings({ depotId: depot?.id });
  const [updating, setUpdating] = useState(false);

  // Initialize form with depot data when modal opens
  useEffect(() => {
    if (open && depot) {
      setName(depot.name || '');
      setShort(depot.short || '');
      setCurrency(depot.currency || '');
      setSavingGoal(
        typeof depot.savinggoal === 'number' && !Number.isNaN(depot.savinggoal)
          ? String(depot.savinggoal)
          : '',
      );
    }
  }, [open, depot]);

  const isValid = name.trim().length > 0 && short.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !depot) return;

    try {
      setUpdating(true);
      const nextName = name.trim();
      const nextShort = short.trim();
      const nextCurrency = currency.trim() || null;
      const nextGoal =
        savingGoal.trim().length > 0 && !Number.isNaN(Number(savingGoal))
          ? parseInt(savingGoal, 10)
          : null;

      await updateSavingDepot(
        depot.id,
        nextName,
        nextShort,
        nextCurrency,
        nextGoal,
      );

      // Reset form
      setName('');
      setShort('');
      setCurrency('');
      setSavingGoal('');

      await onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating depot:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="Edit Saving Depot"
      submitDisabled={!isValid || updating}
      heightPercent={0.7}
      onSubmit={handleSubmit}
    >
      <View style={styles.container}>
        <Text style={commonFormStyles.modalLabel}>Name</Text>
        <Input
          value={name}
          onChangeText={setName}
          placeholder="e.g. Vacation"
          returnKeyType="next"
          onFocus={e =>
            e.target.setNativeProps({
              selection: { start: 0, end: name.length },
            })
          }
        />

        <Text style={commonFormStyles.modalLabel}>Short</Text>
        <Input
          value={short}
          onChangeText={setShort}
          placeholder="e.g. VAC"
          maxLength={6}
          returnKeyType="done"
          onFocus={e =>
            e.target.setNativeProps({
              selection: { start: 0, end: short.length },
            })
          }
          onSubmitEditing={() => {
            // Focus next input or submit if valid
            if (isValid) {
              handleSubmit();
            }
          }}
        />

        <Text style={commonFormStyles.modalLabel}>Currency</Text>
        <Input
          value={currency}
          onChangeText={setCurrency}
          placeholder="e.g. EUR"
          maxLength={6}
        />

        <Text style={commonFormStyles.modalLabel}>Saving Goal</Text>
        <Input
          value={savingGoal}
          onChangeText={setSavingGoal}
          placeholder="e.g. 5000"
          keyboardType="numeric"
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
