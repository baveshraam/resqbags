import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/colors';

interface ScreenContainerProps {
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  contentContainerStyle?: ViewStyle | ViewStyle[];
  refreshControl?: React.ReactElement;
}

export function ScreenContainer({ 
  children, 
  footer, 
  scrollable = true,
  contentContainerStyle,
  refreshControl,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.container}>
      {scrollable ? (
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, contentContainerStyle]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, contentContainerStyle]}>
          {children}
        </View>
      )}

      {footer && (
        <View style={styles.footer}>
          {footer}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  staticContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  footer: {
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.cream,
  },
});
