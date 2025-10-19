import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { guardianAPI } from '../../backend/api/guardian-api';

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
      // Get current user to find guardian ID
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      if (user) {
        // For now, we'll use the user ID as guardian ID
        // In a real app, you'd have a mapping table
        setGuardianId(user.id);
        await loadAlerts(user.id);
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
      const alertsData = await guardianAPI.alerts.getRecentAlerts(guardian_id);
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
      <StatusBar barStyle="light-content" />
      
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
              <Text style={styles.alertText}>{alertCount} Alerts</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#0A1E4A',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
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
    color: '#333333',
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
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#333333',
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
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#666666',
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
    backgroundColor: '#E0E0E0',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButtonText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
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
    color: '#999999',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#000000',
  },
  alertsSection: {
    marginTop: 30,
    marginBottom: 20,
  },
  alertsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  alertsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  alertsCount: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  alertsList: {
    maxHeight: 300,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  alertIconText: {
    fontSize: 18,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 20,
  },
  alertTime: {
    fontSize: 12,
    color: '#666666',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  noAlertsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noAlertsText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 5,
  },
  noAlertsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});