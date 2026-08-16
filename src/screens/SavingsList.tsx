import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Input from '../components/atoms/Input';
import RoundedButton from '../components/atoms/RoundedButton';
import { useSavings } from '../hooks/useSavings';
import { useNavigation } from '@react-navigation/native';
import { useSavingsUIStore } from '../store/savingsUI';
import FABSpeedDial from '../components/FABSpeedDial';
import FormBottomSheet from '../components/FormBottomSheet';
import { Info, Trash2 } from 'lucide-react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import InfoModal from '../components/atoms/InfoModal';
import IncludedSavingsTotal, {
  SavingDepotSummary,
} from '../components/organisms/savings/IncludedSavingsTotal';

export default function SavingsList() {
  const { depotsQuery, deleteSavingDepot, createSavingDepot } = useSavings();
  const { data, loading, refetch } = depotsQuery;
  const depots = React.useMemo(
    () =>
      (data as { getSavingDepots?: SavingDepotSummary[] } | undefined)
        ?.getSavingDepots ?? [],
    [data],
  );
  const navigation = useNavigation<any>();
  const [infoOpen, setInfoOpen] = React.useState(false);
  const [pendingCreates, setPendingCreates] = React.useState<any[]>([]);
  const [pendingDeletes, setPendingDeletes] = React.useState<
    Record<string, true>
  >({});

  useEffect(() => {
    if (!depots || depots.length === 0) void refetch();
  }, [depots, refetch]);

  const pendingCreateIds = React.useMemo(
    () => new Set(pendingCreates.map(d => d.id)),
    [pendingCreates],
  );
  const pendingDeleteIds = React.useMemo(
    () => new Set(Object.keys(pendingDeletes)),
    [pendingDeletes],
  );

  const displayList = React.useMemo(
    () => [...pendingCreates, ...depots],
    [depots, pendingCreates],
  );

  const handleCreateDepot = useCallback(
    async (payload: {
      name: string;
      short: string;
      currency?: string | null;
      savinggoal?: number | null;
    }) => {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(16)
        .slice(2)}`;
      const tempDepot = {
        id: tempId,
        name: payload.name,
        short: payload.short,
        currency: payload.currency ?? undefined,
        savinggoal: payload.savinggoal ?? null,
        sum: 0,
      };
      setPendingCreates(prev => [tempDepot, ...prev]);
      try {
        await createSavingDepot(
          payload.name,
          payload.short,
          payload.currency ?? null,
          payload.savinggoal ?? null,
        );
      } catch (err) {
        console.error('Error creating saving depot:', err);
        setPendingCreates(prev => prev.filter(d => d.id !== tempId));
      }
    },
    [createSavingDepot],
  );

  useEffect(() => {
    if (pendingCreates.length === 0 || depots.length === 0) return;
    setPendingCreates(prev =>
      prev.filter(pending => {
        const match = depots.some(depot => {
          return (
            depot.name === pending.name &&
            depot.short === pending.short &&
            (depot.currency || null) === (pending.currency || null) &&
            (depot.savinggoal ?? null) === (pending.savinggoal ?? null)
          );
        });
        return !match;
      }),
    );
  }, [depots, pendingCreates.length]);

  useEffect(() => {
    if (Object.keys(pendingDeletes).length === 0) return;
    const existing = new Set(depots.map(d => `${d.id}`));
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
  }, [depots, pendingDeletes]);

  const {
    isSpeedDialOpen,
    toggleSpeedDial,
    closeSpeedDial,
    openCreateDepotModal,
    isCreateDepotModalOpen,
    closeCreateDepotModal,
  } = useSavingsUIStore();

  // Auto-close FAB when navigating away
  useEffect(() => {
    const unsub = navigation.addListener('blur', () => closeSpeedDial());
    return unsub;
  }, [navigation, closeSpeedDial]);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.title}>Savings</Text>
            <TouchableOpacity
              onPress={() => setInfoOpen(true)}
              accessibilityLabel="About savings"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ marginLeft: 8 }}
            >
              <Info color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        <IncludedSavingsTotal depots={depots} />
        {loading && depots.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            data={displayList}
            keyExtractor={d => d.id}
            ItemSeparatorComponent={() => <View style={styles.sep} />}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={() => (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>No saving depots yet</Text>
                <Text style={styles.emptySub}>
                  Create your first depot to start tracking savings.
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
                  title="Create Depot"
                  onPress={openCreateDepotModal}
                  fullWidth
                  style={{ marginTop: 12 }}
                />
              </View>
            )}
            renderItem={({ item }) => {
              const isPending = pendingCreateIds.has(item.id);
              const isDeleting = pendingDeleteIds.has(item.id);
              const isBlocked = isPending || isDeleting;
              return (
                <TouchableOpacity
                  style={[
                    styles.depotItem,
                    isBlocked ? styles.loadingItem : null,
                  ]}
                  onPress={() => {
                    if (isBlocked) {
                      Alert.alert(
                        'Please wait',
                        'This depot is still syncing. Try again in a moment.',
                      );
                      return;
                    }
                    navigation.navigate('SavingTransactions', {
                      depotId: item.id,
                    });
                  }}
                >
                  <View>
                    <Text style={styles.depotName}>{item.name}</Text>
                    <Text
                      style={[
                        styles.depotSub,
                        { color: (item.sum ?? 0) >= 0 ? '#16a34a' : '#ef4444' },
                      ]}
                    >
                      {`Total: ${(item.sum ?? 0).toLocaleString()}${
                        item.currency ? ` ${item.currency}` : ''
                      }`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    {isBlocked ? (
                      <ActivityIndicator
                        size="small"
                        color="#60a5fa"
                        style={{ marginLeft: 12 }}
                      />
                    ) : (
                      <TouchableOpacity
                        accessibilityLabel="Delete depot"
                        onPress={() => {
                          Alert.alert(
                            'Delete Depot',
                            `Are you sure you want to delete "${item.name}"?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              {
                                text: 'Delete',
                                style: 'destructive',
                                onPress: async () => {
                                  setPendingDeletes(prev => ({
                                    ...prev,
                                    [item.id]: true,
                                  }));
                                  try {
                                    await deleteSavingDepot(item.id);
                                  } catch {
                                    setPendingDeletes(prev => {
                                      const next = { ...prev };
                                      delete next[item.id];
                                      return next;
                                    });
                                  }
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
                    )}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}

        {/* Floating Action Button bottom-left */}
        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={toggleSpeedDial}
          position="right"
          actions={[
            {
              label: 'New Depot',
              onPress: () => {
                closeSpeedDial();
                openCreateDepotModal();
              },
              color: '#2563eb',
            },
          ]}
        />

        {/* Create Depot Modal */}
        <CreateDepotModal
          visible={isCreateDepotModalOpen}
          onClose={closeCreateDepotModal}
          onCreate={handleCreateDepot}
        />
        <InfoModal
          visible={infoOpen}
          title="Saving depots"
          content="Saving buckets help you track money set aside for goals (e.g., Vacation, Emergency fund). Add transactions when you save or withdraw. Optionally set a currency and a goal to visualize progress."
          onClose={() => setInfoOpen(false)}
        />
      </View>
    </ScreenWrapper>
  );
}

function CreateDepotModal({
  visible,
  onClose,
  onCreate,
}: {
  visible: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    short: string;
    currency?: string | null;
    savinggoal?: number | null;
  }) => void | Promise<void>;
}) {
  const [name, setName] = React.useState('');
  const [short, setShort] = React.useState('');
  const [currency, setCurrency] = React.useState('€');
  const [savingGoal, setSavingGoal] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isValid = name.trim().length > 0 && short.trim().length > 0;

  // Reset when closed so the next open is empty
  React.useEffect(() => {
    if (!visible) {
      setName('');
      setShort('');
      setCurrency('€');
      setSavingGoal('');
      setIsSubmitting(false);
    }
  }, [visible]);

  return (
    <FormBottomSheet
      visible={visible}
      onClose={onClose}
      title="Create Saving Depot"
      submitLabel={isSubmitting ? 'Creating...' : 'Create'}
      submitDisabled={!isValid || isSubmitting}
      onSubmit={async () => {
        if (!isValid) return;
        onClose();
        setIsSubmitting(true);
        const parsedGoal =
          savingGoal.trim().length > 0 && !Number.isNaN(Number(savingGoal))
            ? parseInt(savingGoal, 10)
            : null;
        void (async () => {
          try {
            await onCreate({
              name: name.trim(),
              short: short.trim(),
              currency: currency.trim() || null,
              savinggoal: parsedGoal,
            });
          } finally {
            setIsSubmitting(false);
            setName('');
            setShort('');
            setCurrency('€');
            setSavingGoal('');
          }
        })();
      }}
    >
      <Text style={styles.modalLabel}>Name</Text>
      <Input value={name} onChangeText={setName} placeholder="e.g. Vacation" />
      <Text style={styles.modalLabel}>Short</Text>
      <Input
        value={short}
        onChangeText={setShort}
        placeholder="e.g. VAC"
        maxLength={6}
      />
      <Text style={styles.modalLabel}>Currency</Text>
      <Input
        value={currency}
        onChangeText={setCurrency}
        placeholder="e.g. EUR"
        maxLength={6}
      />
      <Text style={styles.modalLabel}>Saving Goal</Text>
      <Input
        value={savingGoal}
        onChangeText={setSavingGoal}
        placeholder="e.g. 5000"
        keyboardType="numeric"
      />
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0e0f14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: '#fff', marginBottom: 16 },
  depotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#1e212b',
    borderRadius: 12,
  },
  sep: { height: 12 },
  depotName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  depotSub: { color: '#94a3b8', marginTop: 4 },
  depotBalance: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  fabContainer: {
    position: 'absolute',
    left: 16,
    bottom: 24,
    alignItems: 'flex-start',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
  speedDialMenu: { marginBottom: 8 },
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  smallButtonText: { color: '#fff', fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCard: {
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    width: '86%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  modalLabel: { color: '#cbd5e1', fontSize: 12, marginBottom: 6 },
  modalInput: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 12,
  },
  listContent: { paddingBottom: 160 },
  loadingItem: { opacity: 0.7 },
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
