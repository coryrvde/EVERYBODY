import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
// import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
import * as Linking from 'expo-linking';
import { supabase } from './app/supabase';

import OnboardingScreen from './app/screens/OnboardingScreen';
import LoginScreen from './app/screens/LoginScreen';
import SignUpScreen from './app/screens/SignUpScreen';
import Details from './app/screens/Details';
import HomeScreen from './app/screens/HomeScreen';
import ChildProfileScreen from './app/screens/ChildProfileScreen';
import ParentalControlScreen from './app/screens/ParentalControlScreen';
import ConversationHistoryScreen from './app/screens/ConversationHistoryScreen';

import LocationTrackingScreen from './app/screens/LocationTrackingScreen';
import ContentBlockingScreen from './app/screens/ContentBlockingScreen';
import SettingsScreen from './app/screens/SettingsScreen';
// import AppAppearanceScreen from './app/screens/AppAppearanceScreen';
import RoleSelectionScreen from './app/screens/RoleSelectionScreen';
import LinkChildScreen from './app/screens/LinkChildScreen';
import JoinFamilyScreen from './app/screens/JoinFamilyScreen';
import ChildQRScreen from './app/screens/ChildQRScreen';
import ParentScanScreen from './app/screens/ParentScanScreen';
import ChildDashboardScreen from './app/screens/ChildDashboardScreen';
import AIMonitoringScreen from './app/screens/AIMonitoringScreen';


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MyTabs() {
  return (
    <Tab.Navigator
    screenOptions={{headerShown: false}}
    >
      <Tab.Screen name="Home" component={HomeScreen} 
      options={{
        tabBarIcon: ({ color, size }) => (
          <AntDesign name="home" color={color} size={size} />
        ),
      }}/>
      <Tab.Screen name="Parental Control" component={ParentalControlScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="people-outline" color={color} size={size} />
        ),
      }}
      />
      <Tab.Screen name="Log" component={ConversationHistoryScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Feather name="clipboard" size={size} color={color} />
        ),
      }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <SimpleLineIcons name="settings" size={size} color={color} />
        ),
      }}
      />
    </Tab.Navigator>
  );

}

function RootStack(){
  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen}/>
    {/* Handle deep link path auth-callback by mapping to Login */}
    <Stack.Screen name="Login" component={LoginScreen} options={{ path: 'auth-callback' }}/>
    <Stack.Screen name="Main" component={MyTabs}/>
    <Stack.Screen name="SignUp" component={SignUpScreen}/>
    <Stack.Screen name="Details" component={Details}/>
    <Stack.Screen name="Child Profiles" component={ChildProfileScreen}/>
    <Stack.Screen name="Location Tracking" component={LocationTrackingScreen}/>
    <Stack.Screen name="Content Blocking" component={ContentBlockingScreen}/>
    <Stack.Screen name="Role Selection" component={RoleSelectionScreen}/>
    <Stack.Screen name="LinkChild" component={LinkChildScreen}/>
    <Stack.Screen name="JoinFamily" component={JoinFamilyScreen}/>
    <Stack.Screen name="ChildQR" component={ChildQRScreen}/>
    <Stack.Screen name="ParentScan" component={ParentScanScreen}/>
    <Stack.Screen name="ChildDashboard" component={ChildDashboardScreen}/>
    <Stack.Screen name="AI Monitoring" component={AIMonitoringScreen}/>
    {/* <Stack.Screen name="App Appearance" component={AppAppearanceScreen}/> */}
  </Stack.Navigator>
  );
}

export default function App() {
  const linking = {
    prefixes: [Linking.createURL('/')],
    config: {
      screens: {
        Onboarding: 'onboarding',
        Login: {
          path: 'auth-callback',
        },
        SignUp: 'signup',
        Main: 'main',
      },
    },
  };
  return (
    <NavigationContainer linking={linking}>
      <RootStack />
    </NavigationContainer>
  );
}
