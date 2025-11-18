import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FABSpeedDial from '../components/FABSpeedDial';
import TransactionListItem from '../components/molecules/TransactionListItem';
import { useExpenses } from '../hooks/useExpenses';
import CreateExpenseTransactionSheet from '../components/organisms/expenses/CreateExpenseTransactionSheet';
import EditExpenseTransactionSheet from '../components/organisms/expenses/EditExpenseTransactionSheet';
import EditExpenseSheet from '../components/organisms/expenses/EditExpenseSheet';
import RoundedButton from '../components/atoms/RoundedButton';
import HorizontalBar from '../components/atoms/HorizontalBar';
import { Info } from 'lucide-react-native';
import InfoModal from '../components/atoms/InfoModal';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
  });
}

function groupByDate(
  transactions: {
    id: string;
    amount: number;
    createdAt?: string;
    describtion?: string;
  }[],
) {
  const map = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const k = (t.createdAt ? new Date(t.createdAt) : new Date())
      .toISOString()
      .slice(0, 10);
    const arr = map.get(k) ?? [];
    arr.push(t);
    map.set(k, arr);
  }
  const entries = Array.from(map.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );
  return entries;
}

export default function ExpenseTransactions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [editExpenseOpen, setEditExpenseOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const expenseId: string = route.params?.expenseId ?? '';
  const { expenseQuery, deleteExpenseTransaction } = useExpenses({
    expenseId,
  });
  const { data, loading, error, refetch } = expenseQuery;
  const expense = data?.getExpense;

  // Open create sheet when navigated with { openCreate: true }
  useEffect(() => {
    const p = (route as any)?.params;
    if (p?.openCreate) {
      setCreateOpen(true);
      // clear the flag so it doesn't reopen on re-render
      try {
        (navigation as any)?.setParams?.({ openCreate: false });
      } catch {}
    }
  }, [route, navigation]);

  // Auto-close FAB when navigating away
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => setIsSpeedDialOpen(false));
    return unsub;
  }, [navigation]);

  const grouped = useMemo(
    () => groupByDate(expense?.transactions ?? []),
    [expense?.transactions],
  );
  const total =
    expense?.sum ??
    (expense?.transactions ?? []).reduce((s, t) => s + (t.amount || 0), 0);

  // Spending limit progress
  const spendingLimit = expense?.spendingLimit ?? 0;
  const spent = Number(total ?? 0);
  const ratio = spendingLimit > 0 ? spent / spendingLimit : 0;
  const barColor = ratio >= 0.9 ? '#f87171' : '#60a5fa'; // darker red when within 10% of the limit, darker blue otherwise

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEditExpenseOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                {expense?.title ?? 'Expense'}
              </Text>
              <Text style={styles.headerHint}>Tap to edit</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setInfoOpen(true)}
            accessibilityLabel="About expense detail"
            activeOpacity={0.7}
          >
            <Info color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.total}>
          {`${Number(total ?? 0).toLocaleString()}${
            expense?.currency ? ` ${expense.currency}` : ''
          }`}
        </Text>

        {/* Spending limit progress bar */}
        {typeof expense?.spendingLimit === 'number' &&
        (expense?.spendingLimit ?? 0) > 0 ? (
          <>
            <Text style={styles.diagCaption}>Limit:</Text>
            <HorizontalBar
              value={spent}
              max={spendingLimit as number}
              height={12}
              fillColor={barColor}
              trackColor="#1f2937"
              labelColor="#cbd5e1"
              labelText={`${Number(spent).toLocaleString()}${
                expense?.currency ? ` ${expense.currency}` : ''
              } / ${Number(spendingLimit).toLocaleString()}${
                expense?.currency ? ` ${expense.currency}` : ''
              }`}
              style={{ marginTop: 4 }}
            />
          </>
        ) : null}

        <FlatList
          contentContainerStyle={styles.listContent}
          data={grouped}
          keyExtractor={([day]) => day}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>
                Add your first transaction to this expense.
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
                title="Add Transaction"
                onPress={() => setCreateOpen(true)}
                fullWidth
                style={{ marginTop: 12 }}
              />
            </View>
          )}
          renderItem={({ item: [day, list] }) => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{formatDate(day)}</Text>
              {list.map(t => (
                <TransactionListItem
                  key={t.id}
                  id={t.id}
                  title={t.describtion || 'Transaction'}
                  subtitle={formatDate(t.createdAt)}
                  amount={t.amount}
                  currency={expense?.currency ?? undefined}
                  onPress={() => {
                    // Prevent editing temp transactions until reconciled
                    if (t.id?.startsWith('temp-')) {
                      Alert.alert('Please wait', 'This transaction is still syncing. Try again in a moment.');
                      return;
                    }
                    setSelectedTransaction(t);
                    setEditOpen(true);
                  }}
                  onDelete={async id => {
                    Alert.alert(
                      'Delete Transaction',
                      'Are you sure you want to delete this transaction?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            console.log("in function");
                            console.log({expenseId, id});
                            
                            await deleteExpenseTransaction(id, expenseId);
                          },
                        },
                      ],
                    );
                  }}
                />
              ))}
            </View>
          )}
        />

        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={() => setIsSpeedDialOpen(v => !v)}
          position="right"
          actions={[
            {
              label: 'Stats',
              onPress: () => {
                setIsSpeedDialOpen(false);
                navigation.navigate('ExpenseStats', { expenseId });
              },
              color: '#0ea5e9',
            },
            {
              label: 'New Transaction',
              onPress: () => {
                setIsSpeedDialOpen(false);
                setCreateOpen(true);
              },
            },
          ]}
        />

        <CreateExpenseTransactionSheet
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          expenseId={expenseId}
          currency={expense?.currency}
          onCreate={() => {}}
        />

        <EditExpenseTransactionSheet
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          currency={expense?.currency}
          expenseId={expenseId}
          onUpdate={refetch}
        />

        <EditExpenseSheet
          open={editExpenseOpen}
          onClose={() => setEditExpenseOpen(false)}
          expense={expense ?? null}
          onUpdate={refetch}
        />

        <InfoModal
          visible={infoOpen}
          title="Expense detail"
          content="This view shows all transactions for the selected expense. Track spending over time, and compare it to the optional monthly spending limit. Use the + button to add new transactions."
          onClose={() => setInfoOpen(false)}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#0e0f14',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerAction: { color: '#cbd5e1', fontSize: 24, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerTitleWrap: { alignItems: 'center' },
  headerHint: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  headerSpacer: { width: 24 },
  periodTitle: {
    color: '#cbd5e1',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 8,
  },
  total: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 8 },
  section: { marginTop: 8 },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  diagCaption: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 2,
  },
  listContent: { paddingBottom: 160 },
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
