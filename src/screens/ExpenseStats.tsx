import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useExpenses } from '../hooks/useExpenses';
import { PieChart, BarChart } from 'react-native-gifted-charts';

function toDateKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ExpenseStats() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const expenseId: string = route.params?.expenseId ?? '';
  const { expenseQuery, categoriesQuery } = useExpenses({
    expenseId,
    includeCategories: true,
  });
  const categories = categoriesQuery.data?.getExpenseCategories || [];
  const expense = expenseQuery.data?.getExpense;

  useEffect(() => {
    void categoriesQuery.refetch();
  }, [categoriesQuery.refetch]);

  const transactions = expense?.transactions ?? ([] as any[]);
  const total = transactions.reduce(
    (s: number, t: any) => s + Number(t.amount || 0),
    0,
  );

  // Ring (pie) by category: sums amounts per category, including 'Uncategorized'
  const [selectedSlice, setSelectedSlice] = useState<number | null>(null);
  const pieSlices = useMemo(() => {
    if (!transactions.length)
      return [] as {
        value: number;
        color: string;
        name?: string;
        percent?: number;
      }[];

    const byCat = new Map<string, number>();
    for (const t of transactions) {
      const key =
        (t.categoryId as string | undefined) ||
        (t.category?.id as string | undefined) ||
        'uncategorized';
      byCat.set(key, (byCat.get(key) || 0) + Number(t.amount || 0));
    }
    const raw = Array.from(byCat.entries()).map(([catId, sum]) => {
      const cat = categories.find(c => c.id === catId);
      return {
        id: catId,
        name:
          cat?.name ||
          (catId === 'uncategorized' ? 'Uncategorized' : 'Category'),
        sum,
        color: cat?.color || undefined,
      };
    });
    const palette = [
      '#2e7d32',
      '#10b981',
      '#06b6d4',
      '#0ea5e9',
      '#6366f1',
      '#a78bfa',
      '#f59e0b',
      '#ef4444',
      '#f472b6',
      '#22c55e',
    ];
    let slices = raw
      .map((m, i) => ({
        value: Number(m.sum) > 0 ? Number(m.sum) : 0,
        color: m.color || palette[i % palette.length],
        name: m.name,
        onPress: () => setSelectedSlice(i),
      }))
      .filter(s => s.value > 0);

    // Fallback: if all values are zero but total exists, show one slice so pie renders
    const computedTotal = raw.reduce((s, r) => s + (Number(r.sum) || 0), 0);
    if ((!slices || slices.length === 0) && computedTotal > 0) {
      slices = [
        {
          value: computedTotal,
          color: '#6b7280',
          name: 'Uncategorized',
          onPress: () => setSelectedSlice(0),
        },
      ];
    }
    return slices;
  }, [transactions, categories, setSelectedSlice]);

  // Bar chart: sum by day (for BarChart)
  const barSeries = useMemo(() => {
    if (!transactions.length)
      return [] as { value: number; label: string; frontColor?: string }[];
    const map = new Map<string, number>();
    for (const t of transactions) {
      const d = t.createdAt ? new Date(t.createdAt) : new Date();
      const key = toDateKey(d);
      map.set(key, (map.get(key) || 0) + Number(t.amount || 0));
    }
    const arr = Array.from(map.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(
        ([k, v]) =>
          ({
            label: k.slice(5).replace('-', '/'),
            value: v,
            frontColor: '#2e7d32',
            dateKey: k,
          } as any),
      );
    return arr;
  }, [transactions]);

  // Bar chart: sum by category (new grouped by category)
  const barByCategory = useMemo(() => {
    if (!transactions.length) return [] as any[];
    const map = new Map<string, number>();
    for (const t of transactions) {
      const key =
        (t.categoryId as string | undefined) ||
        (t.category?.id as string | undefined) ||
        'uncategorized';
      map.set(key, (map.get(key) || 0) + (t.amount || 0));
    }
    const palette = [
      '#2e7d32',
      '#10b981',
      '#06b6d4',
      '#0ea5e9',
      '#6366f1',
      '#a78bfa',
      '#f59e0b',
      '#ef4444',
      '#f472b6',
      '#22c55e',
    ];
    const entries = Array.from(map.entries());
    const arr = entries.map(([catId, sum], i) => {
      const cat = categories.find(c => c.id === catId);
      return {
        label: '', // hide labels visually too
        name:
          cat?.name ||
          (catId === 'uncategorized' ? 'Uncategorized' : 'Category'),
        value: sum,
        frontColor: cat?.color || palette[i % palette.length],
      };
    });
    return arr;
  }, [transactions, categories]);

  return (
    <ScreenWrapper scrollable={false}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 48 }}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {expense?.title ?? 'Expense'} · Stats
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.sectionTitle}>By Category</Text>
        <View style={styles.card}>
          {pieSlices.length ? (
            <View style={{ alignItems: 'center' }}>
              <PieChart
                data={pieSlices}
                donut
                radius={110}
                innerRadius={60}
                showText={false}
                strokeColor={'#0e0f14'}
                strokeWidth={2}
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: '#cbd5e1', fontWeight: '700' }}>
                      {selectedSlice != null
                        ? pieSlices[selectedSlice]?.name ?? 'Total'
                        : 'Total'}
                    </Text>
                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>
                      {selectedSlice != null
                        ? (
                            pieSlices[selectedSlice]?.value ?? 0
                          ).toLocaleString()
                        : total.toLocaleString()}
                    </Text>
                  </View>
                )}
              />
              {/* Legend */}
              <View style={styles.legendWrap}>
                {pieSlices.map((s, idx) => (
                  <View
                    key={`${s.name ?? 'cat'}-${idx}`}
                    style={styles.legendItem}
                  >
                    <View
                      style={[styles.legendDot, { backgroundColor: s.color }]}
                    />
                    <Text style={styles.legendText} numberOfLines={1}>
                      {(s.name ?? 'Category') +
                        ' · ' +
                        (s.value != null
                          ? Number(s.value).toLocaleString()
                          : '')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No data</Text>
          )}
          <Text style={styles.totalText}>Total: {total.toLocaleString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>By Category · Bars</Text>
        <View style={styles.card}>
          {barByCategory.length ? (
            <View style={{ paddingVertical: 8, overflow: 'visible' }}>
              <BarChart
                data={barByCategory as any}
                barWidth={18}
                spacing={18}
                initialSpacing={14}
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor={'#334155'}
                yAxisColor={'#334155'}
                hideRules={true}
                xAxisLabelTextStyle={{ color: 'transparent', fontSize: 1 }}
                yAxisTextStyle={{ color: 'transparent', fontSize: 1 }}
                renderTooltip={(item: any, index: number) => {
                  const len = (barByCategory as any[]).length;
                  const shiftStyle =
                    index >= len - 1
                      ? { marginLeft: -30 }
                      : index <= 0
                      ? { marginLeft: 30 }
                      : null;
                  return (
                    <View style={[styles.tooltip, shiftStyle]}>
                      <Text style={styles.tooltipText}>
                        {item?.name ?? 'Category'}
                      </Text>
                      <Text style={styles.tooltipValue}>
                        {item?.value?.toLocaleString?.() ?? item?.value}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>No data</Text>
          )}
        </View>

        <Text style={styles.sectionTitle}>Daily Spends</Text>
        <View style={styles.card}>
          {barSeries.length ? (
            <View style={{ paddingVertical: 8, overflow: 'visible' }}>
              <BarChart
                data={barSeries}
                barWidth={12}
                spacing={12}
                initialSpacing={14}
                frontColor={'#2e7d32'}
                xAxisThickness={1}
                yAxisThickness={1}
                xAxisColor={'#334155'}
                yAxisColor={'#334155'}
                hideRules={true}
                xAxisLabelTextStyle={{ color: 'transparent', fontSize: 1 }}
                yAxisTextStyle={{ color: 'transparent', fontSize: 1 }}
                renderTooltip={(item: any, index: number) => {
                  const len = (barSeries as any[]).length;
                  const shiftStyle =
                    index >= len - 1
                      ? { marginLeft: -30 }
                      : index <= 0
                      ? { marginLeft: 30 }
                      : null;
                  return (
                    <View style={[styles.tooltip, shiftStyle]}>
                      <Text style={styles.tooltipText}>
                        {item?.dateKey ?? item?.label}
                      </Text>
                      <Text style={styles.tooltipValue}>
                        {item?.value?.toLocaleString?.() ?? item?.value}
                      </Text>
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <Text style={styles.emptyText}>No data</Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0e0f14' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerAction: { color: '#cbd5e1', fontSize: 24, padding: 4 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSpacer: { width: 24 },
  sectionTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
    marginVertical: 8,
  },
  card: {
    backgroundColor: '#1e212b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    padding: 12,
    marginBottom: 16,
  },
  totalText: { color: '#94a3b8', fontSize: 12, marginTop: 8 },
  emptyText: { color: '#64748b' },
  // Legend styles (compact, wraps to fit more items)
  legendWrap: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 6,
    maxWidth: '48%',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#cbd5e1',
    fontSize: 12,
  },
  // Tooltip styles for bar chart
  tooltip: {
    backgroundColor: '#111827',
    borderColor: '#374151',
    borderWidth: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  tooltipText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  tooltipValue: {
    color: '#e5e7eb',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2,
  },
});
