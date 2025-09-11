import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FABSpeedDial from '../components/FABSpeedDial';
import FormBottomSheet from '../components/FormBottomSheet';
import Input from '../components/atoms/Input';
import RoundedButton from '../components/atoms/RoundedButton';
import { Trash2, Info } from 'lucide-react-native';
import InfoModal from '../components/atoms/InfoModal';
import { useExpenses } from '../hooks/useFinanceData';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client';
import { preferences } from '../services/preferences';
import { GET_EXPENSES_QUERY } from '../graphql/finance';

const CREATE_EXPENSE = gql`
  mutation CreateExpense(
    $title: String!
    $currency: String
    $monthlyRecurring: Boolean
    $spendingLimit: Int
    $skipTemplateIds: [ID!]
  ) {
    createExpense(
      title: $title
      currency: $currency
      monthlyRecurring: $monthlyRecurring
      spendingLimit: $spendingLimit
      skipTemplateIds: $skipTemplateIds
    ) {
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
  const route = useRoute<any>();
  const { data, loading, error, refetch } = useExpenses();
  const expenses = data?.getExpenses || [];
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const displayedExpenses = useMemo(
    () => (showArchived ? expenses : (expenses || []).filter(e => !e.archived)),
    [expenses, showArchived],
  );

  useEffect(() => {
    if (!expenses || expenses.length === 0) void refetch();
  }, [expenses, refetch]);

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

  // Auto-close FAB when navigating away
  useEffect(() => {
    const unsub = navigation.addListener('blur', () =>
      setIsSpeedDialOpen(false),
    );
    return unsub;
  }, [navigation]);

  // Open create modal when navigated with param { openCreate: true }
  useEffect(() => {
    const p = (route as any)?.params;
    if (p?.openCreate) {
      setIsCreateModalOpen(true);
    }
  }, [route]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.title}>Expenses</Text>
            <TouchableOpacity
              onPress={() => setInfoOpen(true)}
              accessibilityLabel="About expenses"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginLeft: 8 }}
              activeOpacity={0.7}
            >
              <Info color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>
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
        {loading && expenses.length === 0 ? (
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
                <TouchableOpacity
                  onPress={() => setInfoOpen(true)}
                  activeOpacity={0.7}
                >
                  <Text style={{ color: '#93c5fd', fontWeight: '700' }}>
                    What is this?
                  </Text>
                </TouchableOpacity>
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
                  navigation.navigate('ExpenseTransactions', {
                    expenseId: item.id,
                  })
                }
              >
                <View>
                  <Text style={styles.expenseName}>{item.title}</Text>
                  <Text style={styles.expenseSub}>
                    {(item.transactions?.length ?? 0).toLocaleString()} entries
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.expenseSum}>{`${(
                    item.sum ?? 0
                  ).toLocaleString()}${
                    item.currency ? ` ${item.currency}` : ''
                  }`}</Text>
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
                                  optimisticResponse: {
                                    __typename: 'Mutation',
                                    deleteExpense: true,
                                  },
                                  update: cache => {
                                    try {
                                      const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
                                      const list = existing?.getExpenses || [];
                                      cache.writeQuery({
                                        query: GET_EXPENSES_QUERY,
                                        data: { getExpenses: list.filter((e: any) => e.id !== item.id) },
                                      });
                                    } catch {}
                                  },
                                });
                              } catch {}
                            },
                          },
                        ],
                      );
                    }}
                    style={{ marginLeft: 12, padding: 6 }}
                  >
                    <Trash2
                      color="#ef4444"
                      size={20}
                      style={{ opacity: 0.8 }}
                    />
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
                setIsSpeedDialOpen(false);
                const next = !showArchived;
                setShowArchived(next);
                await preferences.setShowArchivedExpenses(next);
              },
              color: showArchived ? '#16a34a' : '#ef4444',
            },
            {
              label: 'New Expense',
              onPress: () => {
                setIsSpeedDialOpen(false);
                setIsCreateModalOpen(true);
              },
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
            {
              label: 'Templates',
              onPress: () => {
                setIsSpeedDialOpen(false);
                navigation.navigate('ExpenseTemplates');
              },
              color: '#0ea5e9',
            },
          ]}
        />

        <CreateExpenseModal
          visible={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
          }}
        />

        <InfoModal
          visible={infoOpen}
          title="Expenses"
          content={`
Expenses let you group your spending into a single bucket for a time period (typically a month) or a specific topic (e.g., **Vacation**, **Home Renovation**). Each bucket contains all the transactions for that period/topic so you can see where your money goes.

**What you can do:**
- Create a bucket for a month or a custom topic.
- Set a spending limit for the bucket to keep yourself on budget.
- Add transactions to the bucket as you spend.
- Categorize each transaction (e.g., Groceries, Dining, Transport) to get a detailed breakdown.
- Make expenses recurring and pre-load recurring transactions (like rent or subscriptions) each time a new recurring bucket is created.
- Archive older Expenses that should not occour primarly in the list.

**How it works (step by step):**
1. Create a new Expense bucket
Choose Month (e.g., "August 2025") or Topic (e.g., "Ski Trip").
2. Set a spending limit (optional)
Add a target budget for the bucket.
3. Add transactions as you go
Enter the amount, date, and assign a category.
4. Use recurring items (optional)
Mark common charges (rent, phone bill, gym) as recurring transactions.
When you create the next recurring bucket (e.g., next month), these transactions are auto-added so you don’t have to re-enter them.
5. Review your spending
See totals vs. limit and a category breakdown for that bucket to understand where your money went during that time/topic.

That’s it — Buckets organize your spending, limits keep you on track, categories show where the money goes, and recurring items save you time every month.`}
          markdown
          onClose={() => setInfoOpen(false)}
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
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [currency, setCurrency] = useState('€');
  const [monthlyRecurring, setMonthlyRecurring] = useState(false);
  const [spendingLimit, setSpendingLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isValid = title.trim().length > 0;

  // Templates handling
  const [templates, setTemplates] = useState<
    Array<{ id: string; describtion: string; amount?: number }>
  >([]);
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  const GET_TEMPLATES = gql`
    query GET_EXPENSE_TEMPLATES {
      getExpenseTransactionTemplates {
        id
        describtion
        amount
      }
    }
  `;

  const loadTemplates = async () => {
    try {
      const { data } = await apolloClient.query({
        query: GET_TEMPLATES,
        fetchPolicy: 'network-only',
      });
      const list: Array<{ id: string; describtion: string; amount?: number }> =
        data?.getExpenseTransactionTemplates ?? [];
      setTemplates(list);
      // Initialize selection: use saved prefs intersecting with current list; default to all
      const saved = (await preferences.getSelectedExpenseTemplateIds()) ?? null;
      if (saved && saved.length > 0) {
        const existing = list.filter(t => saved.includes(t.id)).map(t => t.id);
        setSelectedTemplateIds(
          existing.length > 0 ? existing : list.map(t => t.id),
        );
      } else {
        setSelectedTemplateIds(list.map(t => t.id));
      }
    } catch (e) {
      // ignore errors; empty list
      setTemplates([]);
    }
  };

  // Reset when closed so the next open is empty
  React.useEffect(() => {
    if (!visible) {
      setTitle('');
      setCurrency('€');
      setMonthlyRecurring(false);
      setSpendingLimit('');
      setTemplates([]);
      setSelectedTemplateIds([]);
      setIsSubmitting(false);
    }
  }, [visible]);

  // Load templates only when needed
  React.useEffect(() => {
    if (visible && monthlyRecurring) {
      void loadTemplates();
    }
  }, [visible, monthlyRecurring]);

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
          const skipTemplateIds =
            monthlyRecurring && templates.length > 0
              ? templates
                  .filter(t => !selectedTemplateIds.includes(t.id))
                  .map(t => t.id)
              : undefined;
          const parsedLimit =
            spendingLimit.trim() && !Number.isNaN(Number(spendingLimit))
              ? parseInt(spendingLimit, 10)
              : null;
          const tempId = `temp-${Date.now()}`;
          const res = await apolloClient.mutate({
            mutation: CREATE_EXPENSE,
            variables: {
              title: title.trim(),
              currency: currency.trim() || null,
              monthlyRecurring,
              spendingLimit: parsedLimit,
              skipTemplateIds,
            },
            refetchQueries: [{ query: GET_EXPENSES_QUERY }],
            awaitRefetchQueries: true,
            optimisticResponse: {
              __typename: 'Mutation',
              createExpense: {
                __typename: 'Expense',
                id: tempId,
              } as any,
            },
            update: (cache, { data }) => {
              try {
                const createdId = (data as any)?.createExpense?.id ?? tempId;
                const existing: any = cache.readQuery({ query: GET_EXPENSES_QUERY });
                const list = existing?.getExpenses || [];
                const withoutDup = list.filter((e: any) => e.id !== createdId && e.id !== tempId);
                const newExpense = {
                  __typename: 'Expense',
                  id: createdId,
                  title: title.trim(),
                  currency: (currency.trim() || null) as any,
                  archived: false,
                  monthlyRecurring,
                  spendingLimit: parsedLimit,
                  sum: 0,
                  transactions: [],
                  expenseByCategory: [],
                } as any;
                cache.writeQuery({
                  query: GET_EXPENSES_QUERY,
                  data: { getExpenses: [newExpense, ...withoutDup] },
                });
              } catch {}
            },
          });
          // Apollo cache already updated; no Zustand sync
          // Persist template selection for next time
          if (monthlyRecurring) {
            await preferences.setSelectedExpenseTemplateIds(
              selectedTemplateIds,
            );
          }
          setTitle('');
          setCurrency('');
          setMonthlyRecurring(false);
          setSpendingLimit('');
          onCreated();
        } finally {
          setIsSubmitting(false);
        }
      }}
    >
      <Text style={styles.modalLabel}>Title</Text>
      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Groceries"
      />
      <Text style={styles.modalLabel}>Currency</Text>
      <Input
        value={currency}
        onChangeText={setCurrency}
        placeholder="e.g. EUR"
        maxLength={6}
      />
      <Text style={styles.modalLabel}>Spending Limit</Text>
      <Input
        value={spendingLimit}
        onChangeText={setSpendingLimit}
        placeholder="e.g. 300"
        keyboardType="numeric"
        leftAdornment={<Text style={{ color: '#cbd5e1', fontSize: 16 }}>€</Text>}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 8,
        }}
      >
        <Text style={styles.modalLabel}>Monthly recurring</Text>
        <Switch value={monthlyRecurring} onValueChange={setMonthlyRecurring} />
      </View>

      {monthlyRecurring && (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.modalLabel}>Templates to include</Text>
          {templates.length === 0 ? (
            <Text style={{ color: '#94a3b8' }}>No templates available yet</Text>
          ) : (
            templates.map(t => {
              const checked = selectedTemplateIds.includes(t.id);
              return (
                <TouchableOpacity
                  key={t.id}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 6,
                  }}
                  onPress={() => {
                    setSelectedTemplateIds(prev =>
                      checked
                        ? prev.filter(id => id !== t.id)
                        : [...prev, t.id],
                    );
                  }}
                >
                  <Text style={{ color: '#f8fafc' }}>
                    {t.describtion}
                    {typeof t.amount === 'number' ? (
                      <Text style={{ color: '#94a3b8' }}>{`  ${Math.round(
                        t.amount,
                      ).toLocaleString()}`}</Text>
                    ) : null}
                  </Text>
                  <Switch
                    value={checked}
                    onValueChange={v => {
                      setSelectedTemplateIds(prev =>
                        v ? [...prev, t.id] : prev.filter(id => id !== t.id),
                      );
                    }}
                  />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      )}
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
  emptySub: {
    color: '#94a3b8',
    marginTop: 6,
    marginBottom: 12,
    textAlign: 'center',
  },
});
