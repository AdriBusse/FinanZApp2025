import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import BottomSheetModal from './BottomSheetModal';

interface FormBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  submitLabel?: string;
  onSubmit: () => void | Promise<void>;
  submitDisabled?: boolean;
  heightPercent?: number;
}

export default function FormBottomSheet({
  visible,
  onClose,
  title,
  children,
  submitLabel = 'Save',
  onSubmit,
  submitDisabled,
  heightPercent = 0.6,
}: FormBottomSheetProps) {
  return (
    <BottomSheetModal
      visible={visible}
      onClose={onClose}
      heightPercent={heightPercent}
    >
      <View style={styles.header}>
        <Text style={styles.modalTitle}>{title}</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            submitDisabled && styles.submitButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={submitDisabled}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.submitButtonText,
              submitDisabled && styles.submitButtonTextDisabled,
            ]}
          >
            {submitLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheetModal>
  );
}

export const formStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#cbd5e1',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  footer: {
    marginTop: 16,
  },
  submitButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#374151',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitButtonTextDisabled: {
    color: '#94a3b8',
  },
  modalLabel: {
    color: '#cbd5e1',
    fontSize: 12,
    marginBottom: 6,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 10,
    color: '#fff',
    marginBottom: 12,
  },
});

const styles = formStyles;
