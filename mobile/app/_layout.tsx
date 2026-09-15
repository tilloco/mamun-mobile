import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/lib/auth-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="lesson/[id]" options={{ headerShown: true, headerBackTitle: 'Orqaga' }} />
          <Stack.Screen name="quiz/[lessonId]" options={{ headerShown: true, headerBackTitle: 'Orqaga' }} />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
