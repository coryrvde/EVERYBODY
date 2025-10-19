import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StatusBar, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function ChildQRScreen() {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const navigation = useNavigation();

  const generateQRCode = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) {
        Alert.alert('Not logged in', 'Please log in first.');
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
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await generateQRCode();
      setLoading(false);
    })();
  }, []);

  const handleRegenerateQR = async () => {
    setRegenerating(true);
    await generateQRCode();
    setRegenerating(false);
    Alert.alert('Success', 'New QR code generated!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Child Account</Text>
        <Text style={styles.headerSubtitle}>Link with Parent</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>📱 Show this QR to your parent</Text>
        <Text style={styles.subtitle}>Your parent will scan this code to link your device and start monitoring your safety</Text>

        {loading && (
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Generating QR Code...</Text>
          </View>
        )}

        {!loading && payload && (
          <View style={styles.qrContainer}>
            <View style={styles.qrBox}>
              <QRCode value={payload} size={250} backgroundColor="#FFFFFF" color="#111827" />
            </View>
            <Text style={styles.qrInstructions}>
              Keep this screen open while your parent scans the QR code
            </Text>
            
            <View style={styles.regenerateSection}>
              <Text style={styles.regenerateTitle}>QR Code not working?</Text>
              <Text style={styles.regenerateSubtext}>
                If your parent can't scan this QR code, try generating a new one
              </Text>
              <TouchableOpacity 
                style={[styles.regenerateButton, regenerating && styles.regenerateButtonDisabled]} 
                onPress={handleRegenerateQR}
                disabled={regenerating}
              >
                {regenerating ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.regenerateButtonText}>🔄 Generate New QR Code</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.navigate('ChildDashboard')}
        >
          <Text style={styles.backButtonText}>← Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#E6F0FA' 
  },
  header: {
    backgroundColor: '#059669',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 4,
  },
  content: { 
    flex: 1, 
    padding: 24, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: '#111827', 
    marginBottom: 12, 
    textAlign: 'center' 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#6B7280', 
    marginBottom: 32, 
    textAlign: 'center',
    lineHeight: 22,
  },
  loaderBox: { 
    alignItems: 'center',
    marginTop: 32 
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
  },
  qrContainer: {
    alignItems: 'center',
  },
  qrBox: { 
    padding: 20, 
    backgroundColor: '#FFF', 
    borderRadius: 20, 
    borderWidth: 2, 
    borderColor: '#059669',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  qrInstructions: {
    marginTop: 20,
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 40,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#374151',
    borderRadius: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  regenerateSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  regenerateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  regenerateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  regenerateButton: {
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  regenerateButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  regenerateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});


