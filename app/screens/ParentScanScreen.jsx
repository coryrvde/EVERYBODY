import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { supabase } from '../supabase';

export default function ParentScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission || !permission.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const onBarcodeScanned = async ({ data }) => {
    if (scanned) return;
    setScanned(true);
    try {
      const parsed = JSON.parse(data);
      if (parsed?.t !== 'guardian-link' || !parsed.childUserId) {
        Alert.alert('Invalid QR', 'This QR code is not recognized.');
        setScanned(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        Alert.alert('Not logged in', 'Please log in as a parent');
        setScanned(false);
        return;
      }

      // Create family link (parent -> child)
      const { error } = await supabase
        .from('family_links')
        .insert({ parent_id: user.id, child_id: parsed.childUserId });
      if (error) throw error;

      Alert.alert('Linked', 'Child device successfully linked');
    } catch (e) {
      console.error('Scan/link failed:', e);
      Alert.alert('Error', 'Failed to link child');
      setScanned(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Scan Child QR</Text>
        <Text style={styles.subtitle}>Point your camera at the child QR to link</Text>
      </View>
      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
          />
        ) : (
          <Text style={styles.permText}>Camera permission required</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#CBD5E1', fontSize: 13, marginTop: 6 },
  cameraBox: { flex: 1, margin: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#334155' },
  permText: { color: '#E2E8F0', textAlign: 'center', marginTop: 24 },
});


