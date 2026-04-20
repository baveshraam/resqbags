import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const MOCK_ORDERS = [
  {
    id: 'o1',
    restaurantName: 'Spice Garden',
    bagName: 'Curry Surprise Box',
    status: 'active' as const,
    pickupTime: 'Today, 7:30 PM – 9:00 PM',
    totalAmount: 159,
    pickupCode: '7842',
    createdAt: 'Just now',
    address: '12 Church Street, Indiranagar',
  },
  {
    id: 'o2',
    restaurantName: 'Bombay Bakes',
    bagName: 'Bakery Treasure Bag',
    status: 'upcoming' as const,
    pickupTime: 'Tomorrow, 7:00 PM – 8:30 PM',
    totalAmount: 188,
    pickupCode: '3291',
    createdAt: '2 hours ago',
    address: '34 Hill Road, Bandra West',
  },
  {
    id: 'o3',
    restaurantName: 'Hyderabadi Daawat',
    bagName: 'Biryani Bounty Bag',
    status: 'past' as const,
    pickupTime: 'Yesterday, 9:00 PM',
    totalAmount: 208,
    pickupCode: '5567',
    createdAt: '1 day ago',
    address: '45 Banjara Hills Road 2',
  },
  {
    id: 'o4',
    restaurantName: 'The Dosa House',
    bagName: 'Tiffin Magic Bag',
    status: 'past' as const,
    pickupTime: '3 days ago, 8:00 PM',
    totalAmount: 108,
    pickupCode: '1923',
    createdAt: '3 days ago',
    address: '7 Gandhi Bazaar, Basavanagudi',
  },
];

const STATUS_CONFIG = {
  active: { label: 'Active', bg: Colors.successBg, text: Colors.forestGreen },
  upcoming: { label: 'Upcoming', bg: Colors.warningBg, text: Colors.goldenAmber },
  past: { label: 'Completed', bg: Colors.softBeige, text: Colors.warmStone },
};

const TABS = ['All', 'Active', 'Upcoming', 'Past'];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? MOCK_ORDERS
    : MOCK_ORDERS.filter(o => o.status === activeTab.toLowerCase());

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color={Colors.deepEspresso} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Rescues</Text>
        <View style={{ width: 40 }} />
      </View>
      <Text style={styles.headerSub}>Your rescue timeline. A story of impact.</Text>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabRow} contentContainerStyle={styles.tabContent}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {filtered.length > 0 ? (
          filtered.map(order => {
            const statusCfg = STATUS_CONFIG[order.status];
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.85}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderRest}>{order.restaurantName}</Text>
                    <Text style={styles.orderBag}>{order.bagName}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
                    <Text style={[styles.statusText, { color: statusCfg.text }]}>{statusCfg.label}</Text>
                  </View>
                </View>
                <View style={styles.orderMeta}>
                  <View style={styles.orderMetaRow}>
                    <Clock size={13} color={Colors.warmStone} />
                    <Text style={styles.orderMetaText}>{order.pickupTime}</Text>
                  </View>
                  <View style={styles.orderMetaRow}>
                    <MapPin size={13} color={Colors.warmStone} />
                    <Text style={styles.orderMetaText}>{order.address}</Text>
                  </View>
                </View>
                <View style={styles.orderBottom}>
                  <View>
                    <Text style={styles.orderAmount}>₹{order.totalAmount}</Text>
                    <Text style={styles.orderTime}>{order.createdAt}</Text>
                  </View>
                  {order.status !== 'past' && (
                    <View style={styles.pinPill}>
                      <Text style={styles.pinPillLabel}>PIN:</Text>
                      <Text style={styles.pinPillValue}>{order.pickupCode}</Text>
                    </View>
                  )}
                  <ChevronRight size={18} color={Colors.warmTaupe} />
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Your story is waiting.</Text>
            <Text style={styles.emptySub}>You haven't rescued any bags yet. Find one near you!</Text>
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace('/(tabs)/index')}>
              <Text style={styles.exploreBtnText}>Explore Rescues</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    paddingHorizontal: 20,
    marginBottom: 14,
    fontStyle: 'italic',
  },
  tabRow: {
    maxHeight: 48,
    marginBottom: 16,
  },
  tabContent: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.softBeige,
  },
  tabActive: {
    backgroundColor: Colors.forestGreen,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  tabTextActive: {
    color: Colors.offWhite,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  orderRest: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  orderBag: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
  },
  orderMeta: {
    gap: 5,
    marginBottom: 12,
  },
  orderMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderMetaText: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  orderBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  orderAmount: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  orderTime: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
    marginTop: 1,
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.mintGlow,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  pinPillLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.forestGreen,
  },
  pinPillValue: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
    letterSpacing: 3,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 22,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
    paddingHorizontal: 20,
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
