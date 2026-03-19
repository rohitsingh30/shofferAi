import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../lib/auth-context';
import { colors, spacing, fontSize, borderRadius, shadows } from '../../lib/theme';

const menuSections = [
  {
    title: 'Account',
    items: [
      { icon: 'location-outline' as const, label: 'Saved Addresses' },
      { icon: 'card-outline' as const, label: 'Payment Methods' },
      { icon: 'key-outline' as const, label: 'Saved Logins' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline' as const, label: 'Notifications' },
      { icon: 'moon-outline' as const, label: 'Appearance' },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: 'help-circle-outline' as const, label: 'Help & Support' },
      { icon: 'document-text-outline' as const, label: 'Terms & Privacy' },
    ],
  },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarOuter}>
            <LinearGradient
              colors={['#7c5cfc', '#a78bfa']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          {user?.email && <Text style={styles.email}>{user.email}</Text>}
        </View>

        {/* Menu sections */}
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    i < section.items.length - 1 && styles.menuItemBorder,
                  ]}
                  activeOpacity={0.6}
                >
                  <Ionicons name={item.icon} size={20} color={colors.secondary} style={styles.menuIcon} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.tertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Sign out */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ShofferAI v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    paddingBottom: spacing['4xl'],
  },
  // Header
  header: {
    alignItems: 'center',
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  avatarOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '800',
  },
  name: {
    color: colors.foreground,
    fontSize: fontSize.xl,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  email: {
    color: colors.tertiary,
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  // Sections
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    gap: spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  menuIcon: {
    width: 24,
  },
  menuLabel: {
    flex: 1,
    color: colors.foreground,
    fontSize: fontSize.base,
    fontWeight: '500',
  },
  menuArrow: {
    color: colors.tertiary,
    fontSize: fontSize.lg,
    fontWeight: '300',
  },
  // Logout
  logoutBtn: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: colors.destructiveMuted,
    borderWidth: 0.5,
    borderColor: colors.destructive + '25',
  },
  logoutText: {
    color: colors.destructive,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  version: {
    color: colors.tertiary,
    fontSize: fontSize.xs,
    textAlign: 'center',
    marginTop: spacing.xl,
    opacity: 0.5,
  },
});
