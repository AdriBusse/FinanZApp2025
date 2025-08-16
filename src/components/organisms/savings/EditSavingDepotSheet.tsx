import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useMutation } from '@apollo/client';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { UPDATESAVINGDEPOT } from '../../../queries/mutations/Savings/UpdateSavingDepot';

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

  const [updateDepot, { loading: updating }] = useMutation(UPDATESAVINGDEPOT);
  
  // Initialize form with depot data when modal opens
  useEffect(() => {
    if (open && depot) {
      setName(depot.name || '');
      setShort(depot.short || '');
      setCurrency(depot.currency || '');
      setSavingGoal(
        typeof depot.savinggoal === 'number' && !Number.isNaN(depot.savinggoal)
          ? String(depot.savinggoal)
          : ''
      );
    }
  }, [open, depot]);

  const isValid = name.trim().length > 0 && short.trim().length > 0;

  const handleSubmit = async () => {
    if (!isValid || !depot) return;
    
    try {
      await updateDepot({
        variables: {
          id: depot.id,
          name: name.trim(),
          short: short.trim(),
          currency: currency.trim() || null,
          savinggoal:
            savingGoal.trim().length > 0 && !Number.isNaN(Number(savingGoal))
              ? parseInt(savingGoal, 10)
              : null,
        },
      });
      
      // Call the onUpdate callback for any additional logic
      await onUpdate();
      
      // Reset form
      setName('');
      setShort('');
      setCurrency('');
      setSavingGoal('');
      
      onClose();
    } catch (error) {
      console.error('Error updating depot:', error);
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
          onFocus={(e) => e.target.setNativeProps({ selection: { start: 0, end: name.length } })}
        />
        
        <Text style={commonFormStyles.modalLabel}>Short</Text>
        <Input
          value={short}
          onChangeText={setShort}
          placeholder="e.g. VAC"
          maxLength={6}
          returnKeyType="done"
          onFocus={(e) => e.target.setNativeProps({ selection: { start: 0, end: short.length } })}
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
