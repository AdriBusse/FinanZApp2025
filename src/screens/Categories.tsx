import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Trash2, Edit, Info } from 'lucide-react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import FABSpeedDial from '../components/FABSpeedDial';
import { useExpenses } from '../hooks/useExpenses';
import InfoModal from '../components/atoms/InfoModal';

export default function Categories() {
  const navigation = useNavigation<any>();
  const [isSpeedDialOpen, setIsSpeedDialOpen] = useState(false);
  const { categoriesQuery, deleteCategory } = useExpenses({
    includeCategories: true,
  });
  const {
    data: categoriesData,
    loading,
    error,
    refetch,
  } = categoriesQuery;
  const categories = categoriesData?.getExpenseCategories || [];
  const [infoOpen, setInfoOpen] = useState(false);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  // Auto-close FAB when navigating away
  useEffect(() => {
    const unsub = navigation.addListener('blur', () =>
      setIsSpeedDialOpen(false),
    );
    return unsub;
  }, [navigation]);

  const handleCreateCategory = () => {
    setIsSpeedDialOpen(false);
    navigation.navigate('CreateCategory');
  };

  const handleEditCategory = (category: any) => {
    navigation.navigate('CreateCategory', { category });
  };

  const handleDeleteCategory = async (category: any) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCategory(category.id);

              Alert.alert('Success', 'Category deleted successfully!');
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert(
                'Error',
                'Failed to delete category. Please try again.',
              );
            }
          },
        },
      ],
    );
  };

  const renderCategory = ({ item }: { item: any }) => (
    <View
      style={[
        styles.categoryItem,
        item.color && { borderColor: item.color, borderWidth: 2 },
      ]}
    >
      <View style={styles.categoryContent}>
        {item.icon && <Text style={styles.categoryIcon}>{item.icon}</Text>}
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{item.name}</Text>
        </View>
      </View>
      <View style={styles.categoryActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEditCategory(item)}
          activeOpacity={0.7}
        >
          <Edit color="#3b82f6" size={20} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteCategory(item)}
          activeOpacity={0.7}
        >
          <Trash2 color="#ef4444" size={20} style={{ opacity: 0.8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Loading categories...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (error) {
    return (
      <ScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error: {error?.message || 'Failed to load categories'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refetch}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Categories</Text>
          <TouchableOpacity
            onPress={() => setInfoOpen(true)}
            accessibilityLabel="About categories"
            activeOpacity={0.7}
          >
            <Info color="#94a3b8" size={20} />
          </TouchableOpacity>
        </View>

        {categories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📂</Text>
            <Text style={styles.emptyTitle}>No Categories</Text>
            <Text style={styles.emptySubtitle}>
              Create your first category to organize your expenses
            </Text>
            <TouchableOpacity
              onPress={() => setInfoOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={{ color: '#93c5fd', fontWeight: '700' }}>
                What is this?
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={categories}
            keyExtractor={item => item.id}
            renderItem={renderCategory}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

        <FABSpeedDial
          isOpen={isSpeedDialOpen}
          onToggle={() => setIsSpeedDialOpen(v => !v)}
          position="right"
          actions={[
            {
              label: 'Create Category',
              onPress: handleCreateCategory,
            },
          ]}
        />
        <InfoModal
          visible={infoOpen}
          title="Categories"
          content="Categories help you organize expense transactions. Assign a category (e.g., Food, Transport) to analyze spending by type. You can edit name, icon and color to fit your workflow."
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
    marginBottom: 24,
  },
  headerAction: {
    color: '#cbd5e1',
    fontSize: 24,
    padding: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#cbd5e1',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 160,
  },
  categoryItem: {
    backgroundColor: '#1e212b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryId: {
    color: '#94a3b8',
    fontSize: 12,
  },
  categoryColor: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 12,
  },
  categoryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  actionButton: {
    marginLeft: 16,
  },
});
