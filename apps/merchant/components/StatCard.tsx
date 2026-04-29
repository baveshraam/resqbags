import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  iconBgColor?: string;
}

export function StatCard({ title, value, icon, iconBgColor = Colors.sageLight }: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
      {icon && (
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    padding: 16,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 28,
    color: Colors.deepEspresso,
    marginBottom: 4,
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.warmStone,
  },
  iconWrapper: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
