import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { FILTER_CHIPS } from '@/constants/data';

interface FilterChipsProps {
  onFilterChange?: (filterId: string) => void;
}

export function FilterChips({ onFilterChange }: FilterChipsProps) {
  const [selected, setSelected] = useState('all');

  const handleSelect = (id: string) => {
    setSelected(id);
    onFilterChange?.(id);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {FILTER_CHIPS.map(chip => (
        <TouchableOpacity
          key={chip.id}
          style={[styles.chip, selected === chip.id && styles.chipSelected]}
          onPress={() => handleSelect(chip.id)}
          activeOpacity={0.8}
        >
          <Text style={[styles.chipText, selected === chip.id && styles.chipTextSelected]}>
            {chip.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.softBeige,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipSelected: {
    backgroundColor: Colors.forestGreen,
    borderColor: Colors.forestGreen,
  },
  chipText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  chipTextSelected: {
    color: Colors.offWhite,
  },
});
