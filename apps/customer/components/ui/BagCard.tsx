import React, { useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Heart, Clock, ShoppingBag, Star, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { RescueBag } from '@/types';
import { useSaved } from '@/store/SavedContext';

interface BagCardProps {
  bag: RescueBag;
  horizontal?: boolean;
}

export function BagCard({ bag, horizontal = false }: BagCardProps) {
  const router = useRouter();
  const { isSaved, toggleSaved } = useSaved();
  const heartScale = useRef(new Animated.Value(1)).current;
  const cartScale = useRef(new Animated.Value(1)).current;

  const discount = Math.round(((bag.originalPrice - bag.rescuePrice) / bag.originalPrice) * 100);
  const saved = isSaved(bag.id);

  const handleHeart = () => {
    toggleSaved(bag.id);
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleRescue = () => {
    Animated.sequence([
      Animated.spring(cartScale, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(cartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    router.push(`/bag/${bag.id}`);
  };

  if (horizontal) {
    return (
      <TouchableOpacity
        style={styles.horizontalCard}
        onPress={() => router.push(`/bag/${bag.id}`)}
        activeOpacity={0.9}
      >
        <Image source={{ uri: bag.imageUrl }} style={styles.horizontalImage} />
        <View style={styles.horizontalContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.restaurantName} numberOfLines={1}>{bag.restaurant.name}</Text>
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              <TouchableOpacity onPress={handleHeart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Heart
                  size={16}
                  color={saved ? Colors.softCoral : Colors.warmTaupe}
                  fill={saved ? Colors.softCoral : 'none'}
                />
              </TouchableOpacity>
            </Animated.View>
          </View>
          <Text style={styles.bagName} numberOfLines={1}>{bag.name}</Text>
          <View style={styles.row}>
            {bag.restaurant.rating && (
              <>
                <Star size={12} color={Colors.goldenAmber} fill={Colors.goldenAmber} />
                <Text style={styles.ratingText}>{bag.restaurant.rating}</Text>
                <Text style={styles.dot}>·</Text>
              </>
            )}
            <MapPin size={12} color={Colors.warmTaupe} />
            <Text style={styles.distanceText}>{bag.distanceLabel || 'Distance unavailable'}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.rescuePrice}>₹{bag.rescuePrice}</Text>
            <Text style={styles.originalPrice}>₹{bag.originalPrice}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% off</Text>
            </View>
          </View>
          <View style={styles.rowBetween}>
            <View style={styles.pickupRow}>
              <Clock size={11} color={Colors.warmStone} />
              <Text style={styles.pickupText}>{bag.pickupStart} – {bag.pickupEnd}</Text>
            </View>
            {bag.stockLeft <= 2 && bag.stockLeft > 0 && (
              <Text style={styles.stockText}>Only {bag.stockLeft} left</Text>
            )}
            {bag.stockLeft <= 0 && (
              <Text style={styles.stockText}>Sold out</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/bag/${bag.id}`)}
      activeOpacity={0.93}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: bag.imageUrl }} style={styles.image} />
        <View style={styles.discountSeal}>
          <Text style={styles.sealText}>{discount}%{'\n'}off</Text>
        </View>
        <Animated.View style={[styles.heartBtn, { transform: [{ scale: heartScale }] }]}>
          <TouchableOpacity onPress={handleHeart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Heart
              size={18}
              color={saved ? Colors.softCoral : Colors.offWhite}
              fill={saved ? Colors.softCoral : 'none'}
            />
          </TouchableOpacity>
        </Animated.View>
        {bag.stockLeft <= 2 && bag.stockLeft > 0 && (
          <View style={styles.stockBadge}>
            <Text style={styles.stockBadgeText}>Only {bag.stockLeft} left!</Text>
          </View>
        )}
        {bag.stockLeft <= 0 && (
          <View style={[styles.stockBadge, { backgroundColor: Colors.warmStone }]}>
            <Text style={styles.stockBadgeText}>Sold Out</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.rowBetween}>
          <Text style={styles.restaurantName} numberOfLines={1}>{bag.restaurant.name}</Text>
          {bag.restaurant.rating && (
            <View style={styles.ratingBadge}>
              <Star size={11} color={Colors.goldenAmber} fill={Colors.goldenAmber} />
              <Text style={styles.ratingText}>{bag.restaurant.rating}</Text>
            </View>
          )}
        </View>
        <Text style={styles.bagName}>{bag.name}</Text>
        <View style={styles.cuisineTag}>
          <Text style={styles.cuisineText}>{bag.restaurant.cuisine}</Text>
        </View>

        <View style={styles.pickupRow}>
          <Clock size={12} color={Colors.warmStone} />
          <Text style={styles.pickupText}>Today, {bag.pickupStart} – {bag.pickupEnd}</Text>
        </View>

        <View style={styles.bottomRow}>
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.rescuePriceLg}>₹{bag.rescuePrice}</Text>
              <Text style={styles.originalPriceLg}>₹{bag.originalPrice}</Text>
            </View>
            <Text style={styles.savingsText}>Save ₹{bag.originalPrice - bag.rescuePrice}</Text>
          </View>
          <Animated.View style={{ transform: [{ scale: cartScale }] }}>
            <TouchableOpacity 
              style={styles.addBtn}
              onPress={handleRescue}
            >
              <ShoppingBag size={15} color={Colors.offWhite} />
              <Text style={styles.addBtnText}>Rescue</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  discountSeal: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: Colors.goldenAmber,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  sealText: {
    color: Colors.offWhite,
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    textAlign: 'center',
    lineHeight: 15,
  },
  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(44,24,16,0.3)',
    borderRadius: 20,
    padding: 8,
  },
  stockBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: Colors.softCoral,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockBadgeText: {
    color: Colors.offWhite,
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
  },
  content: {
    padding: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restaurantName: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
    flex: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.amberLight,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  ratingText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  bagName: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginTop: 2,
    marginBottom: 6,
  },
  cuisineTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.softBeige,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  pickupText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rescuePriceLg: {
    fontSize: 22,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  originalPriceLg: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.warmTaupe,
    textDecorationLine: 'line-through',
    textDecorationColor: Colors.warmTaupe,
  },
  savingsText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.sageGreen,
    marginTop: 1,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.forestGreen,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addBtnText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
    gap: 12,
  },
  qtyBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    color: Colors.offWhite,
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
  },
  qtyText: {
    color: Colors.offWhite,
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    minWidth: 16,
    textAlign: 'center',
  },
  // Horizontal card styles
  horizontalCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 14,
    width: 220,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  horizontalImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  horizontalContent: {
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginVertical: 3,
  },
  dot: {
    color: Colors.warmTaupe,
    fontSize: 12,
  },
  distanceText: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  rescuePrice: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  originalPrice: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: Colors.warmTaupe,
    textDecorationLine: 'line-through',
    textDecorationColor: Colors.warmTaupe,
  },
  discountBadge: {
    backgroundColor: Colors.amberLight,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  discountText: {
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
    color: Colors.goldenAmber,
  },
  stockText: {
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
    color: Colors.softCoral,
  },
});
