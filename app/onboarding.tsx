import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Leaf, ArrowRight, Shield, CircleCheck as CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    title: 'Welcome to\nResQBag',
    subtitle: 'Rescue good food.\nSave big. Feel great.',
    body: 'Every day, tonnes of perfectly good food gets wasted by restaurants. You can change that — one rescue at a time.',
    bgColor: Colors.forestGreen,
    accent: Colors.sageLight,
    emoji: '🌿',
  },
  {
    title: 'Fresh food\nat 70% off.',
    subtitle: 'No tricks. No compromises.',
    body: 'Discover surprise bags from the best local restaurants, packed with today\'s freshest surplus — for a fraction of the price.',
    bgColor: Colors.softBeige,
    accent: Colors.forestGreen,
    emoji: '🎁',
  },
  {
    title: 'Join a community\nof conscious eaters.',
    subtitle: 'Together, we\'re making a difference.',
    body: '12,400 meals rescued and counting. Every bag you rescue plants a seed. Welcome to the movement.',
    bgColor: Colors.cream,
    accent: Colors.sageGreen,
    emoji: '🤝',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showAuth, setShowAuth] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const scrollRef = useRef<ScrollView>(null);
  const otpRefs = useRef<(TextInput | null)[]>([null, null, null, null]);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      const next = currentSlide + 1;
      setCurrentSlide(next);
      scrollRef.current?.scrollTo({ x: next * width, animated: true });
    } else {
      setShowAuth(true);
    }
  };

  const handleScroll = (e: any) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentSlide(idx);
  };

  const handleSendOTP = () => {
    if (phone.length >= 10) setOtpSent(true);
  };

  const handleOTPChange = (val: string, idx: number) => {
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 3) otpRefs.current[idx + 1]?.focus();
    if (newOtp.every(d => d !== '')) {
      setTimeout(() => router.replace('/'), 300);
    }
  };

  if (showAuth) {
    return (
      <KeyboardAvoidingView
        style={[styles.authRoot, { paddingTop: insets.top }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.authInner}>
          <View style={styles.authLogo}>
            <Leaf size={32} color={Colors.offWhite} />
          </View>
          <Text style={styles.authTitle}>
            {otpSent ? 'Enter OTP' : "Let's start rescuing together."}
          </Text>
          <Text style={styles.authSub}>
            {otpSent
              ? `We sent a 4-digit code to +91 ${phone}`
              : 'Enter your phone number to join the community.'}
          </Text>

          {!otpSent ? (
            <>
              <View style={styles.phoneInputRow}>
                <View style={styles.countryCode}>
                  <Text style={styles.countryCodeText}>+91</Text>
                </View>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="Mobile number"
                  placeholderTextColor={Colors.warmTaupe}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                  maxLength={10}
                />
              </View>
              <TouchableOpacity
                style={[styles.authBtn, phone.length < 10 && styles.authBtnDisabled]}
                onPress={handleSendOTP}
                disabled={phone.length < 10}
                activeOpacity={0.85}
              >
                <Text style={styles.authBtnText}>Send OTP</Text>
                <ArrowRight size={18} color={Colors.offWhite} />
              </TouchableOpacity>

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleBtn}
                onPress={() => router.replace('/')}
                activeOpacity={0.85}
              >
                <Text style={styles.googleBtnText}>Continue with Google</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={ref => { otpRefs.current[idx] = ref; }}
                    style={[styles.otpBox, digit && styles.otpBoxFilled]}
                    value={digit}
                    onChangeText={val => handleOTPChange(val, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>
              <TouchableOpacity onPress={() => setOtpSent(false)}>
                <Text style={styles.resendText}>Didn't receive it? Resend OTP</Text>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.secureNote}>
            <Shield size={13} color={Colors.warmTaupe} />
            <Text style={styles.secureNoteText}>Your data is safe and never shared.</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: SLIDES[currentSlide].bgColor }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, idx) => (
          <View key={idx} style={[styles.slide, { width, backgroundColor: slide.bgColor }]}>
            <View style={[styles.slideInner, { paddingTop: insets.top + 40 }]}>
              <Text style={styles.slideEmoji}>{slide.emoji}</Text>
              <Text style={[styles.slideTitle, { color: idx === 0 ? Colors.offWhite : Colors.deepEspresso }]}>
                {slide.title}
              </Text>
              <Text style={[styles.slideSubtitle, { color: idx === 0 ? Colors.sageLight : Colors.sageGreen }]}>
                {slide.subtitle}
              </Text>
              <Text style={[styles.slideBody, { color: idx === 0 ? Colors.sageLight : Colors.warmStone }]}>
                {slide.body}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: currentSlide === idx
                    ? (currentSlide === 0 ? Colors.offWhite : Colors.forestGreen)
                    : (currentSlide === 0 ? 'rgba(255,255,255,0.4)' : Colors.warmTaupe),
                  width: currentSlide === idx ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentSlide === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <ArrowRight size={18} color={Colors.offWhite} />
        </TouchableOpacity>

        {currentSlide < SLIDES.length - 1 && (
          <TouchableOpacity onPress={() => setShowAuth(true)}>
            <Text style={[
              styles.skipText,
              { color: currentSlide === 0 ? Colors.sageLight : Colors.warmStone }
            ]}>
              Skip
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  slide: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  slideInner: {
    flex: 1,
    paddingHorizontal: 32,
    paddingBottom: 160,
  },
  slideEmoji: {
    fontSize: 64,
    marginBottom: 24,
  },
  slideTitle: {
    fontSize: 40,
    fontFamily: 'PlayfairDisplay-Bold',
    lineHeight: 48,
    marginBottom: 10,
  },
  slideSubtitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    lineHeight: 26,
    marginBottom: 16,
  },
  slideBody: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    lineHeight: 23,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    paddingTop: 20,
    gap: 16,
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  skipText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
  },
  // Auth styles
  authRoot: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  authInner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 30,
  },
  authLogo: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.forestGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  authTitle: {
    fontSize: 28,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 8,
    lineHeight: 36,
  },
  authSub: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 21,
    marginBottom: 28,
  },
  phoneInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  countryCode: {
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
  },
  countryCodeText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: Colors.deepEspresso,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  authBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 16,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  authBtnDisabled: {
    opacity: 0.5,
  },
  authBtnText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
  },
  googleBtn: {
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  googleBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
    justifyContent: 'center',
  },
  otpBox: {
    width: 64,
    height: 68,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.offWhite,
    fontSize: 28,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: Colors.sageGreen,
    backgroundColor: Colors.successBg,
  },
  resendText: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
    textAlign: 'center',
    marginBottom: 24,
  },
  secureNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  secureNoteText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
  },
});
