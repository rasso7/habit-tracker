import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, View } from "react-native";
import { Button, Divider, Surface, Text } from "react-native-paper";

export default function action() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
     

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Surface style={styles.profileCard} elevation={0}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <MaterialCommunityIcons
                name="account-circle"
                size={60}
                color="#7c4dff"
              />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.name || user?.email?.split('@')[0] || "User"}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || "No email available"}
              </Text>
            </View>
          </View>
        </Surface>

        {/* Account Details Card */}
        <Surface style={styles.card} elevation={0}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Account Information</Text>
            
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="email-outline"
                size={24}
                color="#6c6c80"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>
                  {user?.email || "No email available"}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="account-outline"
                size={24}
                color="#6c6c80"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>
                  {user?.$id || "Not available"}
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="calendar-outline"
                size={24}
                color="#6c6c80"
              />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Account Created</Text>
                <Text style={styles.infoValue}>
                  {user?.$createdAt 
                    ? new Date(user.$createdAt).toLocaleDateString()
                    : "Not available"
                  }
                </Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Settings Card */}
        <Surface style={styles.card} elevation={0}>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Settings</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="bell-outline"
                  size={24}
                  color="#6c6c80"
                />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#6c6c80"
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="shield-outline"
                  size={24}
                  color="#6c6c80"
                />
                <Text style={styles.settingLabel}>Privacy & Security</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#6c6c80"
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <MaterialCommunityIcons
                  name="help-circle-outline"
                  size={24}
                  color="#6c6c80"
                />
                <Text style={styles.settingLabel}>Help & Support</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#6c6c80"
              />
            </View>
          </View>
        </Surface>

        {/* Sign Out Button */}
        <View style={styles.signOutContainer}>
          <Button 
            mode="contained" 
            onPress={signOut} 
            icon="logout"
            style={styles.signOutButton}
            contentStyle={styles.signOutButtonContent}
            labelStyle={styles.signOutButtonLabel}
          >
            Sign Out
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: "bold",
    color: "#22223b",
  },
  profileCard: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  avatarContainer: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#22223b",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#6c6c80",
  },
  card: {
    marginBottom: 18,
    borderRadius: 18,
    backgroundColor: "#f7f2fa",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#22223b",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#6c6c80",
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: "#22223b",
    fontWeight: "500",
  },
  divider: {
    marginVertical: 12,
    backgroundColor: "#e0e0e0",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#22223b",
    marginLeft: 16,
  },
  signOutContainer: {
    marginTop: 24,
    marginBottom: 32,
  },
  signOutButton: {
    backgroundColor: "#e53935",
    borderRadius: 12,
  },
  signOutButtonContent: {
    paddingVertical: 8,
  },
  signOutButtonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
});