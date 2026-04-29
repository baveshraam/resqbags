import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Clock, MapPin, ChevronRight, AlertCircle } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';
import { supabase } from '@/lib/supabase';

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: 'Active', bg: Colors.successBg, text: Colors.forestGreen },
  upcoming: { label: 'Upcoming', bg: Colors.warningBg, text: Colors.goldenAmber },
  past: { label: 'Completed', bg: Colors.softBeige, text: Colors.warmStone },
};

const DEFAULT_STATUS = STATUS_CONFIG.past;

const TABS = ['All', 'Active', 'Upcoming', 'Past'];

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    const TEMP_USER_ID = '11111111-1111-1111-1111-111111111111';
    const { data, error: sbError } = await supabase
      .from('orders')
      .select('*, bag_instances(title, pickup_start, pickup_end, restaurants(name, address_line))')
      .eq('customer_profile_id', TEMP_USER_ID)
      .order('created_at', { ascending: false });

    if (sbError) {
      console.error('Supabase error:', sbError);
      setError(sbError.message || 'Failed to fetch orders.');
    } else if (data) {
      const mappedOrders = data.map(o => {
        const rawStatus = o.status?.toLowerCase() || '';
        const mappedStatus = rawStatus === 'reserved' || rawStatus === 'active' ? 'active' : 'past';
        const bagData = o.bag_instances || {};
        const restData = bagData.restaurants || {};

        // Format pickup times from ISO to readable
        let pickupDisplay = 'Pickup time TBD';
        try {
          if (bagData.pickup_start && bagData.pickup_end) {
            const start = new Date(bagData.pickup_start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            const end = new Date(bagData.pickup_end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
            pickupDisplay = `${start} – ${end}`;
          }
        } catch { /* keep default */ }

        return {
          id: o.id,
          restaurantName: restData.name || 'Local Restaurant',
          bagName: bagData.title || 'Rescue Bag',
          status: mappedStatus,
          pickupTime: pickupDisplay,
          totalAmount: o.total_amount,
          pickupCode: o.pickup_code,
          createdAt: new Date(o.created_at).toLocaleDateString(),
          address: restData.address_line || '',
          quantity: o.quantity || 1,
        };
      });
      setOrders(mappedOrders);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = activeTab === 'All'
    ? orders
    : orders.filter(o => o.status === activeTab.toLowerCase());

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
        {loading ? (
          <View style={{ padding: 60, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={Colors.forestGreen} />
            <Text style={{ marginTop: 16, fontFamily: 'DMSans-Medium', fontSize: 14, color: Colors.warmStone }}>Loading your rescue history...</Text>
          </View>
        ) : error ? (
          <View style={{ padding: 40, alignItems: 'center', backgroundColor: Colors.errorBg, borderRadius: 16, borderWidth: 1, borderColor: Colors.softCoral, marginBottom: 30 }}>
            <AlertCircle size={36} color={Colors.terracotta} style={{ marginBottom: 16 }} />
            <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 18, color: Colors.terracotta, marginBottom: 8 }}>Could not load orders</Text>
            <Text style={{ fontFamily: 'DMSans-Regular', fontSize: 14, color: Colors.terracotta, textAlign: 'center', marginBottom: 20, opacity: 0.9 }}>{error}</Text>
            <TouchableOpacity style={{ backgroundColor: Colors.terracotta, borderRadius: 14, paddingHorizontal: 24, paddingVertical: 14 }} onPress={fetchOrders}>
              <Text style={{ fontFamily: 'DMSans-Bold', fontSize: 15, color: Colors.offWhite }}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length > 0 ? (
          filtered.map(order => {
            const statusCfg = STATUS_CONFIG[order.status] || DEFAULT_STATUS;
            return (
              <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.85}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={styles.orderRest}>{order.restaurantName}</Text>
                    <Text style={styles.orderBag}>{order.bagName} x{order.quantity}</Text>
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
            <TouchableOpacity style={styles.exploreBtn} onPress={() => router.replace('/')}>
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
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
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginTop: 2,
  },
  statusBadge: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
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
    gap: 8,
    backgroundColor: Colors.mintGlow,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pinPillLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.forestGreen,
  },
  pinPillValue: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
    letterSpacing: 4,
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
