import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Search, ShoppingCart, CreditCard, Package } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

const steps = [
  { icon: Search, label: 'Find a Bag', desc: 'Browse restaurants near you with surplus food ready to rescue.' },
  { icon: ShoppingCart, label: 'Reserve It', desc: 'Add to cart and choose your pickup window — quick and easy.' },
  { icon: CreditCard, label: 'Pay Securely', desc: 'Pay with UPI, card or wallet in just a few taps.' },
  { icon: Package, label: 'Pick It Up', desc: 'Show your QR code, collect your rescue, and enjoy!' },
];

export function HowItWorks() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>The Rescue Ritual</Text>
      <Text style={styles.sub}>Four simple steps to save food and feel great.</Text>
      <View style={styles.steps}>
        {steps.map((step, idx) => (
          <View key={idx} style={styles.step}>
            <View style={styles.iconCircle}>
              <step.icon size={22} color={Colors.forestGreen} />
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    backgroundColor: Colors.softBeige,
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  heading: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 4,
  },
  sub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginBottom: 20,
  },
  steps: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.mintGlow,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepText: {
    flex: 1,
    paddingTop: 2,
  },
  stepLabel: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 3,
  },
  stepDesc: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 18,
  },
});
