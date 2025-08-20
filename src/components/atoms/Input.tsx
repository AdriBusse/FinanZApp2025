import React from 'react';
import {
  TextInput as RNTextInput,
  StyleSheet,
  TextInputProps,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

type InputProps = TextInputProps & {
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
};

export default function Input(props: InputProps) {
  const { leftAdornment, rightAdornment, containerStyle, style, ...rest } = props;
  const extraPaddingLeft = leftAdornment ? { paddingLeft: 28 } : null;
  const extraPaddingRight = rightAdornment ? { paddingRight: 28 } : null;

  return (
    <View style={[styles.container, containerStyle]}>
      <RNTextInput
        placeholderTextColor="#94a3b8"
        {...rest}
        style={[styles.input, style, extraPaddingLeft, extraPaddingRight]}
        autoCapitalize="none"
        autoCorrect={false}
        spellCheck={false}
      />
      {leftAdornment ? (
        <View style={styles.leftAdornment}>{leftAdornment}</View>
      ) : null}
      {rightAdornment ? (
        <View style={styles.rightAdornment}>{rightAdornment}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
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
  leftAdornment: {
    position: 'absolute',
    left: 10,
    top: 0,
    bottom: 12, // account for input marginBottom spacing visually
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightAdornment: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
