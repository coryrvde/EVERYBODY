import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';

function generateCode(length = 6) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < length; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function LinkChildScreen() {
  const navigation = useNavigation();
  const [activeCode, setActiveCode] = useState(null);
  const [loading, setLoading] = useState(false);

  const createLinkCode = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      const code = generateCode();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 10).toISOString(); // 10 minutes

      const { error } = await supabase
        .from('link_codes')
        .insert({ code, parent_user_id: user.id, expires_at: expiresAt });
      if (error) throw error;

      setActiveCode(code);
    } catch (e) {
      console.error('Failed to create link code:', e);
      Alert.alert('Error', 'Could not create link code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Link a Child Device</Text>
        <Text style={styles.subtitle}>Generate a code and enter it on the child's app, or scan the child QR</Text>

        <TouchableOpacity style={styles.button} onPress={createLinkCode} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Generating...' : 'Generate Code'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.scanButton]} onPress={() => navigation.navigate('ParentScan')}>
          <Text style={styles.buttonText}>Scan Child QR</Text>
        </TouchableOpacity>

        {activeCode && (
          <View style={styles.codeBox}>
            <Text style={styles.code}>{activeCode}</Text>
            <Text style={styles.codeHint}>Code expires in 10 minutes</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 24 },
  button: { backgroundColor: '#2563EB', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  scanButton: { backgroundColor: '#059669', marginTop: 12 },
  codeBox: { marginTop: 24, borderRadius: 12, borderWidth: 1, borderColor: '#93C5FD', backgroundColor: '#EFF6FF', padding: 16, alignItems: 'center' },
  code: { fontSize: 32, fontWeight: '800', letterSpacing: 4, color: '#1E40AF' },
  codeHint: { marginTop: 8, fontSize: 12, color: '#374151' },
});


