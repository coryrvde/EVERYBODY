// Local Storage Service for Guardian AI App
// This service manages local data storage using AsyncStorage

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../supabase';

class LocalStorageService {
  constructor() {
    this.storageKeys = {
      // User Data
      USER_PROFILE: 'user_profile',
      USER_PREFERENCES: 'user_preferences',
      
      // Children Data
      CHILDREN_DATA: 'children_data',
      CHILD_PROFILES: 'child_profiles',
      
      // Alerts and Monitoring
      ALERTS_DATA: 'alerts_data',
      RECENT_ALERTS: 'recent_alerts',
      REAL_TIME_ALERTS: 'real_time_alerts',
      
      // Telegram Bot Data
      TELEGRAM_CONFIG: 'telegram_config',
      TELEGRAM_MESSAGES: 'telegram_messages',
      TELEGRAM_CHATS: 'telegram_chats',
      
      // AI Monitoring Data
      AI_FILTERS: 'ai_filters',
      AI_ANALYSIS_HISTORY: 'ai_analysis_history',
      
      // App Usage Data
      APP_USAGE_STATS: 'app_usage_stats',
      LOCATION_HISTORY: 'location_history',
      CONTENT_BLOCKING_DATA: 'content_blocking_data',
      
      // Settings and Configuration
      APP_SETTINGS: 'app_settings',
      NOTIFICATION_SETTINGS: 'notification_settings',
      PARENTAL_CONTROLS: 'parental_controls',
      
      // Sync and Cache
      LAST_SYNC_TIME: 'last_sync_time',
      CACHE_METADATA: 'cache_metadata',
      OFFLINE_QUEUE: 'offline_queue'
    };
    
    this.isInitialized = false;
  }

  /**
   * Initialize the storage service
   */
  async initialize() {
    try {
      console.log('🗄️ Initializing Local Storage Service...');
      
      // Check if storage is available
      await AsyncStorage.getItem('test_key');
      
      // Set up storage metadata
      await this.setStorageMetadata();
      
      this.isInitialized = true;
      console.log('✅ Local Storage Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Local Storage Service:', error);
      return false;
    }
  }

  /**
   * Set storage metadata
   */
  async setStorageMetadata() {
    const metadata = {
      initialized_at: new Date().toISOString(),
      version: '1.0.0',
      last_cleanup: new Date().toISOString()
    };
    
    await this.setData(this.storageKeys.CACHE_METADATA, metadata);
  }

  /**
   * Generic method to store data
   */
  async setData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      console.log(`💾 Data stored successfully: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error storing data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Generic method to retrieve data
   */
  async getData(key, defaultValue = null) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData === null) {
        return defaultValue;
      }
      return JSON.parse(jsonData);
    } catch (error) {
      console.error(`❌ Error retrieving data for key ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data by key
   */
  async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      console.log(`🗑️ Data removed successfully: ${key}`);
      return true;
    } catch (error) {
      console.error(`❌ Error removing data for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Clear all app data
   */
  async clearAllData() {
    try {
      const keys = Object.values(this.storageKeys);
      await AsyncStorage.multiRemove(keys);
      console.log('🧹 All app data cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      return false;
    }
  }

  // ==================== USER DATA METHODS ====================

  /**
   * Store user profile data
   */
  async storeUserProfile(profileData) {
    const data = {
      ...profileData,
      stored_at: new Date().toISOString(),
      version: '1.0.0'
    };
    
    return await this.setData(this.storageKeys.USER_PROFILE, data);
  }

  /**
   * Get user profile data
   */
  async getUserProfile() {
    return await this.getData(this.storageKeys.USER_PROFILE, {});
  }

  /**
   * Store user preferences
   */
  async storeUserPreferences(preferences) {
    const data = {
      ...preferences,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.USER_PREFERENCES, data);
  }

  /**
   * Get user preferences
   */
  async getUserPreferences() {
    return await this.getData(this.storageKeys.USER_PREFERENCES, {
      theme: 'light',
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    });
  }

  // ==================== CHILDREN DATA METHODS ====================

  /**
   * Store children data
   */
  async storeChildrenData(childrenData) {
    const data = {
      children: childrenData,
      stored_at: new Date().toISOString(),
      count: childrenData.length
    };
    
    return await this.setData(this.storageKeys.CHILDREN_DATA, data);
  }

  /**
   * Get children data
   */
  async getChildrenData() {
    const data = await this.getData(this.storageKeys.CHILDREN_DATA, {});
    return data.children || [];
  }

  /**
   * Store individual child profile
   */
  async storeChildProfile(childId, profileData) {
    const existingData = await this.getData(this.storageKeys.CHILD_PROFILES, {});
    
    existingData[childId] = {
      ...profileData,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.CHILD_PROFILES, existingData);
  }

  /**
   * Get child profile
   */
  async getChildProfile(childId) {
    const data = await this.getData(this.storageKeys.CHILD_PROFILES, {});
    return data[childId] || null;
  }

  // ==================== ALERTS DATA METHODS ====================

  /**
   * Store alerts data
   */
  async storeAlertsData(alertsData) {
    const data = {
      alerts: alertsData,
      stored_at: new Date().toISOString(),
      count: alertsData.length,
      unread_count: alertsData.filter(alert => !alert.is_acknowledged).length
    };
    
    return await this.setData(this.storageKeys.archALERTS_DATA, data);
  }

  /**
   * Get alerts data
   */
  async getAlertsData() {
    const data = await this.getData(this.storageKeys.ALERTS_DATA, {});
    return data.alerts || [];
  }

  /**
   * Store recent alerts
   */
  async storeRecentAlerts(alerts) {
    const data = {
      alerts,
      stored_at: new Date().toISOString(),
      count: alerts.length
    };
    
    return await this.setData(this.storageKeys.RECENT_ALERTS, data);
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts() {
    const data = await this.getData(this.storageKeys.RECENT_ALERTS, {});
    return data.alerts || [];
  }

  /**
   * Add new alert
   */
  async addAlert(alertData) {
    const existingAlerts = await this.getAlertsData();
    const newAlert = {
      ...alertData,
      id: alertData.id || Date.now().toString(),
      created_at: new Date().toISOString(),
      is_acknowledged: false
    };
    
    const updatedAlerts = [newAlert, ...existingAlerts.slice(0, 99)]; // Keep last 100 alerts
    
    return await this.storeAlertsData(updatedAlerts);
  }

  /**
   * Mark alert as acknowledged
   */
  async acknowledgeAlert(alertId) {
    const alerts = await this.getAlertsData();
    const updatedAlerts = alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, is_acknowledged: true, acknowledged_at: new Date().toISOString() }
        : alert
    );
    
    return await this.storeAlertsData(updatedAlerts);
  }

  // ==================== TELEGRAM BOT DATA METHODS ====================

  /**
   * Store Telegram bot configuration
   */
  async storeTelegramConfig(configData) {
    const data = {
      ...configData,
      stored_at: new Date().toISOString(),
      is_active: true
    };
    
    return await this.setData(this.storageKeys.TELEGRAM_CONFIG, data);
  }

  /**
   * Get Telegram bot configuration
   */
  async getTelegramConfig() {
    return await this.getData(this.storageKeys.TELEGRAM_CONFIG, {});
  }

  /**
   * Store Telegram messages
   */
  async storeTelegramMessages(messages) {
    const data = {
      messages,
      stored_at: new Date().toISOString(),
      count: messages.length
    };
    
    return await this.setData(this.storageKeys.TELEGRAM_MESSAGES, data);
  }

  /**
   * Get Telegram messages
   */
  async getTelegramMessages() {
    const data = await this.getData(this.storageKeys.TELEGRAM_MESSAGES, {});
    return data.messages || [];
  }

  /**
   * Add new Telegram message
   */
  async addTelegramMessage(messageData) {
    const existingMessages = await this.getTelegramMessages();
    const newMessage = {
      ...messageData,
      id: messageData.id || Date.now().toString(),
      received_at: new Date().toISOString(),
      flagged: false
    };
    
    const updatedMessages = [newMessage, ...existingMessages.slice(0, 499)]; // Keep last 500 messages
    
    return await this.storeTelegramMessages(updatedMessages);
  }

  /**
   * Store Telegram chats
   */
  async storeTelegramChats(chats) {
    const data = {
      chats,
      stored_at: new Date().toISOString(),
      count: chats.length
    };
    
    return await this.setData(this.storageKeys.TELEGRAM_CHATS, data);
  }

  /**
   * Get Telegram chats
   */
  async getTelegramChats() {
    const data = await this.getData(this.storageKeys.TELEGRAM_CHATS, {});
    return data.chats || [];
  }

  // ==================== AI MONITORING DATA METHODS ====================

  /**
   * Store AI filters
   */
  async storeAIFilters(filters) {
    const data = {
      filters,
      stored_at: new Date().toISOString(),
      count: filters.length,
      active_count: filters.filter(filter => filter.is_active).length
    };
    
    return await this.setData(this.storageKeys.AI_FILTERS, data);
  }

  /**
   * Get AI filters
   */
  async getAIFilters() {
    const data = await this.getData(this.storageKeys.AI_FILTERS, {});
    return data.filters || [];
  }

  /**
   * Add AI filter
   */
  async addAIFilter(filterData) {
    const existingFilters = await this.getAIFilters();
    const newFilter = {
      ...filterData,
      id: filterData.id || Date.now().toString(),
      created_at: new Date().toISOString(),
      is_active: true,
      times_flagged: 0
    };
    
    const updatedFilters = [newFilter, ...existingFilters];
    
    return await this.storeAIFilters(updatedFilters);
  }

  /**
   * Store AI analysis history
   */
  async storeAIAnalysisHistory(analysisData) {
    const data = {
      analyses: analysisData,
      stored_at: new Date().toISOString(),
      count: analysisData.length
    };
    
    return await this.setData(this.storageKeys.AI_ANALYSIS_HISTORY, data);
  }

  /**
   * Get AI analysis history
   */
  async getAIAnalysisHistory() {
    const data = await this.getData(this.storageKeys.AI_ANALYSIS_HISTORY, {});
    return data.analyses || [];
  }

  /**
   * Add AI analysis result
   */
  async addAIAnalysis(analysisData) {
    const existingAnalyses = await this.getAIAnalysisHistory();
    const newAnalysis = {
      ...analysisData,
      id: analysisData.id || Date.now().toString(),
      analyzed_at: new Date().toISOString()
    };
    
    const updatedAnalyses = [newAnalysis, ...existingAnalyses.slice(0, 199)]; // Keep last 200 analyses
    
    return await this.storeAIAnalysisHistory(updatedAnalyses);
  }

  // ==================== APP USAGE DATA METHODS ====================

  /**
   * Store app usage statistics
   */
  async storeAppUsageStats(statsData) {
    const data = {
      ...statsData,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.APP_USAGE_STATS, data);
  }

  /**
   * Get app usage statistics
   */
  async getAppUsageStats() {
    return await this.getData(this.storageKeys.APP_USAGE_STATS, {
      total_sessions: 0,
      total_time_spent: 0,
      last_session: null,
      features_used: {},
      alerts_created: 0,
      filters_added: 0
    });
  }

  /**
   * Update app usage statistics
   */
  async updateAppUsageStats(updates) {
    const existingStats = await this.getAppUsageStats();
    const updatedStats = {
      ...existingStats,
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return await this.storeAppUsageStats(updatedStats);
  }

  /**
   * Store location history
   */
  async storeLocationHistory(locations) {
    const data = {
      locations,
      stored_at: new Date().toISOString(),
      count: locations.length
    };
    
    return await this.setData(this.storageKeys.LOCATION_HISTORY, data);
  }

  /**
   * Get location history
   */
  async getLocationHistory() {
    const data = await this.getData(this.storageKeys.LOCATION_HISTORY, {});
    return data.locations || [];
  }

  /**
   * Add location data
   */
  async addLocationData(locationData) {
    const existingLocations = await this.getLocationHistory();
    const newLocation = {
      ...locationData,
      id: locationData.id || Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    
    const updatedLocations = [newLocation, ...existingLocations.slice(0, 199)]; // Keep last 200 locations
    
    return await this.storeLocationHistory(updatedLocations);
  }

  // ==================== SETTINGS AND CONFIGURATION METHODS ====================

  /**
   * Store app settings
   */
  async storeAppSettings(settings) {
    const data = {
      ...settings,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.APP_SETTINGS, data);
  }

  /**
   * Get app settings
   */
  async getAppSettings() {
    return await this.getData(this.storageKeys.APP_SETTINGS, {
      theme: 'light',
      auto_sync: true,
      cache_duration: 24, // hours
      max_stored_alerts: 100,
      max_stored_messages: 500,
      privacy_mode: false
    });
  }

  /**
   * Store notification settings
   */
  async storeNotificationSettings(settings) {
    const data = {
      ...settings,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.NOTIFICATION_SETTINGS, data);
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings() {
    return await this.getData(this.storageKeys.NOTIFICATION_SETTINGS, {
      push_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      alert_sound: true,
      vibration: true,
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '07:00'
      }
    });
  }

  /**
   * Store parental controls settings
   */
  async storeParentalControls(controls) {
    const data = {
      ...controls,
      updated_at: new Date().toISOString()
    };
    
    return await this.setData(this.storageKeys.PARENTAL_CONTROLS, data);
  }

  /**
   * Get parental controls settings
   */
  async getParentalControls() {
    return await this.getData(this.storageKeys.PARENTAL_CONTROLS, {
      content_filtering: true,
      location_tracking: true,
      app_monitoring: true,
      time_restrictions: {
        enabled: false,
        bedtime: '22:00',
        wake_time: '07:00'
      },
      blocked_apps: [],
      allowed_apps: []
    });
  }

  // ==================== SYNC AND CACHE METHODS ====================

  /**
   * Store last sync time
   */
  async storeLastSyncTime(syncTime = new Date().toISOString()) {
    return await this.setData(this.storageKeys.LAST_SYNC_TIME, syncTime);
  }

  /**
   * Get last sync time
   */
  async getLastSyncTime() {
    return await this.getData(this.storageKeys.LAST_SYNC_TIME, null);
  }

  /**
   * Add item to offline queue
   */
  async addToOfflineQueue(action, data) {
    const existingQueue = await this.getData(this.storageKeys.OFFLINE_QUEUE, []);
    const queueItem = {
      id: Date.now().toString(),
      action,
      data,
      created_at: new Date().toISOString(),
      retry_count: 0
    };
    
    const updatedQueue = [...existingQueue, queueItem];
    
    return await this.setData(this.storageKeys.OFFLINE_QUEUE, updatedQueue);
  }

  /**
   * Get offline queue
   */
  async getOfflineQueue() {
    return await this.getData(this.storageKeys.OFFLINE_QUEUE, []);
  }

  /**
   * Clear offline queue
   */
  async clearOfflineQueue() {
    return await this.setData(this.storageKeys.OFFLINE_QUEUE, []);
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get storage statistics
   */
  async getStorageStats() {
    try {
      const keys = Object.values(this.storageKeys);
      const stats = {};
      
      for (const key of keys) {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          stats[key] = {
            size: data.length,
            has_data: true
          };
        } else {
          stats[key] = {
            size: 0,
            has_data: false
          };
        }
      }
      
      return stats;
    } catch (error) {
      console.error('❌ Error getting storage stats:', error);
      return {};
    }
  }

  /**
   * Clean up old data
   */
  async cleanupOldData() {
    try {
      console.log('🧹 Cleaning up old data...');
      
      // Clean up old alerts (keep last 100)
      const alerts = await this.getAlertsData();
      if (alerts.length > 100) {
        await this.storeAlertsData(alerts.slice(0, 100));
      }
      
      // Clean up old messages (keep last 500)
      const messages = await this.getTelegramMessages();
      if (messages.length > 500) {
        await this.storeTelegramMessages(messages.slice(0, 500));
      }
      
      // Clean up old analysis history (keep last 200)
      const analyses = await this.getAIAnalysisHistory();
      if (analyses.length > 200) {
        await this.storeAIAnalysisHistory(analyses.slice(0, 200));
      }
      
      // Clean up old location history (keep last 200)
      const locations = await this.getLocationHistory();
      if (locations.length > 200) {
        await this.storeLocationHistory(locations.slice(0, 200));
      }
      
      console.log('✅ Data cleanup completed');
      return true;
    } catch (error) {
      console.error('❌ Error during data cleanup:', error);
      return false;
    }
  }

  /**
   * Export all data
   */
  async exportAllData() {
    try {
      const exportData = {};
      const keys = Object.values(this.storageKeys);
      
      for (const key of keys) {
        exportData[key] = await this.getData(key);
      }
      
      exportData.export_metadata = {
        exported_at: new Date().toISOString(),
        version: '1.0.0',
        total_keys: keys.length
      };
      
      return exportData;
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      return null;
    }
  }

  /**
   * Import data
   */
  async importData(importData) {
    try {
      console.log('📥 Importing data...');
      
      const keys = Object.keys(importData);
      let importedCount = 0;
      
      for (const key of keys) {
        if (key !== 'export_metadata') {
          await this.setData(key, importData[key]);
          importedCount++;
        }
      }
      
      console.log(`✅ Imported ${importedCount} data items`);
      return true;
    } catch (error) {
      console.error('❌ Error importing data:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const localStorageService = new LocalStorageService();
