import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { useAuthStore } from '../store/auth';
import ScreenWrapper from '../components/layout/ScreenWrapper';

export default function Profile() {
  const { user, logout } = useAuthStore();
  // Read version from package.json (Metro supports JSON require)
  const pkg = require('../../package.json');
  const version: string = pkg?.version ?? '0.0.0';
  return (
    <ScreenWrapper>
      <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>User: {user?.username ?? 'Unknown'}</Text>
      <View style={{ height: 12 }} />
      <Button title="Logout" onPress={() => logout()} />
      <View style={{ height: 24 }} />
      <Text style={styles.version}>App version: {version}</Text>
    </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666' },
  version: { marginTop: 4, color: '#888' },
});
