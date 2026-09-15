import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/lib/auth-context';
import { colors } from '../src/theme/colors';

export default function Index() {
  const { isLoading, token, user } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!token || !user) {
    return <Redirect href="/(auth)/phone" />;
  }

  // Ism va imtihon sanasi hali kiritilmagan bo'lsa (yangi foydalanuvchi) - onboardingni yakunlashga yuboramiz
  if (!user.name || !user.examDate) {
    return <Redirect href="/(auth)/profile-setup" />;
  }

  return <Redirect href="/(tabs)/dashboard" />;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
});
