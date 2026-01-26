import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
} from 'react-native';
import IconSymbol from './IconSymbol';
export type IconOption = { keyword?: string; icon: string; label?: string };

interface IconPickerProps {
  selectedIcon: string;
  onIconSelect: (icon: string) => void;
  label?: string;
  options?: IconOption[]; // optional, passed from backend metadata
}

export default function IconPicker({
  selectedIcon,
  onIconSelect,
  label = 'Icon',
  options,
}: IconPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const OPTIONS: IconOption[] =
    Array.isArray(options) && options.length > 0
      ? options
      : [{ icon: 'pin', label: 'Pin', keyword: 'pin' }];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.iconPreview}>
          <IconSymbol name={selectedIcon || 'pin'} size={28} color="#3b82f6" />
        </View>
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
              data={OPTIONS}
              keyExtractor={item => item.icon || item.keyword || item.label || 'pin'}
              numColumns={4}
              renderItem={({ item }) => {
                const iconKey = item.icon || item.keyword || item.label || 'pin';
                return (
                  <TouchableOpacity
                    style={[
                      styles.iconOption,
                      selectedIcon === iconKey && styles.selectedIcon,
                    ]}
                    onPress={() => {
                      onIconSelect(iconKey);
                      setIsOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <IconSymbol name={iconKey} size={28} color="#3b82f6" />
                  </TouchableOpacity>
                );
              }}
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
    width: 64,
    height: 64,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#374151',
    justifyContent: 'center',
  },
  iconPreview: {
    alignItems: 'center',
    justifyContent: 'center',
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
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f644',
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
