import React from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';

export default function Input(props: TextInputProps) {
  return (
    <RNTextInput
      placeholderTextColor="#94a3b8"
      {...props}
      style={[styles.input, props.style]}
      autoCapitalize="none"
      autoCorrect={false}
      spellCheck={false}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#1e212b',
  },
});
