import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import { useAuthRequest, makeRedirectUri } from 'expo-auth-session';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

WebBrowser.maybeCompleteAuthSession();

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: makeRedirectUri({ scheme: 'shofferai' }),
      scopes: ['openid', 'profile', 'email'],
      responseType: 'token',
      usePKCE: false,
    },
    googleDiscovery
  );

  useEffect(() => {
    if (response?.type === 'success' && response.params?.access_token) {
      handleGoogleLogin(response.params.access_token);
    }
  }, [response]);

  const handleGoogleLogin = async (accessToken: string) => {
    setLoading(true);
    try {
      await loginWithGoogle(accessToken);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/chat');
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Google login failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async () => {
    setLoading(true);
    try {
      // Ensure dev user exists
      await fetch(
        (process.env.EXPO_PUBLIC_API_URL || 'https://shofferai-27188185100.asia-south1.run.app') +
          '/api/auth/dev-login',
        { method: 'POST' }
      );
      await login('demo@shofferai.com', 'demo1234');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/chat');
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Dev login failed', e instanceof Error ? e.message : 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await login(email.trim(), password.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(app)/chat');
    } catch (e: unknown) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Login failed', e instanceof Error ? e.message : 'Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoGlow}>
            <LinearGradient
              colors={['#7c5cfc', '#ec4899']}
              style={styles.logo}
            >
              <Ionicons name="flash" size={26} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.title}>ShofferAI</Text>
          <Text style={styles.subtitle}>Your AI that actually does things</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[
                styles.input,
                focused === 'email' && styles.inputFocused,
              ]}
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={colors.tertiary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={[
                styles.input,
                focused === 'password' && styles.inputFocused,
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.tertiary}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
            />
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnLoading]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.loginBtnText}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && styles.loginBtnLoading]}
          activeOpacity={0.8}
          disabled={!request || loading}
          onPress={() => promptAsync()}
        >
          <Ionicons name="logo-google" size={18} color={colors.foreground} />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* Register */}
        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerText}>
            New here?{' '}
            <Text style={styles.registerHighlight}>Create an account</Text>
          </Text>
        </TouchableOpacity>

        {/* Dev Login */}
        <TouchableOpacity
          style={styles.devBtn}
          onPress={handleDevLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Ionicons name="code-slash" size={16} color={colors.tertiary} />
          <Text style={styles.devBtnText}>Dev Login (skip auth)</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  // Logo
  logoArea: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  logoGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  logoText: {
    color: '#fff',
    fontSize: fontSize['2xl'],
    fontWeight: '800',
  },
  title: {
    color: colors.foreground,
    fontSize: fontSize['3xl'],
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.tertiary,
    fontSize: fontSize.base,
  },
  // Form
  form: {
    gap: spacing.lg,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.secondary,
    fontSize: fontSize.sm,
    fontWeight: '600',
    marginLeft: 2,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    color: colors.foreground,
    fontSize: fontSize.base,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.primaryBorder,
    backgroundColor: colors.surfaceRaised,
  },
  loginBtn: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: spacing.sm,
    ...shadows.glow,
  },
  loginBtnLoading: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: '700',
  },
  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing['2xl'],
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.tertiary,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.sm,
  },
  // Google
  googleBtn: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  googleBtnText: {
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  // Register
  registerLink: {
    alignItems: 'center',
    marginTop: spacing['2xl'],
  },
  registerText: {
    color: colors.tertiary,
    fontSize: fontSize.base,
  },
  registerHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  // Dev
  devBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  devBtnText: {
    color: colors.tertiary,
    fontSize: fontSize.sm,
  },
});
