import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FABSpeedDial from '../components/FABSpeedDial';
import FormBottomSheet from '../components/FormBottomSheet';
import Input from '../components/atoms/Input';
import { Trash2 } from 'lucide-react-native';
import { useFinanceStore } from '../store/finance';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client';

const CREATE_EXPENSE = gql`
  mutation CreateExpense($title: String!) {
    createExpense(title: $title) {
      id
    }
  }
`;

const DELETE_EXPENSE = gql`
  mutation DELETEEXPENSE($id: String!) {
    deleteExpense(id: $id)
  }
`;

export default function Expenses() {
  const navigation = useNavigation<any>();
  const { expenses, isLoading, loadAll } = useFinanceStore();
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    if (!expenses || expenses.length === 0) void loadAll();
  }, [expenses, loadAll]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Expenses</Text>
        {isLoading && expenses.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={e => e.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.expenseItem}
                onPress={() =>
                  navigation.navigate('ExpenseTransactions', { expenseId: item.id })
                }
              >
                <View>
                  <Text style={styles.expenseName}>{item.title}</Text>
                  <Text style={styles.expenseSub}>
                    {(item.transactions?.length ?? 0).toLocaleString()} entries
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.expenseSum}>{(item.sum ?? 0).toLocaleString()}</Text>
                  <TouchableOpacity
                    accessibilityLabel="Delete expense"
                    onPress={() => {
                      Alert.alert(
                        'Delete Expense',
                        `Are you sure you want to delete "${item.title}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Delete',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                await apolloClient.mutate({
                                  mutation: DELETE_EXPENSE,
                                  variables: { id: item.id },
                                });
                                await loadAll();
                              } catch {
                                /* no-op */
                              }
                            },
                          },
                        ],
                      );
                    }}
                    style={{ marginLeft: 12, padding: 6 }}
                  >
                    <Trash2 color="#ef4444" size={20} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={() => setIsSpeedDialOpen(v => !v)}
          position="right"
          actions={[
            {
              label: 'New Expense',
              onPress: () => setIsCreateModalOpen(true),
              color: '#2563eb',
            },
            {
              label: 'Categories',
              onPress: () => {
                setIsSpeedDialOpen(false);
                navigation.navigate('Categories');
              },
              color: '#2e7d32',
            },
          ]}
        />

        <CreateExpenseModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={async () => {
            setIsCreateModalOpen(false);
            await loadAll();
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

function CreateExpenseModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = title.trim().length > 0;

  return (
    <FormBottomSheet
      visible={visible}
      onClose={onClose}
      title="Create Expense"
      submitLabel={isSubmitting ? 'Creating...' : 'Create'}
      submitDisabled={!isValid || isSubmitting}
      onSubmit={async () => {
        if (!isValid) return;
        try {
          setIsSubmitting(true);
          await apolloClient.mutate({
            mutation: CREATE_EXPENSE,
            variables: { title: title.trim() },
          });
          setTitle('');
          await onCreated();
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <Text style={styles.modalLabel}>Title</Text>
      <Input value={title} onChangeText={setTitle} placeholder="e.g. Groceries" />
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0e0f14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 16 },
  expenseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1e212b',
    borderRadius: 12,
  },
  sep: { height: 12 },
  expenseName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  expenseSub: { color: '#94a3b8', marginTop: 4 },
  expenseSum: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  modalLabel: { color: '#cbd5e1', fontSize: 12, marginBottom: 6 },
  listContent: { paddingBottom: 160 },
});
