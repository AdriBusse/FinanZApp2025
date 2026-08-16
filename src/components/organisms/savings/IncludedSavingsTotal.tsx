import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Check, Settings2 } from 'lucide-react-native';
import FormBottomSheet from '../../FormBottomSheet';
import { storage } from '../../../services/storage';

const INCLUDED_SAVING_DEPOTS_STORAGE_KEY = 'included-saving-depot-ids';

export type SavingDepotSummary = {
  id: string;
  name: string;
  short: string;
  currency?: string | null;
  sum?: number | null;
  savinggoal?: number | null;
};

export default function IncludedSavingsTotal({
  depots,
}: {
  depots: SavingDepotSummary[];
}) {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [includedDepotIds, setIncludedDepotIds] = useState<string[] | null>(
    null,
  );
  const [hasLoadedIncludedDepots, setHasLoadedIncludedDepots] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void storage
      .getJSON<string[]>(INCLUDED_SAVING_DEPOTS_STORAGE_KEY)
      .then(savedIds => {
        if (!isMounted) return;
        if (Array.isArray(savedIds)) setIncludedDepotIds(savedIds);
        setHasLoadedIncludedDepots(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (
      !hasLoadedIncludedDepots ||
      includedDepotIds !== null ||
      depots.length === 0
    ) {
      return;
    }
    const initialIds = depots.map(depot => depot.id);
    setIncludedDepotIds(initialIds);
    void storage.setJSON(INCLUDED_SAVING_DEPOTS_STORAGE_KEY, initialIds);
  }, [depots, hasLoadedIncludedDepots, includedDepotIds]);

  const includedDepotIdSet = useMemo(
    () => new Set(includedDepotIds ?? []),
    [includedDepotIds],
  );

  const totalSavingsByCurrency = useMemo(() => {
    const totals = new Map<string, number>();
    for (const depot of depots) {
      if (!includedDepotIdSet.has(depot.id)) continue;
      const currency = depot.currency?.trim() || 'No currency';
      totals.set(currency, (totals.get(currency) ?? 0) + (depot.sum ?? 0));
    }
    return Array.from(totals.entries()).map(([currency, total]) => ({
      currency,
      total,
    }));
  }, [depots, includedDepotIdSet]);

  const updateIncludedDepotIds = useCallback((ids: string[]) => {
    setIncludedDepotIds(ids);
    void storage.setJSON(INCLUDED_SAVING_DEPOTS_STORAGE_KEY, ids);
  }, []);

  return (
    <>
      <View style={styles.totalCard}>
        <View>
          <Text style={styles.totalLabel}>Included savings</Text>
          {includedDepotIds === null ? (
            <ActivityIndicator size="small" color="#60a5fa" />
          ) : totalSavingsByCurrency.length > 0 ? (
            totalSavingsByCurrency.map(({ currency, total }) => (
              <Text key={currency} style={styles.totalAmount}>
                {total.toLocaleString()} {currency}
              </Text>
            ))
          ) : (
            <Text style={styles.totalAmount}>0</Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => setIsSelectorOpen(true)}
          accessibilityLabel="Choose saving depots included in total"
          accessibilityHint="Opens the saving depot selection"
          style={styles.totalSettingsButton}
        >
          <Settings2 color="#cbd5e1" size={22} />
        </TouchableOpacity>
      </View>
      <IncludedSavingDepotsModal
        visible={isSelectorOpen}
        depots={depots}
        includedDepotIds={includedDepotIds ?? []}
        onClose={() => setIsSelectorOpen(false)}
        onChange={updateIncludedDepotIds}
      />
    </>
  );
}

function IncludedSavingDepotsModal({
  visible,
  depots,
  includedDepotIds,
  onClose,
  onChange,
}: {
  visible: boolean;
  depots: SavingDepotSummary[];
  includedDepotIds: string[];
  onClose: () => void;
  onChange: (ids: string[]) => void;
}) {
  const includedIds = useMemo(
    () => new Set(includedDepotIds),
    [includedDepotIds],
  );

  const toggleDepot = useCallback(
    (depotId: string) => {
      const nextIds = new Set(includedIds);
      if (nextIds.has(depotId)) {
        nextIds.delete(depotId);
      } else {
        nextIds.add(depotId);
      }
      onChange(Array.from(nextIds));
    },
    [includedIds, onChange],
  );

  return (
    <FormBottomSheet
      visible={visible}
      onClose={onClose}
      title="Included savings"
      submitLabel="Done"
      onSubmit={onClose}
      heightPercent={0.7}
    >
      <Text style={styles.selectionDescription}>
        Choose the saving depots included in the total above.
      </Text>
      <ScrollView style={styles.depotOptionList}>
        {depots.map(depot => {
          const isIncluded = includedIds.has(depot.id);
          return (
            <TouchableOpacity
              key={depot.id}
              style={[
                styles.depotOption,
                isIncluded && styles.depotOptionSelected,
              ]}
              onPress={() => toggleDepot(depot.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isIncluded }}
              accessibilityLabel={`Include ${depot.name} in savings total`}
            >
              <View style={styles.depotOptionText}>
                <Text style={styles.depotOptionName}>{depot.name}</Text>
                <Text style={styles.depotOptionAmount}>
                  {(depot.sum ?? 0).toLocaleString()}{' '}
                  {depot.currency?.trim() || 'No currency'}
                </Text>
              </View>
              <View
                style={[styles.checkbox, isIncluded && styles.checkboxSelected]}
              >
                {isIncluded && <Check color="#0e0f14" size={16} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#1e212b',
  },
  totalLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalAmount: { color: '#fff', fontSize: 24, fontWeight: '800' },
  totalSettingsButton: { padding: 10, margin: -10 },
  selectionDescription: {
    color: '#94a3b8',
    marginBottom: 12,
    lineHeight: 20,
  },
  depotOptionList: { flex: 1 },
  depotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#1e212b',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  depotOptionSelected: { borderColor: '#38bdf8' },
  depotOptionText: { flex: 1 },
  depotOptionName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  depotOptionAmount: { color: '#94a3b8', marginTop: 4 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#38bdf8', borderColor: '#38bdf8' },
});
