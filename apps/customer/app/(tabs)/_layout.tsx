import React from 'react';
import { Tabs } from 'expo-router';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Home, Search, ShoppingBag, Users, User } from 'lucide-react-native';
import { Colors } from '../../constants/colors';
import { useCart } from '@/store/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function CartTabIcon({ color, size }: { color: string; size: number }) {
  const { totalItems } = useCart();
  return (
    <View style={{ position: 'relative' }}>
      <ShoppingBag size={size} color={color} />
      {totalItems > 0 && (
        <View style={tabStyles.cartBadge}>
          <Text style={tabStyles.cartBadgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
        </View>
      )}
    </View>
  );
}

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          tabStyles.tabBar,
          {
            height: (Platform.OS === 'web' ? 76 : 64) + bottom,
            paddingBottom: bottom + (Platform.OS === 'web' ? 12 : 8),
            paddingTop: Platform.OS === 'web' ? 10 : 8,
          },
        ],
        tabBarActiveTintColor: Colors.forestGreen,
        tabBarInactiveTintColor: Colors.warmTaupe,
        tabBarLabelStyle: tabStyles.tabLabel,
        tabBarItemStyle: tabStyles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ color, size }) => <CartTabIcon color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.offWhite,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingBottom: 8,
    paddingTop: 8,
    shadowColor: Colors.shadowMd,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 8,
  },
  tabLabel: {
    fontSize: 11,
    lineHeight: 13,
    fontFamily: 'DMSans-Medium',
  },
  tabItem: {
    paddingTop: Platform.OS === 'web' ? 0 : 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: Colors.softCoral,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.offWhite,
  },
  cartBadgeText: {
    fontSize: 10,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
    lineHeight: 12,
  },
});
