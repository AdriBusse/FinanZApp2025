import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFinanceStore } from '../store/finance';
import { useNavigation, useRoute } from '@react-navigation/native';
import FABSpeedDial from '../components/FABSpeedDial';
import TransactionListItem from '../components/molecules/TransactionListItem';
import CreateTransactionSheet from '../components/organisms/savings/CreateTransactionSheet';
import EditSavingTransactionSheet from '../components/organisms/savings/EditSavingTransactionSheet';
import EditSavingDepotSheet from '../components/organisms/savings/EditSavingDepotSheet';
import ScreenWrapper from '../components/layout/ScreenWrapper';
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
  // sort by date desc
  const entries = Array.from(map.entries()).sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );
  return entries;
}

export default function SavingTransactions() {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editDepotOpen, setEditDepotOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const depotId: string = route.params?.depotId ?? '';
  const { depots, createSavingTx, deleteSavingTransaction } = useFinanceStore();
  const depot = depots.find(d => d.id === depotId);

  const grouped = useMemo(
    () => groupByDate(depot?.transactions ?? []),
    [depot?.transactions],
  );
  const total = (depot?.transactions ?? []).reduce(
    (s, t) => s + (t.amount || 0),
    0,
  );

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setEditDepotOpen(true)}
            style={styles.headerTitleContainer}
          >
            <Text style={styles.headerTitle}>{depot?.name ?? 'Saving'}</Text>
            <Text style={styles.editHint}>tap to edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setInfoOpen(true)}
            accessibilityLabel="About saving detail"
            activeOpacity={0.7}
          >
            <Info color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <Text style={styles.periodTitle}>
          {new Date().toLocaleString(undefined, {
            month: 'long',
            day: '2-digit',
          })}
          :
        </Text>
        <Text
          style={[styles.total, { color: total >= 0 ? '#16a34a' : '#ef4444' }]}
        >
          {`${total.toLocaleString()}${
            depot?.currency ? ` ${depot.currency}` : ''
          }`}
        </Text>

        {/* Saving goal progress bar */}
        {typeof depot?.savinggoal === 'number' &&
        (depot?.savinggoal ?? 0) > 0 ? (
          <>
            <Text style={styles.diagCaption}>Goal:</Text>
            <HorizontalBar
              value={total}
              max={depot!.savinggoal as number}
              height={12}
              fillColor="#60a5fa"
              trackColor="#1f2937"
              labelColor="#cbd5e1"
              labelText={`${Number(total ?? 0).toLocaleString()}${
                depot?.currency ? ` ${depot.currency}` : ''
              } / ${Number(depot!.savinggoal as number).toLocaleString()}${
                depot?.currency ? ` ${depot.currency}` : ''
              }`}
              style={{ marginTop: 4 }}
            />
          </>
        ) : null}

        <FlatList
          contentContainerStyle={{ paddingBottom: 160 }}
          data={grouped}
          keyExtractor={([day]) => day}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>
                Add your first transaction to this saving depot.
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
                  currency={depot?.currency || undefined}
                  onPress={() => {
                    setSelectedTransaction(t);
                    setEditOpen(true);
                  }}
                  onDelete={id => {
                    Alert.alert(
                      'Delete Transaction',
                      'Are you sure you want to delete this transaction?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              await deleteSavingTransaction(id);
                            } catch {}
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

        {/* FAB (unified) */}
        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={() => setIsSpeedDialOpen(v => !v)}
          position="right"
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

        {/* Create Transaction Bottom Sheet */}
        <CreateTransactionSheet
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreate={async (amount, describtion) => {
            await createSavingTx(depotId, amount, describtion);
            setCreateOpen(false);
          }}
        />

        {/* Edit Transaction Bottom Sheet */}
        <EditSavingTransactionSheet
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          onUpdate={async () => {}}
        />

        {/* Edit Depot Bottom Sheet */}
        <EditSavingDepotSheet
          open={editDepotOpen}
          onClose={() => {
            setEditDepotOpen(false);
          }}
          depot={depot || null}
          onUpdate={async () => {}}
        />

        <InfoModal
          visible={infoOpen}
          title="Saving detail"
          content="This view lists all transactions for the selected saving depot. Track progress toward your goal and add deposits or withdrawals with the + button."
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
  headerTitleContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  editHint: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e212b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  rowTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  rowSub: { color: '#94a3b8', marginTop: 4 },
  rowAmount: { color: '#f1f5f9', fontWeight: '800' },
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
