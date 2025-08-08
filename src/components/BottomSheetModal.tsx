import React, { ReactNode, useEffect, useRef } from 'react';
import { Modal, View, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  heightPercent?: number; // 0..1, default 0.6
  children: ReactNode;
}

export default function BottomSheetModal({ visible, onClose, heightPercent = 0.6, children }: BottomSheetModalProps) {
  const screenHeight = Dimensions.get('window').height;
  const targetHeight = Math.max(0.3, Math.min(0.95, heightPercent)) * screenHeight;
  const translateY = useRef(new Animated.Value(targetHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: targetHeight, duration: 200, useNativeDriver: true }),
        Animated.timing(backdrop, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, translateY, targetHeight, backdrop]);

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View style={[styles.backdrop, { opacity: backdrop.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) }]} />
        </TouchableWithoutFeedback>
        <Animated.View style={[styles.sheet, { height: targetHeight, transform: [{ translateY }] }]}> 
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <View style={styles.content}>{children}</View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  sheet: { backgroundColor: '#111827', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  handleContainer: { alignItems: 'center', paddingTop: 8 },
  handle: { width: 48, height: 4, backgroundColor: '#374151', borderRadius: 2 },
  content: { flex: 1, padding: 16 },
});
