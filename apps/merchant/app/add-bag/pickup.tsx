import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Info } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepProgress } from '../../components/StepProgress';
import { InfoCard } from '../../components/InfoCard';
import { validatePickupWindow, parseTimeText } from '../../utils/time';

const START_CHIPS = ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'];
const END_CHIPS = ['7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM'];

export default function PickupScreen() {
  const router = useRouter();
  const { bag, setPickupDetails } = useMerchantStore();
  const { pickupStart, pickupEnd, quantity } = bag;

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeInput, setActiveInput] = useState<'start' | 'end' | null>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Validate start time format
    if (!pickupStart || !pickupStart.trim()) {
      newErrors.pickupStart = 'Start time is required';
    } else if (!parseTimeText(pickupStart)) {
      newErrors.pickupStart = 'Invalid format (e.g. 6:00 PM)';
    }

    // Validate end time format
    if (!pickupEnd || !pickupEnd.trim()) {
      newErrors.pickupEnd = 'End time is required';
    } else if (!parseTimeText(pickupEnd)) {
      newErrors.pickupEnd = 'Invalid format (e.g. 9:00 PM)';
    }

    // Validate window if both times are parseable
    if (!newErrors.pickupStart && !newErrors.pickupEnd) {
      const result = validatePickupWindow(pickupStart, pickupEnd);
      if (!result.valid) {
        newErrors.pickupEnd = result.error || 'Invalid pickup window';
      }
    }

    // Validate quantity
    const rawQty = quantity?.trim() || '';
    if (!rawQty) {
      newErrors.quantity = 'Quantity is required';
    } else {
      const qty = parseInt(rawQty, 10);
      if (isNaN(qty) || qty.toString() !== rawQty) {
        newErrors.quantity = 'Must be a whole number';
      } else if (qty < 1) {
        newErrors.quantity = 'Minimum 1 bag';
      } else if (qty > 99) {
        newErrors.quantity = 'Maximum 99 bags';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      router.push('/add-bag/review');
    } else {
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
    }
  };

  const handleChipPress = (time: string) => {
    if (activeInput === 'start') {
      setPickupDetails({ pickupStart: time });
      setErrors(prev => ({ ...prev, pickupStart: '' }));
    } else if (activeInput === 'end') {
      setPickupDetails({ pickupEnd: time });
      setErrors(prev => ({ ...prev, pickupEnd: '' }));
    }
  };

  const activeChips = activeInput === 'end' ? END_CHIPS : START_CHIPS;
  const chipLabel = activeInput === 'end' ? 'Tap to set end time:' : 'Tap to set start time:';

  return (
    <ScreenContainer
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
        />
      }
    >
      <ScreenHeader title="Step 3 of 4" />

      <View style={styles.content}>
        <StepProgress current={3} total={4} />

        <Text style={styles.title}>Pickup & Quantity</Text>
        <Text style={styles.subtitle}>Set when customers can grab these bags and how many you have.</Text>

        <View style={styles.form}>
          <View style={styles.timeSection}>
            <View style={styles.row}>
              <InputField
                label="Pickup start time"
                placeholder="e.g. 6:00 PM"
                value={pickupStart}
                onChangeText={(text) => {
                  setPickupDetails({ pickupStart: text });
                  setErrors(prev => ({ ...prev, pickupStart: '', pickupEnd: errors.pickupEnd?.includes('window') ? '' : prev.pickupEnd }));
                }}
                onFocus={() => setActiveInput('start')}
                required
                error={errors.pickupStart}
                containerStyle={{ flex: 1 }}
              />

              <InputField
                label="Pickup end time"
                placeholder="e.g. 9:00 PM"
                value={pickupEnd}
                onChangeText={(text) => {
                  setPickupDetails({ pickupEnd: text });
                  setErrors(prev => ({ ...prev, pickupEnd: '' }));
                }}
                onFocus={() => setActiveInput('end')}
                required
                error={errors.pickupEnd}
                containerStyle={{ flex: 1 }}
              />
            </View>

            {activeInput && (
              <View style={styles.chipSection}>
                <Text style={styles.chipLabel}>{chipLabel}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  <View style={styles.chipsContainer}>
                    {activeChips.map(time => {
                      const isActive =
                        (activeInput === 'start' && pickupStart === time) ||
                        (activeInput === 'end' && pickupEnd === time);
                      return (
                        <TouchableOpacity
                          key={time}
                          style={[styles.chip, isActive && styles.chipActive]}
                          onPress={() => handleChipPress(time)}
                        >
                          <Text style={[styles.chipText, isActive && styles.chipTextActive]}>{time}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
              </View>
            )}
          </View>

          <InfoCard
            icon={<Info size={18} color={Colors.goldenAmber} />}
            message="Customers can only reserve and collect their bags during this window. Typical windows are 2–3 hours in the evening."
            variant="warning"
          />

          <InputField
            label="Quantity available"
            placeholder="e.g. 5"
            keyboardType="number-pad"
            maxLength={2}
            value={quantity}
            onChangeText={(text) => {
              // Only allow digits
              const cleaned = text.replace(/[^0-9]/g, '');
              setPickupDetails({ quantity: cleaned });
              setErrors(prev => ({ ...prev, quantity: '' }));
            }}
            required
            error={errors.quantity}
            helperText="How many bags of this type do you have today?"
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 32,
    color: Colors.deepEspresso,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.warmStone,
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  timeSection: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  chipSection: {
    gap: 8,
  },
  chipLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.warmStone,
  },
  chipsScroll: {
    marginHorizontal: -24,
  },
  chipsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 10,
  },
  chip: {
    backgroundColor: Colors.offWhite,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.forestGreen,
    borderColor: Colors.forestGreen,
  },
  chipText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.deepEspresso,
  },
  chipTextActive: {
    color: Colors.offWhite,
  },
});
