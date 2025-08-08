import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useMutation } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';
import FormBottomSheet, {
  formStyles as commonFormStyles,
} from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import Dropdown from '../../atoms/Dropdown';
import { UPDATEEXPENSETRANSACTION } from '../../../queries/mutations/Expenses/UpdateExpenseTransaction';
import { useCategoriesStore } from '../../../store/categories';

interface Transaction {
  id: string;
  amount: number;
  describtion: string;
  categoryId?: string | null;
  category?: {
    id: string;
    name: string;
  } | null;
}

export default function EditExpenseTransactionSheet({
  open,
  onClose,
  onUpdate,
  transaction,
}: {
  open: boolean;
  onClose: () => void;
  onUpdate: () => Promise<void>;
  transaction: Transaction | null;
}) {
  const navigation = useNavigation<any>();
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { categories, loading, fetchCategories } = useCategoriesStore();
  const [updateTransaction, { loading: updating }] = useMutation(UPDATEEXPENSETRANSACTION);
  
  // Initialize form with transaction data when modal opens
  useEffect(() => {
    if (open && transaction) {
      setAmount(transaction.amount?.toString() || '');
      setDescribtion(transaction.describtion || '');
      setSelectedCategoryId(transaction.categoryId || null);
      fetchCategories();
    }
  }, [open, transaction, fetchCategories]);
  
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

  const handleSubmit = async () => {
    if (!isValid || !transaction) return;
    
    try {
      await updateTransaction({
        variables: {
          transactionId: transaction.id,
          amount: Number(amount),
          describtion,
          categoryId: selectedCategoryId || null,
        },
      });
      
      // Call the onUpdate callback for any additional logic
      await onUpdate();
      
      // Reset form
      setAmount('');
      setDescribtion('');
      setSelectedCategoryId(null);
      
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
          onFocus={(e) => e.target.setNativeProps({ selection: { start: 0, end: describtion.length } })}
        />
        
        <Text style={commonFormStyles.modalLabel}>Amount</Text>
        <Input
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholder="e.g. 12.50"
          returnKeyType="done"
          onFocus={(e) => e.target.setNativeProps({ selection: { start: 0, end: amount.length } })}
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
          onSelect={(option) => {
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

        {selectedCategoryId && (
          <View style={styles.categoryPreview}>
            <Text style={commonFormStyles.modalLabel}>Selected Category</Text>
            <View style={styles.previewContainer}>
              {(() => {
                const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
                return selectedCategory ? (
                  <View style={styles.previewItem}>
                    {selectedCategory.icon && (
                      <Text style={styles.previewIcon}>{selectedCategory.icon}</Text>
                    )}
                    <Text style={[
                      styles.previewName,
                      selectedCategory.color && { color: selectedCategory.color }
                    ]}>
                      {selectedCategory.name}
                    </Text>
                    {selectedCategory.color && (
                      <View style={[
                        styles.previewColor,
                        { backgroundColor: selectedCategory.color }
                      ]} />
                    )}
                  </View>
                ) : null;
              })()}
            </View>
          </View>
        )}
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
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
