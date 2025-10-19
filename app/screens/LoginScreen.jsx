import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, StatusBar, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log('Login with:', { email, password, rememberMe });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login failed:', error.message);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.error('No active session found');
        return;
      }

      if (rememberMe) {
        await supabase.auth.setSession(session);
      }

      // Decide next screen based on whether the user has chosen a role
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;
        if (!userId) {
          console.error('No user ID found after login');
          navigation.navigate('Main');
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (profileError) {
          console.warn('Profile lookup failed, sending to Main:', profileError.message);
          navigation.navigate('Main');
          return;
        }

        if (!profile || !profile.role) {
          navigation.navigate('Role Selection');
          return;
        }

        navigation.navigate('Main');
      } catch (routingError) {
        console.warn('Post-login routing error, defaulting to Main:', routingError);
        navigation.navigate('Main');
      }
    } catch (e) {
      console.error('Unexpected login error:', e);
    }
  };

  const handleRecoverPassword = () => {
    console.log('Recover password for:', email);
    alert('Password recovery link sent to your email.');
  };

  const handleResendConfirmation = async () => {
    try {
      if (!email) {
        Alert.alert('Enter email', 'Please enter your email first.');
        return;
      }
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) {
        Alert.alert('Resend failed', error.message);
        return;
      }
      Alert.alert('Email sent', 'Check your inbox for the verification link.');
    } catch (e) {
      Alert.alert('Error', 'Could not resend verification email.');
      console.error('Resend verification error:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.content}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo3.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
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

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="***********"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.icon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setRememberMe(!rememberMe)}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Remember me</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRecoverPassword}>
              <Text style={styles.recoverText}>Recover password</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleResendConfirmation}>
          <Text style={styles.secondaryButtonText}>Resend confirmation email</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>Welcome to your safe space</Text>
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
    paddingTop: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2B6CB0',
    textAlign: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#2B6CB0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
  },
  logo: {
    width: 180,
    height: 180,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#2D3748',
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
    color: '#2D3748',
    backgroundColor: '#EDF2F7',
  },
  icon: {
    fontSize: 20,
    marginLeft: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#EDF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#2B6CB0',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#2D3748',
  },
  recoverText: {
    fontSize: 14,
    color: '#2B6CB0',
  },
  button: {
    backgroundColor: '#4299E1',
    borderRadius: 30,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    color: '#2B6CB0',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 16,
    color: '#2D3748',
    textAlign: 'center',
  },
});