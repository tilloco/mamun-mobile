import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { colors } from '../../src/theme/colors';

function MessagesButton() {
  const router = useRouter();
  const unreadCount = 3; // placeholder — replace with real data later

  return (
    <TouchableOpacity onPress={() => router.push('/messages')} style={{ marginRight: 16 }}>
      <View style={{ width: 24, height: 24 }}>
        <Ionicons name="chatbubble-ellipses-outline" size={24} color={colors.text} />
        {unreadCount > 0 && (
          <View style={{
            position: 'absolute',
            top: -4,
            right: -6,
            backgroundColor: 'red',
            borderRadius: 8,
            minWidth: 16,
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 3,
          }}>
            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
       headerRight: () => <MessagesButton />,
headerLeft: () => (
  <Image
    source={require('../../assets/logo.png')}
    style={{ width: 32, height: 32, marginLeft: 16, resizeMode: 'contain' }}
  />
),
headerTitleAlign: 'left',
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen name="dashboard" options={{
        title: 'Bosh sahifa',
        tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="modules" options={{
        title: 'Kurs',
        tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="ai" options={{
        title: 'AI Yordamchi',
        tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="exam" options={{
        title: 'Imtihon',
        tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" size={size} color={color} />,
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil',
        tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
      }} />

      {/* Hidden from the tab bar, still reachable by navigation */}
      <Tabs.Screen name="messages" options={{ href: null }} />
      <Tabs.Screen name="exam-result" options={{ href: null }} />
    </Tabs>
  );
}