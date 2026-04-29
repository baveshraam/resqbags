import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, MapPin, Clock, CreditCard, Smartphone, Wallet, CircleCheck as CheckCircle2, Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { useCart } from '@/store/CartContext';
import { supabase } from '@/lib/supabase';
import { Alert, ActivityIndicator } from 'react-native';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI', desc: 'Pay via any UPI app', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', desc: 'Paytm, PhonePe, Amazon Pay', icon: Wallet },
];


export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, totalAmount, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [isReserving, setIsReserving] = useState(false);

  const total = totalAmount;

  const handleConfirm = async () => {
    if (items.length === 0 || isReserving) return;
    const item = items[0];
    const bagId = item?.bag?.id;
    if (!bagId) {
      Alert.alert('Reservation Failed', 'This bag is no longer available.');
      return;
    }
    
    setIsReserving(true);
    try {
      const { data: latest, error: latestError } = await supabase
        .from('bag_instances')
        .select('id, status, quantity_available, pickup_end')
        .eq('id', bagId)
        .single();

      if (latestError || !latest) {
        Alert.alert('This bag is no longer available');
        return;
      }

      if (latest.status !== 'ACTIVE') {
        Alert.alert('This bag is no longer available');
        return;
      }

      if ((latest.quantity_available ?? 0) <= 0) {
        Alert.alert('Sold out');
        return;
      }

      if (latest.pickup_end && new Date(latest.pickup_end).getTime() <= Date.now()) {
        Alert.alert('Pickup window expired');
        return;
      }

      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      // TODO: Integrate UPI/Razorpay payment confirmation here.
      // NOTE: This demo profile must exist in the profiles table.
      // Run SQL: INSERT INTO profiles (id) VALUES ('11111111-1111-1111-1111-111111111111') ON CONFLICT DO NOTHING;
      const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';
      const { data, error } = await supabase.rpc('reserve_bag', {
        p_bag_instance_id: bagId,
        p_customer_profile_id: TEMP_USER_ID,
        p_quantity: quantity,
      });

      if (error) {
        console.error('Reserve failed:', error);
        // 409 Conflict typically means the RPC raised an exception
        const msg = error.message || '';
        if (msg.includes('Not enough quantity') || error.code === '409') {
          throw new Error('This bag is no longer available or was already reserved.');
        }
        if (msg.includes('profile') || msg.includes('foreign key')) {
          throw new Error('Demo profile not found. Please create the demo profile row in the database.');
        }
        throw error;
      }

      // RPC may return array or object — handle both
      const result = Array.isArray(data) ? data[0] : data;
      if (result && result.success === false) {
        throw new Error(result.message || 'Failed to reserve bag.');
      }

      clearCart();
      router.replace({
        pathname: '/success',
        params: {
          pickupCode: result?.pickup_code,
          totalAmount: result?.total_amount,
          pickupStart: item.bag.pickupStart,
          pickupEnd: item.bag.pickupEnd,
          pickupAddress: item.bag.restaurant.address,
          orderId: result?.order_id,
        },
      });
    } catch (err: any) {
      Alert.alert('Reservation Failed', err.message || 'We could not reserve this bag. It may have sold out.');
    } finally {
      setIsReserving(false);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.deepEspresso} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Pickup Details</Text>

        <View style={styles.pickupCard}>
          <View style={styles.pickupRow}>
            <MapPin size={16} color={Colors.sageGreen} />
            <View style={styles.pickupInfo}>
              <Text style={styles.pickupLabel}>Pickup Location</Text>
              {items[0] && <Text style={styles.pickupValue}>{items[0].bag.restaurant.address}</Text>}
            </View>
          </View>
          <View style={styles.pickupDivider} />
          <View style={styles.pickupRow}>
            <Clock size={16} color={Colors.sageGreen} />
            <View style={styles.pickupInfo}>
              <Text style={styles.pickupLabel}>Pickup Window</Text>
              {items[0] && <Text style={styles.pickupValue}>Today, {items[0].bag.pickupStart} – {items[0].bag.pickupEnd}</Text>}
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Order Summary</Text>

        <View style={styles.orderCard}>
          {items.map(item => (
            <View key={item.bag.id} style={styles.orderItem}>
              <Image source={{ uri: item.bag.imageUrl }} style={styles.orderImage} />
              <View style={styles.orderInfo}>
                <Text style={styles.orderName}>{item.bag.name}</Text>
                <Text style={styles.orderRest}>{item.bag.restaurant.name}</Text>
              </View>
              <Text style={styles.orderPrice}>₹{item.bag.rescuePrice * item.quantity}</Text>
            </View>
          ))}

          <View style={styles.orderDivider} />
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSumLabel}>Bag price</Text>
            <Text style={styles.orderSumValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderSumLabel}>Taxes/charges</Text>
            <Text style={styles.orderSumValue}>Calculated at final payment</Text>
          </View>
          <View style={styles.orderDivider} />
          <View style={styles.orderSummaryRow}>
            <Text style={styles.orderTotalLabel}>Total (demo)</Text>
            <Text style={styles.orderTotalValue}>₹{total}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>

        <View style={styles.paymentCards}>
          {PAYMENT_METHODS.map(method => {
            const IconComp = method.icon;
            const active = selectedPayment === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentCard,
                  method.id === 'upi' && styles.paymentCardPrimary,
                  active && styles.paymentCardActive,
                ]}
                onPress={() => setSelectedPayment(method.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.paymentIconBox, active && styles.paymentIconBoxActive]}>
                  <IconComp size={20} color={active ? Colors.offWhite : Colors.warmStone} />
                </View>
                <View style={styles.paymentInfo}>
                  <Text style={[styles.paymentLabel, active && styles.paymentLabelActive]}>{method.label}</Text>
                  <Text style={styles.paymentDesc}>{method.desc}</Text>
                </View>
                {active && <CheckCircle2 size={20} color={Colors.sageGreen} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.demoPaymentNote}>Demo payment flow — real UPI/Razorpay integration comes next.</Text>

        <View style={styles.goodNote}>
          <Leaf size={16} color={Colors.sageGreen} />
          <Text style={styles.goodNoteText}>You're saving food and the planet. Thank you for being part of this.</Text>
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={[styles.confirmBtn, isReserving && { opacity: 0.7 }]} 
          onPress={handleConfirm} 
          activeOpacity={0.85}
          disabled={isReserving}
        >
          {isReserving ? (
            <ActivityIndicator color={Colors.offWhite} size="small" />
          ) : (
            <Text style={styles.confirmBtnText}>Confirm & Rescue · ₹{total}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 12,
    marginTop: 4,
  },
  pickupCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pickupInfo: {
    flex: 1,
  },
  pickupLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginBottom: 2,
  },
  pickupValue: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
    lineHeight: 20,
  },
  pickupDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  orderCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderImage: {
    width: 52,
    height: 52,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  orderInfo: {
    flex: 1,
  },
  orderName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  orderRest: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  orderPrice: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  orderDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  orderSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderSumLabel: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  orderSumValue: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
  },
  orderTotalLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  orderTotalValue: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  paymentCards: {
    gap: 10,
    marginBottom: 20,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  paymentCardPrimary: {
    borderColor: Colors.sageGreen,
  },
  paymentCardActive: {
    borderColor: Colors.sageGreen,
    borderWidth: 2,
    backgroundColor: Colors.successBg,
  },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.softBeige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentIconBoxActive: {
    backgroundColor: Colors.sageGreen,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  paymentLabelActive: {
    color: Colors.forestGreen,
  },
  paymentDesc: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 1,
  },
  goodNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  demoPaymentNote: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: -6,
    marginBottom: 12,
    textAlign: 'center',
  },
  goodNoteText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 19,
    flex: 1,
    fontStyle: 'italic',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.offWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmBtn: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
