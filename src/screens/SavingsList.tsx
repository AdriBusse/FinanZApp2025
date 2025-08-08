import React, { useEffect } from 'react';
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
import { useFinanceStore } from '../store/finance';
import { useNavigation } from '@react-navigation/native';
import { useSavingsUIStore } from '../store/savingsUI';
import FABSpeedDial from '../components/FABSpeedDial';
import FormBottomSheet from '../components/FormBottomSheet';
import { Trash2 } from 'lucide-react-native';

export default function SavingsList() {
  const { depots, isLoading, loadAll, deleteSavingDepot } = useFinanceStore();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (!depots || depots.length === 0) void loadAll();
  }, [depots, loadAll]);

  const {
    isSpeedDialOpen,
    toggleSpeedDial,
    openCreateDepotModal,
    isCreateDepotModalOpen,
    closeCreateDepotModal,
  } = useSavingsUIStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Savings</Text>
      {isLoading && depots.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={depots}
          keyExtractor={d => d.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.depotItem}
              onPress={() =>
                navigation.navigate('SavingTransactions', { depotId: item.id })
              }
            >
              <View>
                <Text style={styles.depotName}>{item.name}</Text>
                <Text
                  style={[
                    styles.depotSub,
                    { color: (item.sum ?? 0) >= 0 ? '#16a34a' : '#ef4444' },
                  ]}
                >
                  Total: {(item.sum ?? 0).toLocaleString()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.depotBalance}>
                  {(item.balance ?? 0).toLocaleString()}
                </Text>
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
                            try {
                              await deleteSavingDepot(item.id);
                            } catch {
                              /* no-op */
                            }
                          },
                        },
                      ],
                    );
                  }}
                  style={{ marginLeft: 12, padding: 6 }}
                >
                  <Trash2 color="#ef4444" size={20} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Floating Action Button bottom-left */}
      <FABSpeedDial
        isOpen={isSpeedDialOpen}
        onToggle={toggleSpeedDial}
        position="left"
        actions={[
          {
            label: 'New Depot',
            onPress: openCreateDepotModal,
            color: '#2563eb',
          },
        ]}
      />

      {/* Create Depot Modal */}
      <CreateDepotModal
        visible={isCreateDepotModalOpen}
        onClose={closeCreateDepotModal}
      />
    </View>
  );
}

function CreateDepotModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { createSavingDepot } = useFinanceStore();
  const [name, setName] = React.useState('');
  const [short, setShort] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isValid = name.trim().length > 0 && short.trim().length > 0;

  return (
    <FormBottomSheet
      visible={visible}
      onClose={onClose}
      title="Create Saving Depot"
      submitLabel={isSubmitting ? 'Creating...' : 'Create'}
      submitDisabled={!isValid || isSubmitting}
      onSubmit={async () => {
        if (!isValid) return;
        try {
          setIsSubmitting(true);
          await createSavingDepot(name.trim(), short.trim());
          onClose();
        } finally {
          setIsSubmitting(false);
          setName('');
          setShort('');
        }
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
});
