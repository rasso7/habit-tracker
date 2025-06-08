import { useAuth } from "@/lib/auth-context";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";

const { width, height } = Dimensions.get('window');

export default function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>("");
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);

  const theme = useTheme();
  const router = useRouter();

  const { signIn, signUp } = useAuth();

  const handleAuth = async () => {
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Passwords must be at least 6 characters long.");
      return;
    }

    setError(null);

    if (isSignUp) {
      const error = await signUp(email, password);
      if (error) {
        setError(error);
        return;
      }
    } else {
      const error = await signIn(email, password);
      if (error) {
        setError(error);
        return;
      }

      router.replace("/");
    }
  };

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <View style={styles.container}>
        {/* Header Section with Illustration */}
        <View style={[
          styles.headerSection,
          isInputFocused && styles.headerSectionFocused
        ]}>
         
          {/* Main Illustration */}
          <View style={styles.illustrationContainer}>
            <Image
              source={require('@/assets/images/main.png')}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          
          {/* Main Title */}
          <View style={styles.titleContainer}>
            <Text style={styles.mainTitle}>
              {isSignUp ? "Join our community" : "Welcome back"}
            </Text>
            <Text style={styles.subtitle}>
              {isSignUp 
                ? "Start building amazing habits today" 
                : "Continue your journey with us"
              }
            </Text>
          </View>
        </View>

        {/* Form Section */}
        <View style={[
          styles.formSection,
          isInputFocused && styles.formSectionFocused
        ]}>
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Enter your email"
              mode="outlined"
              style={styles.input}
              onChangeText={setEmail}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              theme={{
                colors: {
                  primary: '#6366F1',
                  outline: '#E5E7EB',
                  onSurfaceVariant: '#6B7280',
                }
              }}
              outlineStyle={styles.inputOutline}
            />

            <TextInput
              label="Password"
              value={password}
              autoCapitalize="none"
              mode="outlined"
              secureTextEntry
              placeholder="Enter your password"
              style={styles.input}
              onChangeText={setPassword}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              theme={{
                colors: {
                  primary: '#6366F1',
                  outline: '#E5E7EB',
                  onSurfaceVariant: '#6B7280',
                }
              }}
              outlineStyle={styles.inputOutline}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Main Action Button */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleAuth}>
              <Text style={styles.primaryButtonText}>
                {isSignUp ? "Get started" : "Sign in"}
              </Text>
            </TouchableOpacity>

            {/* Switch Mode Button */}
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSwitchMode}>
              <Text style={styles.secondaryButtonText}>
                {isSignUp
                  ? "I have an account"
                  : "Create new account"}
              </Text>
            </TouchableOpacity>

            {/* Terms Text */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{'\n'}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6366F1',
  },
  headerSection: {
    flex: 0.4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    position: 'relative',
  },
  headerSectionFocused: {
    flex: 0.3,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
  illustrationContainer: {
    marginBottom: 2,
  },
  iconImage: {
    width: 140,
    height: 140,
  },
  titleContainer: {
    alignItems: 'center',
  },
  mainTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  formSection: {
    flex: 0.6,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 40,
    paddingHorizontal: 32,
    paddingBottom: 0,
  },
  formSectionFocused: {
    flex: 0.7,
  },
  formContainer: {
    flex: 1,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  inputOutline: {
    borderRadius: 16,
    borderWidth: 1.5,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#6366F1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '500',
  },
  termsText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 16,
  },
  termsLink: {
    color: '#6366F1',
    fontWeight: '500',
  },
});