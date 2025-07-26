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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import { Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Card, Surface, Text } from "react-native-paper";

export default function Index() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>();
  const [completedHabits, setCompletedHabits] = useState<string[]>();

  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});

  // Generate calendar dates (3 before, current, 3 after)
  const generateCalendarDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = -3; i <= 3; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    
    return dates;
  };

  const calendarDates = generateCalendarDates();

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const formatDay = (date: Date) => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return false;
  };

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
            fetchTodayCompletions();
          }
        }
      );

      fetchHabits();
      fetchTodayCompletions();

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

  const fetchTodayCompletions = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const response = await databases.listDocuments(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        [
          Query.equal("user_id", user?.$id ?? ""),
          Query.greaterThanEqual("completed_at", today.toISOString()),
        ]
      );
      const completions = response.documents as HabitCompletion[];
      setCompletedHabits(completions.map((c) => c.habit_id));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteHabit = async (id: string) => {
    try {
      await databases.deleteDocument(DATABASE_ID, HABITS_COLLECTION_ID, id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCompleteHabit = async (id: string) => {
    if (!user || completedHabits?.includes(id)) return;
    try {
      const currentDate = new Date().toISOString();
      await databases.createDocument(
        DATABASE_ID,
        COMPLETIONS_COLLECTION_ID,
        ID.unique(),
        {
          habit_id: id,
          user_id: user.$id,
          completed_at: currentDate,
        }
      );

      const habit = habits?.find((h) => h.$id === id);
      if (!habit) return;

      await databases.updateDocument(DATABASE_ID, HABITS_COLLECTION_ID, id, {
        streak_count: habit.streak_count + 1,
        last_completed: currentDate,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const isHabitCompleted = (habitId: string) =>
    completedHabits?.includes(habitId);

  const renderRightActions = (habitId: string) => (
    <View style={styles.swipeActionRight}>
      {isHabitCompleted(habitId) ? (
        <View style={styles.completedAction}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color={"#000000"}
          />
          <Text style={styles.actionText}>Completed!</Text>
        </View>
      ) : (
        <View style={styles.completeAction}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24}
            color={"#000000"}
          />
          <Text style={styles.actionText}>Complete</Text>
        </View>
      )}
    </View>
  );

  const renderLeftActions = () => (
    <View style={styles.swipeActionLeft}>
      <View style={styles.deleteAction}>
        <MaterialCommunityIcons
          name="trash-can-outline"
          size={24}
          color={"#000000"}
        />
        <Text style={styles.actionText}>Delete</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>😊</Text>
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.name || user?.email?.split('@')[0] || 'Alex Cole'}
              </Text>
              <Text style={styles.greeting}>Today's Habit</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.addButton}>
            <MaterialCommunityIcons
              name="plus"
              size={24}
              color="#1a1a1a"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar Section */}
      <View style={styles.calendarSection}>
        <View style={styles.calendarHeader}>
          <View style={styles.monthNavigation}>
            <TouchableOpacity>
              <MaterialCommunityIcons name="chevron-left" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.monthText}>March 2025</Text>
            <TouchableOpacity>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.calendarContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.calendarScrollContent}
          >
            {calendarDates.map((date, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateItem,
                  isToday(date) && styles.dateItemToday,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  isToday(date) && styles.dayTextToday,
                ]}>
                  {formatDay(date)}
                </Text>
                <Text style={[
                  styles.dateText,
                  isToday(date) && styles.dateTextToday,
                ]}>
                  {formatDate(date)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Time Periods */}
        <View style={styles.timePeriodsContainer}>
          <TouchableOpacity style={styles.timePeriod}>
            <Text style={styles.timePeriodText}>Morning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timePeriod}>
            <Text style={styles.timePeriodText}>Afternoon</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timePeriod}>
            <Text style={styles.timePeriodText}>Evening</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Card Section */}
      <View style={styles.heroSection}>
        <Card style={styles.heroCard} elevation={8 as any}>
          <Card.Content style={styles.heroCardContent}>
            <View style={styles.heroTextSection}>
              <Text style={styles.heroCardTitle}>Habit Tracker</Text>
              <Text style={styles.heroCardSubtitle}>
            One step daily, it's your{'\n'} way to lifelong success!
              </Text>
              <TouchableOpacity style={styles.heroButton}>
                <Text style={styles.heroButtonIcon}>→</Text>
              </TouchableOpacity>
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

      {/* Habits Section */}
      <View style={styles.habitsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Start New Habits</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          style={styles.habitsContainer}
        >
          {habits?.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={64}
                color="#4a5568"
              />
              <Text style={styles.emptyStateTitle}>
                No Habits Yet
              </Text>
              <Text style={styles.emptyStateText}>
                Start building better habits today!
              </Text>
            </View>
          ) : (
            habits?.map((habit, key) => (
              <Swipeable
                ref={(ref) => {
                  swipeableRefs.current[habit.$id] = ref;
                }}
                key={key}
                overshootLeft={false}
                overshootRight={false}
                renderLeftActions={renderLeftActions}
                renderRightActions={() => renderRightActions(habit.$id)}
                onSwipeableOpen={(direction) => {
                  if (direction === "left") {
                    handleDeleteHabit(habit.$id);
                  } else if (direction === "right") {
                    handleCompleteHabit(habit.$id);
                  }

                  swipeableRefs.current[habit.$id]?.close();
                }}
              >
                <Surface
                  style={[
                    styles.card,
                    isHabitCompleted(habit.$id) && styles.cardCompleted,
                  ]}
                  elevation={0}
                >
                  <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle}>{habit.title}</Text>
                      {isHabitCompleted(habit.$id) && (
                        <View style={styles.completedBadge}>
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={20}
                            color="#CDFF47"
                          />
                        </View>
                      )}
                    </View>
                    <Text style={styles.cardDescription}>
                      {habit.description}
                    </Text>
                    <View style={styles.cardFooter}>
                      <View style={styles.streakBadge}>
                        <MaterialCommunityIcons
                          name="fire"
                          size={16}
                          color={"#ff6b35"}
                        />
                        <Text style={styles.streakText}>
                          {habit.streak_count} day streak
                        </Text>
                      </View>
                      <View style={styles.frequencyBadge}>
                        <Text style={styles.frequencyText}>
                          {habit.frequency.charAt(0).toUpperCase() +
                            habit.frequency.slice(1)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </Surface>
              </Swipeable>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: "#1a1a1a",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4a5568",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#CDFF47",
    marginBottom: 2,
  },
  greeting: {
    fontSize: 16,
    color: "#a0a0a0",
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#CDFF47",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },

  calendarSection: {
    backgroundColor: "#2d2d2d",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 20,
    marginBottom: 20,
  },
  calendarHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  calendarContainer: {
    marginBottom: 20,
  },
  calendarScrollContent: {
    paddingHorizontal: 20,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 25,
    minWidth: 50,
    minHeight: 70,
  },
  dateItemToday: {
    backgroundColor: "#CDFF47",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#a0a0a0",
    marginBottom: 8,
  },
  dayTextToday: {
    color: "#1a1a1a",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
  },
  dateTextToday: {
    color: "#1a1a1a",
  },

  timePeriodsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  timePeriod: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  timePeriodText: {
    fontSize: 14,
    color: "#a0a0a0",
    fontWeight: "500",
  },

  // Hero Card Styles
  heroSection: {
    marginHorizontal: 16,
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
    fontSize: 16,
    fontWeight: "800",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 18,
  },

  heroCardSubtitle: {
    fontSize: 13,
    color: "#2d2d2d",
    marginBottom: 12,
    lineHeight: 18,
    fontWeight: "500",
  },

  heroButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  heroButtonIcon: {
    fontSize: 16,
    color: "#1a1a1a",
    fontWeight: "600",
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
    width: 130,
    height: 185,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  girlImage: {
    width: "100%",
    height: "100%",
  },

  habitsSection: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  seeAllText: {
    fontSize: 14,
    color: "#a0a0a0",
    fontWeight: "500",
  },

  habitsContainer: {
    flex: 1,
  },

  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#2d2d2d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#404040",
  },
  cardCompleted: {
    opacity: 0.8,
    borderColor: "#CDFF47",
    backgroundColor: "#333",
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  completedBadge: {
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: "#a0a0a0",
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4a2c1a",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#8b4513",
  },
  streakText: {
    marginLeft: 4,
    color: "#ff6b35",
    fontWeight: "600",
    fontSize: 12,
  },
  frequencyBadge: {
    backgroundColor: "#1a2332",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#2563eb",
  },
  frequencyText: {
    color: "#60a5fa",
    fontWeight: "600",
    fontSize: 12,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#a0a0a0",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#6a6a6a",
    textAlign: "center",
  },

  swipeActionLeft: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
    backgroundColor: "#ef4444",
    borderRadius: 20,
    marginBottom: 16,
    paddingLeft: 20,
  },
  swipeActionRight: {
    justifyContent: "center",
    alignItems: "flex-end",
    flex: 1,
    backgroundColor: "#CDFF47",
    borderRadius: 20,
    marginBottom: 16,
    paddingRight: 20,
  },
  deleteAction: {
    alignItems: "center",
  },
  completeAction: {
    alignItems: "center",
  },
  completedAction: {
    alignItems: "center",
  },
  actionText: {
    color: "#000000",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4,
  },
});