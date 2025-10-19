import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';

export default function JoinFamilyScreen() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const join = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        Alert.alert('Error', 'You must be logged in');
        return;
      }

      const { data: codes, error: codeErr } = await supabase
        .from('link_codes')
        .select('code,parent_user_id,expires_at,used')
        .eq('code', code.trim().toUpperCase())
        .limit(1);
      if (codeErr) throw codeErr;

      const record = codes?.[0];
      if (!record) {
        Alert.alert('Invalid Code', 'Please check the code and try again');
        return;
      }
      if (record.used) {
        Alert.alert('Code Used', 'This code has already been used');
        return;
      }
      if (new Date(record.expires_at).getTime() < Date.now()) {
        Alert.alert('Expired', 'This code has expired');
        return;
      }

      // Link parent-child
      const { error: linkErr } = await supabase
        .from('family_links')
        .insert({ parent_user_id: record.parent_user_id, child_user_id: user.id });
      if (linkErr) throw linkErr;

      // Mark code used
      await supabase
        .from('link_codes')
        .update({ used: true })
        .eq('code', record.code);

      // Ensure child role
      await supabase
        .from('profiles')
        .upsert({ id: user.id, role: 'child', updated_at: new Date().toISOString() });

      Alert.alert('Joined', 'You are now linked to your parent');
    } catch (e) {
      console.error('Join failed:', e);
      Alert.alert('Error', 'Could not join family');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Join Your Family</Text>
        <Text style={styles.subtitle}>Enter the code from your parent's app</Text>

        <View style={styles.inputRow}>
          <TextInput
            placeholder="ABC123"
            value={code}
            onChangeText={(t) => setCode(t.toUpperCase())}
            autoCapitalize="characters"
            style={styles.input}
            maxLength={8}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={join} disabled={loading || code.length < 4}>
          <Text style={styles.buttonText}>{loading ? 'Joining...' : 'Join Family'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 12 },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 24 },
  inputRow: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 12, paddingVertical: 6 },
  input: { fontSize: 18, fontWeight: '700', letterSpacing: 4, color: '#111827', paddingVertical: 10 },
  button: { backgroundColor: '#059669', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
});


