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
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { ID, Query } from "react-native-appwrite";
import { Swipeable } from "react-native-gesture-handler";
import { Surface, Text } from "react-native-paper";

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
            color={"#fff"}
          />
          <Text style={styles.actionText}>Completed!</Text>
        </View>
      ) : (
        <View style={styles.completeAction}>
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={24}
            color={"#fff"}
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
          color={"#fff"}
        />
        <Text style={styles.actionText}>Delete</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons
            name="calendar-outline"
            size={24}
            color="#64748b"
          />
        </View>
        <View style={styles.headerCenter}>
          <Text style={styles.greeting}>
            Hi, {user?.name || user?.email?.split('@')[0] || 'Alex'} 👋
          </Text>
          <Text style={styles.subtitle}>
            Let's make habits together!
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color="#64748b"
            />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>😊</Text>
          </View>
        </View>
      </View>

      {/* Calendar Date Selector */}
      <View style={styles.calendarContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.calendarScrollContent}
        >
          {calendarDates.map((date, index) => (
            <View
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
            </View>
          ))}
        </ScrollView>
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
              color="#c0c0c0"
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
                          color="#4caf50"
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    marginTop:12,
  },
  headerLeft: {
    width: 40,
    alignItems: "flex-start",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerRight: {
    width: 80,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  greeting: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
    textAlign: "center",
  },
  notificationButton: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
  },

  calendarContainer: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  calendarScrollContent: {
    paddingHorizontal: 16,
  },
  dateItem: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    minWidth: 56,
  },
  dateItemSelected: {
    backgroundColor: "#3b82f6",
  },
  dateItemToday: {
    backgroundColor: "#3b82f6",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 4,
  },
  dayTextSelected: {
    color: "#fff",
  },
  dayTextToday: {
    color: "#fff",
  },
  dateText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  dateTextSelected: {
    color: "#fff",
  },
  dateTextToday: {
    color: "#fff",
  },

  habitsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardCompleted: {
    opacity: 0.7,
    borderColor: "#4caf50",
    borderWidth: 1,
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
    color: "#1a1a1a",
    flex: 1,
  },
  completedBadge: {
    marginLeft: 8,
  },
  cardDescription: {
    fontSize: 14,
    marginBottom: 16,
    color: "#64748b",
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
    backgroundColor: "#fff7ed",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#fed7aa",
  },
  streakText: {
    marginLeft: 4,
    color: "#ea580c",
    fontWeight: "600",
    fontSize: 12,
  },
  frequencyBadge: {
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  frequencyText: {
    color: "#0369a1",
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
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#94a3b8",
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
    backgroundColor: "#10b981",
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
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
});