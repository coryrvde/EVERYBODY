import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

export default function RoleSelectionScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      console.log('RoleSelectionScreen: Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('RoleSelectionScreen: Session found:', !!session?.user);
      if (!session?.user) {
        console.log('RoleSelectionScreen: No session, navigating to Login');
        navigation.navigate('Login');
      }
    })();
  }, []);

  const setRole = async (role) => {
    try {
      console.log('RoleSelectionScreen: Setting role to:', role);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        console.warn('No user session while setting role');
        return;
      }
      
      console.log('RoleSelectionScreen: Updating profile with role:', role);
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, role, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Error updating profile:', error);
        return;
      }

      console.log('RoleSelectionScreen: Role set successfully, navigating...');
      Alert.alert(
        'Role Set!',
        `You are now registered as a ${role}.`,
        [
          {
            text: 'Continue',
            onPress: () => {
              if (role === 'parent') {
                navigation.navigate('Child Profiles');
              } else {
                navigation.navigate('ChildDashboard');
              }
            }
          }
        ]
      );
    } catch (e) {
      console.error('Error setting role:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose how you'll use Guardian AI</Text>

        <TouchableOpacity style={[styles.card, styles.parent]} onPress={() => setRole('parent')}>
          <Text style={styles.cardTitle}>I'm a Parent</Text>
          <Text style={styles.cardDesc}>Full controls, manage children and permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.child]} onPress={() => setRole('child')}>
          <Text style={styles.cardTitle}>I'm a Child</Text>
          <Text style={styles.cardDesc}>Limited features, requires parent link</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 24 },
  card: { borderRadius: 16, padding: 20, marginBottom: 16 },
  parent: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#93C5FD' },
  child: { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#86EFAC' },
  cardTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  cardDesc: { fontSize: 13, color: '#374151', marginTop: 6 },
});


