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
import { ShoppingBag, Heart, CreditCard, Bell, ChartBar as BarChart3, Circle as HelpCircle, Shield, LogOut, ChevronRight, Leaf } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const MENU_ITEMS = [
  {
    group: 'My Activity',
    items: [
      { icon: ShoppingBag, label: 'My Orders', badge: '2', route: '/orders' },
      { icon: Heart, label: 'Saved Items', badge: null, route: null },
      { icon: BarChart3, label: 'Impact Dashboard', badge: null, route: null },
    ],
  },
  {
    group: 'Account',
    items: [
      { icon: CreditCard, label: 'Payment Methods', badge: null, route: null },
      { icon: Bell, label: 'Notifications', badge: '3', route: null },
    ],
  },
  {
    group: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help & Support', badge: null, route: null },
      { icon: Shield, label: 'Terms & Privacy', badge: null, route: null },
    ],
  },
];

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200' }}
            style={styles.avatar}
          />
          <View style={styles.badgeDot}>
            <Text style={styles.badgeDotText}>★</Text>
          </View>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>Priya Sharma</Text>
          <Text style={styles.profileMeta}>Member since March 2025</Text>
          <View style={styles.rescueCount}>
            <Leaf size={13} color={Colors.sageGreen} />
            <Text style={styles.rescueCountText}>12 Meals Rescued</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.quickStats}>
        <View style={styles.qStat}>
          <Text style={styles.qStatValue}>12</Text>
          <Text style={styles.qStatLabel}>Rescues</Text>
        </View>
        <View style={styles.qStatDivider} />
        <View style={styles.qStat}>
          <Text style={styles.qStatValue}>₹1,840</Text>
          <Text style={styles.qStatLabel}>Saved</Text>
        </View>
        <View style={styles.qStatDivider} />
        <View style={styles.qStat}>
          <Text style={styles.qStatValue}>3</Text>
          <Text style={styles.qStatLabel}>Badges</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.impactCard} activeOpacity={0.85}>
        <View style={styles.impactHeader}>
          <Leaf size={14} color={Colors.sageGreen} />
          <Text style={styles.impactTitle}>Your Impact</Text>
        </View>
        <View style={styles.impactRow}>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>12</Text>
            <Text style={styles.impactLabel}>Meals</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>₹1,840</Text>
            <Text style={styles.impactLabel}>Saved</Text>
          </View>
          <View style={styles.impactItem}>
            <Text style={styles.impactValue}>27.6kg</Text>
            <Text style={styles.impactLabel}>CO₂</Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Menu Groups */}
      {MENU_ITEMS.map(group => (
        <View key={group.group} style={styles.menuGroup}>
          <Text style={styles.menuGroupLabel}>{group.group}</Text>
          <View style={styles.menuCard}>
            {group.items.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <React.Fragment key={item.label}>
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={() => item.route && router.push(item.route as any)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.menuIconBox}>
                      <IconComp size={18} color={Colors.forestGreen} />
                    </View>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    <View style={styles.menuRight}>
                      {item.badge && (
                        <View style={styles.menuBadge}>
                          <Text style={styles.menuBadgeText}>{item.badge}</Text>
                        </View>
                      )}
                      <ChevronRight size={16} color={Colors.warmTaupe} />
                    </View>
                  </TouchableOpacity>
                  {idx < group.items.length - 1 && <View style={styles.menuDivider} />}
                </React.Fragment>
              );
            })}
          </View>
        </View>
      ))}

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => router.replace('/onboarding')}
        activeOpacity={0.85}
      >
        <LogOut size={18} color={Colors.softCoral} />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>ResQBag v1.0.0 · Made with care for the planet</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    paddingBottom: 100,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: Colors.softCoral,
  },
  badgeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.goldenAmber,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.cream,
  },
  badgeDotText: {
    fontSize: 11,
    color: Colors.offWhite,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  profileMeta: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 2,
  },
  rescueCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  rescueCountText: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
  },
  editBtn: {
    backgroundColor: Colors.softBeige,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: Colors.offWhite,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactCard: {
    backgroundColor: Colors.successBg,
    marginHorizontal: 20,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.mintGlow,
    marginBottom: 24,
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  impactTitle: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  impactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  impactItem: {
    alignItems: 'center',
    flex: 1,
  },
  impactValue: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  impactLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 2,
  },
  qStat: {
    flex: 1,
    alignItems: 'center',
  },
  qStatValue: {
    fontSize: 20,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  qStatLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 2,
  },
  qStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  menuGroup: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuGroupLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: Colors.warmTaupe,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'DMSans-Medium',
    color: Colors.deepEspresso,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuBadge: {
    backgroundColor: Colors.softCoral,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    minWidth: 22,
    alignItems: 'center',
  },
  menuBadgeText: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 66,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.coralLight,
    backgroundColor: Colors.errorBg,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.softCoral,
  },
  version: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
    textAlign: 'center',
    marginBottom: 10,
  },
});
