import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ScreenWrapper from '../components/layout/ScreenWrapper';

export default function Report() {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Report</Text>
        <Text style={styles.subtitle}>
          Insights and analytics will appear here.
        </Text>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});
