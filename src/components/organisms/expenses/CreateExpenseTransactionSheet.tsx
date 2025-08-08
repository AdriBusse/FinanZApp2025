import React, { useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, FlatList } from 'react-native';
import { useQuery } from '@apollo/client';
import FormBottomSheet, { formStyles as commonFormStyles } from '../../FormBottomSheet';
import Input from '../../atoms/Input';
import { GETEXPENSECATEGORIES } from '../../../queries/GetExpenseCategories';

type Category = { id: string; name: string; color?: string | null; icon?: string | null };

type CategoriesData = {
  getExpenseCategories: Category[];
};

export default function CreateExpenseTransactionSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (amount: number, describtion: string, categoryId: string) => Promise<void>;
}) {
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data, loading } = useQuery<CategoriesData>(GETEXPENSECATEGORIES);
  const categories = useMemo(() => data?.getExpenseCategories ?? [], [data]);

  const isValid =
    amount.trim().length > 0 &&
    describtion.trim().length > 0 &&
    !isNaN(Number(amount)) &&
    !!selectedCategoryId;

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="New Expense Transaction"
      submitLabel="Save"
      submitDisabled={!isValid}
      heightPercent={0.8}
      onSubmit={async () => {
        if (!isValid || !selectedCategoryId) return;
        await onCreate(Number(amount), describtion, selectedCategoryId);
        setAmount('');
        setDescribtion('');
        setSelectedCategoryId(null);
      }}
    >
      <Text style={commonFormStyles.modalLabel}>Amount</Text>
      <Input
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        placeholder="e.g. 12.50"
      />
      <Text style={commonFormStyles.modalLabel}>Description</Text>
      <Input value={describtion} onChangeText={setDescribtion} placeholder="What is this?" />

      <Text style={[commonFormStyles.modalLabel, { marginTop: 8 }]}>Category</Text>
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={c => c.id}
          style={{ maxHeight: 220, marginBottom: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const selected = selectedCategoryId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedCategoryId(item.id)}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  backgroundColor: selected ? '#2e7d3244' : '#1e212b',
                  borderWidth: selected ? 1 : 0,
                  borderColor: '#2e7d32',
                }}
              >
                <Text style={{ color: '#f8fafc', fontWeight: '700' }}>{item.name}</Text>
                {!!item.icon && (
                  <Text style={{ color: '#94a3b8', marginTop: 2 }}>{item.icon}</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
      )}
    </FormBottomSheet>
  );
}
