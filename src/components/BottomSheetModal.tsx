import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  heightPercent?: number; // 0..1, default 0.6
  children: ReactNode;
}

export default function BottomSheetModal({
  visible,
  onClose,
  heightPercent = 0.6,
  children,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const screenHeight = Dimensions.get('window').height;
  const targetHeight = Math.max(0.3, Math.min(0.95, heightPercent)) * screenHeight;
  const translateY = useRef(new Animated.Value(targetHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: targetHeight,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(backdrop, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, translateY, targetHeight, backdrop]);

  const modalHeight = keyboardHeight > 0 
    ? Math.min(targetHeight, screenHeight - keyboardHeight - 50) // Leave 50px margin
    : targetHeight;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableWithoutFeedback onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}>
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: backdrop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.5],
                }),
              },
            ]}
          />
        </TouchableWithoutFeedback>
        <Animated.View
          style={[
            styles.sheet,
            { 
              height: modalHeight,
              transform: [{ translateY }],
              paddingBottom: Math.max(0, insets.bottom || 0),
            },
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[
              styles.contentContainer,
              { paddingBottom: 32 + (insets.bottom || 0) },
            ]}
            nestedScrollEnabled={true}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { 
    flex: 1, 
    justifyContent: 'flex-end',
    backgroundColor: 'transparent',
  },
  backdrop: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#000' 
  },
  sheet: {
    backgroundColor: '#111827',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  handleContainer: { 
    alignItems: 'center', 
    paddingTop: 8,
    paddingBottom: 8,
  },
  handle: { 
    width: 48, 
    height: 4, 
    backgroundColor: '#374151', 
    borderRadius: 2 
  },
  content: { 
    flex: 1,
  },
  contentContainer: { 
    padding: 16, 
    paddingBottom: 32,
    flexGrow: 1,
  },
});
