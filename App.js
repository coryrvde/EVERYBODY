import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
// import { createStaticNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AntDesign from '@expo/vector-icons/AntDesign';
import Ionicons from '@expo/vector-icons/Ionicons';
import Feather from '@expo/vector-icons/Feather';
import SimpleLineIcons from '@expo/vector-icons/SimpleLineIcons';
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
import SettingsScreen from './app/screens/Setting';
// import AppAppearanceScreen from './app/screens/AppAppearanceScreen';


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
    <Stack.Screen name="Home" component={MyTabs}/>
    <Stack.Screen name="Login" component={LoginScreen}/>
    <Stack.Screen name="SignUp" component={SignUpScreen}/>
    <Stack.Screen name="Details" component={Details}/>
    <Stack.Screen name="Child Profiles" component={ChildProfileScreen}/>
    <Stack.Screen name="Location Tracking" component={LocationTrackingScreen}/>
    <Stack.Screen name="Content Blocking" component={ContentBlockingScreen}/>
    {/* <Stack.Screen name="App Appearance" component={AppAppearanceScreen}/> */}
  </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
