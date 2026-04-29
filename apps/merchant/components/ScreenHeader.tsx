import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors } from '../constants/colors';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export function ScreenHeader({ title, subtitle, showBack = true }: ScreenHeaderProps) {
  const router = useRouter();

  return (
    <View style={styles.header}>
      {showBack ? (
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.deepEspresso} />
        </TouchableOpacity>
      ) : (
        <View style={styles.placeholder} />
      )}
      
      {title ? <Text style={styles.headerTitle}>{title}</Text> : null}
      
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    color: Colors.warmStone,
  },
});
