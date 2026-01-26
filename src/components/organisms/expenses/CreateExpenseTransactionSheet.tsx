import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  TextInput,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar as CalendarIcon, Plus, X } from 'lucide-react-native';
import FormBottomSheet from '../../FormBottomSheet';
import Calendar from '../../atoms/Calendar';
import { preferences } from '../../../services/preferences';
import { useExpenses } from '../../../hooks/useExpenses';
import IconSymbol from '../../atoms/IconSymbol';

export default function CreateExpenseTransactionSheet({
  open,
  onClose,
  onCreate,
  expenseId,
  currency,
}: {
  open: boolean;
  onClose: () => void;
  onCreate?: (
    amount: number,
    describtion: string,
    categoryId: string,
  ) => void | Promise<void>;
  expenseId: string;
  currency?: string;
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

  const { categoriesQuery, createExpenseTransaction } = useExpenses({
    includeCategories: true,
    expenseId,
  });
  const { data: categoriesData, loading, refetch } = categoriesQuery;
  const categories = categoriesData?.getExpenseCategories || [];
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const amountInputRef = useRef<TextInput | null>(null);

  // Fetch categories when modal opens
  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  // Load persisted autocategorize default when opening
  useEffect(() => {
    if (open) {
      preferences
        .getTxAutoCategorizeDefault()
        .then(v => setAutoCategorize(!!v))
        .catch(() => {});
      setTimeout(() => amountInputRef.current?.focus(), 50);
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
    return categoryOptions;
  }, [categories, loading]);
  const selectedCategory = useMemo(
    () => categories.find(cat => cat.id === selectedCategoryId) || null,
    [categories, selectedCategoryId],
  );
  const categoryOptions = useMemo(
    () => [
      { id: '', label: 'No category', icon: 'x' },
      ...dropdownOptions,
      ...(categories.length === 0 && !loading
        ? [{ id: 'create_new', label: 'Create New Category', icon: 'plus' }]
        : []),
    ],
    [dropdownOptions, categories.length, loading],
  );

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
      await createExpenseTransaction(
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

  const formattedDate = `${String(selectedDate.getDate()).padStart(2, '0')}.${String(
    selectedDate.getMonth() + 1,
  ).padStart(2, '0')}.${selectedDate.getFullYear()}`;

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="New Transaction"
      submitDisabled={!isValid || submitting}
      heightPercent={0.85}
      onSubmit={handleSubmit}
    >
      <View style={styles.sheetContent}>
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

        <View style={styles.formBlock}>
          <View>
            <Text style={styles.sectionLabel}>Title</Text>
            <View style={styles.titleRow}>
              <TextInput
                value={describtion}
                onChangeText={setDescribtion}
                placeholder="Groceries from Whole Foods"
                placeholderTextColor="#6b7280"
                returnKeyType="next"
                style={styles.titleInput}
              />
            </View>
          </View>

          <View style={styles.inlineInputs}>
            <View style={styles.fieldGroup}>
              <Text style={styles.sectionLabel}>Category</Text>
              <TouchableOpacity
                style={styles.categorySquare}
                onPress={() => setCategoryOpen(true)}
                activeOpacity={0.8}
              >
                {selectedCategory?.icon ? (
                  <IconSymbol name={selectedCategory.icon} size={22} color="#3b82f6" />
                ) : (
                  <X color="#3b82f6" size={22} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.fieldGroupWide}>
              <Text style={styles.sectionLabel}>Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setCalendarOpen(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.dateText}>{formattedDate}</Text>
                <CalendarIcon color="#3b82f6" size={18} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={[styles.inlineRow, { marginTop: 10 }]}>
          <Text style={styles.sectionLabel}>Auto categorize</Text>
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

        <Modal
          visible={categoryOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setCategoryOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCategoryOpen(false)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Category</Text>
                <TouchableOpacity onPress={() => setCategoryOpen(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={categoryOptions}
                keyExtractor={item => item.id || item.label}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      (item.id || '') === (selectedCategoryId || '') &&
                        styles.optionSelected,
                    ]}
                    onPress={() => {
                      if (item.id === 'create_new') {
                        setCategoryOpen(false);
                        onClose();
                        navigation.navigate('CreateCategory');
                        return;
                      }
                      setSelectedCategoryId(item.id || null);
                      setCategoryOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      {item.icon ? (
                        item.icon === 'plus' ? (
                          <Plus color="#3b82f6" size={18} />
                        ) : (
                          <IconSymbol name={item.icon} size={18} color="#3b82f6" />
                        )
                      ) : null}
                      <Text style={styles.optionText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </TouchableOpacity>
        </Modal>
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
  formBlock: {
    gap: 10,
  },
  inlineInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldGroup: {
    alignItems: 'flex-start',
  },
  fieldGroupWide: {
    flex: 1,
  },
  categorySquare: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  dateText: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '600',
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
  inlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    color: '#94a3b8',
    fontSize: 20,
    padding: 4,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  optionSelected: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
  },
});
