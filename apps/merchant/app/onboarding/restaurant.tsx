import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepProgress } from '../../components/StepProgress';

export default function RestaurantDetailsScreen() {
  const router = useRouter();
  const { restaurant, setRestaurantDetails } = useMerchantStore();
  const { name, cuisine, ownerName, phone } = restaurant;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!name || name.length < 2) newErrors.name = 'Restaurant name must be at least 2 characters';
    if (!cuisine) newErrors.cuisine = 'Cuisine is required';
    if (!ownerName || ownerName.trim().length < 2) newErrors.ownerName = 'Contact name must be at least 2 characters';
    if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ''))) newErrors.phone = 'Phone must be 10 digits';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      router.push('/onboarding/location');
    } else {
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
    }
  };

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton
          title="Continue"
          onPress={handleContinue}
        />
      }
    >
      <ScreenHeader title="Step 1 of 2" />

      <View style={styles.content}>
        <StepProgress current={1} total={2} />

        <Text style={styles.title}>Tell us about your restaurant</Text>
        <Text style={styles.subtitle}>We need these details to verify your business and get you set up.</Text>

        <View style={styles.card}>
          <View style={styles.form}>
            <InputField
              label="Restaurant name"
              placeholder="e.g. The Green Kitchen"
              value={name}
              onChangeText={(text) => {
                setRestaurantDetails({ name: text });
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              required
              error={errors.name}
            />

            <InputField
              label="Cuisine type"
              placeholder="e.g. Italian, Bakery, Cafe"
              value={cuisine}
              onChangeText={(text) => {
                setRestaurantDetails({ cuisine: text });
                setErrors(prev => ({ ...prev, cuisine: '' }));
              }}
              required
              error={errors.cuisine}
            />

            <InputField
              label="Owner/Contact name"
              placeholder="e.g. Jane Doe"
              value={ownerName}
              onChangeText={(text) => {
                setRestaurantDetails({ ownerName: text });
                setErrors(prev => ({ ...prev, ownerName: '' }));
              }}
              required
              error={errors.ownerName}
            />

            <InputField
              label="Phone number"
              placeholder="10 digit number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={(text) => {
                setRestaurantDetails({ phone: text });
                setErrors(prev => ({ ...prev, phone: '' }));
              }}
              required
              error={errors.phone}
            />
          </View>
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
    marginBottom: 24,
    lineHeight: 26,
  },
  card: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 32,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  form: {
    gap: 20,
  },
});
