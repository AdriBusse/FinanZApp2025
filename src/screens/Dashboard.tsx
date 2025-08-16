import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, useWindowDimensions, Alert } from 'react-native';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useFinanceStore } from '../store/finance';
import { useNavigation } from '@react-navigation/native';
import RoundedButton from '../components/atoms/RoundedButton';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { preferences } from '../services/preferences';
import { useAuthStore } from '../store/auth';
import { Plus, Lock, Unlock, Trash2, ExternalLink } from 'lucide-react-native';

type WidgetType =
  | 'saving_sum'
  | 'expense_total'
  | 'link_expense'
  | 'link_saving'
  | 'quick_expense'
  | 'net_worth'
  | 'spend_today'
  | 'latest_expense';

type Widget = {
  id: string;
  type: WidgetType;
  title?: string;
  // optional linkage
  depotId?: string;
  expenseId?: string;
};

export default function Dashboard() {
  const { width: screenW } = useWindowDimensions();
  const { summary, depots, expenses, loadAll } = useFinanceStore();
  const navigation = useNavigation<any>();
  const userId = useAuthStore(s => s.user?.id);

  const [layout, setLayout] = useState<Widget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<WidgetType | null>(null);
  const [selecting, setSelecting] = useState<'depot' | 'expense' | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

  const editData = React.useMemo(() => {
    const base = [...layout, ({ id: '__plus__' } as any)];
    return isDragging ? [...base, ({ id: '__trash__' } as any)] : base;
  }, [layout, isDragging]);

  useEffect(() => {
    loadAll().catch(() => {});
  }, [loadAll]);

  // Load dashboard layout (per user)
  useEffect(() => {
    let mounted = true;
    // Clear layout immediately to avoid showing previous user's widgets
    setLayout([]);
    setLayoutReady(false);
    if (!userId) {
      // Don't read global keys when no user; wait for user to be available
      return () => {
        mounted = false;
      };
    }
    preferences
      .getDashboardLayout()
      .then(v => {
        if (!mounted) return;
        setLayout(Array.isArray(v) ? (v as Widget[]) : []);
        setLayoutReady(true);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [userId]);

  // Persist layout
  useEffect(() => {
    // Avoid writing during user switch until the user's layout has been loaded
    if (!userId || !layoutReady) return;
    void preferences.setDashboardLayout(layout);
  }, [layout, userId, layoutReady]);

  function addWidget(w: Widget) {
    setLayout(prev => [...prev, w]);
  }

  function renderWidgetContent(w: Widget) {
    if (w.type === 'saving_sum') {
      const d = depots.find(x => x.id === w.depotId);
      return (
        <>
          <Text style={styles.widgetTitle}>{w.title ?? d?.name ?? 'Savings'}</Text>
          <Text style={styles.widgetValue}>
            {(d?.sum ?? 0).toLocaleString()}{d?.currency ? ` ${d.currency}` : ''}
          </Text>
        </>
      );
    }
    if (w.type === 'expense_total') {
      const e = expenses.find(x => x.id === w.expenseId);
      return (
        <>
          <Text style={styles.widgetTitle}>{w.title ?? e?.title ?? 'Expense Total'}</Text>
          <Text style={styles.widgetValue}>
            {(e?.sum ?? 0).toLocaleString()}{e?.currency ? ` ${e.currency}` : ''}
          </Text>
        </>
      );
    }
    if (w.type === 'link_expense') {
      const e = expenses.find(x => x.id === w.expenseId);
      return (
        <>
          <Text style={styles.widgetTitle}>Open Expense</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ExternalLink color="#94a3b8" size={16} />
            <Text style={[styles.widgetValue, { marginLeft: 6, fontSize: 16 }]}>{e?.title ?? 'Expense'}</Text>
          </View>
        </>
      );
    }
    if (w.type === 'link_saving') {
      const d = depots.find(x => x.id === w.depotId);
      return (
        <>
          <Text style={styles.widgetTitle}>Open Saving Depot</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ExternalLink color="#94a3b8" size={16} />
            <Text style={[styles.widgetValue, { marginLeft: 6, fontSize: 16 }]}>{d?.name ?? 'Saving'}</Text>
          </View>
        </>
      );
    }
    if (w.type === 'quick_expense') {
      const e = expenses.find(x => x.id === w.expenseId);
      return (
        <>
          <Text style={styles.widgetTitle}>Quick Action</Text>
          <Text style={[styles.widgetValue, { fontSize: 16 }]}>
            {e ? `Create Tx: ${e.title}` : 'Create Expense'}
          </Text>
        </>
      );
    }
    if (w.type === 'net_worth') {
      return (
        <>
          <Text style={styles.widgetTitle}>Net Worth (Savings)</Text>
          <Text style={styles.widgetValue}>{(summary?.savingValue ?? 0).toLocaleString()}</Text>
        </>
      );
    }
    if (w.type === 'spend_today') {
      const todaySpentCount = summary?.todaySpent?.length ?? 0;
      const todaySpentSum = (summary?.todaySpent ?? []).reduce((acc, t) => acc + (t?.amount ?? 0), 0);
      return (
        <>
          <Text style={styles.widgetTitle}>Spend Today</Text>
          <Text style={styles.widgetValue}>{todaySpentSum.toLocaleString()}</Text>
          <Text style={styles.widgetSub}>{todaySpentCount} tx</Text>
        </>
      );
    }
    if (w.type === 'latest_expense') {
      return (
        <>
          <Text style={styles.widgetTitle}>Latest Expense</Text>
          <Text style={styles.widgetValue}>{summary?.latestExpense?.sum?.toLocaleString?.() ?? (summary?.latestExpense?.sum ?? 0)}</Text>
          <Text style={styles.widgetSub}>{summary?.latestExpense?.title ?? '—'}</Text>
        </>
      );
    }
    return null;
  }

  function onWidgetPress(w: Widget) {
    if (editMode) return;
    if (w.type === 'link_expense' && w.expenseId) {
      navigation.navigate('ExpensesTab', { screen: 'ExpenseTransactions', params: { expenseId: w.expenseId } });
    } else if (w.type === 'link_saving' && w.depotId) {
      navigation.navigate('SavingsTab', { screen: 'SavingTransactions', params: { depotId: w.depotId } });
    } else if (w.type === 'quick_expense') {
      if (w.expenseId) {
        navigation.navigate('ExpensesTab', { screen: 'ExpenseTransactions', params: { expenseId: w.expenseId, openCreate: true } });
      } else {
        // Fallback: open generic create if no expense selected (legacy widgets)
        navigation.navigate('ExpensesTab', { screen: 'ExpensesList', params: { openCreate: true } });
      }
    }
  }

  function confirmDeleteWidget(id: string) {
    Alert.alert(
      'Remove tile',
      'Do you really want to remove this tile from your dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setLayout(prev => prev.filter(w => w.id !== id)),
        },
      ],
    );
  }

  // All dynamic content is rendered via widgets above.

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {/* Customizable dashboard grid */}
      <View style={styles.gridHeader}>
        <TouchableOpacity disabled onPress={() => setEditMode(e => !e)} style={[styles.lockBtn, { opacity: 0.5 }]} accessibilityRole="button" accessibilityLabel="Toggle dashboard edit mode (disabled)">
          {editMode ? <Unlock color="#cbd5e1" size={18} /> : <Lock color="#cbd5e1" size={18} />}
        </TouchableOpacity>
      </View>
      {editMode && (
        <>
          <Text style={{ color: '#94a3b8', marginBottom: 8 }}>Long-press a tile to drag. Drop on the red box to delete.</Text>
          <Text style={{ color: '#f59e0b', marginBottom: 8 }}>Debug: layout={layout.length} editData={editData.length}</Text>
        </>
      )}

      {editMode ? (
        <>
        <DraggableFlatList
          key="edit"
          data={editData}
          keyExtractor={(w, i) => `${w.id}-${i}`}
          numColumns={2}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12, flexGrow: 1 }}
          removeClippedSubviews={false}
          extraData={editData.length}
          onDragBegin={(index) => { setIsDragging(true); setDraggingIndex(index); }}
          onDragEnd={({ data, from, to }) => {
            const trashIndex = data.findIndex(x => (x as any).id === '__trash__');
            setIsDragging(false);
            if (trashIndex >= 0 && to === trashIndex && draggingIndex != null) {
              // Dropped on trash: remove original item
              setLayout(prev => prev.filter((_, i) => i !== draggingIndex));
              setDraggingIndex(null);
              return;
            }
            // Reorder: ignore sentinels (trash & plus)
            const clean = data.filter(x => (x as any).id !== '__trash__' && (x as any).id !== '__plus__') as Widget[];
            setLayout(clean);
            setDraggingIndex(null);
          }}
          activationDistance={8}
          renderItem={({ item, getIndex, drag, isActive }) => {
            // Debug log to confirm render on device
            try { console.log('Dashboard edit render item', (item as any).id); } catch {}
            const idx = getIndex?.() ?? 0;
            const tileW = Math.floor((screenW - 16 * 2 - 12) / 2);
            try { console.log('Dashboard edit tileW', tileW); } catch {}
            if ((item as any).id === '__plus__') {
              return (
                <View style={{ width: tileW, marginRight: idx % 2 === 0 ? 12 : 0, minHeight: 120, backgroundColor: 'rgba(255,255,0,0.06)' }}>
                  <TouchableOpacity style={[styles.widgetTile, styles.plusTile, styles.debugBorder]} onPress={() => { setAddOpen(true); setAddType(null); setSelecting(null); }}>
                    <Plus color="#60a5fa" size={28} />
                    <Text style={{ color: '#94a3b8', marginTop: 6 }}>Add</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            if ((item as any).id === '__trash__') {
              return (
                <View style={{ width: tileW, marginRight: idx % 2 === 0 ? 12 : 0, minHeight: 120, backgroundColor: 'rgba(255,255,0,0.06)' }}>
                  <View style={[styles.widgetTile, styles.trashTile, styles.debugBorder]}> 
                    <Trash2 color="#ef4444" size={24} />
                    <Text style={{ color: '#ef4444', marginTop: 6 }}>Drop to delete</Text>
                  </View>
                </View>
              );
            }
            return (
              <View style={{ width: tileW, marginRight: idx % 2 === 0 ? 12 : 0, minHeight: 120, backgroundColor: 'rgba(255,255,0,0.06)' }}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  onLongPress={drag}
                  delayLongPress={80}
                  disabled={!editMode}
                  onPress={() => onWidgetPress(item as Widget)}
                  style={[
                    styles.widgetTile,
                    styles.debugBorder,
                    { flex: 0 },
                    isActive ? { borderWidth: 1, borderColor: '#60a5fa' } : null,
                  ]}
                >
                  {renderWidgetContent(item as Widget)}
                </TouchableOpacity>
              </View>
            );
          }}
        />
        {/* DEBUG: Mirror non-draggable FlatList to verify visibility */}
        <Text style={{ color: '#ef4444', marginTop: 12 }}>DEBUG: Mirror list (should show same tiles)</Text>
        <FlatList
          data={editData}
          keyExtractor={(w, i) => `${w.id}-mirror-${i}`}
          numColumns={1}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => (
            <View style={{ width: '100%', height: 80, backgroundColor: '#22c55e', borderRadius: 8, marginBottom: 8, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: '#0b1a0f', fontWeight: '700' }}>{(item as any).id}</Text>
            </View>
          )}
        />
        </>
      ) : (
        <FlatList
          key="view"
          data={[...layout, { id: '__plus__', type: 'quick_expense' } as any]}
          keyExtractor={(w, i) => `${w.id}-${i}`}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between' }}
          contentContainerStyle={{ paddingBottom: 12 }}
          renderItem={({ item }) => {
            if ((item as any).id === '__plus__') {
              return (
                <View style={styles.gridItem}>
                  <TouchableOpacity style={[styles.widgetTile, styles.plusTile]} onPress={() => { setAddOpen(true); setAddType(null); setSelecting(null); }}>
                    <Plus color="#60a5fa" size={28} />
                    <Text style={{ color: '#94a3b8', marginTop: 6 }}>Add</Text>
                  </TouchableOpacity>
                </View>
              );
            }
            return (
              <View style={styles.gridItem}>
                <TouchableOpacity activeOpacity={0.8} onPress={() => onWidgetPress(item as Widget)} style={styles.widgetTile}>
                  <TouchableOpacity
                    onPress={() => confirmDeleteWidget((item as Widget).id)}
                    style={styles.deleteBtn}
                    accessibilityRole="button"
                    accessibilityLabel="Delete tile"
                  >
                    <Trash2 color="#cbd5e1" size={16} />
                  </TouchableOpacity>
                  {renderWidgetContent(item as Widget)}
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Add widget modal */}
      <Modal visible={addOpen} transparent animationType="fade" onRequestClose={() => setAddOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.addModal}>
            <Text style={styles.modalTitle}>Add Element</Text>
            {!addType && (
              <ScrollView>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('saving_sum'); setSelecting('depot'); }}><Text style={styles.addItemText}>Savings Sum (choose depot)</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('expense_total'); setSelecting('expense'); }}><Text style={styles.addItemText}>Expense Total (choose expense)</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('link_expense'); setSelecting('expense'); }}><Text style={styles.addItemText}>Link to Expense</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('link_saving'); setSelecting('depot'); }}><Text style={styles.addItemText}>Link to Saving</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('quick_expense'); setSelecting('expense'); }}><Text style={styles.addItemText}>Quick: Create Expense Tx (choose expense)</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('net_worth'); setSelecting(null); addWidget({ id: `${Date.now()}`, type: 'net_worth' }); setAddOpen(false); }}><Text style={styles.addItemText}>Net Worth (Savings)</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('spend_today'); setSelecting(null); addWidget({ id: `${Date.now()}`, type: 'spend_today' }); setAddOpen(false); }}><Text style={styles.addItemText}>Spend Today</Text></TouchableOpacity>
                <TouchableOpacity style={styles.addItem} onPress={() => { setAddType('latest_expense'); setSelecting(null); addWidget({ id: `${Date.now()}`, type: 'latest_expense' }); setAddOpen(false); }}><Text style={styles.addItemText}>Latest Expense</Text></TouchableOpacity>
              </ScrollView>
            )}
            {!!addType && selecting === 'depot' && (
              <ScrollView>
                {depots.map(d => (
                  <TouchableOpacity key={d.id} style={styles.addItem} onPress={() => {
                    if (addType === 'saving_sum' || addType === 'link_saving') {
                      addWidget({ id: `${Date.now()}`, type: addType, depotId: d.id, title: d.name });
                      setAddOpen(false);
                    }
                  }}>
                    <Text style={styles.addItemText}>{d.name} ({d.short})</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            {!!addType && selecting === 'expense' && (
              <ScrollView>
                {expenses.map(e => (
                  <TouchableOpacity key={e.id} style={styles.addItem} onPress={() => {
                    if (addType === 'expense_total' || addType === 'link_expense' || addType === 'quick_expense') {
                      addWidget({ id: `${Date.now()}`, type: addType, expenseId: e.id, title: e.title });
                      setAddOpen(false);
                    }
                  }}>
                    <Text style={styles.addItemText}>{e.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
            <View style={[styles.row, { marginTop: 12 }]}> 
              <View style={{ flex: 1 }} />
              <RoundedButton title="Close" variant="outline" size="sm" onPress={() => setAddOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
    </ScreenWrapper>
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
  gridHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 },
  lockBtn: { padding: 8, borderRadius: 8, backgroundColor: '#1e212b' },
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
  gridItem: {
    width: '48%',
  },
  gridItemEdit: {
    width: '50%',
    paddingHorizontal: 4,
  },
  widgetTile: {
    flex: 1,
    backgroundColor: '#1e212b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    minHeight: 96,
  },
  // Used in edit mode when we render items directly (without wrapper)
  widgetTileEdit: {
    width: '48%',
    flex: 0,
  },
  plusTile: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  widgetTitle: { color: '#94a3b8', fontSize: 12, fontWeight: '700' },
  widgetValue: { color: '#f8fafc', fontSize: 18, fontWeight: '800', marginTop: 4 },
  widgetSub: { color: '#cbd5e1', fontSize: 12, marginTop: 4 },
  widgetActions: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  iconBtn: { padding: 6 },
  deleteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 6,
    borderRadius: 9999,
    backgroundColor: '#111827',
    zIndex: 2,
  },
  trashTile: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: '#191c24',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderStyle: 'dashed',
  },
  // DEBUG: temporary style to visualize tile bounds in edit mode on device
  debugBorder: {
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  addModal: { backgroundColor: '#0e0f14', borderRadius: 12, padding: 16, maxHeight: '80%' },
  addItem: { paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#1f2937' },
  addItemText: { color: '#e5e7eb', fontSize: 16 },
});
