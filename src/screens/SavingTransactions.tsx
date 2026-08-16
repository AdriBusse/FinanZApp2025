import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSavings } from '../hooks/useSavings';
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
  const [pendingCreates, setPendingCreates] = useState<any[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, any>>({});
  const [pendingDeletes, setPendingDeletes] = useState<Record<string, true>>({});
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const depotId: string = route.params?.depotId ?? '';
  const {
    depotQuery,
    createSavingTransaction,
    deleteSavingTransaction,
    updateSavingTransaction,
  } = useSavings({ depotId, includeList: false });
  const { data, refetch, loading } = depotQuery;
  const depot = data?.getSavingDepot;

  const displayTransactions = useMemo(() => {
    const base = depot?.transactions ?? [];
    const merged = base.map(t =>
      pendingUpdates[t.id] ? { ...t, ...pendingUpdates[t.id] } : t,
    );
    return [...pendingCreates, ...merged];
  }, [depot?.transactions, pendingCreates, pendingUpdates]);

  const grouped = useMemo(
    () => groupByDate(displayTransactions),
    [displayTransactions],
  );
  const total = (depot?.transactions ?? []).reduce(
    (s, t) => s + (t.amount || 0),
    0,
  );

  // Auto-close FAB when navigating away
  useEffect(() => {
    const unsub = navigation.addListener('blur', () =>
      setIsSpeedDialOpen(false),
    );
    return unsub;
  }, [navigation]);

  const pendingCreateIds = useMemo(
    () => new Set(pendingCreates.map(t => t.id)),
    [pendingCreates],
  );
  const pendingUpdateIds = useMemo(
    () => new Set(Object.keys(pendingUpdates)),
    [pendingUpdates],
  );
  const pendingDeleteIds = useMemo(
    () => new Set(Object.keys(pendingDeletes)),
    [pendingDeletes],
  );

  const handleCreate = useCallback(
    async (amount: number, describtion: string) => {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
      const tempTx = {
        id: tempId,
        amount,
        describtion,
        createdAt: new Date().toISOString(),
      };
      setPendingCreates(prev => [tempTx, ...prev]);
      try {
        await createSavingTransaction(depotId, amount, describtion);
      } catch (err) {
        console.error('Error creating transaction:', err);
        setPendingCreates(prev => prev.filter(t => t.id !== tempId));
      }
    },
    [createSavingTransaction, depotId],
  );

  useEffect(() => {
    if (!depot?.transactions?.length || pendingCreates.length === 0) return;
    const dateKey = (value?: string) =>
      (value ? new Date(value) : new Date()).toISOString().slice(0, 10);
    setPendingCreates(prev =>
      prev.filter(pending => {
        const pendingKey = dateKey(pending.createdAt);
        const match = depot.transactions.some(tx => {
          return (
            tx.amount === pending.amount &&
            tx.describtion === pending.describtion &&
            dateKey(tx.createdAt) === pendingKey
          );
        });
        return !match;
      }),
    );
  }, [depot?.transactions, pendingCreates.length]);

  useEffect(() => {
    if (Object.keys(pendingDeletes).length === 0) return;
    const existing = new Set(
      (depot?.transactions ?? []).map(t => `${t.id}`),
    );
    setPendingDeletes(prev => {
      let changed = false;
      const next: Record<string, true> = { ...prev };
      for (const id of Object.keys(prev)) {
        if (!existing.has(id)) {
          delete next[id];
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [depot?.transactions, pendingDeletes]);

  const handleUpdate = useCallback(
    async (payload: { id: string; amount: number; describtion: string }) => {
      setPendingUpdates(prev => ({
        ...prev,
        [payload.id]: {
          amount: payload.amount,
          describtion: payload.describtion,
        },
      }));
      try {
        await updateSavingTransaction(
          payload.id,
          depotId,
          payload.amount,
          payload.describtion,
        );
      } catch (err) {
        console.error('Error updating transaction:', err);
      } finally {
        setPendingUpdates(prev => {
          const next = { ...prev };
          delete next[payload.id];
          return next;
        });
      }
    },
    [updateSavingTransaction, depotId],
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
          ListHeaderComponent={
            loading ? (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="small" color="#60a5fa" />
                <Text style={styles.loadingText}>Loading transactions…</Text>
              </View>
            ) : null
          }
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
                  loading={
                    pendingCreateIds.has(t.id) ||
                    pendingUpdateIds.has(t.id) ||
                    pendingDeleteIds.has(t.id)
                  }
                  onPress={() => {
                    if (
                      pendingCreateIds.has(t.id) ||
                      pendingUpdateIds.has(t.id) ||
                      pendingDeleteIds.has(t.id)
                    ) {
                      Alert.alert(
                        'Please wait',
                        'This transaction is still syncing. Try again in a moment.',
                      );
                      return;
                    }
                    setSelectedTransaction(t);
                    setEditOpen(true);
                  }}
                  onDelete={
                    pendingCreateIds.has(t.id) ||
                    pendingUpdateIds.has(t.id) ||
                    pendingDeleteIds.has(t.id)
                      ? undefined
                      : id => {
                          Alert.alert(
                            'Delete Transaction',
                            'Are you sure you want to delete this transaction?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  setPendingDeletes(prev => ({
                                    ...prev,
                                    [id]: true,
                                  }));
                                  try {
                                    await deleteSavingTransaction(id, depotId);
                                  } catch (err) {
                                    console.error(
                                      'Error deleting transaction:',
                                      err,
                                    );
                                    setPendingDeletes(prev => {
                                      const next = { ...prev };
                                      delete next[id];
                                      return next;
                                    });
                                  }
                                },
                              },
                            ],
                          );
                        }
                  }
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
          currency={depot?.currency}
          onCreate={handleCreate}
        />

        {/* Edit Transaction Bottom Sheet */}
        <EditSavingTransactionSheet
          open={editOpen}
          onClose={() => {
            setEditOpen(false);
            setSelectedTransaction(null);
          }}
          transaction={selectedTransaction}
          currency={depot?.currency}
          depotId={depotId}
          onSave={handleUpdate}
        />

        {/* Edit Depot Bottom Sheet */}
        <EditSavingDepotSheet
          open={editDepotOpen}
          onClose={() => {
            setEditDepotOpen(false);
          }}
          depot={depot || null}
          onUpdate={refetch}
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
  loadingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
});
