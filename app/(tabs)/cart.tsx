import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Minus, Plus, ShoppingBag, Leaf, ArrowRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { useCart } from '@/store/CartContext';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { items, removeFromCart, updateQuantity, totalAmount } = useCart();

  const platformFee = 9;
  const total = totalAmount + platformFee;
  const totalSavings = items.reduce((sum, i) => sum + (i.bag.originalPrice - i.bag.rescuePrice) * i.quantity, 0);

  if (items.length === 0) {
    return (
      <View style={[styles.root, styles.emptyRoot, { paddingTop: insets.top }]}>
        <Text style={styles.pageTitle}>Your Cart</Text>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <ShoppingBag size={48} color={Colors.warmTaupe} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is waiting for a rescue.</Text>
          <Text style={styles.emptySub}>Find a bag nearby and start your food-saving journey.</Text>
          <TouchableOpacity style={styles.exploreBtn} onPress={() => router.push('/')}>
            <Text style={styles.exploreBtnText}>Explore Rescues</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <Text style={styles.pageTitle}>Your Cart</Text>
      <Text style={styles.pageSub}>These meals are counting on you.</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {items.map(item => (
          <View key={item.bag.id} style={styles.cartCard}>
            <Image source={{ uri: item.bag.imageUrl }} style={styles.cartImage} />
            <View style={styles.cartInfo}>
              <Text style={styles.cartRestName}>{item.bag.restaurant.name}</Text>
              <Text style={styles.cartBagName}>{item.bag.name}</Text>
              {item.bag.stockLeft <= 2 && (
                <Text style={styles.lowStock}>Only {item.bag.stockLeft} left!</Text>
              )}
              <View style={styles.cartBottom}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.bag.id, item.quantity - 1)}
                  >
                    <Minus size={14} color={Colors.deepEspresso} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => updateQuantity(item.bag.id, item.quantity + 1)}
                  >
                    <Plus size={14} color={Colors.deepEspresso} />
                  </TouchableOpacity>
                </View>
                <View style={styles.priceCol}>
                  <Text style={styles.itemTotal}>₹{item.bag.rescuePrice * item.quantity}</Text>
                  <TouchableOpacity style={styles.releaseBtn} onPress={() => removeFromCart(item.bag.id)}>
                    <Text style={styles.releaseText}>Release</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* Savings Banner */}
        <View style={styles.savingsBanner}>
          <Leaf size={18} color={Colors.forestGreen} />
          <Text style={styles.savingsText}>
            You're saving <Text style={styles.savingsBold}>₹{totalSavings}</Text> with this rescue!
          </Text>
        </View>

        {/* Order Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Item Total</Text>
            <Text style={styles.summaryValue}>₹{totalAmount}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Platform Fee</Text>
            <Text style={styles.summaryValue}>₹{platformFee}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Checkout Button */}
      <View style={[styles.checkoutBar, { paddingBottom: insets.bottom + 12 }]}>
        <View>
          <Text style={styles.checkoutTotal}>₹{total}</Text>
          <Text style={styles.checkoutSavings}>Save ₹{totalSavings}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
          activeOpacity={0.85}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <ArrowRight size={18} color={Colors.offWhite} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  emptyRoot: {
    alignItems: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 2,
  },
  pageSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    paddingHorizontal: 20,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  cartCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 14,
    flexDirection: 'row',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  cartImage: {
    width: 100,
    height: 120,
    resizeMode: 'cover',
  },
  cartInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  cartRestName: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  cartBagName: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginTop: 2,
  },
  lowStock: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: Colors.softCoral,
    marginTop: 3,
  },
  cartBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.softBeige,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  qtyBtn: {
    padding: 2,
  },
  qtyText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    minWidth: 18,
    textAlign: 'center',
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemTotal: {
    fontSize: 17,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  releaseBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.softCoral,
    marginTop: 2,
  },
  releaseText: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: Colors.softCoral,
  },
  savingsBanner: {
    backgroundColor: Colors.successBg,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  savingsText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.forestGreen,
    flex: 1,
  },
  savingsBold: {
    fontFamily: 'DMSans-Bold',
  },
  summaryCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  totalValue: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  checkoutBar: {
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
    justifyContent: 'space-between',
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  checkoutTotal: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  checkoutSavings: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.forestGreen,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  checkoutBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    backgroundColor: Colors.softBeige,
    borderRadius: 40,
    padding: 24,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  exploreBtn: {
    backgroundColor: Colors.sageGreen,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 14,
  },
  exploreBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
