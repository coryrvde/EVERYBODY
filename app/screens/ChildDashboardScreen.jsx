import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../supabase';
import { useNavigation } from '@react-navigation/native';

export default function ChildDashboardScreen() {
  const [linkedParent, setLinkedParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    checkLinkStatus();
  }, []);

  // Refresh link status when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkLinkStatus();
    });
    return unsubscribe;
  }, [navigation]);

  const checkLinkStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Check if child is linked to a parent
      const { data: links, error } = await supabase
        .from('family_links')
        .select(`
          parent_id,
          created_at
        `)
        .eq('child_id', user.id)
        .limit(1);

      if (error) {
        console.error('Error checking link status:', error);
        return;
      }

      if (links && links.length > 0) {
        // Get parent profile information
        const { data: parentProfile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, created_at')
          .eq('id', links[0].parent_id)
          .single();
        
        if (!profileError && parentProfile) {
          setLinkedParent({
            full_name: parentProfile.full_name,
            created_at: links[0].created_at
          });
        } else {
          // If we can't get parent profile, still show as linked
          setLinkedParent({
            full_name: 'Parent',
            created_at: links[0].created_at
          });
        }
      }
    } catch (e) {
      console.error('Error in checkLinkStatus:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigation.navigate('Onboarding');
    } catch (e) {
      console.error('Logout error:', e);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Child Dashboard</Text>
        <Text style={styles.headerSubtitle}>Your Guardian AI account</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>🔗 Link Status</Text>
          
          {loading ? (
            <Text style={styles.statusText}>Checking connection...</Text>
          ) : linkedParent ? (
            <View>
              <Text style={styles.statusText}>✅ Connected to parent</Text>
              <Text style={styles.parentName}>
                Parent: {linkedParent.full_name || 'Unknown'}
              </Text>
              <Text style={styles.linkDate}>
                Linked since: {new Date(linkedParent.created_at).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <View>
              <Text style={styles.statusText}>❌ Not linked to parent</Text>
              <Text style={styles.statusSubtext}>
                Ask your parent to scan your QR code to link accounts
              </Text>
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={styles.qrButton}
                  onPress={() => navigation.navigate('ChildQR')}
                >
                  <Text style={styles.qrButtonText}>Show QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={checkLinkStatus}
                >
                  <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📱 Your Account</Text>
          <Text style={styles.infoText}>
            This is your child account. Your parent can monitor your safety and help protect you online.
          </Text>
          <Text style={styles.infoText}>
            Features available to you:
          </Text>
          <Text style={styles.featureText}>• Show QR code for parent linking</Text>
          <Text style={styles.featureText}>• View your connection status</Text>
          <Text style={styles.featureText}>• Basic account management</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F0F9FF' 
  },
  header: {
    backgroundColor: '#0EA5E9',
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
    color: '#E0F2FE',
    textAlign: 'center',
    marginTop: 4,
  },
  content: { 
    flex: 1, 
    padding: 24 
  },
  statusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
  },
  statusSubtext: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
  },
  linkDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  qrButton: {
    backgroundColor: '#0EA5E9',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  qrButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  refreshButton: {
    backgroundColor: '#6B7280',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
    lineHeight: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    paddingLeft: 8,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
