import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { PriceRangeCard } from '../../components/PriceRangeCard';
import { StepProgress } from '../../components/StepProgress';

const PRICE_RANGES = [
  { range: '₹100–₹200', desc: 'Small snacks / bakery' },
  { range: '₹200–₹300', desc: 'Regular meal box' },
  { range: '₹300–₹400', desc: 'Premium meal box' },
  { range: '₹400–₹500', desc: 'Biryani / large box' },
];

export default function PriceScreen() {
  const router = useRouter();
  const { bag, setPriceRange } = useMerchantStore();
  const { priceRange: selectedRange } = bag;

  return (
    <ScreenContainer
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton
          title="Continue"
          disabled={!selectedRange}
          onPress={() => router.push('/add-bag/details')}
        />
      }
    >
      <ScreenHeader title="Step 1 of 4" />

      <View style={styles.content}>
        <StepProgress current={1} total={4} />

        <Text style={styles.title}>Set bag value</Text>
        <Text style={styles.subtitle}>
          Choose the approximate value range of this surprise bag. Customers pay a discounted price.
        </Text>

        <View style={styles.optionsContainer}>
          {PRICE_RANGES.map((item) => (
            <PriceRangeCard
              key={item.range}
              range={item.range}
              description={item.desc}
              selected={selectedRange === item.range}
              onPress={() => setPriceRange(item.range)}
            />
          ))}
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
    fontSize: 36,
    color: Colors.deepEspresso,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
    color: Colors.warmStone,
    marginBottom: 32,
    lineHeight: 26,
  },
  optionsContainer: {
    gap: 14,
  },
});
