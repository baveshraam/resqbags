import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { MapPin } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepProgress } from '../../components/StepProgress';
import { supabase } from '../../lib/supabase';

export default function LocationScreen() {
  const router = useRouter();
  const { restaurant, setLocation, setRestaurantId } = useMerchantStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const { address } = restaurant;

  const validate = () => {
    if (!address || address.length < 8) {
      setError('Please enter a full, valid address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSave = async () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
      return;
    }

    // If restaurant already exists in this session, skip insert
    if (restaurant.restaurantId) {
      router.push('/dashboard');
      return;
    }

    setIsSaving(true);
    try {
      const { data, error: sbError } = await supabase
        .from('restaurants')
        .insert({
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          owner_name: restaurant.ownerName,
          phone: restaurant.phone,
          address_line: address,
          status: 'PENDING_REVIEW',
          is_live: true
        })
        .select()
        .single();

      if (sbError) {
        console.error('Supabase error:', sbError);
        Alert.alert('Error', sbError.message);
        return;
      }
      
      setRestaurantId(data.id);
      Alert.alert('Success', 'Restaurant onboarding complete!');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Restaurant save error:', err);
      Alert.alert('Error', err.message || 'Could not save restaurant');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton
          title="Save Restaurant"
          disabled={isSaving}
          loading={isSaving}
          onPress={handleSave}
        />
      }
    >
      <ScreenHeader title="Step 2 of 2" />

      <View style={styles.content}>
        <StepProgress current={2} total={2} />

        <Text style={styles.title}>Where are you located?</Text>
        <Text style={styles.subtitle}>Customers need to know where to pick up their rescue bags.</Text>

        <View style={styles.card}>
          <View style={styles.mapIconWrapper}>
            <MapPin size={24} color={Colors.forestGreen} />
            <Text style={styles.mapTitle}>Pickup Location</Text>
          </View>
          <Text style={styles.mapDesc}>
            Location verification (Google Maps) will be added later. For now, enter the exact pickup address customers should visit.
          </Text>

          <InputField
            label="Full restaurant address"
            placeholder="Street address, City, ZIP code"
            value={address}
            onChangeText={(text) => {
              setLocation(text);
              setError('');
            }}
            multiline
            required
            error={error}
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
    gap: 16,
  },
  mapIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  mapTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.deepEspresso,
  },
  mapDesc: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
    lineHeight: 20,
    backgroundColor: Colors.sageLight,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});
