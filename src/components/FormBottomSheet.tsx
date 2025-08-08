import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import BottomSheetModal from './BottomSheetModal';

interface FormBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
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
  cancelLabel = 'Cancel',
  onSubmit,
  submitDisabled,
  heightPercent = 0.6,
}: FormBottomSheetProps) {
  return (
    <BottomSheetModal visible={visible} onClose={onClose} heightPercent={heightPercent}>
      <Text style={styles.modalTitle}>{title}</Text>
      {children}
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Button title={cancelLabel} onPress={onClose} />
        <View style={{ width: 12 }} />
        <Button title={submitLabel} disabled={!!submitDisabled} onPress={onSubmit} />
      </View>
    </BottomSheetModal>
  );
}

export const formStyles = StyleSheet.create({
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalLabel: { color: '#cbd5e1', fontSize: 12, marginBottom: 6 },
  modalInput: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 10, color: '#fff', marginBottom: 12 },
});

const styles = formStyles;
