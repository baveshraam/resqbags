import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, MapPin, Clock, Leaf, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { RESCUE_BAGS } from '../../constants/data';
import { useCart } from '@/store/CartContext';
import { useSaved } from '@/store/SavedContext';
import { supabase } from '@/lib/supabase';
import { calculateCustomerPrice } from '@/utils/pricing';

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
}

export default function BagDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useSaved();
  const [quantity, setQuantity] = useState(1);
  const heartScale = useRef(new Animated.Value(1)).current;
  const cartScale = useRef(new Animated.Value(1)).current;
  const [bag, setBag] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try mock data first (for static bag IDs like b1, b2, etc.)
    const mockBag = RESCUE_BAGS.find(b => b.id === id);
    if (mockBag) {
      setBag({ ...mockBag, pickupEndAt: null, distanceLabel: mockBag.distanceLabel || 'Distance unavailable' });
      setLoading(false);
      return;
    }

    // Otherwise fetch from Supabase (for merchant-published bags)
    const fetchBag = async () => {
      const { data, error } = await supabase
        .from('bag_instances')
        .select('*, restaurants(*)')
        .eq('id', id)
        .single();

      if (error || !data) {
        console.error('Bag fetch error:', error);
        setLoading(false);
        return;
      }

      // Sanitization helpers
      const clip = (s: string | null | undefined, max: number, fb: string = '') => {
        if (!s || typeof s !== 'string') return fb;
        const t = s.trim();
        return t.length > max ? t.slice(0, max).trim() + '...' : (t || fb);
      };

      const rest = data.restaurants || {};
      const merchantPrice = data.merchant_price || 150;
      const customerPrice = calculateCustomerPrice(merchantPrice);
      const contents = data.possible_contents
        ? data.possible_contents.split(',').map((s: string) => s.trim()).filter(Boolean).map((s: string) => clip(s, 60, s))
        : [];
      const cuisineRaw = rest.cuisine || 'Various';
      const cuisine = /^\d{1,2}:\d{2}/.test(cuisineRaw) ? 'Various' : clip(cuisineRaw, 30, 'Various');

      setBag({
        id: data.id,
        restaurantId: data.restaurant_id,
        restaurant: {
          name: clip(rest.name, 55, 'Local Restaurant'),
          cuisine,
          city: '',
          address: clip(rest.address_line, 80, ''),
          rating: null,
          reviewCount: 0,
          verified: true,
          heroImage: '',
          ownerNote: '',
          description: cuisine !== 'Various' ? `Serving delicious ${cuisine} cuisine.` : '',
        },
        name: clip(data.title, 55, 'Rescue Bag'),
        description: clip(data.description, 200, ''),
        originalPrice: Math.round(merchantPrice * 2.5),
        rescuePrice: customerPrice,
        merchantPrice,
        stockLeft: data.quantity_available || 0,
        pickupStart: data.pickup_start ? formatTime(data.pickup_start) : 'TBD',
        pickupEnd: data.pickup_end ? formatTime(data.pickup_end) : 'TBD',
        pickupEndAt: data.pickup_end || null,
        imageUrl: 'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=800',
        possibleContents: contents,
        allergenNote: 'Please ask the restaurant about allergens.',
        isActive: data.status === 'ACTIVE',
        distanceLabel: 'Distance unavailable',
      });
      setLoading(false);
    };

    fetchBag();
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.forestGreen} />
        <Text style={{ marginTop: 12, fontFamily: 'DMSans-Medium', color: Colors.warmStone }}>Loading bag details...</Text>
      </View>
    );
  }

  if (!bag) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center', padding: 40 }]}>
        <Text style={{ fontSize: 18, fontFamily: 'DMSans-Bold', color: Colors.deepEspresso, textAlign: 'center', marginBottom: 8 }}>Bag not found</Text>
        <Text style={{ fontSize: 14, fontFamily: 'DMSans-Regular', color: Colors.warmStone, textAlign: 'center', marginBottom: 20 }}>This bag may have been removed or is no longer available.</Text>
        <TouchableOpacity style={{ backgroundColor: Colors.forestGreen, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 12 }} onPress={() => router.back()}>
          <Text style={{ color: Colors.offWhite, fontFamily: 'DMSans-Bold', fontSize: 14 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const discount = Math.round(((bag.originalPrice - bag.rescuePrice) / bag.originalPrice) * 100);
  const saved = isSaved(bag.id);
  const savings = (bag.originalPrice - bag.rescuePrice) * quantity;

  const handleHeart = () => {
    toggleSaved(bag.id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const pickupEndAt = bag?.pickupEndAt ? new Date(bag.pickupEndAt) : null;
  const isExpired = pickupEndAt ? pickupEndAt.getTime() <= Date.now() : false;
  const isSoldOut = bag.stockLeft <= 0;
  const isInactive = bag.isActive === false;
  const isUnavailable = isInactive || isSoldOut || isExpired;
  const availabilityMessage = isInactive
    ? 'This bag is no longer available.'
    : isSoldOut
      ? 'Sold out'
      : isExpired
        ? 'Pickup window expired'
        : '';

  const handleAddToCart = () => {
    if (isUnavailable) {
      Alert.alert('Unavailable', availabilityMessage || 'This bag is no longer available.');
      return;
    }
    addToCart(bag, quantity);
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(cartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    router.push('/(tabs)/cart');
  };

  const directionsUrl = bag.restaurant.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bag.restaurant.address)}`
    : null;

  const handleDirections = async () => {
    if (!directionsUrl) return;
    await Linking.openURL(directionsUrl);
  };

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: bag.imageUrl }} style={styles.heroImage} />
          <View style={[styles.heroTopBar, { top: insets.top + 12 }]}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <ArrowLeft size={20} color={Colors.deepEspresso} />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity style={styles.heartBtnHero} onPress={handleHeart}>
                <Heart
                  size={20}
                  color={saved ? Colors.softCoral : Colors.deepEspresso}
                  fill={saved ? Colors.softCoral : 'none'}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <View style={styles.heroOverlay}>
            <View style={styles.discountSeal}>
              <Text style={styles.sealText}>{discount}% OFF</Text>
            </View>
          </View>
        </View>

        {/* Restaurant Info */}
        <View style={styles.content}>
          <View style={styles.restRow}>
            <View style={styles.restInfo}>
              <Text style={styles.restName}>{bag.restaurant.name}</Text>
              {bag.restaurant.rating ? (
                <View style={styles.ratingRow}>
                  <Star size={14} color={Colors.goldenAmber} fill={Colors.goldenAmber} />
                  <Text style={styles.ratingText}>{bag.restaurant.rating}</Text>
                  <Text style={styles.reviewCount}>({bag.restaurant.reviewCount} reviews)</Text>
                </View>
              ) : null}
            </View>
            <View style={styles.verifiedBadge}>
              <CheckCircle2 size={14} color={Colors.sageGreen} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          </View>

          <View style={styles.cuisineRow}>
            <View style={styles.cuisineTag}>
              <Text style={styles.cuisineText}>{bag.restaurant.cuisine}</Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={12} color={Colors.warmStone} />
              <Text style={styles.locationText} numberOfLines={1}>{bag.restaurant.address}</Text>
            </View>
            <Text style={styles.distanceText}>{bag.distanceLabel || 'Distance unavailable'}</Text>
          </View>

          {bag.restaurant.ownerNote && (
            <View style={styles.ownerNoteBox}>
              <Text style={styles.ownerNoteText}>"{bag.restaurant.ownerNote}"</Text>
            </View>
          )}

          {/* Bag Name & Description */}
          <Text style={styles.bagName}>{bag.name}</Text>
          <Text style={styles.bagDesc}>{bag.description}</Text>

          {isUnavailable ? (
            <View style={styles.unavailableBanner}>
              <Text style={styles.unavailableText}>{availabilityMessage}</Text>
            </View>
          ) : null}

          {/* Pricing Card */}
          <View style={styles.pricingCard}>
            <View style={styles.pricingMain}>
              <Text style={styles.rescuePrice}>₹{bag.rescuePrice}</Text>
              <Text style={styles.originalPrice}>₹{bag.originalPrice}</Text>
            </View>
            <View style={styles.savingsRow}>
              <Leaf size={14} color={Colors.sageGreen} />
              <Text style={styles.savingsText}>You save ₹{savings} on this rescue</Text>
            </View>
            <Text style={styles.priceNote}>Original value before rescue</Text>
          </View>

          {/* Pickup Window */}
          <View style={styles.pickupCard}>
            <View style={styles.pickupHeader}>
              <Clock size={18} color={Colors.forestGreen} />
              <Text style={styles.pickupTitle}>Pickup Window</Text>
              {bag.stockLeft <= 2 && (
                <View style={styles.urgencyBadge}>
                  <Text style={styles.urgencyText}>Only {bag.stockLeft} left!</Text>
                </View>
              )}
            </View>
            <Text style={styles.pickupTime}>Today, {bag.pickupStart} – {bag.pickupEnd}</Text>
            {bag.restaurant.address ? (
              <TouchableOpacity style={styles.directionsBtn} onPress={handleDirections} activeOpacity={0.85}>
                <Text style={styles.directionsText}>Get Directions</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.noAddressText}>Pickup address will be confirmed by the restaurant.</Text>
            )}
          </View>

          {/* What's Inside */}
          <Text style={styles.sectionTitle}>What might be inside</Text>
          <Text style={styles.surpriseNote}>A delicious surprise from today's kitchen — fresh, genuine, and made with care.</Text>
          <View style={styles.contentsList}>
            {bag.possibleContents.map((item: string, idx: number) => (
              <View key={idx} style={styles.contentItem}>
                <CheckCircle2 size={15} color={Colors.sageGreen} />
                <Text style={styles.contentItemText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Allergen */}
          <View style={styles.allergenBox}>
            <AlertCircle size={15} color={Colors.goldenAmber} />
            <Text style={styles.allergenText}>{bag.allergenNote}</Text>
          </View>

          {/* Impact section removed */}

          {/* About Restaurant */}
          <Text style={styles.sectionTitle}>About the Restaurant</Text>
          <Text style={styles.restDesc}>{bag.restaurant.description}</Text>
        </View>
      </ScrollView>

      {/* Sticky Bottom */}
      <View style={[styles.stickyBottom, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={isUnavailable}
          >
            <Minus size={16} color={Colors.deepEspresso} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.min(bag.stockLeft, quantity + 1))}
            disabled={isUnavailable}
          >
            <Plus size={16} color={Colors.deepEspresso} />
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.addBtnWrapper, { transform: [{ scale: cartScale }] }]}>
          <TouchableOpacity
            style={[styles.addToCartBtn, isUnavailable && { opacity: 0.6 }]}
            onPress={handleAddToCart}
            activeOpacity={0.85}
            disabled={isUnavailable}
          >
            <ShoppingBag size={18} color={Colors.offWhite} />
            <Text style={styles.addToCartText}>Add to Cart · ₹{bag.rescuePrice * quantity}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  heroTopBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backBtn: {
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    padding: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  heartBtnHero: {
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    padding: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 3,
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
  },
  discountSeal: {
    backgroundColor: Colors.goldenAmber,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  sealText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  content: {
    padding: 20,
  },
  restRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  restInfo: { flex: 1 },
  restName: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  reviewCount: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  verifiedText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  cuisineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  cuisineTag: {
    backgroundColor: Colors.softBeige,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cuisineText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    flex: 1,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmTaupe,
    marginTop: 4,
  },
  ownerNoteBox: {
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.sageGreen,
  },
  ownerNoteText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bagName: {
    fontSize: 24,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginBottom: 8,
  },
  bagDesc: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 22,
    marginBottom: 16,
  },
  unavailableBanner: {
    backgroundColor: Colors.errorBg,
    borderColor: Colors.softCoral,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  unavailableText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.terracotta,
  },
  pricingCard: {
    backgroundColor: Colors.successBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  pricingMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 6,
  },
  rescuePrice: {
    fontSize: 30,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  originalPrice: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.warmTaupe,
    textDecorationLine: 'line-through',
    textDecorationColor: Colors.warmTaupe,
  },
  priceNote: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
    marginTop: 6,
  },
  savingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  savingsText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
  },
  pickupCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pickupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  pickupTitle: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    flex: 1,
  },
  directionsBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  directionsText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  noAddressText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 10,
  },
  urgencyBadge: {
    backgroundColor: Colors.coralLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  urgencyText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.softCoral,
  },
  pickupTime: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 8,
    marginTop: 4,
  },
  surpriseNote: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 20,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  contentsList: {
    gap: 8,
    marginBottom: 14,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contentItemText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.deepEspresso,
  },
  allergenBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: Colors.warningBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  allergenText: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    flex: 1,
    lineHeight: 19,
  },
  impactCard: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  impactTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
    marginBottom: 8,
  },
  impactStat: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.sageLight,
    lineHeight: 20,
    marginBottom: 16,
  },
  impactHighlight: {
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  impactItem: {
    alignItems: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  impactLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.sageLight,
    textAlign: 'center',
    marginTop: 2,
  },
  restDesc: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 22,
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.offWhite,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: Colors.softBeige,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyText: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    minWidth: 24,
    textAlign: 'center',
  },
  addBtnWrapper: {
    flex: 1,
  },
  addToCartBtn: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addToCartText: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
