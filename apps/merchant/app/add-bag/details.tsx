import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Image as ImageIcon } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useMerchantStore } from '../../store/useMerchantStore';
import { ScreenContainer } from '../../components/ScreenContainer';
import { ScreenHeader } from '../../components/ScreenHeader';
import { InputField } from '../../components/InputField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { StepProgress } from '../../components/StepProgress';

export default function DetailsScreen() {
  const router = useRouter();
  const { bag, setBagDetails } = useMerchantStore();
  const { title, description, contents } = bag;

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!title || title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters';
    if (!description || description.trim().length < 10) newErrors.description = 'Description must be at least 10 characters';
    if (!contents || contents.trim().length < 3) newErrors.contents = 'Please list some possible contents';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validate()) {
      router.push('/add-bag/pickup');
    } else {
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
    }
  };

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
      <ScreenHeader title="Step 2 of 4" />

      <View style={styles.content}>
        <StepProgress current={2} total={4} />

        <Text style={styles.title}>Bag details</Text>
        <Text style={styles.subtitle}>Describe what customers might receive. Exact contents can vary.</Text>

        <View style={styles.form}>
          <InputField
            label="Bag title"
            placeholder="e.g. Dinner Surprise Bag"
            value={title}
            onChangeText={(text) => {
              setBagDetails({ title: text });
              setErrors(prev => ({ ...prev, title: '' }));
            }}
            required
            error={errors.title}
            helperText="Give it an appetising name that builds excitement"
          />

          <InputField
            label="Short description"
            placeholder="e.g. May include rice, curry, sides and a dessert"
            value={description}
            onChangeText={(text) => {
              setBagDetails({ description: text });
              setErrors(prev => ({ ...prev, description: '' }));
            }}
            multiline
            required
            error={errors.description}
            helperText="A brief, honest description builds trust with customers"
          />

          <InputField
            label="Possible contents"
            placeholder="e.g. Naan, dal makhani, paneer tikka, gulab jamun"
            value={contents}
            onChangeText={(text) => {
              setBagDetails({ contents: text });
              setErrors(prev => ({ ...prev, contents: '' }));
            }}
            multiline
            required
            error={errors.contents}
            helperText="List likely items. Exact contents can vary"
          />

          <View style={styles.imagePlaceholder}>
            <View style={styles.imageIconCircle}>
              <ImageIcon size={24} color={Colors.sageGreen} />
            </View>
            <Text style={styles.imageTitle}>Add a photo</Text>
            <Text style={styles.imageText}>Photo upload will be available soon. Bags with photos get 3× more rescues!</Text>
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
    gap: 20,
  },
  imagePlaceholder: {
    backgroundColor: Colors.softBeige,
    borderRadius: 16,
    padding: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    gap: 8,
    marginTop: 8,
  },
  imageIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  imageTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.deepEspresso,
  },
  imageText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
});
