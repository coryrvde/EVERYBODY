import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../supabase';

export default function ChildQRScreen() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;
        if (!user) {
          Alert.alert('Not logged in', 'Please log in first.');
          // Optionally navigate to Login if available in stack
          return;
        }

        // Minimal payload with type discriminator and a timestamp
        const qrPayload = {
          t: 'guardian-link',
          childUserId: user.id,
          ts: Date.now(),
        };
        setPayload(JSON.stringify(qrPayload));
      } catch (e) {
        console.error('Error preparing QR payload:', e);
        Alert.alert('Error', 'Could not prepare QR code');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Show this QR to your parent</Text>
        <Text style={styles.subtitle}>Your parent will scan it to link your device</Text>

        {loading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
          </View>
        )}

        {!loading && payload && (
          <View style={styles.qrBox}>
            <QRCode value={payload} size={220} backgroundColor="#FFFFFF" color="#111827" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { flex: 1, padding: 24, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginTop: 12, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 6, marginBottom: 24, textAlign: 'center' },
  loaderBox: { marginTop: 32 },
  qrBox: { padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
});


