import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { colors } from './theme.native';

// Lazy imports for tab screens
import SchedulePageContainer from './containers/SchedulePageContainer';
import MapContainer from './containers/MapContainer';
import Links from './components/Links';
import AboutPage from './components/AboutPage';
import SettingsPage from './components/Settings';

const Tab = createBottomTabNavigator();

const NAV_ICONS = {
  Schedule: '◉',
  Map: '⊡',
  Links: '⊞',
  About: 'ⓘ',
  Settings: '⚙',
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerStyle: {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
              borderBottomWidth: 1,
            },
            headerTintColor: colors.foreground,
            headerTitleStyle: { fontWeight: '600', fontSize: 16 },
            tabBarStyle: {
              backgroundColor: 'rgba(5,5,6,0.85)',
              borderTopColor: colors.border,
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.muted,
            tabBarShowLabel: true,
            tabBarLabelStyle: { fontSize: 11 },
            tabBarIcon: ({ color }) => (
              <Text style={{ color, fontSize: 18 }}>{NAV_ICONS[route.name]}</Text>
            ),
          })}
        >
          <Tab.Screen name="Schedule" component={SchedulePageContainer} />
          <Tab.Screen name="Map" component={MapContainer} />
          <Tab.Screen name="Links" component={Links} />
          <Tab.Screen name="About" component={AboutPage} />
          <Tab.Screen name="Settings" component={SettingsPage} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
