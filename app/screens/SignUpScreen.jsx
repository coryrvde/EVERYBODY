import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import * as Linking from 'expo-linking';
import { EMAIL_REDIRECT_URL } from '../config/links';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function SignUpScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!fullName || !email || !password || !repeatPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const redirectTo = EMAIL_REDIRECT_URL && EMAIL_REDIRECT_URL.length > 0
        ? EMAIL_REDIRECT_URL
        : Linking.createURL('auth-callback');
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: redirectTo,
          // If email confirmations are enabled in Supabase, there will be no session here
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        Alert.alert('Sign Up Failed', error.message);
        return;
      }

      // When email confirmation is ON, data.user exists but data.session is null
      if (data?.session) {
        Alert.alert('Success', 'Account created! Choose your role to continue.');
        navigation.navigate('Role Selection');
        return;
      }

      if (data?.user && !data?.session) {
        Alert.alert(
          'Confirm your email',
          'We sent you a verification link. Please confirm your email, then log in.'
        );
        navigation.navigate('Login');
        return;
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sign-Up</Text>
          <Text style={styles.subtitle}>Create an account</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Full name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Name Surname"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
            <Text style={styles.icon}>👤</Text>
          </View>

          <Text style={styles.label}>Enter your email</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="email@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.icon}>✉️</Text>
          </View>

          <Text style={styles.label}>Create your password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="**********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.icon}>🔑</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Repeat password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="**********"
              value={repeatPassword}
              onChangeText={setRepeatPassword}
              secureTextEntry={!showRepeatPassword}
            />
            <TouchableOpacity onPress={() => setShowRepeatPassword(!showRepeatPassword)}>
              <Text style={styles.icon}>🔒</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <Text style={styles.buttonText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF2F7',
    borderRadius: 30,
    paddingHorizontal: 20,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#EDF2F7',
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
  },
  button: {
    backgroundColor: '#1A1A1A',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});