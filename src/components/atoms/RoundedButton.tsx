import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  GestureResponderEvent,
  ActivityIndicator,
} from 'react-native';

export type RoundedButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

const COLORS = {
  primary: '#2563eb',
  secondary: '#374151',
  danger: '#ef4444',
  textOnDark: '#ffffff',
  outlineBorder: '#475569',
  disabledBg: '#334155',
  disabledText: '#94a3b8',
};

export default function RoundedButton({
  title,
  onPress,
  disabled,
  loading,
  variant = 'primary',
  size = 'md',
  fullWidth,
  style,
  textStyle,
}: RoundedButtonProps) {
  const isDisabled = !!(disabled || loading);
  const { container, label } = getStyles(
    variant,
    size,
    !!fullWidth,
    isDisabled,
  );

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[container, style]}
      accessibilityRole="button"
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? COLORS.textOnDark : '#fff'}
        />
      ) : (
        <Text style={[label, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

function getStyles(
  variant: NonNullable<RoundedButtonProps['variant']>,
  size: NonNullable<RoundedButtonProps['size']>,
  fullWidth: boolean,
  disabled: boolean,
) {
  const baseContainer: ViewStyle = {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  };
  const paddings: Record<
    NonNullable<RoundedButtonProps['size']>,
    { paddingVertical: number; paddingHorizontal: number; fontSize: number }
  > = {
    sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: 13 },
    md: { paddingVertical: 12, paddingHorizontal: 18, fontSize: 15 },
    lg: { paddingVertical: 14, paddingHorizontal: 22, fontSize: 17 },
  };

  const pal = (() => {
    if (disabled) {
      return {
        bg: COLORS.disabledBg,
        text: COLORS.disabledText,
        border: COLORS.outlineBorder,
      };
    }
    switch (variant) {
      case 'primary':
        return { bg: COLORS.primary, text: COLORS.textOnDark };
      case 'secondary':
        return { bg: COLORS.secondary, text: COLORS.textOnDark };
      case 'danger':
        return { bg: COLORS.danger, text: COLORS.textOnDark };
      case 'outline':
        return {
          bg: 'transparent',
          text: COLORS.textOnDark,
          border: COLORS.outlineBorder,
        };
      default:
        return { bg: COLORS.primary, text: COLORS.textOnDark };
    }
  })();

  const container: ViewStyle = {
    ...baseContainer,
    backgroundColor: pal.bg,
    borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth : 0,
    borderColor: pal.border,
    paddingVertical: paddings[size].paddingVertical,
    paddingHorizontal: paddings[size].paddingHorizontal,
    width: fullWidth ? '100%' : undefined,
  };

  const label: TextStyle = {
    color: pal.text,
    fontWeight: '700',
    fontSize: paddings[size].fontSize,
  };

  return StyleSheet.create({ container, label });
}
