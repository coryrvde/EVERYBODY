import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, FlatList, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { guardianClient } from '../api/guardian-client';
import { simpleAlertService } from '../services/simpleAlertService';
import { 
  Users, 
  Activity, 
  BarChart3, 
  Bell, 
  Shield, 
  Settings,
  LogOut,
  Plus,
  Eye,
  AlertTriangle
} from 'lucide-react-native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('HOME');
  const [alerts, setAlerts] = useState([]);
  const [guardianId, setGuardianId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [highPriorityAlerts, setHighPriorityAlerts] = useState(0);

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
      setupRealTimeNotifications();
      initializeAlertNotifications();
    }
  }, [guardianId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (simpleAlertService) {
        simpleAlertService.cleanup();
      }
    };
  }, []);

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

  async function initializeAlertNotifications() {
    try {
      console.log('🔔 Initializing alert notifications for guardian:', guardianId);
      
      // Initialize the simple alert service
      const success = await simpleAlertService.initialize(guardianId);
      
      if (success) {
        console.log('✅ Alert notifications initialized successfully');
        
        // Add callback to handle new alerts
        simpleAlertService.addAlertCallback((alert) => {
          console.log('🔔 New alert received in HomeScreen:', alert);
          
          // Update local alerts state
          setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
          
          // Show alert notification
          showAlertNotification(alert);
        });
        
        // Load initial alerts
        await loadInitialAlerts();
        
      } else {
        console.error('❌ Failed to initialize alert notifications');
      }
    } catch (error) {
      console.error('❌ Error initializing alert notifications:', error);
    }
  }

  async function loadInitialAlerts() {
    try {
      const recentAlerts = await simpleAlertService.getRecentAlerts(10);
      setAlerts(recentAlerts);
      console.log('📊 Loaded initial alerts:', recentAlerts.length);
    } catch (error) {
      console.error('❌ Error loading initial alerts:', error);
    }
  }

  function showAlertNotification(alert) {
    try {
      const severityEmoji = getSeverityEmoji(alert.severity);
      const alertTypeEmoji = getAlertTypeEmoji(alert.alert_type);
      
      const title = `${severityEmoji} ${alert.severity?.toUpperCase() || 'ALERT'} Alert - ${alertTypeEmoji}`;
      const message = `📱 App: ${alert.app_name || 'Unknown'}\n👤 Contact: ${alert.contact || 'Unknown'}\n📝 Content: ${alert.flagged_content}\n🤖 AI Analysis: ${alert.ai_reasoning || 'Content flagged by AI'}\n🎯 Confidence: ${Math.round((alert.confidence || 0.8) * 100)}%`;

      Alert.alert(
        title,
        message,
        [
          {
            text: 'View Details',
            onPress: () => handleViewAlert(alert)
          },
          {
            text: 'Acknowledge',
            onPress: () => handleAcknowledgeAlert(alert.id)
          },
          {
            text: 'Dismiss',
            style: 'cancel'
          }
        ],
        { 
          cancelable: true,
          userInterfaceStyle: 'light'
        }
      );

    } catch (error) {
      console.error('❌ Error showing alert notification:', error);
    }
  }

  function getSeverityEmoji(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return '🔵';
      default: return '📢';
    }
  }

  function getAlertTypeEmoji(alertType) {
    switch (alertType?.toLowerCase()) {
      case 'content_flag': return '🚩';
      case 'suspicious_activity': return '👁️';
      case 'emergency': return '🚨';
      case 'location': return '📍';
      case 'app_usage': return '📱';
      default: return '📢';
    }
  }

  function handleViewAlert(alert) {
    console.log('👁️ Viewing alert details:', alert);
    // You can navigate to a detailed alert view here
  }

  function handleAcknowledgeAlert(alertId) {
    console.log('✅ Acknowledging alert:', alertId);
    // You can implement alert acknowledgment here
  }

  async function createTestAlert() {
    try {
      console.log('🧪 Creating test alert...');
      
      // Create a test alert
      const testAlert = await simpleAlertService.createTestAlert(
        'test-child-id',
        'I want to skip school today and meet my friends',
        'medium'
      );
      
      if (testAlert) {
        console.log('✅ Test alert created successfully');
        Alert.alert('Test Alert Created', 'A test alert has been created and should appear shortly.');
      } else {
        console.error('❌ Failed to create test alert');
        Alert.alert('Error', 'Failed to create test alert. Please check the console for details.');
      }
    } catch (error) {
      console.error('❌ Error creating test alert:', error);
      Alert.alert('Error', 'Failed to create test alert. Please check the console for details.');
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

  async function setupRealTimeNotifications() {
    try {
      console.log('Setting up real-time notifications for guardian:', guardianId);
      
      // Start notification service
      await notificationService.startNotifications(guardianId);
      
      // Add notification callback
      notificationService.addNotificationCallback(guardianId, (alert) => {
        console.log('Real-time notification received:', alert);
        
        // Update real-time alerts state
        setRealTimeAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        
        // Update alert counts
        updateAlertCounts();
        
        // Show notification
        showRealTimeNotification(alert);
      });
      
      // Load initial alert counts
      await updateAlertCounts();
      
      // Load recent alerts
      await loadRecentAlerts();
      
    } catch (error) {
      console.error('Error setting up real-time notifications:', error);
    }
  }

  async function updateAlertCounts() {
    try {
      const unreadCount = await notificationService.getUnreadAlertCount(guardianId);
      const highPriorityCount = await notificationService.getHighPriorityAlertCount(guardianId);
      
      setUnreadAlertCount(unreadCount);
      setHighPriorityAlerts(highPriorityCount);
    } catch (error) {
      console.error('Error updating alert counts:', error);
    }
  }

  async function loadRecentAlerts() {
    try {
      const recentAlerts = await notificationService.getRecentAlerts(guardianId, 10);
      setRealTimeAlerts(recentAlerts);
    } catch (error) {
      console.error('Error loading recent alerts:', error);
    }
  }

  function showRealTimeNotification(alert) {
    Alert.alert(
      `🚨 ${alert.severity.toUpperCase()} Alert`,
      `${alert.app_name}: ${alert.flagged_content}\n\nAI Analysis: ${alert.ai_reasoning}\nConfidence: ${Math.round((alert.confidence || 0.8) * 100)}%`,
      [
        { text: 'View Details', onPress: () => handleViewAlert(alert) },
        { text: 'Acknowledge', onPress: () => handleAcknowledgeAlert(alert.id) },
        { text: 'Dismiss', style: 'cancel' }
      ],
      { cancelable: true }
    );
  }

  function handleViewAlert(alert) {
    console.log('Viewing alert details:', alert);
    // Navigate to detailed alert view or conversation history
    navigation.navigate('Conversation History');
  }

  async function handleAcknowledgeAlert(alertId) {
    try {
      await notificationService.markAlertAsAcknowledged(alertId);
      await updateAlertCounts();
      console.log('Alert acknowledged');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
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
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/logo3.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
            <View>
              <Text style={styles.headerTitle}>Guardian AI</Text>
              <Text style={styles.headerSubtitle}>Parent Dashboard</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back!</Text>
          <Text style={styles.welcomeSubtitle}>Monitor and protect your children's digital safety</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Bell size={24} color="#3B82F6" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>{alerts.length}</Text>
              <Text style={styles.statLabel}>Active Alerts</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={24} color="#10B981" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>2</Text>
              <Text style={styles.statLabel}>Linked Children</Text>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Shield size={24} color="#F59E0B" />
            </View>
            <View style={styles.statContent}>
              <Text style={styles.statNumber}>98%</Text>
              <Text style={styles.statLabel}>Protection Level</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleButtonPress('Child Profiles')}
            >
              <View style={styles.actionIcon}>
                <Users size={28} color="#3B82F6" />
              </View>
              <Text style={styles.actionTitle}>Child Profiles</Text>
              <Text style={styles.actionSubtitle}>Manage children</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleButtonPress('ParentScan')}
            >
              <View style={styles.actionIcon}>
                <Plus size={28} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>Link Child</Text>
              <Text style={styles.actionSubtitle}>Scan QR code</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleButtonPress('Location Tracking')}
            >
              <View style={styles.actionIcon}>
                <Activity size={28} color="#8B5CF6" />
              </View>
              <Text style={styles.actionTitle}>Location</Text>
              <Text style={styles.actionSubtitle}>Track devices</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleButtonPress('Content Blocking')}
            >
              <View style={styles.actionIcon}>
                <Shield size={28} color="#EF4444" />
              </View>
              <Text style={styles.actionTitle}>Content Block</Text>
              <Text style={styles.actionSubtitle}>Block apps/sites</Text>
            </TouchableOpacity>


              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('AI Monitoring')}
              >
                <View style={styles.actionIcon}>
                  <Text style={{ fontSize: 28 }}>🧠</Text>
                </View>
                <Text style={styles.actionTitle}>AI Monitoring</Text>
                <Text style={styles.actionSubtitle}>Smart detection</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => navigation.navigate('Telegram Setup')}
              >
                <View style={styles.actionIcon}>
                  <Text style={{ fontSize: 28 }}>📱</Text>
                </View>
                <Text style={styles.actionTitle}>Telegram Setup</Text>
                <Text style={styles.actionSubtitle}>Real-time monitoring</Text>
              </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={createTestAlert}
            >
              <View style={styles.actionIcon}>
                <Bell size={28} color="#F59E0B" />
              </View>
              <Text style={styles.actionTitle}>Test Alert</Text>
              <Text style={styles.actionSubtitle}>Create test alert</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity Overview</Text>
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Weekly Activity</Text>
              <View style={styles.alertBadge}>
                <Text style={styles.alertBadgeText}>{alerts.length} alerts this week</Text>
              </View>
            </View>
            
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const height = (item.value / maxValue) * 120;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[styles.bar, { height: height }]} />
                    <Text style={styles.barLabel}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Alerts</Text>
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Eye size={16} color="#3B82F6" />
            </TouchableOpacity>
          </View>

          {alerts.length > 0 ? (
            <View style={styles.alertsList}>
              {alerts.slice(0, 3).map((item, index) => (
                <TouchableOpacity key={item.id} style={styles.alertItem}>
                  <View style={styles.alertIcon}>
                    <AlertTriangle 
                      size={20} 
                      color={
                        item.severity === 'critical' ? '#EF4444' :
                        item.severity === 'high' ? '#F59E0B' : '#3B82F6'
                      } 
                    />
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
                      { backgroundColor: item.severity === 'critical' ? '#FEE2E2' : '#FEF3C7' }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: item.severity === 'critical' ? '#DC2626' : '#D97706' }
                      ]}>
                        {item.severity.toUpperCase()}
                      </Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Bell size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateTitle}>No recent alerts</Text>
              <Text style={styles.emptyStateSubtitle}>Alerts will appear here when detected</Text>
            </View>
          )}
        </View>

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  // Header Styles
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  // Welcome Section
  welcomeSection: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  // Stats Cards
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  // Section Styles
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  // Quick Actions
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Chart Styles
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  alertBadgeText: {
    fontSize: 12,
    color: '#D97706',
    fontWeight: '500',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 160,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 24,
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Alerts Styles
  alertsList: {
    gap: 12,
  },
  alertItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Empty State
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Footer
  footer: {
    height: 40,
  },
});