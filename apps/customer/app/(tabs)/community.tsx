import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { COMMUNITY_POSTS } from '../../constants/data';

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.', city: 'Bengaluru', rescues: 47, badge: '🥇' },
  { rank: 2, name: 'Arjun M.', city: 'Mumbai', rescues: 39, badge: '🥈' },
  { rank: 3, name: 'Kavitha R.', city: 'Chennai', rescues: 31, badge: '🥉' },
  { rank: 4, name: 'Rohan V.', city: 'Pune', rescues: 28, badge: '' },
  { rank: 5, name: 'Ananya K.', city: 'Hyderabad', rescues: 24, badge: '' },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      <Text style={styles.pageTitle}>Community Story</Text>
      <Text style={styles.pageSub}>Thousands of neighbors rescuing alongside you.</Text>

      <View style={styles.resqRunCard}>
        <View style={styles.resqRunHeader}>
          <Text style={styles.resqRunTitle}>ResQRun</Text>
          <Text style={styles.resqRunBadge}>Coming Soon</Text>
        </View>
        <Text style={styles.resqRunBody}>Community food rescue challenges are coming soon.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stories from the Community</Text>
        {COMMUNITY_POSTS.map(post => (
          <View key={post.id} style={styles.feedCard}>
            <View style={styles.feedHeader}>
              <Image source={{ uri: post.userAvatar }} style={styles.userAvatar} />
              <View style={styles.feedUserInfo}>
                <Text style={styles.feedUserName}>{post.userName}</Text>
                <Text style={styles.feedMeta}>@ {post.restaurantName} · {post.timeAgo}</Text>
              </View>
            </View>
            <Image source={{ uri: post.imageUrl }} style={styles.feedImage} />
            <View style={styles.feedContent}>
              <Text style={styles.feedCaption}>{post.caption}</Text>
              <Text style={styles.feedLikes}>{post.likes} rescues cheered</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ResQRun Leaderboard</Text>
        <Text style={styles.sectionSub}>A community high-five for our heroes.</Text>
        {LEADERBOARD.map(item => (
          <View key={item.rank} style={styles.leaderRow}>
            <Text style={styles.leaderRank}>{item.badge || `#${item.rank}`}</Text>
            <View style={styles.leaderInfo}>
              <Text style={styles.leaderName}>{item.name}</Text>
              <Text style={styles.leaderCity}>{item.city}</Text>
            </View>
            <View style={styles.leaderRescues}>
              <Text style={styles.leaderCount}>{item.rescues}</Text>
              <Text style={styles.leaderCountLabel}>rescues</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.inviteCard}>
        <Text style={styles.inviteTitle}>Spread the Goodness</Text>
        <Text style={styles.inviteSub}>Invite a friend and you both get ₹50 off your next rescue. Share the love.</Text>
        <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.85}>
          <Text style={styles.inviteBtnText}>Invite Friends</Text>
        </TouchableOpacity>
      </View>
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
  pageTitle: {
    fontSize: 28,
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
  resqRunCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    marginHorizontal: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  resqRunHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resqRunTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  resqRunBadge: {
    fontSize: 11,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
    backgroundColor: Colors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  resqRunBody: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    lineHeight: 19,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 10,
  },
  sectionSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  feedCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 18,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  feedUserInfo: {
    flex: 1,
  },
  feedUserName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  feedMeta: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 2,
  },
  feedImage: {
    width: '100%',
    height: 220,
    resizeMode: 'cover',
  },
  feedContent: {
    padding: 14,
  },
  feedCaption: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.deepEspresso,
    lineHeight: 19,
    marginBottom: 10,
  },
  feedLikes: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderRank: {
    width: 36,
    textAlign: 'center',
    fontSize: 16,
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  leaderCity: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  leaderRescues: {
    alignItems: 'flex-end',
  },
  leaderCount: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  leaderCountLabel: {
    fontSize: 11,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  inviteCard: {
    backgroundColor: Colors.softBeige,
    borderRadius: 18,
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  inviteTitle: {
    fontSize: 16,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  inviteSub: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 18,
  },
  inviteBtn: {
    backgroundColor: Colors.forestGreen,
    borderRadius: 12,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  inviteBtnText: {
    fontSize: 13,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
