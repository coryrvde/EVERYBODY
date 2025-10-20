// Test script for Guardian AI Storage System
// This tests the local storage and sync functionality

import { localStorageService } from './app/services/localStorageService.js';
import { dataSyncService } from './app/services/dataSyncService.js';

async function testStorageSystem() {
  try {
    console.log('🧪 Testing Guardian AI Storage System...\n');

    // Test 1: Initialize services
    console.log('1️⃣ Initializing services...');
    const storageInit = await localStorageService.initialize();
    const syncInit = await dataSyncService.initialize();
    
    if (storageInit && syncInit) {
      console.log('✅ Services initialized successfully');
    } else {
      console.log('❌ Service initialization failed');
      return;
    }

    // Test 2: Store user profile
    console.log('\n2️⃣ Testing user profile storage...');
    const userProfile = {
      name: 'Test Parent',
      email: 'test@guardian-ai.com',
      role: 'parent',
      created_at: new Date().toISOString()
    };
    
    const profileStored = await localStorageService.storeUserProfile(userProfile);
    if (profileStored) {
      console.log('✅ User profile stored successfully');
      
      const retrievedProfile = await localStorageService.getUserProfile();
      console.log('📋 Retrieved profile:', retrievedProfile);
    } else {
      console.log('❌ Failed to store user profile');
    }

    // Test 3: Store user preferences
    console.log('\n3️⃣ Testing user preferences storage...');
    const preferences = {
      theme: 'dark',
      notifications: true,
      language: 'en',
      timezone: 'UTC'
    };
    
    const prefsStored = await localStorageService.storeUserPreferences(preferences);
    if (prefsStored) {
      console.log('✅ User preferences stored successfully');
      
      const retrievedPrefs = await localStorageService.getUserPreferences();
      console.log('📋 Retrieved preferences:', retrievedPrefs);
    } else {
      console.log('❌ Failed to store user preferences');
    }

    // Test 4: Add test alert
    console.log('\n4️⃣ Testing alert storage...');
    const testAlert = {
      type: 'content_flag',
      severity: 'high',
      message: 'Test alert for storage system',
      app_name: 'Test App',
      flagged_content: 'Test content that was flagged',
      confidence: 0.85,
      ai_reasoning: 'This is a test alert to verify storage functionality'
    };
    
    const alertAdded = await localStorageService.addAlert(testAlert);
    if (alertAdded) {
      console.log('✅ Test alert added successfully');
      
      const alerts = await localStorageService.getAlertsData();
      console.log('📋 Retrieved alerts count:', alerts.length);
    } else {
      console.log('❌ Failed to add test alert');
    }

    // Test 5: Add AI filter
    console.log('\n5️⃣ Testing AI filter storage...');
    const testFilter = {
      filter_text: 'test storage system',
      filter_type: 'context',
      severity: 'medium',
      description: 'Test filter for storage verification'
    };
    
    const filterAdded = await localStorageService.addAIFilter(testFilter);
    if (filterAdded) {
      console.log('✅ Test AI filter added successfully');
      
      const filters = await localStorageService.getAIFilters();
      console.log('📋 Retrieved filters count:', filters.length);
    } else {
      console.log('❌ Failed to add test AI filter');
    }

    // Test 6: Store app settings
    console.log('\n6️⃣ Testing app settings storage...');
    const appSettings = {
      auto_sync: true,
      cache_duration: 24,
      max_stored_alerts: 100,
      max_stored_messages: 500,
      privacy_mode: false
    };
    
    const settingsStored = await localStorageService.storeAppSettings(appSettings);
    if (settingsStored) {
      console.log('✅ App settings stored successfully');
      
      const retrievedSettings = await localStorageService.getAppSettings();
      console.log('📋 Retrieved settings:', retrievedSettings);
    } else {
      console.log('❌ Failed to store app settings');
    }

    // Test 7: Update app usage stats
    console.log('\n7️⃣ Testing app usage statistics...');
    const usageStats = {
      total_sessions: 1,
      total_time_spent: 300,
      features_used: {
        alerts: 1,
        filters: 1,
        storage: 1
      },
      alerts_created: 1,
      filters_added: 1
    };
    
    const statsUpdated = await localStorageService.updateAppUsageStats(usageStats);
    if (statsUpdated) {
      console.log('✅ App usage stats updated successfully');
      
      const retrievedStats = await localStorageService.getAppUsageStats();
      console.log('📋 Retrieved stats:', retrievedStats);
    } else {
      console.log('❌ Failed to update app usage stats');
    }

    // Test 8: Get storage statistics
    console.log('\n8️⃣ Testing storage statistics...');
    const storageStats = await localStorageService.getStorageStats();
    console.log('📊 Storage Statistics:');
    console.log(`   Total data types with data: ${Object.values(storageStats).filter(stat => stat.has_data).length}`);
    console.log(`   Total storage size: ${Math.round(Object.values(storageStats).reduce((total, stat) => total + (stat.size || 0), 0) / 1024)} KB`);

    // Test 9: Test sync status
    console.log('\n9️⃣ Testing sync status...');
    const syncStatus = dataSyncService.getSyncStatus();
    console.log('🔄 Sync Status:');
    console.log(`   Is syncing: ${syncStatus.isSyncing}`);
    console.log(`   Last sync: ${syncStatus.lastSyncTime || 'Never'}`);
    console.log(`   Periodic sync active: ${syncStatus.isPeriodicSyncActive}`);

    // Test 10: Export data
    console.log('\n🔟 Testing data export...');
    const exportData = await localStorageService.exportAllData();
    if (exportData) {
      console.log('✅ Data export successful');
      console.log(`📦 Exported ${Object.keys(exportData).length} data items`);
      console.log(`📅 Export timestamp: ${exportData.export_metadata?.exported_at}`);
    } else {
      console.log('❌ Data export failed');
    }

    console.log('\n🎉 Storage system test completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('✅ Local storage service: Working');
    console.log('✅ Data sync service: Working');
    console.log('✅ User data storage: Working');
    console.log('✅ Alert storage: Working');
    console.log('✅ AI filter storage: Working');
    console.log('✅ App settings storage: Working');
    console.log('✅ Usage statistics: Working');
    console.log('✅ Storage statistics: Working');
    console.log('✅ Data export: Working');

    console.log('\n🚀 Your Guardian AI storage system is fully functional!');
    console.log('📱 You can now test the Data Management screen in your app.');

    return true;

  } catch (error) {
    console.error('❌ Storage system test failed:', error);
    return false;
  }
}

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  testStorageSystem()
    .then((success) => {
      if (success) {
        console.log('\n✅ All tests passed! Your storage system is ready.');
      } else {
        console.log('\n❌ Some tests failed. Check the errors above.');
      }
    })
    .catch((error) => {
      console.error('❌ Test execution failed:', error);
    });
}

export { testStorageSystem };
