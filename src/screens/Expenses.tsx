import React, { useEffect, useMemo, useState } from 'react';
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
import RoundedButton from '../components/atoms/RoundedButton';
import { Trash2 } from 'lucide-react-native';
import { useFinanceStore } from '../store/finance';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client';
import { preferences } from '../services/preferences';

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
  const [showArchived, setShowArchived] = useState(false);

  const displayedExpenses = useMemo(
    () => (showArchived ? expenses : (expenses || []).filter(e => !e.archived)),
    [expenses, showArchived],
  );

  useEffect(() => {
    if (!expenses || expenses.length === 0) void loadAll();
  }, [expenses, loadAll]);

  // Load persisted preference once
  useEffect(() => {
    let mounted = true;
    preferences
      .getShowArchivedExpenses()
      .then(v => {
        if (mounted) setShowArchived(v);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Expenses</Text>
          <TouchableOpacity
            onPress={async () => {
              const next = !showArchived;
              setShowArchived(next);
              await preferences.setShowArchivedExpenses(next);
            }}
            accessibilityRole="button"
            accessibilityLabel="Toggle archived filter"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Text style={styles.titleMeta}>
              {showArchived ? 'Archived included' : 'Archived excluded'}
            </Text>
          </TouchableOpacity>
        </View>
        {isLoading && expenses.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={displayedExpenses}
            keyExtractor={e => e.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>
                  {showArchived ? 'No expenses found' : 'No active expenses'}
                </Text>
                <Text style={styles.emptySub}>
                  {showArchived
                    ? 'You have no expenses yet. Create your first one.'
                    : 'Archived expenses are hidden. Create a new one to get started.'}
                </Text>
                <RoundedButton
                  title="Create Expense"
                  onPress={() => setIsCreateModalOpen(true)}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              </View>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.expenseItem,
                  showArchived && item.archived ? styles.archivedItem : null,
                ]}
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
              label: 'Archived',
              onPress: async () => {
                const next = !showArchived;
                setShowArchived(next);
                await preferences.setShowArchivedExpenses(next);
              },
              color: showArchived ? '#16a34a' : '#ef4444',
            },
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

  // Reset when closed so the next open is empty
  React.useEffect(() => {
    if (!visible) {
      setTitle('');
      setIsSubmitting(false);
    }
  }, [visible]);

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
  title: { fontSize: 24, fontWeight: '700', color: '#fff' },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleMeta: { color: '#94a3b8', fontSize: 12 },
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
  archivedItem: { opacity: 0.6 },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 48,
  },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  emptySub: { color: '#94a3b8', marginTop: 6, marginBottom: 12, textAlign: 'center' },
});
