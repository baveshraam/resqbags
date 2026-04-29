import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '../constants/colors';

interface PriceRangeCardProps {
  range: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
}

export function PriceRangeCard({ range, description, selected, onPress }: PriceRangeCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.optionCard,
        selected && styles.optionCardSelected
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.textContainer}>
        <Text style={[
          styles.optionText,
          selected && styles.optionTextSelected
        ]}>
          {range}
        </Text>
        {description ? (
          <Text style={[
            styles.descText,
            selected && styles.descTextSelected
          ]}>
            {description}
          </Text>
        ) : null}
      </View>
      {selected && (
        <View style={styles.checkCircle}>
          <Check size={16} color={Colors.offWhite} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  optionCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionCardSelected: {
    backgroundColor: Colors.successBg,
    borderColor: Colors.forestGreen,
  },
  textContainer: {
    flex: 1,
    gap: 4,
  },
  optionText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.deepEspresso,
  },
  optionTextSelected: {
    color: Colors.forestGreen,
  },
  descText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.warmStone,
    lineHeight: 18,
  },
  descTextSelected: {
    color: Colors.forestGreen,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.forestGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
