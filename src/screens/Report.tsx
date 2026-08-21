import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import {
  PieChart,
  BarChart2,
  ChevronDown,
  Check,
  ShoppingBag,
  Tag,
} from 'lucide-react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import { useExpenses } from '../hooks/useExpenses';

// Palette for categories
const CATEGORY_PALETTE = [
  '#2dd4bf', // teal / turquoise
  '#3b82f6', // blue
  '#f97316', // orange
  '#a855f7', // purple
  '#ec4899', // pink
  '#eab308', // yellow
  '#10b981', // emerald
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#64748b', // slate/gray fallback
];

function formatAmount(val: number): string {
  if (typeof val !== 'number' || isNaN(val)) return '0';
  return val.toLocaleString();
}

function formatDateLabel(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export default function Report() {
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null,
  );
  const { expensesQuery, expenseQuery } = useExpenses({
    expenseId: selectedExpenseId ?? undefined,
  });
  const rawExpenses = useMemo(
    () => (expensesQuery.data as any)?.getExpenses ?? [],
    [expensesQuery.data],
  );
  const loading = Boolean(expensesQuery?.loading || expenseQuery?.loading);

  // Sort expenses newest first
  const expenses = useMemo(() => {
    return [...rawExpenses].sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return timeB - timeA;
    });
  }, [rawExpenses]);

  useEffect(() => {
    if (expenses.length > 0 && !selectedExpenseId) {
      setSelectedExpenseId(expenses[0].id);
    }
  }, [expenses, selectedExpenseId]);

  // The list is used for selection; transaction data is fetched only for it.
  const selectedExpenseSummary = useMemo(() => {
    if (!expenses.length) return null;
    return expenses.find(e => e.id === selectedExpenseId) || expenses[0];
  }, [expenses, selectedExpenseId]);
  const selectedExpenseDetail = (expenseQuery?.data as any)?.getExpense;
  const selectedExpense =
    selectedExpenseDetail?.id === selectedExpenseId
      ? selectedExpenseDetail
      : selectedExpenseSummary;

  // View state: 'donut' (round diagram) | 'histogram' (daily bar chart)
  const [chartType, setChartType] = useState<'donut' | 'histogram'>('donut');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Transactions of selected expense
  const transactions = useMemo(() => {
    return selectedExpense?.transactions || [];
  }, [selectedExpense]);

  const currency = selectedExpense?.currency || 'EUR';

  // Total spent sum
  const totalSpent = useMemo(() => {
    return transactions.reduce(
      (acc: number, t: any) => acc + Number(t.amount || 0),
      0,
    );
  }, [transactions]);

  // Category breakdown slices
  const categorySlices = useMemo(() => {
    if (!transactions.length) return [];

    const map = new Map<string, { name: string; sum: number }>();
    for (const t of transactions) {
      const catName = t.category?.name || 'Uncategorized';
      const current = map.get(catName) || { name: catName, sum: 0 };
      current.sum += Number(t.amount || 0);
      map.set(catName, current);
    }

    const list = Array.from(map.values())
      .filter(item => item.sum > 0)
      .sort((a, b) => b.sum - a.sum);

    return list.map((item, idx) => {
      const percentage = totalSpent > 0 ? (item.sum / totalSpent) * 100 : 0;
      const color = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];
      return {
        ...item,
        percentage,
        color,
      };
    });
  }, [transactions, totalSpent]);

  // Daily histogram grouping
  const dailyData = useMemo(() => {
    if (!transactions.length) return [];

    const map = new Map<
      string,
      { dateStr: string; dateObj: Date; sum: number }
    >();
    for (const t of transactions) {
      const dateObj = t.createdAt ? new Date(t.createdAt) : new Date();
      const dateStr = !isNaN(dateObj.getTime())
        ? dateObj.toISOString().slice(0, 10)
        : 'Unknown';
      const current = map.get(dateStr) || { dateStr, dateObj, sum: 0 };
      current.sum += Number(t.amount || 0);
      map.set(dateStr, current);
    }

    return Array.from(map.values())
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
      .map(item => ({
        label: formatDateLabel(item.dateStr),
        sum: item.sum,
      }));
  }, [transactions]);

  const maxDailySum = useMemo(() => {
    if (!dailyData.length) return 1;
    return Math.max(...dailyData.map(d => d.sum), 1);
  }, [dailyData]);

  // Render SVG Donut Chart
  const renderDonutChart = () => {
    const size = 230;
    const center = size / 2;
    const radius = 80;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    let accumOffset = 0;
    const gap = categorySlices.length > 1 ? 6 : 0;

    return (
      <View style={styles.chartCenterContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Background ring */}
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#1e293b"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {categorySlices.map((slice, i) => {
              const sliceLength = (slice.percentage / 100) * circumference;
              const drawLength = Math.max(0, sliceLength - gap);
              const dashArray = `${drawLength} ${circumference - drawLength}`;
              const strokeDashoffset = -accumOffset;
              accumOffset += sliceLength;

              return (
                <Circle
                  key={`${slice.name}-${i}`}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={dashArray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              );
            })}
          </G>
        </Svg>
        {/* Ring Center Text */}
        <View pointerEvents="none" style={styles.donutCenterContent}>
          <Text style={styles.donutSubLabel}>Spent</Text>
          <Text style={styles.donutMainValue} numberOfLines={1}>
            {`${formatAmount(totalSpent)} ${currency}`}
          </Text>
          {!!selectedExpense && (
            <Text style={styles.donutExpenseTitle} numberOfLines={1}>
              {selectedExpense.title}
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render Histogram (Bar Chart by Day)
  const renderHistogram = () => {
    const barMaxHeight = 150;

    return (
      <View style={styles.histogramCard}>
        {/* Y Axis Reference Labels */}
        <View style={styles.gridLinesContainer}>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>{formatAmount(maxDailySum)}</Text>
            <View style={styles.gridLine} />
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>
              {formatAmount(maxDailySum / 2)}
            </Text>
            <View style={styles.gridLine} />
          </View>
          <View style={styles.gridRow}>
            <Text style={styles.gridLabel}>0</Text>
            <View style={styles.gridLine} />
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.histogramBarsScroll}
        >
          {dailyData.map((item, idx) => {
            const heightPercent = maxDailySum > 0 ? item.sum / maxDailySum : 0;
            const barHeight = Math.max(12, heightPercent * barMaxHeight);
            const sliceColor = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

            return (
              <View key={`${item.label}-${idx}`} style={styles.barColumn}>
                <Text style={styles.barValueText}>
                  {formatAmount(item.sum)}
                </Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: barHeight,
                        backgroundColor: sliceColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabelText}>{item.label}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Header Controls: Expense Selector Dropdown + Chart Toggle */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownOpen(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownTitle} numberOfLines={1}>
              {selectedExpense ? selectedExpense.title : 'Select Expense'}
            </Text>
            <ChevronDown color="#94a3b8" size={18} style={{ marginLeft: 6 }} />
          </TouchableOpacity>

          <View style={styles.toggleGroup}>
            <TouchableOpacity
              style={[
                styles.toggleBtn,
                chartType === 'donut' && styles.toggleBtnActive,
              ]}
              onPress={() => setChartType('donut')}
              activeOpacity={0.7}
            >
              <PieChart
                color={chartType === 'donut' ? '#38bdf8' : '#94a3b8'}
                size={18}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.toggleBtn,
                chartType === 'histogram' && styles.toggleBtnActive,
              ]}
              onPress={() => setChartType('histogram')}
              activeOpacity={0.7}
            >
              <BarChart2
                color={chartType === 'histogram' ? '#38bdf8' : '#94a3b8'}
                size={18}
              />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#60a5fa" />
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : !selectedExpense || transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Transactions</Text>
            <Text style={styles.emptySub}>
              {expenses.length === 0
                ? 'Create an expense to see reporting insights.'
                : 'There are no transactions recorded for this expense.'}
            </Text>
          </View>
        ) : (
          <>
            {/* Main Visual Component: Donut Chart or Daily Histogram */}
            <View style={styles.chartWrapper}>
              {chartType === 'donut' ? renderDonutChart() : renderHistogram()}
            </View>

            {/* Category Breakdown List */}
            <View style={styles.breakdownSection}>
              <Text style={styles.sectionTitle}>Breakdown by Category</Text>
              {categorySlices.map((cat, i) => (
                <View key={`${cat.name}-${i}`} style={styles.categoryRow}>
                  <View
                    style={[
                      styles.categoryIconCircle,
                      { backgroundColor: `${cat.color}22` },
                    ]}
                  >
                    <ShoppingBag color={cat.color} size={18} />
                  </View>

                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                    <Text style={styles.categoryPercent}>
                      {`${cat.percentage.toFixed(2)}%`}
                    </Text>
                  </View>

                  <Text style={styles.categoryAmount}>
                    {`${formatAmount(cat.sum)} ${currency}`}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Expense Selector Modal */}
        <Modal
          visible={dropdownOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownOpen(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setDropdownOpen(false)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.modalTitle}>Select Expense</Text>
              <FlatList
                data={expenses}
                keyExtractor={item => item.id}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedExpense?.id;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.expenseOption,
                        isSelected && styles.expenseOptionSelected,
                      ]}
                      onPress={() => {
                        setSelectedExpenseId(item.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.expenseOptionTitle,
                            isSelected && { color: '#38bdf8' },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.expenseOptionSub}>
                          {`Total: ${formatAmount(item.sum || 0)} ${
                            item.currency || 'EUR'
                          }`}
                        </Text>
                      </View>
                      {isSelected && <Check color="#38bdf8" size={20} />}
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 40,
    backgroundColor: '#0e0f14',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e212b',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    maxWidth: '70%',
    borderWidth: 1,
    borderColor: '#2d3342',
  },
  dropdownTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: '#1e212b',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: '#2d3342',
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#1e212b',
    borderRadius: 16,
    padding: 20,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptySub: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
  },
  chartWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  chartCenterContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  donutCenterContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  donutSubLabel: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  donutMainValue: {
    color: '#f8fafc',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  donutExpenseTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  histogramCard: {
    width: '100%',
    backgroundColor: '#141821',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 36,
    left: 16,
    right: 16,
    height: 150,
    justifyContent: 'space-between',
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gridLabel: {
    color: '#64748b',
    fontSize: 10,
    width: 45,
  },
  gridLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  histogramBarsScroll: {
    paddingLeft: 50,
    paddingRight: 16,
    paddingTop: 10,
    alignItems: 'flex-end',
    minWidth: '100%',
  },
  barColumn: {
    alignItems: 'center',
    marginRight: 16,
    width: 48,
  },
  barValueText: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  barTrack: {
    height: 150,
    width: 28,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barLabelText: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
  },
  breakdownSection: {
    marginTop: 8,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e212b',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  categoryIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '700',
  },
  categoryPercent: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  categoryAmount: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#141821',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '60%',
    borderTopWidth: 1,
    borderColor: '#1f2937',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  expenseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#1e212b',
  },
  expenseOptionSelected: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  expenseOptionTitle: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  expenseOptionSub: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
});
