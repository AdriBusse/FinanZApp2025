import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuthStore } from '../store/auth';
import ScreenWrapper from '../components/layout/ScreenWrapper';

export default function Profile() {
  const { user, logout } = useAuthStore();
  return (
    <ScreenWrapper>
      <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>User: {user?.username ?? 'Unknown'}</Text>
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={() => logout()} />
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666' },
});
