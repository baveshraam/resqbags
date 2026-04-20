import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle2, Calendar, MapPin, Copy, Hop as Home } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const ORDER_ID = 'RQB-20250420-8471';
const PICKUP_PIN = '7842';
const PICKUP_TIME = 'Today, 7:30 PM – 9:00 PM';
const PICKUP_ADDRESS = '12 Church Street, Indiranagar, Bengaluru';

export default function SuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, bounciness: 15 }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(confettiAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(confettiAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Confetti dots */}
        <View style={styles.confettiArea} pointerEvents="none">
          {[...Array(8)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.confettiDot,
                {
                  left: `${10 + i * 12}%`,
                  backgroundColor: i % 3 === 0 ? Colors.sageGreen : i % 3 === 1 ? Colors.goldenAmber : Colors.softCoral,
                  opacity: confettiAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.8, 0.3, 0.8] }),
                  transform: [
                    {
                      translateY: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, i % 2 === 0 ? -20 : -35],
                      }),
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>

        {/* Check Icon */}
        <View style={styles.checkWrapper}>
          <Animated.View style={[styles.checkCircleOuter, { transform: [{ scale: checkScale }] }]}>
            <View style={styles.checkCircleInner}>
              <CheckCircle2 size={48} color={Colors.offWhite} />
            </View>
          </Animated.View>
        </View>

        {/* Headline */}
        <Animated.View style={[styles.headlineArea, { opacity: contentOpacity }]}>
          <Text style={styles.headline}>You're a Food Rescuer!</Text>
          <Text style={styles.subline}>Thank you for making a difference tonight. One bag at a time, we change the world.</Text>
        </Animated.View>

        {/* Order Card */}
        <Animated.View style={[styles.orderCard, { opacity: contentOpacity }]}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <TouchableOpacity style={styles.copyRow}>
              <Text style={styles.orderId}>{ORDER_ID}</Text>
              <Copy size={14} color={Colors.sageGreen} />
            </TouchableOpacity>
          </View>

          {/* QR Placeholder */}
          <View style={styles.qrContainer}>
            <View style={styles.qrMock}>
              <View style={styles.qrInner}>
                <Text style={styles.qrText}>QR Code</Text>
                <Text style={styles.qrSubText}>Show at restaurant</Text>
              </View>
            </View>
          </View>

          {/* PIN */}
          <View style={styles.pinContainer}>
            <Text style={styles.pinLabel}>Backup PIN</Text>
            <View style={styles.pinBoxes}>
              {PICKUP_PIN.split('').map((digit, i) => (
                <View key={i} style={styles.pinBox}>
                  <Text style={styles.pinDigit}>{digit}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.pickupInfoCard}>
            <View style={styles.pickupRow}>
              <Calendar size={15} color={Colors.sageGreen} />
              <View>
                <Text style={styles.pickupInfoLabel}>Pickup Time</Text>
                <Text style={styles.pickupInfoValue}>{PICKUP_TIME}</Text>
              </View>
            </View>
            <View style={styles.pickupDivider} />
            <View style={styles.pickupRow}>
              <MapPin size={15} color={Colors.sageGreen} />
              <View style={{ flex: 1 }}>
                <Text style={styles.pickupInfoLabel}>Address</Text>
                <Text style={styles.pickupInfoValue}>{PICKUP_ADDRESS}</Text>
              </View>
            </View>
          </View>

          <View style={styles.reminderBox}>
            <Text style={styles.reminderText}>Show this screen at the restaurant. Enjoy your meal and feel good about your rescue!</Text>
          </View>
        </Animated.View>

        {/* Impact */}
        <Animated.View style={[styles.impactCard, { opacity: contentOpacity }]}>
          <Text style={styles.impactTitle}>Your Rescue Impact</Text>
          <View style={styles.impactRow}>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>2.3kg</Text>
              <Text style={styles.impactLabel}>CO₂ Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>₹250</Text>
              <Text style={styles.impactLabel}>Money Saved</Text>
            </View>
            <View style={styles.impactItem}>
              <Text style={styles.impactValue}>1</Text>
              <Text style={styles.impactLabel}>Meal Rescued</Text>
            </View>
          </View>
          <Text style={styles.impactNote}>That's like charging your phone 280 times. Small action, big heart.</Text>
        </Animated.View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace('/')}
          activeOpacity={0.85}
        >
          <Home size={18} color={Colors.offWhite} />
          <Text style={styles.homeBtnText}>Back to Home</Text>
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
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    alignItems: 'center',
  },
  confettiArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    flexDirection: 'row',
  },
  confettiDot: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 20,
  },
  checkWrapper: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: 'center',
  },
  checkCircleOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.mintGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineArea: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headline: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    textAlign: 'center',
    marginBottom: 8,
  },
  subline: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 10,
  },
  orderCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  orderIdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderIdLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  copyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderId: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrMock: {
    width: 160,
    height: 160,
    borderRadius: 16,
    backgroundColor: Colors.softBeige,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  qrInner: {
    alignItems: 'center',
  },
  qrText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  qrSubText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 4,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pinLabel: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginBottom: 10,
  },
  pinBoxes: {
    flexDirection: 'row',
    gap: 10,
  },
  pinBox: {
    width: 52,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.softBeige,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pinDigit: {
    fontSize: 24,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  pickupInfoCard: {
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pickupInfoLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  pickupInfoValue: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
    marginTop: 1,
  },
  pickupDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  reminderBox: {
    backgroundColor: Colors.mintGlow,
    borderRadius: 12,
    padding: 12,
  },
  reminderText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.forestGreen,
    textAlign: 'center',
    lineHeight: 19,
  },
  impactCard: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
    marginBottom: 16,
    textAlign: 'center',
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  impactLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.sageLight,
    marginTop: 2,
    textAlign: 'center',
  },
  impactNote: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.sageLight,
    textAlign: 'center',
    lineHeight: 19,
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
  homeBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  homeBtnText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
