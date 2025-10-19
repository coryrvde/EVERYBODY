import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { guardianClient } from '../api/guardian-client';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('HOME');
  const [alerts, setAlerts] = useState([]);
  const [guardianId, setGuardianId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sample data for the chart
  const chartData = [
    { date: 'Oct 10', value: 3 },
    { date: 'Oct 11', value: 5 },
    { date: 'Oct 12', value: 2 },
    { date: 'Oct 13', value: 1 },
    { date: 'Oct 14', value: 7 },
    { date: 'Oct 15', value: 8 },
    { date: 'Oct 16', value: 4 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  // Load guardian ID and alerts on component mount
  useEffect(() => {
    initializeData();
  }, []);

  // Set up real-time alerts subscription
  useEffect(() => {
    if (guardianId) {
      setupRealtimeAlerts();
    }
  }, [guardianId]);

  async function initializeData() {
    try {
      // Prefer session to avoid AuthSessionMissingError in dev
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.warn('Auth session error:', sessionError);
      }

      const user = sessionData?.session?.user || null;

      // Fallback to getUser if session absent (may warn in dev)
      if (!user) {
        const { data: { user: fallbackUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.warn('Auth getUser error:', userError);
        }
        if (fallbackUser) {
          setGuardianId(fallbackUser.id);
          await loadAlerts(fallbackUser.id);
          return;
        }
      }

      if (user) {
        // For now, we'll use the user ID as guardian ID
        // In a real app, you'd have a mapping table
        setGuardianId(user.id);
        await loadAlerts(user.id);
      } else {
        // No session/user yet: skip alerts load to avoid noisy errors
        console.warn('Auth session missing - skipping alerts load');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
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

  function setupRealtimeAlerts() {
    const channel = supabase
      .channel('realtime-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'recent_alerts',
        filter: `guardian_id=eq.${guardianId}`
      }, (payload) => {
        console.log('New alert received:', payload.new);
        setAlerts(prev => [payload.new, ...prev.slice(0, 49)]); // Keep last 50 alerts
        // Could trigger local notification here
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    console.log(`Navigating to ${tab}`);
  };

  const handleButtonPress = (button) => {
    console.log(`${button} pressed`);
    // alert(`Opening ${button}`);
    navigation.navigate(button);
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase.auth.signOut();
              if (error) {
                console.error('Error logging out:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              } else {
                Alert.alert('Success', 'You have been logged out successfully.');
                navigation.navigate('Login');
              }
            } catch (error) {
              console.error('Unexpected error during logout:', error);
              Alert.alert('Error', 'An unexpected error occurred. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Home</Text>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Guarding the Mind.</Text>
            <Text style={styles.tagline}>Protecting the Conversation</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>{alerts.length} Alerts</Text>
            </View>
            
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const height = (item.value / maxValue) * 150;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[styles.bar, { height: height }]} />
                    <Text style={styles.barLabel}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Child Profiles')}
            >
              <Text style={styles.gridButtonText}>Child Profiles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Quick Actions')}
            >
              <Text style={styles.gridButtonText}>Quick Actions</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Summary')}
            >
              <Text style={styles.gridButtonText}>Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Recent Alerts')}
            >
              <Text style={styles.gridButtonText}>Recent Alerts</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Alerts Section */}
          <View style={styles.alertsSection}>
            <View style={styles.alertsHeader}>
              <Text style={styles.alertsTitle}>Recent Alerts</Text>
              <Text style={styles.alertsCount}>({alerts.length})</Text>
            </View>

            {alerts.length > 0 ? (
              <FlatList
                data={alerts.slice(0, 5)} // Show only first 5 alerts
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
                <Text style={styles.noAlertsText}>No recent alerts</Text>
                <Text style={styles.noAlertsSubtext}>Alerts will appear here when detected</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6F0FA',
  },
  scrollView: {
    flex: 1,
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
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontSize: 20,
    color: '#2D3748',
    textAlign: 'center',
    lineHeight: 30,
  },
  chartContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#ECC94B',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#2D3748',
    fontWeight: '500',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 30,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: '#4299E1',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#2D3748',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridButton: {
    width: '48%',
    backgroundColor: '#EDF2F7',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4299E1',
  },
  gridButtonText: {
    fontSize: 18,
    color: '#2D3748',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#2B6CB0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#4299E1',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    marginBottom: 4,
  },
  navIconText: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 10,
    color: '#EDF2F7',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#FFFFFF',
  },
});



{/* <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('HOME')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>🏠</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>
            HOME
          </Text>
        </TouchableOpacity>

       <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Parent Control')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>👥</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Parent Control' && styles.navLabelActive]}>
            Parent Control
          </Text>
        </TouchableOpacity> 

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Log')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>📋</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Log' && styles.navLabelActive]}>
            Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('SETTINGS')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>⚙️</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'SETTINGS' && styles.navLabelActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View> */}