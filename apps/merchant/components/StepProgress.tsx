import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface StepProgressProps {
  current: number;
  total: number;
}

export function StepProgress({ current, total }: StepProgressProps) {
  const progress = Math.min(current / total, 1);

  return (
    <View style={styles.wrapper}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.stepsRow}>
        {Array.from({ length: total }, (_, i) => {
          const stepNum = i + 1;
          const isComplete = stepNum < current;
          const isCurrent = stepNum === current;

          return (
            <View
              key={stepNum}
              style={[
                styles.dot,
                isComplete && styles.dotComplete,
                isCurrent && styles.dotCurrent,
              ]}
            >
              <Text
                style={[
                  styles.dotText,
                  (isComplete || isCurrent) && styles.dotTextActive,
                ]}
              >
                {stepNum}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 24,
    gap: 12,
  },
  track: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: Colors.forestGreen,
    borderRadius: 3,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.softBeige,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotComplete: {
    backgroundColor: Colors.forestGreen,
    borderColor: Colors.forestGreen,
  },
  dotCurrent: {
    backgroundColor: Colors.offWhite,
    borderColor: Colors.forestGreen,
  },
  dotText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.warmTaupe,
  },
  dotTextActive: {
    color: Colors.forestGreen,
  },
});
