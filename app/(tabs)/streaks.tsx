import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit, HabitCompletion } from "@/types/database.type";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";

export default function StreaksScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            fetchHabits();
          } else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            fetchHabits();
          }
        }
      );

      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            fetchCompletions();
          }
        }
      );

      fetchHabits();
      fetchCompletions();

      return () => {
        habitsSubscription();
        completionsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      setHabits(response.documents as Habit[]);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCompletions = async () => {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [Query.equal("user_id", user?.$id ?? "")]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions);
    } catch (error) {
      console.error(error);
    }
  };

  interface StreakData {
    streak: number;
    bestStreak: number;
    total: number;
  }

  const getStreakData = (habitId: string): StreakData => {
    const habitCompletions = completedHabits
      ?.filter((c) => c.habit_id === habitId)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );

    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    // build streak data
    let streak = 0;
    let bestStreak = 0;
    let total = habitCompletions.length;

    let lastDate: Date | null = null;
    let currentStreak = 0;

    habitCompletions?.forEach((c) => {
      const date = new Date(c.completed_at);
      if (lastDate) {
        const diff =
          (date.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

        if (diff <= 1.5) {
          currentStreak += 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }

      if (currentStreak > bestStreak) bestStreak = currentStreak;
      streak = currentStreak;
      lastDate = date;
    });

    return { streak, bestStreak, total };
  };

  const habitStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreakData(habit.$id);
    return { habit, bestStreak, streak, total };
  });

  const rankedHabits = habitStreaks.sort((a, b) => b.bestStreak - a.bestStreak);

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];
  
  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Today's Challenge</Text>
        <Text style={styles.seeAllText}>See All</Text>
      </View>
      
      {/* Hero Card Section */}
      <View style={styles.heroSection}>
        <Card style={styles.heroCard} elevation={8 as any}>
          <Card.Content style={styles.heroCardContent}>
            <View style={styles.heroTextSection}>
              <Text style={styles.heroCardTitle}>Daily {'\n'}Challenge</Text>
              <Text style={styles.heroCardSubtitle}>
                Do your plan before 09:00 AM
              </Text>
              
              {/* User Icons Section */}
              <View style={styles.userIconsContainer}>
                <View style={styles.userIconsRow}>
                  <Image 
                    source={require('@/assets/images/icon4.png')} 
                    style={styles.userIcon}
                  />
                  <Image 
                    source={require('@/assets/images/icon3.jpeg')} 
                    style={[styles.userIcon, styles.userIconOverlap]}
                  />
                  <Image 
                    source={require('@/assets/images/icon2.jpg')} 
                    style={[styles.userIcon, styles.userIconOverlap]}
                  />
                  <View style={[styles.userIcon, styles.userIconOverlap, styles.userIconCount]}>
                    <Text style={styles.userIconCountText}>+4</Text>
                  </View>
                </View>
              </View>
            </View>
            <View style={styles.heroImageSection}>
              <View style={styles.girlImageContainer}>
                <Image 
                  source={require('@/assets/images/gym.png')} 
                  style={styles.girlImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    
      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.leaderboardTitle}>🏆 Leaderboard</Text>
          <Text style={styles.leaderboardDescription}>Your top performing habits ranked by best streak</Text>
          <Text style={styles.rankingTitle}> Top Streaks</Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}> {key + 1} </Text>
              </View>
              <Text style={styles.rankingHabit}> {item.habit.title}</Text>
              <Text style={styles.rankingStreak}> {item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
       <View style={styles.subSection}>
        <Text style={styles.subTitle}>Daily Habit</Text>
        <Text style={styles.subseeAllText}>See All</Text>
      </View>
      {habits.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}> No Habits yet. Add your first Habit!</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card
              key={key}
              style={[styles.card, key === 0 && styles.firstCard]}
            >
              <Card.Content>
                <Text variant="titleMedium" style={styles.habitTitle}>
                
                  {habit.title}
                </Text>
                <Text style={styles.habitDescription}>
                  
                  {habit.description}
                </Text>
                <View style={styles.statsRow}>
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}> 🔥 {streak}</Text>
                    <Text style={styles.statLabel}> Current</Text>
                  </View>
                  <View style={styles.statBadgeGold}>
                    <Text style={styles.statBadgeText}> 🏆 {bestStreak}</Text>
                    <Text style={styles.statLabel}> Best</Text>
                  </View>
                  <View style={styles.statBadgeGreen}>
                    <Text style={styles.statBadgeText}> ✅ {total}</Text>
                    <Text style={styles.statLabel}> Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  
  // Header Styles
  headerSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 36,
    marginBottom: 8,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CDFF47",
    letterSpacing: 0.2,
  },
  
  // Hero Card Styles
  heroSection: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 20,
  },

  heroCard: {
    borderRadius: 20,
    backgroundColor: "#CDFF47",
    shadowColor: "#CDFF47",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'visible',
    position: 'relative',
  },

  heroCardContent: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 100,
  },

  heroTextSection: {
    flex: 1,
    paddingRight: 12,
  },

  heroCardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 8,
    lineHeight: 24,
    letterSpacing: 0.5,
  },

  heroCardSubtitle: {
    fontSize: 13,
    color: "#2d2d2d",
    marginBottom: 16,
    lineHeight: 18,
    fontWeight: "500",
  },

  // User Icons Styles
  userIconsContainer: {
    marginBottom: 16,
  },

  userIconsRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  userIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#fff",
  },

  userIconOverlap: {
    marginLeft: -8,
  },

  userIconCount: {
    backgroundColor: "#2d2d2d",
    alignItems: "center",
    justifyContent: "center",
  },

  userIconCountText: {
    color: "#CDFF47",
    fontSize: 11,
    fontWeight: "bold",
  },


  heroImageSection: {
    position: "relative",
    width: 0,
    height: 0,
  },

  girlImageContainer: {
    position: "absolute",
    bottom: -98,
    right: -16,
    width: 155,
    height: 180,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  girlImage: {
    width: "100%",
    height: "100%",
  },

  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: "#2d2d2d",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#404040",
  },
  firstCard: {
    borderWidth: 2,
    borderColor: "#CDFF47",
  },
  habitTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
    color: "#fff",
  },
  habitDescription: {
    color: "#a0a0a0",
    marginBottom: 8,
  },
  subSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 8,
  },

  subTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.3,
  },

  subseeAllText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#CDFF47",
    letterSpacing: 0.2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  statBadge: {
    backgroundColor: "#4a2c1a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#8b4513",
  },
  statBadgeGold: {
    backgroundColor: "#4a4a1a",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#b8860b",
  },
  statBadgeGreen: {
    backgroundColor: "#1a4a2e",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignItems: "center",
    minWidth: 60,
    borderWidth: 1,
    borderColor: "#228b22",
  },
  statBadgeText: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#fff",
  },
  statLabel: {
    fontSize: 11,
    color: "#a0a0a0",
    marginTop: 2,
    fontWeight: "500",
  },

  rankingContainer: {
    marginBottom: 24,
    marginHorizontal: 16,
    backgroundColor: "#2d2d2d",
    borderRadius: 20,
    padding: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#404040",
  },
  leaderboardTitle: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 8,
    color: "#CDFF47",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  leaderboardDescription: {
    fontSize: 14,
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 18,
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#CDFF47",
    letterSpacing: 0.5,
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#404040",
    paddingBottom: 12,
  },
  rankingBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "#404040",
  },
  badge1: { backgroundColor: "#CDFF47" }, // bright yellow-green
  badge2: { backgroundColor: "#6b7280" }, // silver
  badge3: { backgroundColor: "#cd7f32" }, // bronze

  rankingBadgeText: {
    fontWeight: "bold",
    color: "#1a1a1a",
    fontSize: 16,
  },

  rankingHabit: {
    flex: 1,
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  rankingStreak: {
    fontSize: 16,
    color: "#CDFF47",
    fontWeight: "bold",
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
  },
});