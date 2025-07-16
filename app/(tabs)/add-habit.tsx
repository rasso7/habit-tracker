import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import {
  Button,
  Card,
  SegmentedButtons,
  Text,
  TextInput,
  useTheme
} from "react-native-paper";

const FREQUENCIES = ["daily", "weekly", "monthly"];
type Frequency = (typeof FREQUENCIES)[number];

const { width } = Dimensions.get('window');

export default function AddHabitScreen() {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string>("");
  const { user } = useAuth();
  const router = useRouter();
  const theme = useTheme();

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await databases.createDocument(
        DATABASE_ID,
        HABITS_COLLECTION_ID,
        ID.unique(),
        {
          user_id: user.$id,
          title,
          description,
          frequency,
          streak_count: 0,
          last_completed: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }
      );

      router.back();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        return;
      }

      setError("There was an error creating the habit");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          
          <Text style={styles.headerSubtitle}>
            Build positive habits that stick
          </Text>
        </View>

        <Card style={styles.formCard} elevation={8 as any}>
          <Card.Content style={styles.cardContent}>
            <View style={styles.inputContainer}>
              <TextInput
                label="Habit Title"
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
                outlineColor="rgba(102, 126, 234, 0.3)"
                activeOutlineColor="#667eea"
                theme={{
                  colors: {
                    background: '#ffffff',
                  }
                }}
                left={<TextInput.Icon icon="bullseye-arrow" />}
                placeholder="Enter your habit name..."
              />
              
              <TextInput
                label="Description"
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                style={styles.descriptionInput}
                multiline
                numberOfLines={5}
                outlineColor="rgba(102, 126, 234, 0.3)"
                activeOutlineColor="#667eea"
                theme={{
                  colors: {
                    background: '#ffffff',
                  }
                }}
                left={<TextInput.Icon icon="text" />}
                placeholder="Describe your habit in detail..."
              />
            </View>

            <View style={styles.frequencySection}>
              <Text style={styles.sectionLabel}>Frequency</Text>
              <SegmentedButtons
                value={frequency}
                onValueChange={(value) => setFrequency(value as Frequency)}
                buttons={FREQUENCIES.map((freq) => ({
                  value: freq,
                  label: freq.charAt(0).toUpperCase() + freq.slice(1),
                  icon: freq === 'daily' ? 'calendar-today' : 
                        freq === 'weekly' ? 'calendar-week' : 'calendar-month',
                }))}
                style={styles.segmentedButtons}
                theme={{
                  colors: {
                    secondaryContainer: '#a2e3f4',
                    onSecondaryContainer: '#FF0000',
                  }
                }}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSubmit}
              disabled={!title || !description}
              style={[
                styles.submitButton,
                (!title || !description) && styles.disabledButton
              ]}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
              buttonColor="#98e322"
              icon="plus"
            >
              Create Habit
            </Button>

            {error && (
              <Card style={styles.errorCard}>
                <Card.Content style={styles.errorContent}>
                  <Text style={styles.errorText}>{error}</Text>
                </Card.Content>
              </Card>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#efefef',
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },



  headerSubtitle: {
    fontSize: 18,
    color: '#475569',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
    marginTop:18,
  },

  formCard: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.1)',
  },

  cardContent: {
    padding: 28,
  },

  inputContainer: {
    marginBottom: 28,
  },

  input: {
    marginBottom: 24,
    backgroundColor: '#ffffff',
    fontSize: 16,
  },

  descriptionInput: {
    marginBottom: 10,
    backgroundColor: '#ffffff',
    fontSize: 16,
    minHeight: 120,
  },

  frequencySection: {
    marginBottom: 16,
  },

  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  segmentedButtons: {
    backgroundColor: '#a2e3f4',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },

  submitButton: {
    borderRadius: 36,
    elevation: 8,
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginTop: 8,
  },

  disabledButton: {
    backgroundColor: '#d5eab3',
    elevation: 0,
    shadowOpacity: 0,
  },

  buttonContent: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  errorCard: {
    marginTop: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },

  errorContent: {
    padding: 16,
  },

  errorText: {
    color: '#dc2626',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});