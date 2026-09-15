import React from 'react';
import { Stack } from 'expo-router';
import { AdminProvider } from '../../src/lib/admin-context';

export default function AdminLayout() {
  return (
    <AdminProvider>
      <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Orqaga' }}>
        <Stack.Screen name="index" options={{ title: 'Admin' }} />
        <Stack.Screen name="settings" options={{ title: 'Sozlamalar' }} />
        <Stack.Screen name="bulk" options={{ title: "Ommaviy qo'shish" }} />
        <Stack.Screen name="manual" options={{ title: "Qo'lda qo'shish" }} />
      </Stack>
    </AdminProvider>
  );
}