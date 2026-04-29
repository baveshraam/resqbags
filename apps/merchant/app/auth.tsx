import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { PrimaryButton } from '../components/PrimaryButton';
import { ScreenContainer } from '../components/ScreenContainer';
import { ScreenHeader } from '../components/ScreenHeader';
import { InputField } from '../components/InputField';

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validate = () => {
    let isValid = true;
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    return isValid;
  };

  const handleLogin = () => {
    if (validate()) {
      router.push('/dashboard');
    } else {
      Alert.alert('Invalid details', 'Please fix the errors before continuing.');
    }
  };

  return (
    <ScreenContainer 
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 0 }}
      footer={
        <PrimaryButton 
          title="Continue" 
          onPress={handleLogin} 
        />
      }
    >
      <ScreenHeader />

      <View style={styles.content}>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to manage your restaurant's rescue bags</Text>

        <View style={styles.card}>
          <Text style={styles.helperText}>Use this for demo access for now</Text>
          <View style={styles.form}>
            <InputField
              label="Email"
              placeholder="owner@restaurant.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              required
              error={emailError}
            />

            <InputField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              required
              error={passwordError}
            />
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 36,
    color: Colors.deepEspresso,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
    color: Colors.warmStone,
    marginBottom: 32,
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
  helperText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: Colors.forestGreen,
    marginBottom: 20,
    backgroundColor: Colors.sageLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    overflow: 'hidden',
    textAlign: 'center',
  },
  form: {
    gap: 20,
  },
});
