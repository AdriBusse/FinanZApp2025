import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import Dropdown from '../../atoms/Dropdown';
import Calendar from '../../atoms/Calendar';
import { useCategoriesStore } from '../../../store/categories';
import { preferences } from '../../../services/preferences';
import { useFinanceStore } from '../../../store/finance';

export default function CreateExpenseTransactionSheet({
  open,
  onClose,
  onCreate,
  expenseId,
}: {
  open: boolean;
  onClose: () => void;
  onCreate?: (
    amount: number,
    describtion: string,
    categoryId: string,
  ) => void | Promise<void>;
  expenseId: string;
}) {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  );
  const [autoCategorize, setAutoCategorize] = useState(false);
  // Date state (defaults to today)
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [day, setDay] = useState(now.getDate());

  const { categories, loading, fetchCategories } = useCategoriesStore();
  const createExpenseTx = useFinanceStore(s => s.createExpenseTx);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open, fetchCategories]);

  // Load persisted autocategorize default when opening
  useEffect(() => {
    if (open) {
      preferences
        .getTxAutoCategorizeDefault()
        .then(v => setAutoCategorize(!!v))
        .catch(() => {});
    }
  }, [open]);

  // Reset form when sheet closes
  useEffect(() => {
    if (!open) {
      setAmount('');
      setDescribtion('');
      setSelectedCategoryId(null);
      const t = new Date();
      setYear(t.getFullYear());
      setMonth(t.getMonth());
      setDay(t.getDate());
    }
  }, [open]);

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
    if (!isValid) return;
    try {
      setSubmitting(true);
      const createdAmount = Number(amount);
      const createdDesc = describtion;
      const createdCategoryId = selectedCategoryId || '';
      // dateMs will be sent to store; no need to compute ISO here

      // Delegate creation + optimistic/caching to store
      await createExpenseTx(
        expenseId,
        createdAmount,
        createdDesc,
        selectedCategoryId || undefined,
        Math.floor(selectedDate.getTime()),
        autoCategorize,
      );
      // Close immediately after positive response to prevent repeated taps
      onClose();
      // Fire and forget any follow-up logic (e.g., refetch, toast)
      void onCreate?.(createdAmount, createdDesc, createdCategoryId);
      // Persist preference for next time
      void preferences.setTxAutoCategorizeDefault(autoCategorize);
      // Do not manually reset; the sheet's close effect resets fields
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="New Expense Transaction"
      submitDisabled={!isValid || submitting}
      heightPercent={0.7}
      onSubmit={handleSubmit}
    >
      <View style={styles.scrollContainer}>
        <Text style={commonFormStyles.modalLabel}>Description</Text>
        <Input
          value={describtion}
          onChangeText={setDescribtion}
          placeholder="What is this?"
          returnKeyType="next"
        />

        <Text style={commonFormStyles.modalLabel}>Amount</Text>
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 12.50"
          returnKeyType="done"
          leftAdornment={<Text style={{ color: '#cbd5e1', fontSize: 16 }}>€</Text>}
          // No implicit submit from keyboard; only Save button triggers
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

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 8,
          }}
        >
          <Text style={commonFormStyles.modalLabel}>Autocategorize</Text>
          <Switch
            value={autoCategorize}
            onValueChange={async v => {
              setAutoCategorize(v);
              try {
                await preferences.setTxAutoCategorizeDefault(v);
              } catch {}
            }}
          />
        </View>

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
  scrollContainer: {
    flex: 1,
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
