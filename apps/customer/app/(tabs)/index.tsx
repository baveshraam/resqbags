import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, ChevronDown, Search, Leaf, AlertCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { BagCard } from '@/components/ui/BagCard';
import { FilterChips } from '@/components/ui/FilterChips';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { HowItWorks } from '@/components/ui/HowItWorks';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { calculateCustomerPrice } from '@/utils/pricing';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeBags, setActiveBags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (iso: string): string => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  const fetchBags = useCallback(async () => {
    setError(null);
    const nowIso = new Date().toISOString();
    const { data, error: sbError } = await supabase
      .from('bag_instances')
      .select('*, restaurants(*)')
      .eq('status', 'ACTIVE')
      .gt('quantity_available', 0)
      .gt('pickup_end', nowIso)
      .order('created_at', { ascending: false });

    if (sbError) {
      console.error('Supabase fetch error:', sbError);
      setError(sbError.message);
      setLoading(false);
      return;
    }
  // Display sanitization helpers
  const sanitize = (s: string | null | undefined, maxLen: number, fallback: string = ''): string => {
    if (!s || typeof s !== 'string') return fallback;
    const trimmed = s.trim();
    if (!trimmed) return fallback;
    return trimmed.length > maxLen ? trimmed.slice(0, maxLen).trim() + '...' : trimmed;
  };

  const sanitizeName = (s: string | null | undefined): string => sanitize(s, 55, 'Local Restaurant');
  const sanitizeCuisine = (s: string | null | undefined): string => {
    const clean = sanitize(s, 30, 'Rescue Bag');
    // Avoid showing raw values like time strings as cuisine
    if (/^\d{1,2}:\d{2}/.test(clean)) return 'Rescue Bag';
    return clean;
  };

    if (data) {
      const mappedBags = data.map((item: any) => {
        const merchantPrice = item.merchant_price || 0;
        const customerPrice = calculateCustomerPrice(merchantPrice);
        const originalPrice = merchantPrice > 0 ? Math.round(merchantPrice * 2.5) : customerPrice;

        return {
          id: item.id,
          restaurantId: item.restaurant_id,
          restaurant: {
            name: sanitizeName(item.restaurants?.name),
            rating: null,
            cuisine: sanitizeCuisine(item.restaurants?.cuisine),
          },
          name: sanitize(item.title, 55, 'Rescue Bag'),
          description: sanitize(item.description, 120, ''),
          originalPrice,
          rescuePrice: customerPrice,
          merchantPrice,
          stockLeft: item.quantity_available || 0,
          pickupStart: item.pickup_start ? formatTime(item.pickup_start) : 'TBD',
          pickupEnd: item.pickup_end ? formatTime(item.pickup_end) : 'TBD',
          imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
          isActive: true,
          distanceLabel: 'Distance unavailable',
        };
      });
      setActiveBags(mappedBags);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBags();
  }, [fetchBags]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const endingSoon = activeBags.filter(b => b.stockLeft > 0 && b.stockLeft <= 2);
  const topRated = activeBags.slice(0, 4);
  const nearby = activeBags.slice(0, 4);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.stickyHeader, { paddingTop: insets.top, opacity: headerOpacity, pointerEvents: 'none' as const }]}>
        <Text style={styles.stickyTitle}>ResQBag</Text>
      </Animated.View>

      <Animated.ScrollView
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.locationBtn}
            activeOpacity={0.7}
            onPress={() => Alert.alert('Location selector tapped')}
          >
            <Text style={styles.locationLabel}>Pickup near</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>Indiranagar, Bengaluru</Text>
              <ChevronDown size={16} color={Colors.forestGreen} />
            </View>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Bell size={20} color={Colors.deepEspresso} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatarBtn}>
              <Image
                source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=80' }}
                style={styles.avatar}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Hero */}
        <LinearGradient
          colors={[Colors.cream, '#EEF7F2']}
          style={styles.hero}
        >
          <View style={styles.heroLeaf}>
            <Leaf size={60} color={Colors.sageLight} />
          </View>
          <Text style={styles.heroTitle}>Rescue{'\n'}Good Food.</Text>
          <Text style={styles.heroSubtitle}>
            Save Big. Save the Planet.
          </Text>
          <Text style={styles.heroBody}>
            Fresh meals from local spots, rescued at up to 70% off. Good for you, better for the planet.
          </Text>
          <View style={styles.heroBtns}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/(tabs)/search')}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Explore Near Me</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={() => router.push('/(tabs)/community')} activeOpacity={0.85}>
              <Text style={styles.outlineBtnText}>Our Story</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Impact Stats Removed from Home */}

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.85}
        >
          <Search size={18} color={Colors.warmTaupe} />
          <Text style={styles.searchPlaceholder}>Find your next rescue...</Text>
        </TouchableOpacity>

        {/* Filter Chips */}
        <View style={styles.filterRow}>
          <FilterChips />
        </View>

        {loading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.forestGreen} />
            <Text style={{ marginTop: 16, fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.warmStone }}>Finding rescue bags near you...</Text>
          </View>
        ) : error ? (
          <View style={{ padding: 40, alignItems: 'center', marginHorizontal: 20, backgroundColor: Colors.errorBg, borderRadius: 16, borderWidth: 1, borderColor: Colors.softCoral, marginBottom: 30 }}>
            <AlertCircle size={36} color={Colors.terracotta} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 18, color: Colors.terracotta, marginBottom: 8 }}>Network Error</Text>
            <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.terracotta, textAlign: 'center', marginBottom: 20, opacity: 0.9 }}>{error}</Text>
            <TouchableOpacity style={{ backgroundColor: Colors.terracotta, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 }} onPress={fetchBags}>
              <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 15, color: Colors.offWhite }}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : activeBags.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center', marginHorizontal: 20, backgroundColor: Colors.offWhite, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginBottom: 30 }}>
            <Leaf size={36} color={Colors.sageGreen} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 18, color: Colors.deepEspresso, marginBottom: 8 }}>No bags available right now</Text>
            <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.warmStone, textAlign: 'center', lineHeight: 22 }}>Check back soon — restaurants add new rescue bags daily!</Text>
          </View>
        ) : (
          <>
            {/* Nearby Rescues */}
            <View style={styles.section}>
              <View style={styles.sectionPad}>
                <SectionHeader title="What's Poppin' Near You" />
              </View>
              {nearby.map(bag => (
                <View key={bag.id} style={styles.cardPad}>
                  <BagCard bag={bag} />
                </View>
              ))}
            </View>

            {/* Ending Soon */}
            {endingSoon.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionPad}>
                  <SectionHeader title="Ending Soon" onSeeAll={() => router.push('/(tabs)/search')} />
                  <Text style={styles.sectionSub}>Don't let these slip away, friend.</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                  {endingSoon.map(bag => (
                    <BagCard key={bag.id} bag={bag} horizontal />
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Top Rated */}
            {topRated.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionPad}>
                  <SectionHeader title="Top Rated by Neighbors" onSeeAll={() => router.push('/(tabs)/search')} />
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hScroll}>
                  {topRated.map(bag => (
                    <BagCard key={bag.id} bag={bag} horizontal />
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Community Nudge */}
        <View style={styles.communityNudge}>
          <Text style={styles.nudgeEmoji}>🌿</Text>
          <Text style={styles.nudgeTitle}>3,200 neighbors rescued bags this week.</Text>
          <Text style={styles.nudgeSub}>Join them and be part of something good.</Text>
          <TouchableOpacity
            style={styles.nudgeBtn}
            onPress={() => router.push('/(tabs)/community')}
            activeOpacity={0.85}
          >
            <Text style={styles.nudgeBtnText}>View Community</Text>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <HowItWorks />
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: Colors.cream,
    paddingHorizontal: 20,
    paddingBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  stickyTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.forestGreen,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  locationBtn: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    position: 'relative',
    padding: 6,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.softCoral,
    borderWidth: 1.5,
    borderColor: Colors.cream,
  },
  avatarBtn: {},
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: Colors.sageGreen,
  },
  hero: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 28,
    marginBottom: 20,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  heroLeaf: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.15,
  },
  heroTitle: {
    fontSize: 42,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    lineHeight: 50,
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
    marginBottom: 8,
  },
  heroBody: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 21,
    marginBottom: 20,
  },
  heroBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    flex: 1,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: Colors.forestGreen,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  searchPlaceholder: {
    fontSize: 15,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
  },
  filterRow: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionPad: {
    paddingHorizontal: 20,
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: -8,
    marginBottom: 12,
  },
  cardPad: {
    paddingHorizontal: 20,
  },
  hScroll: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },
  communityNudge: {
    marginHorizontal: 20,
    backgroundColor: Colors.forestGreen,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  nudgeEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  nudgeTitle: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
    textAlign: 'center',
    marginBottom: 6,
    lineHeight: 28,
  },
  nudgeSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.sageLight,
    textAlign: 'center',
    marginBottom: 16,
  },
  nudgeBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  nudgeBtnText: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
