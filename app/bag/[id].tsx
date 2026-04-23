import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Heart, Star, MapPin, Clock, Leaf, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, ChevronRight, Plus, Minus, ShoppingBag } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { RESCUE_BAGS } from '@/constants/data';
import { useCart } from '@/store/CartContext';
import { useSaved } from '@/store/SavedContext';

export default function BagDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { addToCart } = useCart();
  const { isSaved, toggleSaved } = useSaved();
  const [quantity, setQuantity] = useState(1);
  const heartScale = useRef(new Animated.Value(1)).current;
  const cartScale = useRef(new Animated.Value(1)).current;

  const bag = RESCUE_BAGS.find(b => b.id === id);
  if (!bag) return null;

  const discount = Math.round(((bag.originalPrice - bag.rescuePrice) / bag.originalPrice) * 100);
  const saved = isSaved(bag.id);
  const savings = (bag.originalPrice - bag.rescuePrice) * quantity;
  const co2 = (2.3 * quantity).toFixed(1);

  const handleHeart = () => {
    toggleSaved(bag.id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.4, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleAddToCart = () => {
    addToCart(bag, quantity);
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(cartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    router.push('/(tabs)/cart');
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
              <View style={styles.ratingRow}>
                <Star size={14} color={Colors.goldenAmber} fill={Colors.goldenAmber} />
                <Text style={styles.ratingText}>{bag.restaurant.rating}</Text>
                <Text style={styles.reviewCount}>({bag.restaurant.reviewCount} reviews)</Text>
              </View>
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
          </View>

          {bag.restaurant.ownerNote && (
            <View style={styles.ownerNoteBox}>
              <Text style={styles.ownerNoteText}>"{bag.restaurant.ownerNote}"</Text>
            </View>
          )}

          {/* Bag Name & Description */}
          <Text style={styles.bagName}>{bag.name}</Text>
          <Text style={styles.bagDesc}>{bag.description}</Text>

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
          </View>

          {/* What's Inside */}
          <Text style={styles.sectionTitle}>What might be inside</Text>
          <Text style={styles.surpriseNote}>A delicious surprise from today's kitchen — fresh, genuine, and made with care.</Text>
          <View style={styles.contentsList}>
            {bag.possibleContents.map((item, idx) => (
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
          >
            <Minus size={16} color={Colors.deepEspresso} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(Math.min(bag.stockLeft, quantity + 1))}
          >
            <Plus size={16} color={Colors.deepEspresso} />
          </TouchableOpacity>
        </View>
        <Animated.View style={[styles.addBtnWrapper, { transform: [{ scale: cartScale }] }]}>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.85}>
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
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
    textDecorationLine: 'line-through',
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
