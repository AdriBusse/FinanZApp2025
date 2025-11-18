import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import ScreenWrapper from '../components/layout/ScreenWrapper';
import Input from '../components/atoms/Input';
import ColorPicker from '../components/atoms/ColorPicker';
import IconPicker from '../components/atoms/IconPicker';
import { useExpenses } from '../hooks/useExpenses';

export default function CreateCategory() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const categoryToEdit = route.params?.category;

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [selectedIcon, setSelectedIcon] = useState('📌');
  const {
    categoryMetadataQuery,
    createCategory,
    updateCategory,
    categoryMeta,
  } = useExpenses({ includeCategoryMetadata: true });
  const {
    loading: metaLoading,
    error: metaError,
    refetch: refetchMeta,
  } = categoryMetadataQuery;
  const { colors, icons } = categoryMeta;
  const [isSaving, setIsSaving] = useState(false);


  // Refresh metadata when screen opens
  useEffect(() => {
    void refetchMeta();
  }, [refetchMeta]);

  // Initialize form with category data if editing
  useEffect(() => {
    if (categoryToEdit) {
      setName(categoryToEdit.name);
      setSelectedColor(categoryToEdit.color || '#3b82f6');
      setSelectedIcon(categoryToEdit.icon || '📌');
    }
  }, [categoryToEdit]);

  // When creating new (not editing), preselect first backend options if available
  useEffect(() => {
    if (!categoryToEdit) {
      if (colors && colors.length > 0 && !selectedColor) {
        setSelectedColor(colors[0]);
      }
      if (icons && icons.length > 0 && !selectedIcon) {
        setSelectedIcon(icons[0].icon);
      }
    }
  }, [categoryToEdit, colors, icons]);

  const isValid = name.trim().length > 0;
  const isEditing = !!categoryToEdit;
  const isLoading = isSaving;

  const handleSubmit = async () => {
    if (!isValid) return;

    try {
      setIsSaving(true);
      if (isEditing) {
        await updateCategory(
          categoryToEdit.id,
          name.trim(),
          selectedColor,
          selectedIcon,
        );

        Alert.alert('Success', 'Category updated successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        await createCategory(name.trim(), selectedColor, selectedIcon);

        Alert.alert('Success', 'Category created successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert(
        'Error',
        `Failed to ${
          isEditing ? 'update' : 'create'
        } category. Please try again.`,
        [{ text: 'OK' }],
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.headerAction}>{'‹'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isEditing ? 'Edit Category' : 'Create Category'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Category Details</Text>
          {metaError ? (
            <Text style={{ color: '#ef4444', marginBottom: 8 }}>
              Failed to load icon/color options. Using defaults.
            </Text>
          ) : null}

          <Text style={styles.label}>Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="Enter category name"
            returnKeyType="done"
            blurOnSubmit
          />

          <View style={styles.pickerRow}>
            <View style={styles.pickerColumn}>
              <ColorPicker
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                label="Color"
                options={colors}
              />
            </View>
            <View style={styles.pickerColumn}>
              <IconPicker
                selectedIcon={selectedIcon}
                onIconSelect={setSelectedIcon}
                label="Icon"
                options={icons}
              />
            </View>
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewItem}>
              <Text style={styles.previewIcon}>{selectedIcon}</Text>
              <Text style={[styles.previewName, { color: selectedColor }]}>
                {name || 'Category Name'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!isValid || isLoading) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isEditing ? 'Update Category' : 'Create Category'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  form: {
    flex: 1,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 4,
  },
  preview: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#1e212b',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  previewTitle: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingTop: 16,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
