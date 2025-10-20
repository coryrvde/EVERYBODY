# 💾 Guardian AI Storage System Setup Guide

## 🎯 **Overview**

Your Guardian AI app now has a comprehensive storage system that stores all information gathered from the app, including:

- **User Data:** Profiles, preferences, settings
- **Children Data:** Child profiles and information
- **Alerts & Monitoring:** Alert history, real-time notifications
- **Telegram Data:** Messages, chats, bot configurations
- **AI Monitoring:** Custom filters, analysis history
- **App Usage:** Statistics, session data, feature usage
- **Location Data:** Location history and tracking
- **Settings:** App settings, notifications, parental controls

## 🏗️ **Architecture**

### **Local Storage (AsyncStorage)**

- **Purpose:** Fast access, offline functionality
- **Technology:** React Native AsyncStorage
- **Data:** User preferences, cached data, offline queue

### **Remote Storage (Supabase)**

- **Purpose:** Cloud backup, cross-device sync
- **Technology:** PostgreSQL database
- **Data:** All persistent data, user accounts, real-time updates

### **Sync Service**

- **Purpose:** Keep local and remote data synchronized
- **Features:** Automatic sync, offline queue, conflict resolution

## 📋 **Setup Steps**

### **Step 1: Install Dependencies**

```bash
npm install @react-native-async-storage/async-storage
```

### **Step 2: Database Setup**

Run the SQL script in your Supabase SQL Editor:

```sql
-- Run: create_storage_database.sql
```

### **Step 3: Initialize Services**

The services are automatically initialized when the app starts:

- `localStorageService.initialize()`
- `dataSyncService.initialize()`

## 🔧 **Services Overview**

### **1. LocalStorageService**

**File:** `app/services/localStorageService.js`

**Features:**

- ✅ Store/retrieve user data
- ✅ Manage children profiles
- ✅ Handle alerts and notifications
- ✅ Store Telegram bot data
- ✅ Manage AI filters and analysis
- ✅ Track app usage statistics
- ✅ Store location history
- ✅ Manage settings and preferences
- ✅ Handle offline queue
- ✅ Data cleanup and maintenance

**Key Methods:**

```javascript
// User Data
await localStorageService.storeUserProfile(profileData);
await localStorageService.getUserProfile();

// Children Data
await localStorageService.storeChildrenData(childrenData);
await localStorageService.getChildrenData();

// Alerts
await localStorageService.addAlert(alertData);
await localStorageService.getAlertsData();

// Telegram
await localStorageService.addTelegramMessage(messageData);
await localStorageService.getTelegramMessages();

// AI Monitoring
await localStorageService.addAIFilter(filterData);
await localStorageService.getAIFilters();

// App Usage
await localStorageService.updateAppUsageStats(stats);
await localStorageService.getAppUsageStats();

// Settings
await localStorageService.storeAppSettings(settings);
await localStorageService.getAppSettings();
```

### **2. DataSyncService**

**File:** `app/services/dataSyncService.js`

**Features:**

- ✅ Automatic periodic sync (every 5 minutes)
- ✅ Manual sync on demand
- ✅ Incremental sync (only changed data)
- ✅ Offline queue processing
- ✅ Conflict resolution
- ✅ Sync status monitoring

**Key Methods:**

```javascript
// Sync Operations
await dataSyncService.performFullSync();
await dataSyncService.performIncrementalSync();
await dataSyncService.forceSyncData("alerts");

// Status
const status = dataSyncService.getSyncStatus();

// Queue Management
await dataSyncService.processOfflineQueue();
```

## 📱 **User Interface**

### **Data Management Screen**

**File:** `app/screens/DataManagementScreen.jsx`

**Features:**

- 📊 **Storage Overview:** View storage statistics and usage
- 🔄 **Sync Status:** Monitor sync status and last sync time
- 💾 **Storage Details:** View detailed storage information by data type
- ⚡ **Data Actions:** Export, cleanup, and clear cache options
- 🔧 **Manual Sync:** Force sync data with cloud

**Navigation:** Home Screen → Data Management

## 🗄️ **Database Tables**

### **Core Tables**

1. **user_preferences** - User preferences and settings
2. **app_settings** - Application configuration
3. **notification_settings** - Notification preferences
4. **parental_controls** - Parental control settings
5. **app_usage_stats** - App usage statistics
6. **location_history** - Location tracking data
7. **content_blocking_data** - Content blocking information
8. **data_sync_log** - Sync operation logs
9. **storage_statistics** - Storage usage statistics
10. **data_export_log** - Data export logs

### **Existing Tables (Enhanced)**

- **profiles** - User and child profiles
- **recent_alerts** - Alert history
- **real_time_alerts** - Real-time notifications
- **telegram_messages** - Telegram message history
- **telegram_chats** - Telegram chat information
- **telegram_bot_configs** - Bot configurations
- **custom_filters** - AI monitoring filters
- **ai_analysis** - AI analysis history

## 🔄 **Data Flow**

### **1. Data Collection**

```
App Usage → LocalStorage → Sync Service → Supabase
```

### **2. Data Retrieval**

```
Supabase → Sync Service → LocalStorage → App
```

### **3. Offline Handling**

```
App Action → LocalStorage → Offline Queue → Sync When Online
```

## 📊 **Storage Statistics**

The system tracks:

- **Data Types:** Number of different data types stored
- **Storage Size:** Total storage usage in KB
- **Item Counts:** Number of items per data type
- **Last Sync:** Last synchronization timestamp
- **Sync Status:** Current sync state

## 🔧 **Configuration Options**

### **Sync Settings**

- **Frequency:** 5 minutes (configurable)
- **Retry Attempts:** 3 attempts
- **Retry Delay:** 2 seconds
- **Auto Sync:** Enabled by default

### **Storage Limits**

- **Max Alerts:** 100 (configurable)
- **Max Messages:** 500 (configurable)
- **Max Analysis:** 200 (configurable)
- **Max Locations:** 200 (configurable)

### **Cleanup Settings**

- **Auto Cleanup:** Enabled
- **Cleanup Frequency:** On app start
- **Retention Policy:** Keep latest N items

## 🚀 **Usage Examples**

### **Store User Data**

```javascript
import { localStorageService } from "../services/localStorageService";

// Store user profile
await localStorageService.storeUserProfile({
  name: "John Doe",
  email: "john@example.com",
  role: "parent",
});

// Store user preferences
await localStorageService.storeUserPreferences({
  theme: "dark",
  notifications: true,
  language: "en",
});
```

### **Handle Alerts**

```javascript
// Add new alert
await localStorageService.addAlert({
  type: "content_flag",
  severity: "high",
  message: "Inappropriate content detected",
  app_name: "Telegram",
});

// Get alerts
const alerts = await localStorageService.getAlertsData();

// Acknowledge alert
await localStorageService.acknowledgeAlert(alertId);
```

### **Manage AI Filters**

```javascript
// Add AI filter
await localStorageService.addAIFilter({
  filter_text: "skip school",
  filter_type: "context",
  severity: "medium",
});

// Get filters
const filters = await localStorageService.getAIFilters();
```

### **Track App Usage**

```javascript
// Update usage stats
await localStorageService.updateAppUsageStats({
  total_sessions: 10,
  total_time_spent: 3600,
  features_used: {
    alerts: 5,
    filters: 3,
    telegram: 2,
  },
});
```

## 🛠️ **Maintenance**

### **Data Cleanup**

```javascript
// Clean up old data
await localStorageService.cleanupOldData();

// Clear all data
await localStorageService.clearAllData();
```

### **Data Export/Import**

```javascript
// Export all data
const exportData = await localStorageService.exportAllData();

// Import data
await localStorageService.importData(importData);
```

### **Storage Statistics**

```javascript
// Get storage stats
const stats = await localStorageService.getStorageStats();

// Get sync status
const syncStatus = dataSyncService.getSyncStatus();
```

## 🔐 **Security & Privacy**

### **Data Protection**

- ✅ **Encryption:** All data encrypted in transit
- ✅ **Access Control:** Row Level Security (RLS) policies
- ✅ **User Isolation:** Users can only access their own data
- ✅ **Audit Trail:** All operations logged

### **Privacy Features**

- ✅ **Data Export:** Users can export their data
- ✅ **Data Deletion:** Users can clear their data
- ✅ **Offline Mode:** Data stored locally when offline
- ✅ **Selective Sync:** Users can control what syncs

## 📈 **Performance**

### **Optimizations**

- ✅ **Lazy Loading:** Data loaded on demand
- ✅ **Caching:** Frequently accessed data cached
- ✅ **Batch Operations:** Multiple operations batched
- ✅ **Indexing:** Database indexes for fast queries
- ✅ **Compression:** Data compressed when possible

### **Monitoring**

- ✅ **Sync Performance:** Track sync times and success rates
- ✅ **Storage Usage:** Monitor storage growth
- ✅ **Error Tracking:** Log and track errors
- ✅ **User Analytics:** Track feature usage

## 🆘 **Troubleshooting**

### **Common Issues**

**1. Sync Failures**

- Check network connectivity
- Verify Supabase credentials
- Check sync logs in Data Management screen

**2. Storage Full**

- Use cleanup function to remove old data
- Increase storage limits in settings
- Export and clear unnecessary data

**3. Data Not Syncing**

- Force manual sync
- Check offline queue
- Verify user authentication

### **Debug Commands**

```javascript
// Check storage stats
const stats = await localStorageService.getStorageStats();
console.log("Storage Stats:", stats);

// Check sync status
const syncStatus = dataSyncService.getSyncStatus();
console.log("Sync Status:", syncStatus);

// Check offline queue
const queue = await localStorageService.getOfflineQueue();
console.log("Offline Queue:", queue);
```

## 🎉 **Benefits**

### **For Users**

- ✅ **Fast Performance:** Local storage for instant access
- ✅ **Offline Support:** Works without internet connection
- ✅ **Data Control:** Full control over their data
- ✅ **Cross-Device Sync:** Data synced across devices
- ✅ **Privacy:** Data stored securely and privately

### **For Developers**

- ✅ **Scalable Architecture:** Handles large amounts of data
- ✅ **Easy Integration:** Simple API for data operations
- ✅ **Error Handling:** Robust error handling and recovery
- ✅ **Monitoring:** Built-in monitoring and logging
- ✅ **Maintenance:** Automated cleanup and maintenance

---

**🎉 Your Guardian AI app now has a comprehensive storage system that efficiently manages all data while providing excellent user experience and developer flexibility!**
