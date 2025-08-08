import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, FlatList } from 'react-native';
import Input from '../components/atoms/Input';
import { useAuthStore } from '../store/auth';
import { useFinanceStore } from '../store/finance';
import { useNavigation } from '@react-navigation/native';

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const { summary, depots, expenses, loadAll } = useFinanceStore();
  const navigation = useNavigation<any>();

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSavingModal, setShowSavingModal] = useState(false);

  useEffect(() => {
    loadAll().catch(() => {});
  }, [loadAll]);

  const todaySpentCount = summary?.todaySpent?.length ?? 0;
  const todaySpentSum = (summary?.todaySpent ?? []).reduce(
    (acc, t) => acc + (t?.amount ?? 0),
    0,
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
        <Button title="Logout" onPress={() => logout()} />
      </View>
      <Text style={styles.subtitle}>Welcome {user?.username ?? ''}</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <Text>
          User: {user?.username ?? '—'} {user?.email ? `(${user.email})` : ''}
        </Text>
        <Text>Total Savings: {summary?.savingValue ?? 0}</Text>
        <Text>ETF Worth: {summary?.etfWorth ?? 0}</Text>
        <Text>ETF Movement: {summary?.etfMovement ?? 0}</Text>
        <Text>
          Today Spent: {todaySpentSum} ({todaySpentCount} tx)
        </Text>
        <Text>
          Latest Expense: {summary?.latestExpense?.title ?? '—'} (sum:{' '}
          {summary?.latestExpense?.sum ?? 0})
        </Text>
      </View>

      <View style={styles.row}>
        <Button title="Add Expense" onPress={() => setShowExpenseModal(true)} />
        <View style={{ width: 12 }} />
        <Button
          title="Savings Transaction"
          onPress={() => setShowSavingModal(true)}
        />
      </View>

      <View style={styles.section}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={styles.sectionTitle}>Saving Depots</Text>
          <Button
            title="Open Savings"
            onPress={() => navigation.navigate('SavingsTab')}
          />
        </View>
        <FlatList
          data={depots}
          keyExtractor={d => d.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text
                style={styles.bold}
                onPress={() =>
                  navigation.navigate('SavingsTab', {
                    screen: 'SavingTransactions',
                    params: { depotId: item.id },
                  })
                }
              >
                {item.name} ({item.short})
              </Text>
              <Text>Balance: {item.sum ?? 0}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        <FlatList
          data={expenses}
          keyExtractor={e => e.id}
          renderItem={({ item }) => (
            <View style={styles.listItem}>
              <Text style={styles.bold}>{item.title}</Text>
              <Text>{item.transactions?.length ?? 0} entries</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today Spent</Text>
        {(summary?.todaySpent ?? []).length === 0 ? (
          <Text style={{ color: '#666' }}>No expenses today.</Text>
        ) : (
          <FlatList
            data={summary?.todaySpent ?? []}
            keyExtractor={t => t.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.bold}>{item.describtion}</Text>
                <Text>{item.amount}</Text>
              </View>
            )}
          />
        )}
      </View>

      <ExpenseModal
        visible={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />
      <SavingModal
        visible={showSavingModal}
        onClose={() => setShowSavingModal(false)}
      />
    </View>
  );
}

function ExpenseModal({
  visible: _visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { expenses, createExpenseTx } = useFinanceStore();
  const [expenseId, setExpenseId] = useState<string | null>(
    expenses[0]?.id ?? null,
  );
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Create Expense</Text>
      <Text>Expense ID</Text>
      <Input
        value={expenseId ?? ''}
        onChangeText={setExpenseId}
        placeholder="Expense ID"
      />
      <Text>Amount</Text>
      <Input value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Text>Description</Text>
      <Input value={description} onChangeText={setDescription} />
      <View style={styles.row}>
        <Button title="Cancel" onPress={onClose} />
        <View style={{ width: 12 }} />
        <Button
          title="Add"
          onPress={async () => {
            if (!expenseId || !amount || !description) return;
            await createExpenseTx(expenseId, parseFloat(amount), description);
            onClose();
          }}
        />
      </View>
    </View>
  );
}

function SavingModal({ onClose }: { onClose: () => void }) {
  const { depots, createSavingTx } = useFinanceStore();
  const [depotId, setDepotId] = useState<string | null>(depots[0]?.id ?? null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  return (
    <View style={styles.modalContainer}>
      <Text style={styles.modalTitle}>Savings Transaction</Text>
      <Text>Depot ID</Text>
      <Input
        value={depotId ?? ''}
        onChangeText={setDepotId}
        placeholder="Depot ID"
      />
      <Text>Amount (+ deposit / - withdrawal)</Text>
      <Input value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Text>Note</Text>
      <Input value={note} onChangeText={setNote} />
      <View style={styles.row}>
        <Button title="Cancel" onPress={onClose} />
        <View style={{ width: 12 }} />
        <Button
          title="Save"
          onPress={async () => {
            if (!depotId || !amount || !note) return;
            await createSavingTx(depotId, parseFloat(amount), note);
            onClose();
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 12 },
  card: {
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    marginBottom: 16,
  },
  cardTitle: { fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  bold: { fontWeight: '700' },
  modalContainer: { flex: 1, padding: 16, paddingTop: 56 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
