import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
} from 'react-native';
import { ICON_MAPPING, IconOption } from '../../utils/iconMapping';

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  label?: string;
}

export default function IconPicker({
  selectedIcon,
  onIconSelect,
  label = 'Icon',
}: IconPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const selectedOption = ICON_MAPPING.find(
    option => option.icon === selectedIcon,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={styles.iconPreview}>{selectedIcon || '📌'}</Text>
        <Text style={styles.iconLabel}>
          {selectedOption?.label || 'Select Icon'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Icon</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={ICON_MAPPING}
              keyExtractor={item => item.keyword}
              numColumns={4}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconOption,
                    selectedIcon === item.icon && styles.selectedIcon,
                  ]}
                  onPress={() => {
                    onIconSelect(item.icon);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.iconText}>{item.icon}</Text>
                  <Text style={styles.iconLabelText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.iconGrid}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#1e212b',
    borderWidth: 1,
    borderColor: '#374151',
  },
  iconPreview: {
    fontSize: 24,
    marginRight: 12,
  },
  iconLabel: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111827',
    borderRadius: 12,
    width: '90%',
    maxHeight: '70%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    color: '#94a3b8',
    fontSize: 20,
    padding: 4,
  },
  iconGrid: {
    padding: 16,
  },
  iconOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    margin: 4,
    borderRadius: 8,
    backgroundColor: '#1e212b',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedIcon: {
    borderColor: '#2e7d32',
    backgroundColor: '#2e7d3244',
  },
  iconText: {
    fontSize: 32,
    marginBottom: 8,
  },
  iconLabelText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  separator: {
    height: 8,
  },
});
