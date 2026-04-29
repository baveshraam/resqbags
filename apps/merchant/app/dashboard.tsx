import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, Plus, Package, CheckCircle2, PauseCircle, ListTodo, DollarSign, Store, ChevronRight } from 'lucide-react-native';
import { Colors } from '../constants/colors';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatCard } from '../components/StatCard';
import { InfoCard } from '../components/InfoCard';
import { useMerchantStore } from '../store/useMerchantStore';
import { PrimaryButton } from '../components/PrimaryButton';
import { supabase } from '../lib/supabase';

interface BagSummary {
  id: string;
  title: string;
  quantity_available: number;
  quantity_total: number;
  pickup_start: string;
  pickup_end: string;
  merchant_price: number;
  status: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { restaurant, setRestaurantDetails } = useMerchantStore();
  const [bags, setBags] = useState<BagSummary[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [highlightListings, setHighlightListings] = useState(false);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBags = useCallback(async () => {
    if (!restaurant.restaurantId) {
      setLoading(false);
      return;
    }
    
    setError(null);
    try {
      // Hydrate restaurant details to ensure we don't show blank 'Merchant'
      const { data: restData, error: restError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('id', restaurant.restaurantId)
        .single();
        
      if (restData && !restError) {
        setRestaurantDetails({
          name: restData.name,
          cuisine: restData.cuisine,
          ownerName: restData.owner_name,
          phone: restData.phone,
          address: restData.address_line,
        });
        setIsLive(restData.is_live !== false);
      }

      // Fetch bags
      const { data, error } = await supabase
        .from('bag_instances')
        .select('id, title, quantity_available, quantity_total, pickup_start, pickup_end, merchant_price, status')
        .eq('restaurant_id', restaurant.restaurantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data) {
        setBags(data as BagSummary[]);
      }
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [restaurant.restaurantId, setRestaurantDetails]);

  useEffect(() => {
    fetchBags();
  }, [fetchBags]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBags();
    setRefreshing(false);
  }, [fetchBags]);

  const activeBags = bags.filter(b => b.status === 'ACTIVE');
  const liveBagsCount = activeBags.length;
  const reservedCount = bags.filter(b => b.status === 'RESERVED').length;
  const pickedUpCount = bags.filter(b => b.status === 'PICKED_UP').length;
  const totalRevenue = bags
    .filter(b => b.status === 'PICKED_UP')
    .reduce((sum, b) => sum + (b.merchant_price * (b.quantity_total - b.quantity_available)), 0);

  const displayName = restaurant.name || 'Merchant';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const cuisine = restaurant.cuisine || '';

  const formatPickupTime = (iso: string) => {
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return iso;
      return d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });
    } catch {
      return iso;
    }
  };

  const handleViewBags = () => {
    setHighlightListings(true);
    if (highlightTimeoutRef.current) clearTimeout(highlightTimeoutRef.current);
    highlightTimeoutRef.current = setTimeout(() => setHighlightListings(false), 2000);
  };

  const handleToggleLive = () => {
    const nextLive = !isLive;
    Alert.alert(
      nextLive ? 'Resume Store?' : 'Pause Store?',
      nextLive
        ? 'Customers will see your bags again.'
        : 'Customers will not see your bags while paused.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: nextLive ? 'Resume' : 'Pause',
          style: nextLive ? 'default' : 'destructive',
          onPress: async () => {
            if (!restaurant.restaurantId) return;
            const { error: updateError } = await supabase
              .from('restaurants')
              .update({ is_live: nextLive })
              .eq('id', restaurant.restaurantId);

            if (updateError) {
              Alert.alert('Update Failed', updateError.message);
              return;
            }

            setIsLive(nextLive);
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer
      scrollable={true}
      contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.forestGreen} />
      }
    >
      {!restaurant.restaurantId ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 }}>
          <View style={[styles.emptyIconCircle, { marginBottom: 20 }]}>
            <Store size={36} color={Colors.forestGreen} />
          </View>
          <Text style={[styles.emptyTitle, { fontSize: 24 }]}>Finish Onboarding</Text>
          <Text style={[styles.emptySubtitle, { marginBottom: 30 }]}>
            Set up your restaurant details to start listing rescue bags and reducing food waste.
          </Text>
          <PrimaryButton 
            title="Complete Setup" 
            onPress={() => router.push('/onboarding/restaurant')}
            style={{ width: '100%' }}
          />
        </View>
      ) : (
        <>
          {error && (
            <View style={{ backgroundColor: Colors.errorBg, padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: Colors.softCoral }}>
              <Text style={{ fontFamily: 'DMSans-Bold', color: Colors.terracotta, marginBottom: 4 }}>Error Loading Dashboard</Text>
              <Text style={{ fontFamily: 'DMSans-Regular', color: Colors.terracotta, marginBottom: 12 }}>{error}</Text>
              <TouchableOpacity style={{ backgroundColor: Colors.terracotta, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start' }} onPress={fetchBags}>
                <Text style={{ color: Colors.offWhite, fontFamily: 'DMSans-Bold', fontSize: 13 }}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting}>Hello, {displayName}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{displayInitial}</Text>
        </View>
      </View>

      {/* Restaurant Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.profileIconCircle}>
            <Store size={20} color={Colors.forestGreen} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{displayName}</Text>
            {cuisine ? <Text style={styles.profileCuisine}>{cuisine}</Text> : null}
          </View>
          <View style={[styles.statusBadge, !isLive && styles.statusBadgePaused]}>
            <View style={[styles.statusDot, !isLive && styles.statusDotPaused]} />
            <Text style={[styles.statusText, !isLive && styles.statusTextPaused]}>{isLive ? 'Active' : 'Paused'}</Text>
          </View>
        </View>
        {restaurant.address ? (
          <Text style={styles.profileAddress} numberOfLines={1}>{restaurant.address}</Text>
        ) : null}
      </View>

      {/* Status Banner */}
      <View style={styles.statusCard}>
        <Clock size={18} color={isLive ? Colors.goldenAmber : Colors.terracotta} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusTitle}>
            {isLive ? 'Restaurant status: Pending review' : 'Restaurant status: Paused'}
          </Text>
          <Text style={styles.statusSub}>
            {isLive
              ? "You can create bags, but they won't appear to customers until verified."
              : 'Your listings are hidden from customers until you resume the store.'}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Today's Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Live Bags"
          value={liveBagsCount.toString()}
          icon={<Package size={18} color={Colors.forestGreen} />}
          iconBgColor={Colors.sageLight}
        />
        <StatCard
          title="Reserved"
          value={reservedCount.toString()}
          icon={<Clock size={18} color={Colors.goldenAmber} />}
          iconBgColor={Colors.warningBg}
        />
        <StatCard
          title="Picked Up"
          value={pickedUpCount.toString()}
          icon={<CheckCircle2 size={18} color={Colors.forestGreen} />}
          iconBgColor={Colors.successBg}
        />
      </View>

      {/* Revenue Card */}
      <View style={styles.revenueCard}>
        <View style={styles.revenueLeft}>
          <Text style={styles.revenueLabel}>Est. Revenue</Text>
          <Text style={styles.revenueAmount}>₹{totalRevenue.toLocaleString()}</Text>
        </View>
        <View style={styles.revenueIconCircle}>
          <DollarSign size={20} color={Colors.forestGreen} />
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/add-bag/price')}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.sageLight }]}>
            <Plus size={20} color={Colors.forestGreen} />
          </View>
          <Text style={styles.actionText}>Add Bag</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleViewBags}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.amberLight }]}>
            <ListTodo size={20} color={Colors.goldenAmber} />
          </View>
          <Text style={styles.actionText}>View Bags</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleToggleLive}>
          <View style={[styles.actionIcon, { backgroundColor: Colors.errorBg }]}>
            <PauseCircle size={20} color={Colors.terracotta} />
          </View>
          <Text style={styles.actionText}>{isLive ? 'Pause Store' : 'Resume Store'}</Text>
        </TouchableOpacity>
      </View>

      {/* Active Listings */}
      <Text style={[styles.sectionTitle, highlightListings && styles.sectionTitleHighlight]}>Active Listings</Text>

      {activeBags.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconCircle}>
            <Package size={32} color={Colors.warmTaupe} />
          </View>
          <Text style={styles.emptyTitle}>No active bags</Text>
          <Text style={styles.emptySubtitle}>
            You haven't listed any rescue bags for today.{'\n'}Add one to start rescuing food.
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={() => router.push('/add-bag/price')}>
            <Plus size={16} color={Colors.offWhite} />
            <Text style={styles.emptyButtonText}>Add First Bag</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.bagsList}>
          {activeBags.map((b) => (
            <View key={b.id} style={styles.liveBagCard}>
              <View style={styles.liveBagTop}>
                <View style={styles.liveBagIcon}>
                  <Package size={18} color={Colors.forestGreen} />
                </View>
                <View style={styles.liveBagDetails}>
                  <Text style={styles.liveBagTitle} numberOfLines={1}>{b.title}</Text>
                  <Text style={styles.liveBagMeta}>
                    {b.quantity_available}/{b.quantity_total} available • ₹{b.merchant_price}
                  </Text>
                </View>
                <ChevronRight size={18} color={Colors.warmTaupe} />
              </View>
              <View style={styles.liveBagTimeRow}>
                <Clock size={13} color={Colors.warmStone} />
                <Text style={styles.liveBagTime}>
                  Pickup: {formatPickupTime(b.pickup_start)} — {formatPickupTime(b.pickup_end)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* FAB */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/add-bag/price')}
        >
          <Plus size={22} color={Colors.offWhite} />
          <Text style={styles.fabText}>Add Rescue Bag</Text>
        </TouchableOpacity>
      </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 16,
    marginBottom: 20,
  },
  headerText: {
    flex: 1,
    paddingRight: 16,
  },
  greeting: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 28,
    color: Colors.deepEspresso,
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 24,
    color: Colors.forestGreen,
  },
  profileCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.deepEspresso,
  },
  profileCuisine: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.warmStone,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.mintGlow,
  },
  statusBadgePaused: {
    borderColor: Colors.softCoral,
    backgroundColor: Colors.errorBg,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.forestGreen,
  },
  statusDotPaused: {
    backgroundColor: Colors.terracotta,
  },
  statusText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: Colors.forestGreen,
  },
  statusTextPaused: {
    color: Colors.terracotta,
  },
  profileAddress: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmTaupe,
    marginTop: 12,
    paddingLeft: 52,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warningBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: Colors.amberLight,
    gap: 12,
  },
  statusTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.deepEspresso,
    marginBottom: 3,
  },
  statusSub: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: Colors.warmTaupe,
    lineHeight: 17,
  },
  sectionTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 20,
    color: Colors.deepEspresso,
    marginBottom: 14,
  },
  statsGrid: {
  sectionTitleHighlight: {
    color: Colors.forestGreen,
  },
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  revenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.offWhite,
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mintGlow,
    marginBottom: 28,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  revenueLeft: {
    gap: 6,
  },
  revenueLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 15,
    color: Colors.warmStone,
  },
  revenueAmount: {
    fontFamily: 'DMSans-Bold',
    fontSize: 34,
    color: Colors.forestGreen,
  },
  revenueIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.successBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 28,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.offWhite,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 13,
    color: Colors.deepEspresso,
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 36,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    marginBottom: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.softBeige,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 18,
    color: Colors.deepEspresso,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.forestGreen,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  emptyButtonText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 14,
    color: Colors.offWhite,
  },
  bagsList: {
    gap: 12,
    marginBottom: 24,
  },
  liveBagCard: {
    backgroundColor: Colors.offWhite,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.mintGlow,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  liveBagTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  liveBagIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.sageLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBagDetails: {
    flex: 1,
    gap: 2,
  },
  liveBagTitle: {
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
    color: Colors.deepEspresso,
  },
  liveBagMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: Colors.warmStone,
  },
  liveBagTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 52,
  },
  liveBagTime: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: Colors.warmStone,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  fab: {
    backgroundColor: Colors.forestGreen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  fabText: {
    color: Colors.offWhite,
    fontFamily: 'DMSans-Bold',
    fontSize: 16,
  },
});
