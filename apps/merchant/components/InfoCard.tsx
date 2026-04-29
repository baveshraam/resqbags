import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../constants/colors';

interface InfoCardProps {
  icon?: React.ReactNode;
  message: string;
  variant?: 'info' | 'warning' | 'success' | 'tip';
  style?: ViewStyle;
}

const variantStyles = {
  info: {
    bg: Colors.sageLight,
    border: Colors.mintGlow,
    text: Colors.forestGreen,
  },
  warning: {
    bg: Colors.warningBg,
    border: Colors.amberLight,
    text: Colors.deepEspresso,
  },
  success: {
    bg: Colors.successBg,
    border: Colors.mintGlow,
    text: Colors.forestGreen,
  },
  tip: {
    bg: Colors.softBeige,
    border: Colors.border,
    text: Colors.warmStone,
  },
};

export function InfoCard({ icon, message, variant = 'info', style }: InfoCardProps) {
  const vs = variantStyles[variant];

  return (
    <View style={[styles.container, { backgroundColor: vs.bg, borderColor: vs.border }, style]}>
      {icon && <View style={styles.iconWrapper}>{icon}</View>}
      <Text style={[styles.text, { color: vs.text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    alignItems: 'flex-start',
  },
  iconWrapper: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    lineHeight: 20,
  },
});
