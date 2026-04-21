import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Heart, Share2, Award, TrendingUp, Users, Gift } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { COMMUNITY_POSTS, BADGES } from '@/constants/data';
import { ImpactStats } from '@/components/ui/ImpactStats';

const LEADERBOARD = [
  { rank: 1, name: 'Priya S.', city: 'Bengaluru', rescues: 47, badge: '🥇' },
  { rank: 2, name: 'Arjun M.', city: 'Mumbai', rescues: 39, badge: '🥈' },
  { rank: 3, name: 'Kavitha R.', city: 'Chennai', rescues: 31, badge: '🥉' },
  { rank: 4, name: 'Rohan V.', city: 'Pune', rescues: 28, badge: '' },
  { rank: 5, name: 'Ananya K.', city: 'Hyderabad', rescues: 24, badge: '' },
];

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const toggleLike = (postId: string) => {
    setLikedPosts(prev =>
      prev.includes(postId) ? prev.filter(id => id !== postId) : [...prev, postId]
    );
  };

  return (
    <ScrollView
      style={[styles.root, { paddingTop: insets.top }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Header */}
      <Text style={styles.pageTitle}>Community Story</Text>
      <Text style={styles.pageSub}>Thousands of neighbors rescuing alongside you.</Text>

      {/* Personal Impact */}
      <View style={styles.impactSection}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <Text style={styles.impactValue}>12</Text>
            <Text style={styles.impactLabel}>Meals Rescued</Text>
          </View>
          <View style={styles.impactCard}>
            <Text style={styles.impactValue}>₹1,840</Text>
            <Text style={styles.impactLabel}>Money Saved</Text>
          </View>
          <View style={[styles.impactCard, styles.impactCardWide]}>
            <Text style={styles.impactValue}>27.6kg</Text>
            <Text style={styles.impactLabel}>CO₂ Prevented</Text>
            <Text style={styles.impactCompare}>Like planting 12 trees</Text>
          </View>
        </View>
      </View>

      {/* Global Impact */}
      <ImpactStats />

      {/* Badges */}
      <View style={styles.badgesSection}>
        <Text style={styles.sectionTitle}>ResQRun Badges</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgesScroll}>
          {BADGES.map(badge => (
            <View key={badge.id} style={[styles.badgeCard, !badge.earned && styles.badgeCardLocked]}>
              <Text style={styles.badgeIcon}>{badge.icon}</Text>
              <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>{badge.name}</Text>
              <Text style={styles.badgeDesc}>{badge.description}</Text>
              {!badge.earned && badge.progress !== undefined && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${((badge.progress || 0) / (badge.total || 1)) * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>{badge.progress}/{badge.total}</Text>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Community Feed */}
      <View style={styles.feedSection}>
        <Text style={styles.sectionTitle}>Stories from the Community</Text>
        {COMMUNITY_POSTS.map(post => {
          const liked = likedPosts.includes(post.id);
          const likeCount = post.likes + (liked ? 1 : 0);
          return (
            <View key={post.id} style={styles.feedCard}>
              <View style={styles.feedHeader}>
                <Image source={{ uri: post.userAvatar }} style={styles.userAvatar} />
                <View style={styles.feedUserInfo}>
                  <Text style={styles.feedUserName}>{post.userName}</Text>
                  <View style={styles.feedMeta}>
                    <Text style={styles.feedRestName}>@ {post.restaurantName}</Text>
                    <Text style={styles.feedTime}> · {post.timeAgo}</Text>
                  </View>
                </View>
              </View>
              <Image source={{ uri: post.imageUrl }} style={styles.feedImage} />
              <View style={styles.feedContent}>
                <Text style={styles.feedCaption}>{post.caption}</Text>
                <View style={styles.feedActions}>
                  <TouchableOpacity style={styles.feedActionBtn} onPress={() => toggleLike(post.id)}>
                    <Heart
                      size={18}
                      color={liked ? Colors.softCoral : Colors.warmTaupe}
                      fill={liked ? Colors.softCoral : 'none'}
                    />
                    <Text style={[styles.feedActionText, liked && styles.feedActionTextLiked]}>{likeCount}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.feedActionBtn}>
                    <Share2 size={18} color={Colors.warmTaupe} />
                    <Text style={styles.feedActionText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Leaderboard */}
      <View style={styles.leaderboardSection}>
        <Text style={styles.sectionTitle}>ResQRun Leaderboard</Text>
        <Text style={styles.leaderSub}>A community high-five for our heroes.</Text>
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

      {/* Invite Card */}
      <View style={styles.inviteCard}>
        <Gift size={28} color={Colors.goldenAmber} />
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
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginBottom: 12,
  },
  impactSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  impactCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  impactCardWide: {
    width: '100%',
    flex: 0,
    backgroundColor: Colors.forestGreen,
  },
  impactValue: {
    fontSize: 26,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  impactLabel: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: 2,
  },
  impactCompare: {
    fontSize: 11,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageLight,
    marginTop: 4,
  },
  communityStats: {
    flexDirection: 'row',
    backgroundColor: Colors.softBeige,
    marginHorizontal: 20,
    borderRadius: 18,
    paddingVertical: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    marginTop: 2,
  },
  statLabel: {
    fontSize: 10,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  badgesSection: {
    marginBottom: 24,
  },
  badgesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  badgeCard: {
    width: 120,
    backgroundColor: Colors.offWhite,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badgeCardLocked: {
    opacity: 0.65,
  },
  badgeIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  badgeName: {
    fontSize: 12,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    textAlign: 'center',
    marginBottom: 3,
  },
  badgeNameLocked: {
    color: Colors.warmTaupe,
  },
  badgeDesc: {
    fontSize: 10,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 14,
  },
  progressContainer: {
    width: '100%',
    marginTop: 8,
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.sageGreen,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmStone,
  },
  feedSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  feedCard: {
    backgroundColor: Colors.offWhite,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.sageGreen,
  },
  feedUserInfo: { flex: 1 },
  feedUserName: {
    fontSize: 14,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
  },
  feedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedRestName: {
    fontSize: 12,
    fontFamily: 'DMSans-Medium',
    color: Colors.sageGreen,
  },
  feedTime: {
    fontSize: 12,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmTaupe,
  },
  feedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  feedContent: {
    padding: 14,
  },
  feedCaption: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    color: Colors.deepEspresso,
    lineHeight: 21,
    marginBottom: 12,
  },
  feedActions: {
    flexDirection: 'row',
    gap: 16,
  },
  feedActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  feedActionText: {
    fontSize: 13,
    fontFamily: 'DMSans-Medium',
    color: Colors.warmTaupe,
  },
  feedActionTextLiked: {
    color: Colors.softCoral,
  },
  leaderboardSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  leaderSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    marginTop: -8,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.offWhite,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  leaderRank: {
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.deepEspresso,
    width: 30,
    textAlign: 'center',
  },
  leaderInfo: {
    flex: 1,
  },
  leaderName: {
    fontSize: 15,
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
    fontSize: 18,
    fontFamily: 'DMSans-Bold',
    color: Colors.forestGreen,
  },
  leaderCountLabel: {
    fontSize: 10,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
  },
  inviteCard: {
    marginHorizontal: 20,
    backgroundColor: Colors.amberLight,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F0D89C',
  },
  inviteTitle: {
    fontSize: 20,
    fontFamily: 'PlayfairDisplay-Bold',
    color: Colors.deepEspresso,
    marginTop: 10,
    marginBottom: 8,
    textAlign: 'center',
  },
  inviteSub: {
    fontSize: 13,
    fontFamily: 'DMSans-Regular',
    color: Colors.warmStone,
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 16,
  },
  inviteBtn: {
    backgroundColor: Colors.goldenAmber,
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  inviteBtnText: {
    fontSize: 15,
    fontFamily: 'DMSans-Bold',
    color: Colors.offWhite,
  },
});
