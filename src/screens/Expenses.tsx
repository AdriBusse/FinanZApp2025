import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Expenses() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Expenses</Text>
      <Text style={styles.subtitle}>
        Coming soon: topics, categories, and transactions.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  subtitle: { color: '#666' },
});
