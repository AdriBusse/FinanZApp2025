import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Input from '../components/atoms/Input';
import { useAuthStore } from '../store/auth';
import { useFinanceStore } from '../store/finance';
import { useNavigation } from '@react-navigation/native';
import RoundedButton from '../components/atoms/RoundedButton';
import ScreenWrapper from '../components/layout/ScreenWrapper';

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
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
        <RoundedButton title="Logout" variant="outline" size="sm" onPress={() => logout()} />
      </View>
      <Text style={styles.subtitle}>Welcome {user?.username ?? ''}</Text>

      <View style={styles.tilesGrid}>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>Total Savings</Text>
          <Text style={styles.tileValue}>{(summary?.savingValue ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>ETF Worth</Text>
          <Text style={styles.tileValue}>{(summary?.etfWorth ?? 0).toLocaleString()}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>ETF Movement</Text>
          <Text style={[styles.tileValue, { color: (summary?.etfMovement ?? 0) >= 0 ? '#16a34a' : '#ef4444' }]}>
            {(summary?.etfMovement ?? 0).toLocaleString()}
          </Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>Today Spent</Text>
          <Text style={styles.tileValue}>{todaySpentSum.toLocaleString()}</Text>
          <Text style={styles.tileSub}>{todaySpentCount} tx</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>Latest Expense</Text>
          <Text style={styles.tileValue}>{summary?.latestExpense?.sum?.toLocaleString?.() ?? (summary?.latestExpense?.sum ?? 0)}</Text>
          <Text style={styles.tileSub}>{summary?.latestExpense?.title ?? '—'}</Text>
        </View>
        <View style={styles.tile}>
          <Text style={styles.tileTitle}>User</Text>
          <Text style={styles.tileValue}>{user?.username ?? '—'}</Text>
          {!!user?.email && <Text style={styles.tileSub}>{user.email}</Text>}
        </View>
      </View>

      <View style={styles.row}>
        <RoundedButton title="Add Expense" onPress={() => setShowExpenseModal(true)} />
        <View style={{ width: 12 }} />
        <RoundedButton title="Savings Transaction" variant="secondary" onPress={() => setShowSavingModal(true)} />
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
          <RoundedButton title="Open Savings" size="sm" variant="secondary" onPress={() => navigation.navigate('SavingsTab')} />
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
              <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
                Balance: {(item.sum ?? 0).toLocaleString()}
              </Text>
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
              <Text style={{ color: '#cbd5e1', marginTop: 4 }}>
                {(item.transactions?.length ?? 0).toLocaleString()} entries
              </Text>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today Spent</Text>
        {(summary?.todaySpent ?? []).length === 0 ? (
          <Text style={{ color: '#94a3b8' }}>No expenses today.</Text>
        ) : (
          <FlatList
            data={summary?.todaySpent ?? []}
            keyExtractor={t => t.id}
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <Text style={styles.bold}>{item.describtion}</Text>
                <Text style={{ color: '#f1f5f9', marginTop: 4 }}>
                  {item.amount?.toLocaleString?.() ?? item.amount}
                </Text>
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
    </ScreenWrapper>
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
      <Text style={styles.modalLabel}>Expense ID</Text>
      <Input
        value={expenseId ?? ''}
        onChangeText={setExpenseId}
        placeholder="Expense ID"
      />
      <Text style={styles.modalLabel}>Amount</Text>
      <Input value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Text style={styles.modalLabel}>Description</Text>
      <Input value={description} onChangeText={setDescription} />
      <View style={styles.row}>
        <RoundedButton title="Cancel" variant="outline" onPress={onClose} />
        <View style={{ width: 12 }} />
        <RoundedButton
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
      <Text style={styles.modalLabel}>Depot ID</Text>
      <Input
        value={depotId ?? ''}
        onChangeText={setDepotId}
        placeholder="Depot ID"
      />
      <Text style={styles.modalLabel}>Amount (+ deposit / - withdrawal)</Text>
      <Input value={amount} onChangeText={setAmount} keyboardType="numeric" />
      <Text style={styles.modalLabel}>Note</Text>
      <Input value={note} onChangeText={setNote} />
      <View style={styles.row}>
        <RoundedButton title="Cancel" variant="outline" onPress={onClose} />
        <View style={{ width: 12 }} />
        <RoundedButton
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
  container: { flex: 1, padding: 16, paddingTop: 20, backgroundColor: '#0e0f14' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 4, color: '#fff' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginBottom: 12 },
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 12 },
  tile: {
    width: '48%',
    backgroundColor: '#1e212b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  tileTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  tileValue: { color: '#f8fafc', fontSize: 18, fontWeight: '800', marginTop: 4 },
  tileSub: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8, color: '#fff' },
  listItem: {
    padding: 14,
    backgroundColor: '#1e212b',
    borderRadius: 12,
    marginBottom: 8,
  },
  bold: { fontWeight: '700', color: '#f8fafc' },
  modalContainer: { flex: 1, padding: 16, paddingTop: 56, backgroundColor: '#111827' },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16, color: '#fff' },
  modalLabel: { color: '#cbd5e1', fontSize: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    color: '#fff',
    backgroundColor: '#0f172a',
  },
});
