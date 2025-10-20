// Data Management Screen
// This screen allows users to view, manage, and export their stored data

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Alert, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { localStorageService } from '../services/localStorageService';
import { dataSyncService } from '../services/dataSyncService';
import { 
  ArrowLeft, 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  RefreshCw, 
  BarChart3,
  FileText,
  Users,
  Bell,
  MessageSquare,
  Brain,
  MapPin,
  Settings
} from 'lucide-react-native';

export default function DataManagementScreen() {
  const navigation = useNavigation();
  const [storageStats, setStorageStats] = useState({});
  const [syncStatus, setSyncStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load storage statistics
      const stats = await localStorageService.getStorageStats();
      setStorageStats(stats);
      
      // Load sync status
      const status = dataSyncService.getSyncStatus();
      setSyncStatus(status);
      
    } catch (error) {
      console.error('❌ Error loading data:', error);
      Alert.alert('Error', 'Failed to load data management information');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleSyncNow = async () => {
    try {
      Alert.alert(
        'Sync Data',
        'This will sync your local data with the cloud. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Sync', 
            onPress: async () => {
              await dataSyncService.performFullSync();
              await loadData();
              Alert.alert('Success', 'Data synced successfully');
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error syncing data:', error);
      Alert.alert('Error', 'Failed to sync data');
    }
  };

  const handleExportData = async () => {
    try {
      Alert.alert(
        'Export Data',
        'This will export all your stored data. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Export', 
            onPress: async () => {
              const exportData = await localStorageService.exportAllData();
              
              if (exportData) {
                // In a real app, you would save this to a file or share it
                console.log('📤 Export data:', exportData);
                Alert.alert('Success', 'Data exported successfully. Check console for details.');
              } else {
                Alert.alert('Error', 'Failed to export data');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const handleClearCache = async () => {
    try {
      Alert.alert(
        'Clear Cache',
        'This will clear all cached data. This action cannot be undone. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Clear', 
            style: 'destructive',
            onPress: async () => {
              const success = await localStorageService.clearAllData();
              
              if (success) {
                await loadData();
                Alert.alert('Success', 'Cache cleared successfully');
              } else {
                Alert.alert('Error', 'Failed to clear cache');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  };

  const handleCleanupOldData = async () => {
    try {
      Alert.alert(
        'Cleanup Old Data',
        'This will remove old data to free up space. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Cleanup', 
            onPress: async () => {
              const success = await localStorageService.cleanupOldData();
              
              if (success) {
                await loadData();
                Alert.alert('Success', 'Old data cleaned up successfully');
              } else {
                Alert.alert('Error', 'Failed to cleanup old data');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('❌ Error cleaning up data:', error);
      Alert.alert('Error', 'Failed to cleanup old data');
    }
  };

  const storageData = [
    {
      id: 'user_profile',
      title: 'User Profile',
      icon: Users,
      color: '#3B82F6',
      description: 'Your profile information and preferences'
    },
    {
      id: 'children_data',
      title: 'Children Data',
      icon: Users,
      color: '#10B981',
      description: 'Linked children profiles and information'
    },
    {
      id: 'alerts_data',
      title: 'Alerts & Notifications',
      icon: Bell,
      color: '#F59E0B',
      description: 'Alert history and notification data'
    },
    {
      id: 'telegram_messages',
      title: 'Telegram Messages',
      icon: MessageSquare,
      color: '#8B5CF6',
      description: 'Monitored Telegram conversations'
    },
    {
      id: 'ai_filters',
      title: 'AI Filters',
      icon: Brain,
      color: '#EF4444',
      description: 'Custom AI monitoring filters'
    },
    {
      id: 'location_history',
      title: 'Location History',
      icon: MapPin,
      color: '#06B6D4',
      description: 'Device location tracking data'
    },
    {
      id: 'app_settings',
      title: 'App Settings',
      icon: Settings,
      color: '#6B7280',
      description: 'Application settings and preferences'
    }
  ];

  const renderStorageItem = ({ item }) => {
    const stats = storageStats[item.id] || {};
    const IconComponent = item.icon;
    
    return (
      <View style={styles.storageItem}>
        <View style={styles.storageItemHeader}>
          <View style={[styles.storageIcon, { backgroundColor: item.color }]}>
            <IconComponent size={20} color="#FFFFFF" />
          </View>
          <View style={styles.storageInfo}>
            <Text style={styles.storageTitle}>{item.title}</Text>
            <Text style={styles.storageDescription}>{item.description}</Text>
          </View>
          <View style={styles.storageStats}>
            <Text style={styles.storageSize}>
              {stats.size ? `${Math.round(stats.size / 1024)} KB` : '0 KB'}
            </Text>
            <View style={[
              styles.storageIndicator, 
              { backgroundColor: stats.has_data ? '#10B981' : '#D1D5DB' }
            ]} />
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <RefreshCw size={32} color="#3B82F6" />
          <Text style={styles.loadingText}>Loading data management...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Data Management</Text>
          <Text style={styles.headerSubtitle}>Manage your stored data</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sync Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Sync Status</Text>
          <View style={styles.syncCard}>
            <View style={styles.syncHeader}>
              <View style={styles.syncInfo}>
                <Text style={styles.syncTitle}>
                  {syncStatus.isSyncing ? 'Syncing...' : 'Sync Status'}
                </Text>
                <Text style={styles.syncSubtitle}>
                  {syncStatus.lastSyncTime 
                    ? `Last sync: ${new Date(syncStatus.lastSyncTime).toLocaleString()}`
                    : 'Never synced'
                  }
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.syncButton}
                onPress={handleSyncNow}
                disabled={syncStatus.isSyncing}
              >
                <RefreshCw 
                  size={20} 
                  color="#FFFFFF" 
                  style={syncStatus.isSyncing ? styles.rotating : null}
                />
                <Text style={styles.syncButtonText}>Sync Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Storage Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💾 Storage Overview</Text>
          <View style={styles.overviewCard}>
            <View style={styles.overviewStats}>
              <View style={styles.overviewStat}>
                <Database size={24} color="#3B82F6" />
                <Text style={styles.overviewStatNumber}>
                  {Object.values(storageStats).filter(stat => stat.has_data).length}
                </Text>
                <Text style={styles.overviewStatLabel}>Data Types</Text>
              </View>
              <View style={styles.overviewStat}>
                <BarChart3 size={24} color="#10B981" />
                <Text style={styles.overviewStatNumber}>
                  {Math.round(
                    Object.values(storageStats).reduce((total, stat) => total + (stat.size || 0), 0) / 1024
                  )} KB
                </Text>
                <Text style={styles.overviewStatLabel}>Total Size</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Storage Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Storage Details</Text>
          <FlatList
            data={storageData}
            keyExtractor={(item) => item.id}
            renderItem={renderStorageItem}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Data Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚡ Data Actions</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <Download size={24} color="#3B82F6" />
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Export All Data</Text>
              <Text style={styles.actionButtonSubtitle}>Download your stored data</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleCleanupOldData}>
            <Trash2 size={24} color="#F59E0B" />
            <View style={styles.actionButtonContent}>
              <Text style={styles.actionButtonTitle}>Cleanup Old Data</Text>
              <Text style={styles.actionButtonSubtitle}>Remove old data to free space</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleClearCache}>
            <Trash2 size={24} color="#EF4444" />
            <View style={styles.actionButtonContent}>
              <Text style={[styles.actionButtonTitle, styles.dangerText]}>Clear All Cache</Text>
              <Text style={styles.actionButtonSubtitle}>Remove all stored data</Text>
            </View>
          </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  syncCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  syncHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncInfo: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  syncSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  syncButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  syncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  rotating: {
    transform: [{ rotate: '360deg' }],
  },
  overviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  overviewStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  overviewStat: {
    alignItems: 'center',
  },
  overviewStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
  },
  overviewStatLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  storageItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  storageItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storageIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  storageInfo: {
    flex: 1,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  storageDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  storageStats: {
    alignItems: 'flex-end',
  },
  storageSize: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  storageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonContent: {
    marginLeft: 16,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  actionButtonSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerText: {
    color: '#DC2626',
  },
  footer: {
    height: 40,
  },
});
