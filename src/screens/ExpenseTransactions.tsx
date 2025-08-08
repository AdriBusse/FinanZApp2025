import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FABSpeedDial from '../components/FABSpeedDial';
import TransactionListItem from '../components/molecules/TransactionListItem';
import { useFinanceStore } from '../store/finance';
import CreateExpenseTransactionSheet from '../components/organisms/expenses/CreateExpenseTransactionSheet';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client';

const DELETE_EXPENSE_TRANSACTION = gql`
  mutation DELETEEXPANSETRANSACTION($id: String!) {
    deleteExpenseTransaction(id: $id)
  }
`;

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
  const entries = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return entries;
}

export default function ExpenseTransactions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const expenseId: string = route.params?.expenseId ?? '';
  const { expenses, createExpenseTx, loadAll } = useFinanceStore();
  const expense = expenses.find(e => e.id === expenseId);

  const grouped = useMemo(
    () => groupByDate(expense?.transactions ?? []),
    [expense?.transactions],
  );
  const total = expense?.sum ?? (expense?.transactions ?? []).reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{expense?.title ?? 'Expense'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.periodTitle}>
          {new Date().toLocaleString(undefined, { month: 'long', day: '2-digit' })}:
        </Text>
        <Text style={styles.total}>{total?.toLocaleString?.() ?? total} d</Text>

        <FlatList
          contentContainerStyle={{ paddingBottom: 120 }}
          data={grouped}
          keyExtractor={([day]) => day}
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
                  onDelete={async id => {
                    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                          try {
                            await apolloClient.mutate({ mutation: DELETE_EXPENSE_TRANSACTION, variables: { id } });
                            await loadAll();
                          } catch {}
                        },
                      },
                    ]);
                  }}
                />
              ))}
            </View>
          )}
        />

        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={() => setIsSpeedDialOpen(v => !v)}
          position="left"
          actions={[
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
          onCreate={async (amount, describtion, categoryId) => {
            await createExpenseTx(expenseId, amount, describtion, categoryId);
            setCreateOpen(false);
          }}
        />
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#0e0f14' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  headerAction: { color: '#cbd5e1', fontSize: 24, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  periodTitle: { color: '#cbd5e1', fontSize: 22, fontWeight: '800', marginTop: 8 },
  total: { color: '#fff', fontSize: 32, fontWeight: '900', marginVertical: 8 },
  section: { marginTop: 12 },
  sectionTitle: { color: '#cbd5e1', fontSize: 14, fontWeight: '700', marginBottom: 8 },
});
