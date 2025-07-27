import { DATABASE_ID, databases, HABITS_COLLECTION_ID } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Dimensions, Image, ScrollView, StyleSheet, View } from "react-native";
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>Ready to Live{'\n'}Healthier?</Text>
          
          <Card style={styles.heroCard} elevation={8 as any}>
            <Card.Content style={styles.heroCardContent}>
              <View style={styles.heroTextSection}>
                <Text style={styles.heroCardTitle}>Drinking Tracker</Text>
                <Text style={styles.heroCardSubtitle}>
                  Stay hydrated, it's{'\n'}nature's best{'\n'}refreshment!
                </Text>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonIcon}>→</Text>
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

        <View style={styles.headerContainer}>
          <Text style={styles.headerSubtitle}>
         Build lasting habits
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
                outlineColor="#404040"
                activeOutlineColor="#CDFF47"
                theme={{
                  colors: {
                    background: '#2d2d2d',
                    onSurface: '#fff',
                    outline: '#404040',
                    onSurfaceVariant: '#a0a0a0',
                  }
                }}
                textColor="#fff"
                left={<TextInput.Icon icon="bullseye-arrow" iconColor="#CDFF47" />}
                placeholder="Enter your habit name..."
                placeholderTextColor="#6a6a6a"
              />
              
              <TextInput
                label="Description"
                mode="outlined"
                value={description}
                onChangeText={setDescription}
                style={styles.descriptionInput}
                multiline
                numberOfLines={5}
                outlineColor="#404040"
                activeOutlineColor="#CDFF47"
                theme={{
                  colors: {
                    background: '#2d2d2d',
                    onSurface: '#fff',
                    outline: '#404040',
                    onSurfaceVariant: '#a0a0a0',
                  }
                }}
                textColor="#fff"
                left={<TextInput.Icon icon="text" iconColor="#CDFF47" />}
                placeholder="Describe your habit in detail..."
                placeholderTextColor="#6a6a6a"
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
                    secondaryContainer: '#CDFF47',
                    onSecondaryContainer: '#1a1a1a',
                    outline: '#404040',
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
              buttonColor="#CDFF47"
              textColor="#1a1a1a"
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
    backgroundColor: '#1a1a1a',
  },
  
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
  },

  // Hero Section Styles
  heroSection: {
    marginBottom: 12,
  },

  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 20,
    lineHeight: 38,
  },

  heroCard: {
    borderRadius: 20,
    backgroundColor: '#CDFF47',
    shadowColor: '#CDFF47',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'visible',
    position: 'relative',
  },

  heroCardContent: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },

  heroTextSection: {
    flex: 1,
    paddingRight: 16,
  },

  heroCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
    lineHeight: 20,
  },

  heroCardSubtitle: {
    fontSize: 16,
    color: '#2d2d2d',
    marginBottom: 20,
    lineHeight: 22,
    fontWeight: '500',
  },

  heroButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  heroButtonIcon: {
    fontSize: 20,
    color: '#1a1a1a',
    fontWeight: '600',
  },

  heroImageSection: {
    position: 'relative',
    width: 0,
    height: 0,
  },

  girlImageContainer: {
    position: 'absolute',
    bottom: -151,
    right: -24,
    width: 180,
    height: 280,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  girlImage: {
    width: '100%',
    height: '100%',
  },

  headerContainer: {
    marginBottom: 22,
    paddingHorizontal: 10,
  },

  headerSubtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 38,
    marginTop: 0,
  },

  formCard: {
    borderRadius: 8,
    backgroundColor: '#2d2d2d',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 12,
    borderWidth: 1,
    borderColor: '#CDFF47',
  },

  cardContent: {
    padding: 28,
  },

  inputContainer: {
    marginBottom: 12,
  },

  input: {
    marginBottom: 16,
    backgroundColor: '#2d2d2d',
    fontSize: 16,
  },

  descriptionInput: {
    marginBottom: 0,
    backgroundColor: '#2d2d2d',
    fontSize: 16,
    minHeight: 80,
  },

  frequencySection: {
    marginBottom: 8,
  },

  sectionLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  segmentedButtons: {
    backgroundColor: '#404040',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#404040',
  },

  submitButton: {
    borderRadius: 6,
    elevation: 8,
    shadowColor: '#CDFF47',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    marginTop: 8,
  },

  disabledButton: {
    backgroundColor: '#6a6a6a',
    elevation: 0,
    shadowOpacity: 0,
  },

  buttonContent: {
    paddingVertical: 8,
    paddingHorizontal: 8,
  },

  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  errorCard: {
    marginTop: 20,
    backgroundColor: '#4a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8b2635',
  },

  errorContent: {
    padding: 16,
  },

  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
});