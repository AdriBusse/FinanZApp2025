import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import IconSymbol from './IconSymbol';

interface DropdownOption {
  id: string;
  label: string;
  icon?: string;
  color?: string;
}

interface DropdownProps {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onSelect: (option: DropdownOption) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  iconColor?: string;
}

export default function Dropdown({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  loading = false,
  disabled = false,
  iconColor = '#3b82f6',
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(option => option.id === value);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.dropdown,
          disabled && styles.dropdownDisabled,
          isOpen && styles.dropdownFocused,
        ]}
        onPress={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#94a3b8" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : selectedOption ? (
          <View style={styles.selectedContainer}>
            {selectedOption.icon && (
              <View style={styles.optionIcon}>
                <IconSymbol name={selectedOption.icon} size={18} color={iconColor} />
              </View>
            )}
            <Text style={styles.selectedText}>{selectedOption.label}</Text>
            {selectedOption.color && (
              <View
                style={[
                  styles.colorIndicator,
                  { backgroundColor: selectedOption.color },
                ]}
              />
            )}
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Text style={styles.arrow}>▼</Text>
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
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={options}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.option,
                    selectedOption?.id === item.id && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    {item.icon && (
                      <View style={styles.optionIcon}>
                        <IconSymbol name={item.icon} size={18} color={iconColor} />
                      </View>
                    )}
                    <Text
                      style={[
                        styles.optionText,
                        selectedOption?.id === item.id &&
                          styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.color && (
                      <View
                        style={[
                          styles.colorIndicator,
                          { backgroundColor: item.color },
                        ]}
                      />
                    )}
                  </View>
                  {selectedOption?.id === item.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.checkmark}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() =>
                selectedOption ? (
                  <TouchableOpacity
                    style={[styles.option, styles.clearOption]}
                    onPress={() => {
                      onSelect({ id: '', label: '', icon: '', color: '' });
                      setIsOpen(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionContent}>
                      <Text style={styles.clearText}>Clear Selection</Text>
                    </View>
                  </TouchableOpacity>
                ) : null
              }
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
  dropdown: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#1e212b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownDisabled: {
    opacity: 0.5,
  },
  dropdownFocused: {
    borderColor: '#2e7d32',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
    marginLeft: 8,
    fontSize: 16,
  },
  selectedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '600',
  },
  placeholder: {
    color: '#94a3b8',
    fontSize: 16,
  },
  arrow: {
    color: '#94a3b8',
    fontSize: 12,
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
  option: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionSelected: {
    backgroundColor: '#2e7d3244',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionIcon: {
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#4ade80',
    fontWeight: '700',
  },
  selectedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#374151',
  },
  clearOption: {
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  clearText: {
    color: '#f87171',
    fontWeight: '600',
  },
  colorIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 10,
  },
});
