// Data Synchronization Service
// This service handles syncing data between local storage and Supabase

import { supabase } from '../supabase';
import { localStorageService } from './localStorageService';

class DataSyncService {
  constructor() {
    this.isSyncing = false;
    this.syncInterval = null;
    this.syncFrequency = 5 * 60 * 1000; // 5 minutes
    this.retryAttempts = 3;
    this.retryDelay = 2000; // 2 seconds
  }

  /**
   * Initialize the sync service
   */
  async initialize() {
    try {
      console.log('🔄 Initializing Data Sync Service...');
      
      // Start periodic sync
      this.startPeriodicSync();
      
      // Perform initial sync
      await this.performFullSync();
      
      console.log('✅ Data Sync Service initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ Error initializing Data Sync Service:', error);
      return false;
    }
  }

  /**
   * Start periodic sync
   */
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    this.syncInterval = setInterval(async () => {
      await this.performIncrementalSync();
    }, this.syncFrequency);
    
    console.log('⏰ Periodic sync started');
  }

  /**
   * Stop periodic sync
   */
  stopPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('⏹️ Periodic sync stopped');
    }
  }

  /**
   * Perform full sync
   */
  async performFullSync() {
    if (this.isSyncing) {
      console.log('⚠️ Sync already in progress, skipping...');
      return;
    }

    try {
      this.isSyncing = true;
      console.log('🔄 Starting full sync...');
      
      // Sync user data
      await this.syncUserData();
      
      // Sync children data
      await this.syncChildrenData();
      
      // Sync alerts data
      await this.syncAlertsData();
      
      // Sync Telegram data
      await this.syncTelegramData();
      
      // Sync AI monitoring data
      await this.syncAIMonitoringData();
      
      // Sync settings
      await this.syncSettings();
      
      // Process offline queue
      await this.processOfflineQueue();
      
      // Update last sync time
      await localStorageService.storeLastSyncTime();
      
      console.log('✅ Full sync completed successfully');
      
    } catch (error) {
      console.error('❌ Error during full sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Perform incremental sync
   */
  async performIncrementalSync() {
    if (this.isSyncing) {
      return;
    }

    try {
      this.isSyncing = true;
      console.log('🔄 Starting incremental sync...');
      
      const lastSyncTime = await localStorageService.getLastSyncTime();
      
      if (lastSyncTime) {
        // Sync only data changed since last sync
        await this.syncChangedData(lastSyncTime);
      } else {
        // If no last sync time, do full sync
        await this.performFullSync();
      }
      
      // Process offline queue
      await this.processOfflineQueue();
      
      // Update last sync time
      await localStorageService.storeLastSyncTime();
      
      console.log('✅ Incremental sync completed');
      
    } catch (error) {
      console.error('❌ Error during incremental sync:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Sync user data
   */
  async syncUserData() {
    try {
      console.log('👤 Syncing user data...');
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log('⚠️ No authenticated user, skipping user data sync');
        return;
      }

      // Get user profile from database
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profileError && profile) {
        await localStorageService.storeUserProfile(profile);
      }

      // Get user preferences
      const { data: preferences, error: preferencesError } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!preferencesError && preferences) {
        await localStorageService.storeUserPreferences(preferences);
      }

      console.log('✅ User data synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
    }
  }

  /**
   * Sync children data
   */
  async syncChildrenData() {
    try {
      console.log('👶 Syncing children data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get children profiles
      const { data: children, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('parent_id', user.id)
        .eq('role', 'child');

      if (!error && children) {
        await localStorageService.storeChildrenData(children);
        
        // Store individual child profiles
        for (const child of children) {
          await localStorageService.storeChildProfile(child.id, child);
        }
      }

      console.log('✅ Children data synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing children data:', error);
    }
  }

  /**
   * Sync alerts data
   */
  async syncAlertsData() {
    try {
      console.log('🚨 Syncing alerts data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get recent alerts
      const { data: alerts, error } = await supabase
        .from('recent_alerts')
        .select('*')
        .eq('guardian_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && alerts) {
        await localStorageService.storeAlertsData(alerts);
        await localStorageService.storeRecentAlerts(alerts.slice(0, 10));
      }

      // Get real-time alerts
      const { data: realTimeAlerts, error: rtError } = await supabase
        .from('real_time_alerts')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!rtError && realTimeAlerts) {
        await localStorageService.storeAlertsData(realTimeAlerts);
      }

      console.log('✅ Alerts data synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing alerts data:', error);
    }
  }

  /**
   * Sync Telegram data
   */
  async syncTelegramData() {
    try {
      console.log('📱 Syncing Telegram data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get Telegram bot configuration
      const { data: botConfig, error: configError } = await supabase
        .from('telegram_bot_configs')
        .select('*')
        .eq('parent_id', user.id)
        .single();

      if (!configError && botConfig) {
        await localStorageService.storeTelegramConfig(botConfig);
      }

      // Get parent Telegram chat
      const { data: parentChat, error: chatError } = await supabase
        .from('parent_telegram_chats')
        .select('*')
        .eq('parent_id', user.id)
        .single();

      if (!chatError && parentChat) {
        // Store parent chat info in config
        const config = await localStorageService.getTelegramConfig();
        await localStorageService.storeTelegramConfig({
          ...config,
          parent_chat_id: parentChat.chat_id,
          parent_chat_type: parentChat.chat_type
        });
      }

      // Get Telegram messages
      const { data: messages, error: messagesError } = await supabase
        .from('telegram_messages')
        .select('*')
        .eq('parent_id', user.id)
        .order('timestamp', { ascending: false })
        .limit(500);

      if (!messagesError && messages) {
        await localStorageService.storeTelegramMessages(messages);
      }

      // Get Telegram chats
      const { data: chats, error: chatsError } = await supabase
        .from('telegram_chats')
        .select('*')
        .eq('parent_id', user.id);

      if (!chatsError && chats) {
        await localStorageService.storeTelegramChats(chats);
      }

      console.log('✅ Telegram data synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing Telegram data:', error);
    }
  }

  /**
   * Sync AI monitoring data
   */
  async syncAIMonitoringData() {
    try {
      console.log('🤖 Syncing AI monitoring data...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get custom filters
      const { data: filters, error: filtersError } = await supabase
        .from('custom_filters')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (!filtersError && filters) {
        await localStorageService.storeAIFilters(filters);
      }

      // Get AI analysis history
      const { data: analyses, error: analysesError } = await supabase
        .from('ai_analysis')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!analysesError && analyses) {
        await localStorageService.storeAIAnalysisHistory(analyses);
      }

      console.log('✅ AI monitoring data synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing AI monitoring data:', error);
    }
  }

  /**
   * Sync settings
   */
  async syncSettings() {
    try {
      console.log('⚙️ Syncing settings...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get app settings
      const { data: appSettings, error: appError } = await supabase
        .from('app_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!appError && appSettings) {
        await localStorageService.storeAppSettings(appSettings);
      }

      // Get notification settings
      const { data: notificationSettings, error: notifError } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (!notifError && notificationSettings) {
        await localStorageService.storeNotificationSettings(notificationSettings);
      }

      // Get parental controls
      const { data: parentalControls, error: controlsError } = await supabase
        .from('parental_controls')
        .select('*')
        .eq('parent_id', user.id)
        .single();

      if (!controlsError && parentalControls) {
        await localStorageService.storeParentalControls(parentalControls);
      }

      console.log('✅ Settings synced successfully');
      
    } catch (error) {
      console.error('❌ Error syncing settings:', error);
    }
  }

  /**
   * Sync changed data since last sync
   */
  async syncChangedData(lastSyncTime) {
    try {
      console.log('🔄 Syncing changed data since:', lastSyncTime);
      
      // This would implement incremental sync based on timestamps
      // For now, we'll do a simplified version
      
      // Sync recent alerts
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: recentAlerts, error } = await supabase
        .from('recent_alerts')
        .select('*')
        .eq('guardian_id', user.id)
        .gte('created_at', lastSyncTime)
        .order('created_at', { ascending: false });

      if (!error && recentAlerts && recentAlerts.length > 0) {
        const existingAlerts = await localStorageService.getAlertsData();
        const updatedAlerts = [...recentAlerts, ...existingAlerts];
        
        // Remove duplicates and keep only latest
        const uniqueAlerts = updatedAlerts.reduce((acc, alert) => {
          if (!acc.find(a => a.id === alert.id)) {
            acc.push(alert);
          }
          return acc;
        }, []);
        
        await localStorageService.storeAlertsData(uniqueAlerts.slice(0, 100));
        console.log(`✅ Synced ${recentAlerts.length} new alerts`);
      }
      
    } catch (error) {
      console.error('❌ Error syncing changed data:', error);
    }
  }

  /**
   * Process offline queue
   */
  async processOfflineQueue() {
    try {
      console.log('📤 Processing offline queue...');
      
      const queue = await localStorageService.getOfflineQueue();
      
      if (queue.length === 0) {
        return;
      }

      let processedCount = 0;
      const failedItems = [];

      for (const item of queue) {
        try {
          const success = await this.processQueueItem(item);
          
          if (success) {
            processedCount++;
          } else {
            failedItems.push(item);
          }
        } catch (error) {
          console.error('❌ Error processing queue item:', error);
          failedItems.push(item);
        }
      }

      // Update queue with failed items
      await localStorageService.setData('offline_queue', failedItems);
      
      console.log(`✅ Processed ${processedCount} items from offline queue`);
      
    } catch (error) {
      console.error('❌ Error processing offline queue:', error);
    }
  }

  /**
   * Process individual queue item
   */
  async processQueueItem(item) {
    try {
      switch (item.action) {
        case 'add_alert':
          return await this.syncAlertToRemote(item.data);
        case 'add_filter':
          return await this.syncFilterToRemote(item.data);
        case 'update_settings':
          return await this.syncSettingsToRemote(item.data);
        case 'acknowledge_alert':
          return await this.acknowledgeAlertRemote(item.data);
        default:
          console.log('⚠️ Unknown queue action:', item.action);
          return false;
      }
    } catch (error) {
      console.error('❌ Error processing queue item:', error);
      return false;
    }
  }

  /**
   * Sync alert to remote
   */
  async syncAlertToRemote(alertData) {
    try {
      const { error } = await supabase
        .from('recent_alerts')
        .upsert(alertData);

      return !error;
    } catch (error) {
      console.error('❌ Error syncing alert to remote:', error);
      return false;
    }
  }

  /**
   * Sync filter to remote
   */
  async syncFilterToRemote(filterData) {
    try {
      const { error } = await supabase
        .from('custom_filters')
        .upsert(filterData);

      return !error;
    } catch (error) {
      console.error('❌ Error syncing filter to remote:', error);
      return false;
    }
  }

  /**
   * Sync settings to remote
   */
  async syncSettingsToRemote(settingsData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;

      const { error } = await supabase
        .from('app_settings')
        .upsert({
          user_id: user.id,
          ...settingsData,
          updated_at: new Date().toISOString()
        });

      return !error;
    } catch (error) {
      console.error('❌ Error syncing settings to remote:', error);
      return false;
    }
  }

  /**
   * Acknowledge alert remotely
   */
  async acknowledgeAlertRemote(alertData) {
    try {
      const { error } = await supabase
        .from('recent_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertData.id);

      return !error;
    } catch (error) {
      console.error('❌ Error acknowledging alert remotely:', error);
      return false;
    }
  }

  /**
   * Force sync specific data type
   */
  async forceSyncData(dataType) {
    try {
      console.log(`🔄 Force syncing ${dataType}...`);
      
      switch (dataType) {
        case 'user':
          await this.syncUserData();
          break;
        case 'children':
          await this.syncChildrenData();
          break;
        case 'alerts':
          await this.syncAlertsData();
          break;
        case 'telegram':
          await this.syncTelegramData();
          break;
        case 'ai':
          await this.syncAIMonitoringData();
          break;
        case 'settings':
          await this.syncSettings();
          break;
        case 'all':
          await this.performFullSync();
          break;
        default:
          console.log('⚠️ Unknown data type for sync:', dataType);
      }
      
      console.log(`✅ Force sync completed for ${dataType}`);
      
    } catch (error) {
      console.error(`❌ Error force syncing ${dataType}:`, error);
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus() {
    return {
      isSyncing: this.isSyncing,
      lastSyncTime: localStorageService.getLastSyncTime(),
      syncFrequency: this.syncFrequency,
      isPeriodicSyncActive: this.syncInterval !== null
    };
  }

  /**
   * Cleanup
   */
  cleanup() {
    this.stopPeriodicSync();
    this.isSyncing = false;
    console.log('🧹 Data Sync Service cleaned up');
  }
}

// Create and export singleton instance
export const dataSyncService = new DataSyncService();
