import { useAuth } from "@/lib/auth-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Divider, Surface, Text } from "react-native-paper";

export default function action() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with gradient effect */}
      

        {/* Enhanced User Profile Card */}
        <Surface style={styles.profileCard} elevation={0}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarGlow}>
                <MaterialCommunityIcons
                  name="account-circle"
                  size={70}
                  color="#CDFF47"
                />
              </View>
              <TouchableOpacity style={styles.avatarEditButton}>
                <MaterialCommunityIcons
                  name="camera"
                  size={16}
                  color="#1a1a1a"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.name || user?.email?.split('@')[0] || "User"}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || "No email available"}
              </Text>
              <View style={styles.statusBadge}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
        </Surface>

        {/* Stats Cards Row */}
        <View style={styles.statsRow}>
          <Surface style={styles.statCard} elevation={0}>
            <MaterialCommunityIcons name="fire" size={32} color="#ff6b35" />
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Total Habits</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={0}>
            <MaterialCommunityIcons name="trophy" size={32} color="#CDFF47" />
            <Text style={styles.statNumber}>45</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </Surface>
          <Surface style={styles.statCard} elevation={0}>
            <MaterialCommunityIcons name="calendar-check" size={32} color="#4fc3f7" />
            <Text style={styles.statNumber}>180</Text>
            <Text style={styles.statLabel}>Completions</Text>
          </Surface>
        </View>

        {/* Enhanced Account Details Card with Settings and Sign Out */}
        <Surface style={styles.card} elevation={0}>
          <View style={styles.cardContent}>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="account-details" size={24} color="#CDFF47" />
              <Text style={styles.cardTitle}>Account Information</Text>
            </View>
            
            <TouchableOpacity style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={20}
                  color="#CDFF47"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email Address</Text>
                <Text style={styles.infoValue}>
                  {user?.email || "No email available"}
                </Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#6a6a6a" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="account-outline"
                  size={20}
                  color="#4fc3f7"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text style={styles.infoValue}>
                  {user?.$id?.slice(0, 12) + "..." || "Not available"}
                </Text>
              </View>
              <MaterialCommunityIcons name="content-copy" size={20} color="#6a6a6a" />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons
                  name="calendar-outline"
                  size={20}
                  color="#ff6b35"
                />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {user?.$createdAt 
                    ? new Date(user.$createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : "Not available"
                  }
                </Text>
              </View>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            {/* Settings & Preferences Section */}
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="cog" size={24} color="#CDFF47" />
              <Text style={styles.cardTitle}>Settings & Preferences</Text>
            </View>
            
            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: '#4fc3f740' }]}>
                  <MaterialCommunityIcons
                    name="bell-outline"
                    size={20}
                    color="#4fc3f7"
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Notifications</Text>
                  <Text style={styles.settingDescription}>Push notifications & reminders</Text>
                </View>
              </View>
              <View style={styles.settingAction}>
                <View style={styles.toggleOn}>
                  <View style={styles.toggleDot} />
                </View>
              </View>
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: '#ff6b3540' }]}>
                  <MaterialCommunityIcons
                    name="shield-outline"
                    size={20}
                    color="#ff6b35"
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Privacy & Security</Text>
                  <Text style={styles.settingDescription}>Data protection settings</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#6a6a6a"
              />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: '#CDFF4740' }]}>
                  <MaterialCommunityIcons
                    name="palette-outline"
                    size={20}
                    color="#CDFF47"
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Theme & Appearance</Text>
                  <Text style={styles.settingDescription}>Dark mode enabled</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#6a6a6a"
              />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            <TouchableOpacity style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: '#9c27b040' }]}>
                  <MaterialCommunityIcons
                    name="help-circle-outline"
                    size={20}
                    color="#9c27b0"
                  />
                </View>
                <View style={styles.settingContent}>
                  <Text style={styles.settingLabel}>Help & Support</Text>
                  <Text style={styles.settingDescription}>FAQs, contact us</Text>
                </View>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#6a6a6a"
              />
            </TouchableOpacity>

            <Divider style={styles.divider} />

            {/* Sign Out Button */}
            <TouchableOpacity 
              style={styles.signOutButton}
              onPress={signOut}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="logout" size={24} color="#fff" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a1a",
  },
  

  profileCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 25,
    backgroundColor: "#2d2d2d",
    shadowColor: "#CDFF47",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#404040",
    marginTop:34
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 20,
  },
  avatarGlow: {
    padding: 5,
    borderRadius: 50,
    backgroundColor: "#CDFF4720",
  },
  avatarEditButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#CDFF47",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#2d2d2d",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#a0a0a0",
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1a4a2e",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4caf50",
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: "#4caf50",
    fontWeight: "600",
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 16,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#2d2d2d",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#404040",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#a0a0a0",
    textAlign: "center",
  },

  card: {
    marginHorizontal: 16,
    marginBottom: 40,
    borderRadius: 25,
    backgroundColor: "#2d2d2d",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#404040",
  },
  cardContent: {
    padding: 24,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#404040",
    alignItems: "center",
    justifyContent: "center",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: "#a0a0a0",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingContent: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: "#a0a0a0",
  },
  settingAction: {
    marginLeft: 12,
  },
  toggleOn: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#CDFF47",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#1a1a1a",
    alignSelf: "flex-end",
  },

  divider: {
    marginVertical: 16,
    backgroundColor: "#404040",
    height: 1,
  },

  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e53935",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    shadowColor: "#e53935",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 10,
  },
  signOutButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 12,
  },
});