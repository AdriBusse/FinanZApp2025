import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, Animated } from 'react-native';
import { useFinanceStore } from '../store/finance';
import { useNavigation } from '@react-navigation/native';
import RoundedButton from '../components/atoms/RoundedButton';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { preferences } from '../services/preferences';
import { useAuthStore } from '../store/auth';
import { Plus, Lock, Unlock, Trash2, ExternalLink, GripVertical, Info } from 'lucide-react-native';
import DashboardGrid from '../components/dashboard/DashboardGrid';
import InfoModal from '../components/atoms/InfoModal';

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
  const { summary, depots, expenses, loadAll } = useFinanceStore();
  const navigation = useNavigation<any>();
  const userId = useAuthStore(s => s.user?.id);

  const [layout, setLayout] = useState<Widget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<WidgetType | null>(null);
  const [selecting, setSelecting] = useState<'depot' | 'expense' | null>(null);
  const [layoutReady, setLayoutReady] = useState(false);
  const saveTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

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

  // Persist layout (debounced)
  useEffect(() => {
    if (!userId || !layoutReady) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void preferences.setDashboardLayout(layout);
    }, 400);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
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

  // Edit-mode tile with clear drag affordance and hold progress
  const HOLD_MS = 220;
  const EditDraggableTile: React.FC<{ item: Widget; isActive: boolean; drag: () => void; onPress: () => void }> = ({ item, isActive, drag, onPress }) => {
    const widthAnim = React.useRef(new Animated.Value(0)).current;
    const startHold = () => {
      widthAnim.setValue(0);
      Animated.timing(widthAnim, { toValue: 1, duration: HOLD_MS, useNativeDriver: false }).start();
    };
    const resetHold = () => {
      widthAnim.stopAnimation();
      widthAnim.setValue(0);
    };
    const progressStyle = {
      width: widthAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
    } as const;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={startHold}
        onPressOut={resetHold}
        onLongPress={() => { resetHold(); drag(); }}
        delayLongPress={HOLD_MS}
        disabled={!editMode}
        onPress={onPress}
        style={[styles.widgetTile, isActive ? styles.activeLift : null]}
      >
        {/* Hold-to-drag progress bar */}
        <View style={styles.holdBarTrack}>
          <Animated.View style={[styles.holdBarProgress, progressStyle]} />
        </View>
        {/* Drag handle indicator */}
        <View style={styles.dragHandle}>
          <GripVertical color="#94a3b8" size={14} />
        </View>
        {renderWidgetContent(item)}
      </TouchableOpacity>
    );
  };

  // All dynamic content is rendered via widgets above.

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={() => setInfoOpen(true)} accessibilityLabel="About dashboard" activeOpacity={0.7}>
          <Info color="#94a3b8" size={20} />
        </TouchableOpacity>
      </View>

      {/* Customizable dashboard grid */}
      <View style={styles.gridHeader}>
        <TouchableOpacity onPress={() => setEditMode(e => !e)} style={styles.lockBtn} accessibilityRole="button" accessibilityLabel="Toggle dashboard edit mode">
          {editMode ? <Unlock color="#cbd5e1" size={18} /> : <Lock color="#cbd5e1" size={18} />}
        </TouchableOpacity>
      </View>

      {editMode ? (
        <DashboardGrid
          data={layout}
          editMode
          horizontalPadding={16}
          keyExtractor={(w) => w.id}
          onDragEnd={(data) => { setLayout(data as Widget[]); }}
          renderTile={({ item, isActive, drag }) => (
            <EditDraggableTile
              item={item as Widget}
              isActive={isActive}
              drag={drag}
              onPress={() => onWidgetPress(item as Widget)}
            />
          )}
        />
      ) : (
        <DashboardGrid
          data={[...layout, { id: '__plus__' } as any]}
          editMode={false}
          horizontalPadding={16}
          keyExtractor={(w) => `${(w as any).id}`}
          renderTile={({ item }) => {
            if ((item as any).id === '__plus__') {
              return (
                <TouchableOpacity style={[styles.widgetTile, styles.plusTile]} onPress={() => { setAddOpen(true); setAddType(null); setSelecting(null); }}>
                  <Plus color="#60a5fa" size={28} />
                  <Text style={{ color: '#94a3b8', marginTop: 6 }}>Add</Text>
                </TouchableOpacity>
              );
            }
            return (
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
      <InfoModal
        visible={infoOpen}
        title="Dashboard"
        content="Customize your dashboard with tiles: totals, quick links and more. Tap the lock icon to enable edit mode, then long-press a tile to drag and reorder. Use the + tile to add new widgets."
        onClose={() => setInfoOpen(false)}
      />
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
  activeLift: {
    transform: [{ scale: 1.03 }],
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  holdBarTrack: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#0b1220',
    borderRadius: 2,
    overflow: 'hidden',
  },
  holdBarProgress: {
    height: 3,
    backgroundColor: '#60a5fa',
  },
  dragHandle: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(148,163,184,0.08)',
  },
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
