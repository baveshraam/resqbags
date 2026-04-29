import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/colors';
import { AlertCircle } from 'lucide-react-native';

export default function ErrorBoundary({ error, retry }: { error: Error; retry: () => void }) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <AlertCircle size={48} color={Colors.terracotta} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.subtitle}>{error.message || 'An unexpected error occurred.'}</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.retryBtn} onPress={retry}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/')}>
            <Text style={styles.homeText}>Go Home</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.cream,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  title: {
    fontFamily: 'PlayfairDisplay-Bold',
    fontSize: 24,
    color: Colors.deepEspresso,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'DMSans-Regular',
    fontSize: 15,
    color: Colors.warmStone,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  retryBtn: {
    flex: 1,
    backgroundColor: Colors.forestGreen,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.offWhite,
  },
  homeBtn: {
    flex: 1,
    backgroundColor: Colors.softBeige,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  homeText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: Colors.deepEspresso,
  },
});
