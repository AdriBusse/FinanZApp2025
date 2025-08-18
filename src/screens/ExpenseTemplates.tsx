import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Edit, Trash2, Plus, Info } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FormBottomSheet, { formStyles as commonFormStyles } from '../components/FormBottomSheet';
import Input from '../components/atoms/Input';
import Dropdown from '../components/atoms/Dropdown';
import RoundedButton from '../components/atoms/RoundedButton';
import FloatingActionButton from '../components/atoms/FloatingActionButton';
import InfoModal from '../components/atoms/InfoModal';
import { apolloClient } from '../apollo/client';
import { gql } from '@apollo/client';
import { useCategoriesStore } from '../store/categories';

const GET_TEMPLATES = gql`
  query GET_EXPENSE_TEMPLATES {
    getExpenseTransactionTemplates { id describtion amount category { id name icon color } }
  }
`;

const CREATE_TEMPLATE = gql`
  mutation CREATE_EXPENSE_TEMPLATE($describtion: String!, $amount: Float!, $categoryId: String) {
    createExpenseTransactionTemplate(describtion: $describtion, amount: $amount, categoryId: $categoryId) {
      id
    }
  }
`;

const UPDATE_TEMPLATE = gql`
  mutation UPDATE_EXPENSE_TEMPLATE($id: String!, $describtion: String, $amount: Float, $categoryId: String) {
    updateExpenseTransactionTemplate(id: $id, describtion: $describtion, amount: $amount, categoryId: $categoryId) {
      id
    }
  }
`;

const DELETE_TEMPLATE = gql`
  mutation DELETE_EXPENSE_TEMPLATE($id: String!) {
    deleteExpenseTransactionTemplate(id: $id)
  }
`;

interface TemplateItem {
  id: string;
  describtion: string;
  amount: number;
  category?: { id: string; name: string; icon?: string | null; color?: string | null } | null;
}

export default function ExpenseTemplates() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<TemplateItem | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await apolloClient.query({ query: GET_TEMPLATES, fetchPolicy: 'network-only' });
      setTemplates(data?.getExpenseTransactionTemplates ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            accessibilityLabel="Back"
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <ArrowLeft color="#cbd5e1" size={22} />
          </TouchableOpacity>
          <Text style={styles.title}>Expense Templates</Text>
          <TouchableOpacity onPress={() => setInfoOpen(true)} accessibilityLabel="About templates" activeOpacity={0.7}>
            <Info color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={templates}
          keyExtractor={t => t.id}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          contentContainerStyle={{ paddingBottom: 120 }}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No templates yet</Text>
              <Text style={styles.emptySub}>Create templates to speed up recurring entries.</Text>
              <TouchableOpacity onPress={() => setInfoOpen(true)} activeOpacity={0.7}>
                <Text style={{ color: '#93c5fd', fontWeight: '700' }}>What is this?</Text>
              </TouchableOpacity>
              <RoundedButton title="Create Template" onPress={() => setCreateOpen(true)} fullWidth style={{ marginTop: 12 }} />
            </View>
          )}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.describtion}</Text>
                <Text style={styles.itemSub}>{`${Math.round(item.amount).toLocaleString()}`}{item.category ? ` • ${item.category.name}` : ''}</Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  style={styles.iconBtn}
                  onPress={() => setEditOpen(item)}
                  accessibilityLabel="Edit template"
                >
                  <Edit color="#3b82f6" size={20} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.iconBtn, { marginLeft: 8 }]}
                  onPress={() => {
                    Alert.alert('Delete Template', 'Are you sure?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: async () => { await apolloClient.mutate({ mutation: DELETE_TEMPLATE, variables: { id: item.id } }); await load(); } },
                    ]);
                  }}
                  accessibilityLabel="Delete template"
                >
                  <Trash2 color="#ef4444" size={20} style={{ opacity: 0.8 }} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {/* Floating action button for creating new templates */}
        <View
          pointerEvents="box-none"
          style={{ position: 'absolute', right: 16, bottom: 16 + (insets.bottom || 0) }}
        >
          <FloatingActionButton onPress={() => setCreateOpen(true)} color="#22c55e" accessibilityLabel="New template">
            <Plus color="#ffffff" size={24} />
          </FloatingActionButton>
        </View>

        <TemplateFormSheet
          title="Create Template"
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (data) => {
            await apolloClient.mutate({ mutation: CREATE_TEMPLATE, variables: data });
            setCreateOpen(false);
            await load();
          }}
        />

        <TemplateFormSheet
          title="Edit Template"
          open={!!editOpen}
          initial={editOpen ?? undefined}
          onClose={() => setEditOpen(null)}
          onSubmit={async (data) => {
            await apolloClient.mutate({ mutation: UPDATE_TEMPLATE, variables: { id: editOpen?.id, ...data } });
            setEditOpen(null);
            await load();
          }}
        />
      <InfoModal
        visible={infoOpen}
        title="Expense Templates"
        content="Templates store frequently used transaction details (description, amount, optional category). Use them to add recurring expenses faster from any expense screen."
        onClose={() => setInfoOpen(false)}
      />
    </View>
    </ScreenWrapper>
  );
}

function TemplateFormSheet({
  open,
  onClose,
  onSubmit,
  title,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (vars: { describtion: string; amount: number; categoryId?: string | null }) => Promise<void>;
  title: string;
  initial?: TemplateItem;
}) {
  const { categories, fetchCategories } = useCategoriesStore();
  const [describtion, setDescribtion] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (categories.length === 0) void fetchCategories();
      if (initial) {
        setDescribtion(initial.describtion || '');
        setAmount(String(Math.round(initial.amount)));
        setSelectedCategoryId(initial.category?.id ?? null);
      } else {
        setDescribtion('');
        setAmount('');
        setSelectedCategoryId(null);
      }
    }
  }, [open, initial, categories.length, fetchCategories]);

  const options = useMemo(() => {
    return [
      { id: '', label: 'No category' },
      ...categories.map(c => ({ id: c.id, label: c.name, icon: c.icon || undefined, color: c.color || undefined })),
    ];
  }, [categories]);

  const isValid = describtion.trim().length > 0 && amount.trim().length > 0 && !Number.isNaN(Number(amount));

  return (
    <FormBottomSheet
      visible={open}
      onClose={onClose}
      title={title}
      submitDisabled={!isValid || submitting}
      onSubmit={async () => {
        if (!isValid) return;
        try {
          setSubmitting(true);
          await onSubmit({
            describtion: describtion.trim(),
            amount: parseFloat(amount),
            categoryId: selectedCategoryId || undefined,
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <View style={{ paddingBottom: 16 }}>
        <Text style={commonFormStyles.modalLabel}>Describtion</Text>
        <Input value={describtion} onChangeText={setDescribtion} placeholder="e.g. Monthly rent" />

        <Text style={commonFormStyles.modalLabel}>Amount</Text>
        <Input value={amount} onChangeText={setAmount} placeholder="e.g. 900" keyboardType="numeric" />

        <Dropdown
          label="Category"
          value={selectedCategoryId}
          options={options}
          onSelect={(opt) => setSelectedCategoryId(opt.id || null)}
          placeholder="Select a category (optional)"
        />
      </View>
    </FormBottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#0e0f14' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  backBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(148,163,184,0.15)' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e212b', padding: 12, borderRadius: 12 },
  itemTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '700' },
  itemSub: { color: '#94a3b8', marginTop: 2 },
  iconBtn: { padding: 6, borderRadius: 8, backgroundColor: 'rgba(148,163,184,0.08)' },
  itemBtn: { paddingVertical: 6, paddingHorizontal: 10, backgroundColor: 'rgba(37,99,235,0.15)', borderWidth: 1, borderColor: '#2563eb', borderRadius: 8, marginLeft: 8 },
  itemBtnText: { color: '#93c5fd', fontWeight: '700' },
  emptyWrap: { alignItems: 'center', justifyContent: 'center', marginTop: 48 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  emptySub: { color: '#94a3b8', marginTop: 6, marginBottom: 12, textAlign: 'center' },
});
