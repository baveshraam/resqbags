import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Store, Leaf, Users } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { SecondaryButton } from '../components/SecondaryButton';
import { ScreenContainer } from '../components/ScreenContainer';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <ScreenContainer 
      scrollable={true}
      footer={
        <View style={styles.footerStack}>
          <PrimaryButton 
            title="Get Started" 
            onPress={() => router.push('/onboarding/restaurant')} 
          />
          <SecondaryButton 
            title="I already have a restaurant" 
            onPress={() => router.push('/auth')} 
          />
        </View>
      }
    >
      <View style={styles.content}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>For restaurants & cafés</Text>
        </View>
        <Text style={styles.headline}>Start rescuing with your kitchen</Text>
        <Text style={styles.subtitle}>
          Turn surplus food into rescue bags customers can discover and pick up.
        </Text>

        <View style={styles.benefitsList}>
          <View style={styles.benefitCard}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.sageLight }]}>
              <Store size={20} color={Colors.forestGreen} />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>Sell surplus food</Text>
              <Text style={styles.benefitDesc}>Recover costs on perfectly good food at the end of the day.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.amberLight }]}>
              <Leaf size={20} color={Colors.goldenAmber} />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>Reduce waste</Text>
              <Text style={styles.benefitDesc}>Make a positive environmental impact in your community.</Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={[styles.iconContainer, { backgroundColor: Colors.mintGlow }]}>
              <Users size={20} color={Colors.forestGreen} />
            </View>
            <View style={styles.benefitTextContainer}>
              <Text style={styles.benefitTitle}>Reach nearby customers</Text>
              <Text style={styles.benefitDesc}>Connect with eco-conscious locals who love your food.</Text>
            </View>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 20,
  },
  badge: {
    backgroundColor: Colors.sageLight,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  badgeText: {
    color: Colors.forestGreen,
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
  },
  headline: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 40,
    color: Colors.deepEspresso,
    marginBottom: 16,
    lineHeight: 48,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
    color: Colors.warmStone,
    lineHeight: 26,
    marginBottom: 40,
  },
  benefitsList: {
    gap: 16,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitTextContainer: {
    flex: 1,
  },
  benefitTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.deepEspresso,
    marginBottom: 4,
  },
  benefitDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
    lineHeight: 20,
  },
  footerStack: {
    gap: 16,
  },
});
