import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  Modal,
  FlatList,
} from 'react-native';

interface ColorPickerProps {
  selectedColor: string;
  onColorSelect: (color: string) => void;
  label?: string;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#a855f7', // purple
  '#f43f5e', // rose
  '#84cc16', // lime
  '#06b6d4', // sky
  '#f472b6', // pink
  '#a78bfa', // violet
  '#34d399', // emerald
  '#fbbf24', // amber
];

export default function ColorPicker({
  selectedColor,
  onColorSelect,
  label = 'Color',
}: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[
          styles.colorButton,
          { backgroundColor: selectedColor },
        ]}
        onPress={() => setIsOpen(true)}
        activeOpacity={0.7}
      >
        <View style={styles.colorPreview} />
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
              <Text style={styles.modalTitle}>Select Color</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={COLORS}
              keyExtractor={(item) => item}
              numColumns={5}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.colorOption,
                    { backgroundColor: item },
                    selectedColor === item && styles.selectedColor,
                  ]}
                  onPress={() => {
                    onColorSelect(item);
                    setIsOpen(false);
                  }}
                  activeOpacity={0.7}
                />
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.colorGrid}
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
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#374151',
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
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
  colorGrid: {
    padding: 16,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#f8fafc',
    borderWidth: 3,
  },
  separator: {
    height: 8,
  },
});
