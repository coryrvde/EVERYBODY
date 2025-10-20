import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { guardianClient } from '../api/guardian-client';

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
  const [alerts, setAlerts] = useState([]);
  const [guardianId, setGuardianId] = useState(null);
  const [linkedChildren, setLinkedChildren] = useState([]);

  // Load guardian data and alerts on component mount
  useEffect(() => {
    initializeData();
  }, []);

  async function initializeData() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (user) {
        setGuardianId(user.id);
        await loadAlerts(user.id);
        await loadLinkedChildren(user.id);
      }
    } catch (error) {
      console.error('Error initializing parent data:', error);
    }
  }

  async function loadAlerts(guardian_id) {
    try {
      const alertsData = await guardianClient.recentAlerts.getRecentAlerts(guardian_id);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  }

  async function loadLinkedChildren(parent_id) {
    try {
      const { data, error } = await supabase
        .from('family_links')
        .select(`
          child_id,
          created_at,
          profiles!family_links_child_id_fkey(id, full_name, email)
        `)
        .eq('parent_id', parent_id);
      
      if (error) throw error;
      setLinkedChildren(data || []);
    } catch (error) {
      console.error('Error loading linked children:', error);
    }
  }

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

  const handleButtonPress = (button) => {
    console.log(`${button} pressed`);
    navigation.navigate(button);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Guardian AI Dashboard</Text>
        <Text style={styles.headerSubtitle}>Parent Control Center</Text>
      </View>

      <FlatList
        style={styles.scrollView}
        data={[{ id: 'content' }]}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={() => (
        <View style={styles.content}>
          
          {/* Link Child Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔗 Link Child Device</Text>
            <Text style={styles.sectionSubtitle}>Connect your child's device to monitor and protect</Text>
            
            <View style={styles.linkButtons}>
              <TouchableOpacity style={styles.button} onPress={createLinkCode} disabled={loading}>
                <Text style={styles.buttonText}>{loading ? 'Generating...' : 'Generate Code'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, styles.scanButton]} onPress={() => navigation.navigate('ParentScan')}>
                <Text style={styles.buttonText}>📱 Scan Child QR</Text>
              </TouchableOpacity>
            </View>

            {activeCode && (
              <View style={styles.codeBox}>
                <Text style={styles.code}>{activeCode}</Text>
                <Text style={styles.codeHint}>Share this code with your child • Expires in 10 minutes</Text>
              </View>
            )}
          </View>

          {/* Linked Children */}
          {linkedChildren.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Linked Children ({linkedChildren.length})</Text>
              <View style={styles.childrenList}>
                {linkedChildren.map((link, index) => (
                  <View key={index} style={styles.childItem}>
                    <Text style={styles.childName}>{link.profiles?.full_name || 'Child'}</Text>
                    <Text style={styles.childEmail}>{link.profiles?.email}</Text>
                    <Text style={styles.linkDate}>Linked: {new Date(link.created_at).toLocaleDateString()}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Parent Features Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛡️ Parent Controls</Text>
            <View style={styles.gridContainer}>
              <TouchableOpacity 
                style={styles.gridButton}
                onPress={() => handleButtonPress('Child Profiles')}
              >
                <Text style={styles.gridButtonText}>👤 Child Profiles</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridButton}
                onPress={() => handleButtonPress('Location Tracking')}
              >
                <Text style={styles.gridButtonText}>📍 Location</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridButton}
                onPress={() => handleButtonPress('Content Blocking')}
              >
                <Text style={styles.gridButtonText}>🚫 Content Block</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.gridButton}
                onPress={() => handleButtonPress('Setting')}
              >
                <Text style={styles.gridButtonText}>⚙️ Settings</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Recent Alerts */}
          <View style={styles.section}>
            <View style={styles.alertsHeader}>
              <Text style={styles.sectionTitle}>🚨 Recent Alerts ({alerts.length})</Text>
            </View>

            {alerts.length > 0 ? (
              <FlatList
                data={alerts.slice(0, 3)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.alertItem}>
                    <View style={styles.alertIcon}>
                      <Text style={styles.alertIconText}>
                        {item.alert_type === 'emergency' ? '🚨' :
                         item.alert_type === 'security' ? '🔒' :
                         item.alert_type === 'activity' ? '📱' : '📢'}
                      </Text>
                    </View>
                    <View style={styles.alertContent}>
                      <Text style={styles.alertMessage} numberOfLines={2}>
                        {item.message}
                      </Text>
                      <Text style={styles.alertTime}>
                        {new Date(item.created_at).toLocaleString()}
                      </Text>
                    </View>
                    {item.severity === 'high' || item.severity === 'critical' ? (
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: item.severity === 'critical' ? '#F44336' : '#FF9800' }
                      ]}>
                        <Text style={styles.severityText}>
                          {item.severity.toUpperCase()}
                        </Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
                style={styles.alertsList}
              />
            ) : (
              <View style={styles.noAlertsContainer}>
                <Text style={styles.noAlertsText}>✅ No recent alerts</Text>
                <Text style={styles.noAlertsSubtext}>Your children are safe!</Text>
              </View>
            )}
          </View>
        </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
  },
  header: {
    backgroundColor: '#2B6CB0',
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  linkButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 16,
  },
  scanButton: {
    backgroundColor: '#059669',
  },
  codeBox: {
    marginTop: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
    padding: 16,
    alignItems: 'center',
  },
  code: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 4,
    color: '#1E40AF',
  },
  codeHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#374151',
    textAlign: 'center',
  },
  childrenList: {
    gap: 12,
  },
  childItem: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  childEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  linkDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  gridButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertsList: {
    maxHeight: 200,
  },
  alertItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertIconText: {
    fontSize: 18,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  alertTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  noAlertsContainer: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  noAlertsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#16A34A',
    marginTop: 4,
  },
});


