import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useFinanceStore } from '../store/finance';
import { useNavigation, useRoute } from '@react-navigation/native';
import FABSpeedDial from '../components/FABSpeedDial';
import FormBottomSheet, { formStyles as commonFormStyles } from '../components/FormBottomSheet';

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: '2-digit' });
}

function groupByDate(transactions: { id: string; amount: number; createdAt?: string; describtion?: string }[]) {
  const map = new Map<string, typeof transactions>();
  for (const t of transactions) {
    const k = (t.createdAt ? new Date(t.createdAt) : new Date()).toISOString().slice(0, 10);
    const arr = map.get(k) ?? [];
    arr.push(t);
    map.set(k, arr);
  }
  // sort by date desc
  const entries = Array.from(map.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  return entries;
}

export default function SavingTransactions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const depotId: string = route.params?.depotId ?? '';
  const { depots, createSavingTx, deleteSavingTransaction } = useFinanceStore();
  const depot = depots.find((d) => d.id === depotId);

  const grouped = useMemo(() => groupByDate(depot?.transactions ?? []), [depot?.transactions]);
  const total = (depot?.transactions ?? []).reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.headerAction}>{'‹'}</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{depot?.name ?? 'Saving'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.periodTitle}>{new Date().toLocaleString(undefined, { month: 'long', day: '2-digit' })}:</Text>
      <Text style={styles.total}>{total.toLocaleString()} d</Text>

      <FlatList
        contentContainerStyle={{ paddingBottom: 120 }}
        data={grouped}
        keyExtractor={([day]) => day}
        renderItem={({ item: [day, list] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{formatDate(day)}</Text>
            {list.map((t) => (
              <View key={t.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{t.describtion || 'Transaction'}</Text>
                  <Text style={styles.rowSub}>{formatDate(t.createdAt)}</Text>
                </View>
                <Text style={styles.rowAmount}>{Math.round(t.amount).toLocaleString()} d</Text>
                <TouchableOpacity
                  accessibilityLabel="Delete transaction"
                  onPress={() => {
                    Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteSavingTransaction(t.id); } catch {} } },
                    ]);
                  }}
                  style={{ marginLeft: 12, padding: 6 }}
                >
                  <Text style={{ color: '#ef4444', fontWeight: '700' }}>Del</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      />

      {/* FAB (unified) */}
      <FABSpeedDial
        isOpen={isSpeedDialOpen}
        onToggle={() => setIsSpeedDialOpen((v) => !v)}
        position="left"
        actions={[{ label: 'New Transaction', onPress: () => { setIsSpeedDialOpen(false); setCreateOpen(true); }, color: '#16a34a' }]}
      />

      {/* Create Transaction Bottom Sheet */}
      <CreateTransactionSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={async (amount, describtion) => {
          await createSavingTx(depotId, amount, describtion);
          setCreateOpen(false);
        }}
      />
    </View>
  );
}

function CreateTransactionSheet({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (amount: number, describtion: string) => Promise<void> }) {
  const [amount, setAmount] = useState('');
  const [describtion, setDescribtion] = useState('');
  const isValid = amount.trim().length > 0 && describtion.trim().length > 0 && !isNaN(Number(amount));
  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title="New Transaction"
      submitLabel="Save"
      submitDisabled={!isValid}
      onSubmit={async () => {
        if (!isValid) return;
        await onCreate(Number(amount), describtion);
        setAmount('');
        setDescribtion('');
      }}
    >
      <Text style={commonFormStyles.modalLabel}>Amount (+ deposit / - withdrawal)</Text>
      <TextInput style={commonFormStyles.modalInput} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 50" placeholderTextColor="#94a3b8" />
      <Text style={commonFormStyles.modalLabel}>Description</Text>
      <TextInput style={commonFormStyles.modalInput} value={describtion} onChangeText={setDescribtion} placeholder="What is this?" placeholderTextColor="#94a3b8" />
    </FormBottomSheet>
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
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e212b', padding: 14, borderRadius: 12, marginBottom: 10 },
  rowTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#94a3b8', marginTop: 4 },
  rowAmount: { color: '#f1f5f9', fontWeight: '800' },
});
