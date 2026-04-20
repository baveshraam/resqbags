import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

const stats = [
  { value: '12.4k', label: 'Meals\nRescued' },
  { value: '8.2t', label: 'CO₂\nSaved' },
  { value: '240+', label: 'Partner\nRestaurants' },
];

export function ImpactStats() {
  return (
    <View style={styles.container}>
      {stats.map((stat, idx) => (
        <React.Fragment key={idx}>
          <View style={styles.item}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
          {idx < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.mintGlow,
    borderRadius: 18,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  label: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 15,
  },
  divider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
});
