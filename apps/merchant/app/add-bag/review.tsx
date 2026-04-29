import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Package, Info, CheckCircle2, ShoppingBag } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { InfoCard } from '../../components/InfoCard';
import { StepProgress } from '../../components/StepProgress';
import { supabase } from '../../lib/supabase';
import { validatePickupWindow } from '../../utils/time';
import { calculateCustomerPrice } from '../../utils/pricing';

function getMerchantPrice(priceRange: string): number {
  if (!priceRange) return 0;
  const match = priceRange.match(/₹\d+–₹(\d+)/);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

function formatPriceRange(priceRange: string): string {
  if (!priceRange) return '—';
  return priceRange;
}

export default function ReviewScreen() {
  const router = useRouter();
  const { bag, restaurant, resetBag } = useMerchantStore();
  const [isLoading, setIsLoading] = useState(false);
  const [published, setPublished] = useState(false);
  // Keep a snapshot of bag data so the review card stays visible after publish
  const bagSnapshot = useRef(bag);
  const priceSnapshot = useRef({ merchantPrice: 0, resqMargin: 0, customerPrice: 0, payout: 0 });

  const merchantPrice = getMerchantPrice(bag.priceRange);
  const resqMargin = merchantPrice * 0.10;
  const customerPrice = calculateCustomerPrice(merchantPrice);
  const payout = merchantPrice - resqMargin;

  // Pre-validate for display
  const timeResult = validatePickupWindow(bag.pickupStart, bag.pickupEnd);
  const qty = parseInt(bag.quantity, 10);
  const qtyValid = !isNaN(qty) && qty >= 1 && qty <= 99;

  const handlePublish = async () => {
    setIsLoading(true);
    try {
      // === Guard: restaurant must exist ===
      const finalRestaurantId = restaurant.restaurantId;
      if (!finalRestaurantId) {
        Alert.alert(
          'Restaurant Required',
          'No restaurant found. Please complete onboarding first.',
          [{ text: 'Go to Onboarding', onPress: () => router.replace('/onboarding/restaurant') }]
        );
        setIsLoading(false);
        return;
      }

      // === Guard: all bag fields must be valid ===
      const validationErrors: string[] = [];

      if (!bag.title || bag.title.trim().length < 3) {
        validationErrors.push('• Bag title is too short (min 3 chars)');
      }
      if (!bag.description || bag.description.trim().length < 10) {
        validationErrors.push('• Description is too short (min 10 chars)');
      }
      if (!bag.priceRange) {
        validationErrors.push('• Price range is not selected');
      }
      if (merchantPrice <= 0) {
        validationErrors.push('• Could not determine merchant price');
      }

      // === Guard: time window must be valid ===
      if (!timeResult.valid) {
        validationErrors.push(`• Pickup time: ${timeResult.error || 'invalid'}`);
      }

      // === Guard: quantity ===
      if (!qtyValid) {
        validationErrors.push('• Quantity must be between 1 and 99');
      }

      if (validationErrors.length > 0) {
        Alert.alert(
          'Cannot Publish',
          'Please fix these issues:\n\n' + validationErrors.join('\n'),
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return;
      }

      // === Build clean payload ===
      const bagPayload = {
        restaurant_id: finalRestaurantId,
        title: bag.title.trim(),
        description: bag.description.trim(),
        possible_contents: bag.contents ? bag.contents.trim() : null,
        price_range: bag.priceRange,
        merchant_price: merchantPrice,
        platform_fee_percent: 10,
        pickup_start: timeResult.startISO!,
        pickup_end: timeResult.endISO!,
        quantity_total: qty,
        quantity_available: qty,
        status: 'ACTIVE',
      };

      const { data, error: bagError } = await supabase
        .from('bag_instances')
        .insert(bagPayload)
        .select();

      if (bagError) {
        console.error('Publish failed:', bagError);
        Alert.alert('Database Error', bagError.message);
        setIsLoading(false);
        return;
      }

      // Snapshot the bag data before any reset so the UI stays intact
      bagSnapshot.current = { ...bag };
      priceSnapshot.current = { merchantPrice, resqMargin, customerPrice, payout };

      // Show in-screen success card (Alert.alert is unreliable on Expo Web)
      setPublished(true);
    } catch (error: any) {
      console.error('Publish failed:', error);
      Alert.alert('Error', error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    resetBag();
    router.replace('/dashboard');
  };

  // --- Published success screen ---
  if (published) {
    const snap = bagSnapshot.current;
    return (
      <ScreenContainer
        scrollable={true}
        contentContainerStyle={{ paddingHorizontal: 0 }}
        footer={
          <PrimaryButton
            title="Go to Dashboard"
            onPress={handleGoToDashboard}
          />
        }
      >
        <View style={styles.content}>
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckCircle2 size={32} color={Colors.forestGreen} />
            </View>
            <Text style={styles.successTitle}>Bag Published</Text>
            <Text style={styles.successMessage}>Your rescue bag is now live for customers.</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View style={styles.bagIconCircle}>
                <ShoppingBag size={20} color={Colors.forestGreen} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.bagTitle}>{snap.title || '—'}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{formatPriceRange(snap.priceRange)}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.bagDescription}>{snap.description || '—'}</Text>
          </View>
        </View>
      </ScreenContainer>
    );
  }

  // --- Normal review screen ---
  return (
    <ScreenContainer
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton
          title="Publish Bag"
          onPress={handlePublish}
          disabled={isLoading}
          loading={isLoading}
        />
      }
    >
      <ScreenHeader title="Step 4 of 4" />

      <View style={styles.content}>
        <StepProgress current={4} total={4} />

        <Text style={styles.title}>Review & publish</Text>
        <Text style={styles.subtitle}>Make sure everything looks right before it goes live to customers.</Text>

        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.bagIconCircle}>
              <ShoppingBag size={20} color={Colors.forestGreen} />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.bagTitle}>{bag.title || '—'}</Text>
              <View style={styles.priceTag}>
                <Text style={styles.priceText}>{formatPriceRange(bag.priceRange)}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.bagDescription}>{bag.description || '—'}</Text>

          {bag.contents ? (
            <View style={styles.contentsRow}>
              <Text style={styles.contentsLabel}>May include:</Text>
              <Text style={styles.bagContents}>{bag.contents}</Text>
            </View>
          ) : null}

          <View style={styles.divider} />

          <View style={styles.detailsList}>
            <View style={styles.detailRow}>
              <View style={styles.detailIconCircle}>
                <Clock size={16} color={Colors.warmStone} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Pickup window</Text>
                <Text style={styles.detailValue}>
                  {bag.pickupStart || '—'}{' - '}{bag.pickupEnd || '—'}
                </Text>
              </View>
            </View>
            <View style={styles.detailRow}>
              <View style={styles.detailIconCircle}>
                <Package size={16} color={Colors.warmStone} />
              </View>
              <View style={styles.detailTextContainer}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailValue}>{bag.quantity || '0'} bags available</Text>
              </View>
            </View>
          </View>

          {!timeResult.valid && bag.pickupStart && bag.pickupEnd ? (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>{timeResult.error}</Text>
            </View>
          ) : null}
        </View>

        {/* Price Breakdown */}
        <Text style={styles.sectionTitle}>Price Breakdown</Text>
        <View style={styles.pricingCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Selected range</Text>
            <Text style={styles.priceVal}>{formatPriceRange(bag.priceRange)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Estimated customer price</Text>
            <Text style={styles.priceVal}>₹{customerPrice}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>ResQBag margin (10%)</Text>
            <Text style={[styles.priceVal, { color: Colors.terracotta }]}>-₹{resqMargin.toFixed(0)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Merchant price (upper bound)</Text>
            <Text style={styles.priceVal}>₹{merchantPrice}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.payoutLabel}>Your estimated payout</Text>
            <Text style={styles.payoutValue}>₹{payout.toFixed(0)}</Text>
          </View>
        </View>

        <InfoCard
          icon={<Info size={18} color={Colors.sageGreen} />}
          message="ResQBag margin is applied automatically. Payouts will be processed to your registered payout account after pickup confirmation."
          variant="info"
          style={{ marginBottom: 32 }}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
  },
  successCard: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  successIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: Colors.deepEspresso,
    marginBottom: 8,
  },
  successMessage: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 24,
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
    marginBottom: 24,
    lineHeight: 26,
  },
  summaryCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 28,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 14,
  },
  bagIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    gap: 8,
  },
  bagTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.deepEspresso,
    lineHeight: 26,
  },
  priceTag: {
    backgroundColor: Colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.mintGlow,
  },
  priceText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: Colors.forestGreen,
  },
  bagDescription: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.warmStone,
    lineHeight: 22,
    marginBottom: 4,
  },
  contentsRow: {
    marginTop: 8,
    gap: 4,
  },
  contentsLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.warmTaupe,
  },
  bagContents: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
  },
  detailsList: {
    gap: 14,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.softBeige,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailTextContainer: {
    flex: 1,
    gap: 2,
  },
  detailLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.warmTaupe,
  },
  detailValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.deepEspresso,
  },
  warningBanner: {
    marginTop: 16,
    backgroundColor: Colors.errorBg,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.softCoral,
  },
  warningText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.terracotta,
    lineHeight: 18,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.deepEspresso,
    marginBottom: 12,
  },
  pricingCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
  },
  priceVal: {
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
    color: Colors.deepEspresso,
  },
  payoutLabel: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.deepEspresso,
  },
  payoutValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: Colors.forestGreen,
  },
  customerLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.warmStone,
  },
  customerValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.deepEspresso,
  },
});
