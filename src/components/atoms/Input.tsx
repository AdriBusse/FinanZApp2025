import React from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps } from 'react-native';

export default function Input(props: TextInputProps) {
  return <RNTextInput placeholderTextColor="#94a3b8" {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#374151', borderRadius: 8, padding: 10, color: '#fff', marginBottom: 12 },
});
