import React from 'react';
import * as LucideIcons from 'lucide-react-native';

type IconSymbolProps = {
  name?: string;
  size?: number;
  color?: string;
};

const toPascalCase = (value: string) =>
  value
    .split('-')
    .map(part => (part ? part[0].toUpperCase() + part.slice(1) : ''))
    .join('');

const resolveIcon = (name?: string) => {
  if (!name) return LucideIcons.Pin;
  const direct = (LucideIcons as Record<string, any>)[name];
  if (direct) return direct;
  const pascal = toPascalCase(name);
  return (LucideIcons as Record<string, any>)[pascal] || LucideIcons.Pin;
};

export default function IconSymbol({
  name,
  size = 20,
  color = '#f8fafc',
}: IconSymbolProps) {
  const Icon = resolveIcon(name);
  return <Icon size={size} color={color} />;
}
