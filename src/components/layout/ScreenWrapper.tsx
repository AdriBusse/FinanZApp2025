import React from 'react';
import {
  Platform,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  KeyboardAvoidingView,
  ActivityIndicator,
} from 'react-native';
import { useFinanceStore } from '../../store/finance';

export type ScreenWrapperProps = {
  children: React.ReactNode;
  scrollable?: boolean; // if true, wraps content in ScrollView; if false, just a View
  contentContainerStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  keyboardOffset?: number; // extra offset for KeyboardAvoidingView
};

export default function ScreenWrapper({
  children,
  scrollable = true,
  contentContainerStyle,
  backgroundColor,
  keyboardOffset = 0,
}: ScreenWrapperProps) {
  const Container = scrollable ? ScrollView : View;
  const { bootstrapped, loadAll } = useFinanceStore();
  const called = React.useRef(false);

  // Kick off initial bootstrap once
  React.useEffect(() => {
    if (!bootstrapped && !called.current) {
      called.current = true;
      void loadAll();
    }
  }, [bootstrapped, loadAll]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={keyboardOffset}
      >
        <Container
          style={scrollable ? undefined : styles.flex}
          {...(scrollable
            ? {
                contentContainerStyle: [
                  styles.scrollContent,
                  contentContainerStyle,
                ],
                keyboardShouldPersistTaps: 'handled' as const,
              }
            : {})}
        >
          {children}
        </Container>
        {!bootstrapped && (
          <View
            pointerEvents="auto"
            style={[
              StyleSheet.absoluteFillObject,
              styles.loadingOverlay,
              { backgroundColor: backgroundColor || '#0e0f14' },
            ]}
          >
            <ActivityIndicator size="large" color="#93c5fd" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  loadingOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
