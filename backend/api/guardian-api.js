import { supabase } from '../app/supabase'
import { Expo, ExpoPushMessage, ExpoPushToken } from 'expo-server-sdk'

// ============================================================================
// GUARDIAN AI API FUNCTIONS
// These functions provide a clean interface for the React Native app to interact
// with the Supabase backend and Edge Functions
// ============================================================================

// ===========================
// AUTHENTICATION FUNCTIONS`
// ===========================

export const authAPI = {
  // Get current user profile
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      throw error
    }
  },

  // Get user profile with additional data
  async getUserProfile() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError
      return { ...user, profile }
    } catch (error) {
      console.error('Error getting user profile:', error)
      throw error
    }
  },

  // Update user profile
  async updateProfile(updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }
}

// ===========================
// SECURITY ALERTS FUNCTIONS
// ===========================

export const alertsAPI = {
  // Get user's security alerts
  async getAlerts(options = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      let query = supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      // Apply filters
      if (options.status) {
        query = query.eq('status', options.status)
      }
      if (options.severity) {
        query = query.eq('severity', options.severity)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting alerts:', error)
      throw error
    }
  },

  // Get single alert by ID
  async getAlert(alertId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('id', alertId)
        .eq('user_id', user.id)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting alert:', error)
      throw error
    }
  },

  // Update alert status
  async updateAlertStatus(alertId, status, notes = null) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const updateData = {
        status,
        updated_at: new Date().toISOString()
      }

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
        updateData.resolved_by = user.id
      }

      const { data, error } = await supabase
        .from('security_alerts')
        .update(updateData)
        .eq('id', alertId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Log the status change
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'alert_status_changed',
          description: `Alert ${alertId} status changed to ${status}`,
          metadata: { alert_id: alertId, new_status: status, notes }
        })

      return data
    } catch (error) {
      console.error('Error updating alert status:', error)
      throw error
    }
  },

  // Create manual alert
  async createAlert(alertData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('security_alerts')
        .insert({
          user_id: user.id,
          ...alertData,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // Log the alert creation
      await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: 'alert_created',
          description: `Manual alert created: ${alertData.title}`,
          metadata: { alert_id: data.id, alert_type: alertData.alert_type }
        })

      // Send push notification for the alert
      try {
        await notificationsAPI.sendAlertNotification(data.id)
      } catch (notificationError) {
        console.warn('Failed to send alert notification:', notificationError)
        // Don't fail the alert creation if notification fails
      }

      return data
    } catch (error) {
      console.error('Error creating alert:', error)
      throw error
    }
  },

  // Process alert with AI (calls Edge Function)
  async processAlertWithAI(alertData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase.functions.invoke('process-alert', {
        body: { alertData: { ...alertData, userId: user.id } }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error processing alert with AI:', error)
      throw error
    }
  }
}

// ===========================
// AI INSIGHTS FUNCTIONS
// ===========================

export const insightsAPI = {
  // Get user's AI insights
  async getInsights(options = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      let query = supabase
        .from('ai_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options.unreadOnly) {
        query = query.eq('is_read', false)
      }
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting insights:', error)
      throw error
    }
  },

  // Mark insight as read
  async markInsightAsRead(insightId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('ai_insights')
        .update({ is_read: true })
        .eq('id', insightId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error marking insight as read:', error)
      throw error
    }
  }
}

// ===========================
// DEVICES FUNCTIONS
// ===========================

export const devicesAPI = {
  // Get user's registered devices
  async getDevices() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('devices')
        .select('*')
        .eq('user_id', user.id)
        .order('last_seen', { ascending: false })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting devices:', error)
      throw error
    }
  },

  // Register new device
  async registerDevice(deviceData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('devices')
        .insert({
          user_id: user.id,
          ...deviceData,
          is_active: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error registering device:', error)
      throw error
    }
  },

  // Update device info
  async updateDevice(deviceId, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('devices')
        .update({
          ...updates,
          last_seen: new Date().toISOString()
        })
        .eq('id', deviceId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating device:', error)
      throw error
    }
  }
}

// ===========================
// EMERGENCY CONTACTS FUNCTIONS
// ===========================

export const emergencyContactsAPI = {
  // Get user's emergency contacts
  async getContacts() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting emergency contacts:', error)
      throw error
    }
  },

  // Add emergency contact
  async addContact(contactData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert({
          user_id: user.id,
          ...contactData,
          is_active: true
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error adding emergency contact:', error)
      throw error
    }
  },

  // Update emergency contact
  async updateContact(contactId, updates) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(updates)
        .eq('id', contactId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating emergency contact:', error)
      throw error
    }
  },

  // Delete emergency contact
  async deleteContact(contactId) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting emergency contact:', error)
      throw error
    }
  }
}

// ===========================
// EMERGENCY RESPONSE FUNCTIONS
// ===========================

export const emergencyAPI = {
  // Trigger emergency response
  async triggerEmergency(emergencyData) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase.functions.invoke('emergency-response', {
        body: { emergencyData: { ...emergencyData, userId: user.id } }
      })

      if (error) throw error

      // Send emergency push notification
      try {
        await notificationsAPI.sendEmergencyNotification(user.id, emergencyData)
      } catch (notificationError) {
        console.warn('Failed to send emergency notification:', notificationError)
        // Don't fail the emergency trigger if notification fails
      }

      return data
    } catch (error) {
      console.error('Error triggering emergency response:', error)
      throw error
    }
  }
}

// ===========================
// ACTIVITY LOGS FUNCTIONS
// ===========================

export const activityAPI = {
  // Get user's activity logs
  async getActivityLogs(options = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      let query = supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }
      if (options.activityType) {
        query = query.eq('activity_type', options.activityType)
      }

      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      console.error('Error getting activity logs:', error)
      throw error
    }
  },

  // Log custom activity
  async logActivity(activityType, description, metadata = {}) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('activity_logs')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          description,
          metadata
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error logging activity:', error)
      throw error
    }
  }
}

// ===========================
// SYSTEM SETTINGS FUNCTIONS
// ===========================

export const settingsAPI = {
  // Get user settings
  async getSettings() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error

      // Convert array of key-value pairs to object
      const settings = {}
      data.forEach(setting => {
        settings[setting.setting_key] = setting.setting_value
      })

      return settings
    } catch (error) {
      console.error('Error getting settings:', error)
      throw error
    }
  },

  // Update setting
  async updateSetting(key, value) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data, error } = await supabase
        .from('system_settings')
        .upsert({
          user_id: user.id,
          setting_key: key,
          setting_value: value
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating setting:', error)
      throw error
    }
  }
}

// ===========================
// REAL-TIME SUBSCRIPTIONS
// ===========================

export const realtimeAPI = {
  // Subscribe to security alerts
  subscribeToAlerts(callback) {
    const { data: { user } } = supabase.auth.getUser()

    return supabase
      .channel('alerts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'security_alerts',
          filter: `user_id=eq.${user.id}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to AI insights
  subscribeToInsights(callback) {
    const { data: { user } } = supabase.auth.getUser()

    return supabase
      .channel('insights')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_insights',
          filter: `user_id=eq.${user.id}`
        },
        callback
      )
      .subscribe()
  },

  // Subscribe to device updates
  subscribeToDevices(callback) {
    const { data: { user } } = supabase.auth.getUser()

    return supabase
      .channel('devices')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'devices',
          filter: `user_id=eq.${user.id}`
        },
        callback
      )
      .subscribe()
  }
}

// ===========================
// PUSH NOTIFICATIONS FUNCTIONS
// ===========================

// Initialize Expo client
const expo = new Expo()

export const notificationsAPI = {
  // Register device for push notifications
  async registerDeviceToken(deviceToken) {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      // Validate Expo push token
      if (!Expo.isExpoPushToken(deviceToken)) {
        throw new Error('Invalid Expo push token')
      }

      // Update or insert device token
      const { data, error } = await supabase
        .from('devices')
        .upsert({
          user_id: user.id,
          device_name: `Device-${deviceToken.slice(-8)}`,
          device_type: 'mobile',
          fcm_token: deviceToken,
          is_active: true,
          last_seen: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error registering device token:', error)
      throw error
    }
  },

  // Send push notification to specific user
  async sendNotificationToUser(userId, notification) {
    try {
      // Get user's active device tokens
      const { data: devices, error } = await supabase
        .from('devices')
        .select('fcm_token')
        .eq('user_id', userId)
        .eq('is_active', true)
        .not('fcm_token', 'is', null)

      if (error) throw error
      if (!devices || devices.length === 0) return { sent: 0, message: 'No active devices found' }

      const messages = devices
        .filter(device => Expo.isExpoPushToken(device.fcm_token))
        .map(device => ({
          to: device.fcm_token,
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: notification.sound || 'default',
          priority: notification.priority || 'default',
          ttl: notification.ttl || 86400, // 24 hours
          expiration: notification.expiration,
          badge: notification.badge
        }))

      if (messages.length === 0) return { sent: 0, message: 'No valid push tokens found' }

      // Send notifications in chunks (Expo recommends max 100 per request)
      const chunks = expo.chunkPushNotifications(messages)
      const tickets = []

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error('Error sending notification chunk:', error)
        }
      }

      // Log the notification
      await supabase
        .from('activity_logs')
        .insert({
          user_id: userId,
          activity_type: 'notification_sent',
          description: `Push notification sent: ${notification.title}`,
          metadata: {
            notification_title: notification.title,
            devices_targeted: devices.length,
            messages_sent: messages.length,
            tickets_received: tickets.length
          }
        })

      return {
        sent: tickets.length,
        tickets: tickets,
        message: `Notifications sent to ${tickets.length} devices`
      }
    } catch (error) {
      console.error('Error sending notification to user:', error)
      throw error
    }
  },

  // Send security alert notification
  async sendAlertNotification(alertId) {
    try {
      // Get alert details
      const { data: alert, error: alertError } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('id', alertId)
        .single()

      if (alertError) throw alertError

      const notification = {
        title: '🚨 Security Alert',
        body: alert.title,
        data: {
          type: 'alert',
          alertId: alert.id,
          severity: alert.severity
        },
        sound: 'default',
        priority: alert.severity === 'critical' ? 'high' : 'default',
        badge: 1
      }

      return await this.sendNotificationToUser(alert.user_id, notification)
    } catch (error) {
      console.error('Error sending alert notification:', error)
      throw error
    }
  },

  // Send AI insight notification
  async sendInsightNotification(insightId) {
    try {
      // Get insight details
      const { data: insight, error: insightError } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('id', insightId)
        .single()

      if (insightError) throw insightError

      const notification = {
        title: '🧠 AI Insight',
        body: insight.title,
        data: {
          type: 'insight',
          insightId: insight.id
        },
        sound: 'default',
        priority: 'default'
      }

      return await this.sendNotificationToUser(insight.user_id, notification)
    } catch (error) {
      console.error('Error sending insight notification:', error)
      throw error
    }
  },

  // Send emergency notification
  async sendEmergencyNotification(userId, emergencyData) {
    try {
      const notification = {
        title: '🚨 EMERGENCY ALERT',
        body: `Emergency: ${emergencyData.emergencyType}`,
        data: {
          type: 'emergency',
          emergencyType: emergencyData.emergencyType,
          severity: emergencyData.severity
        },
        sound: 'default',
        priority: 'high',
        badge: 1,
        ttl: 0 // Never expire emergency notifications
      }

      return await this.sendNotificationToUser(userId, notification)
    } catch (error) {
      console.error('Error sending emergency notification:', error)
      throw error
    }
  },

  // Send broadcast notification to all users (admin function)
  async sendBroadcastNotification(title, body, data = {}) {
    try {
      // Get all active device tokens
      const { data: devices, error } = await supabase
        .from('devices')
        .select('fcm_token, user_id')
        .eq('is_active', true)
        .not('fcm_token', 'is', null)

      if (error) throw error
      if (!devices || devices.length === 0) return { sent: 0, message: 'No active devices found' }

      const messages = devices
        .filter(device => Expo.isExpoPushToken(device.fcm_token))
        .map(device => ({
          to: device.fcm_token,
          title: title,
          body: body,
          data: { ...data, broadcast: true },
          sound: 'default',
          priority: 'default'
        }))

      if (messages.length === 0) return { sent: 0, message: 'No valid push tokens found' }

      const chunks = expo.chunkPushNotifications(messages)
      const tickets = []

      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
          tickets.push(...ticketChunk)
        } catch (error) {
          console.error('Error sending broadcast notification chunk:', error)
        }
      }

      return {
        sent: tickets.length,
        totalDevices: devices.length,
        message: `Broadcast sent to ${tickets.length} devices`
      }
    } catch (error) {
      console.error('Error sending broadcast notification:', error)
      throw error
    }
  }
}

// ===========================
// UTILITY FUNCTIONS
// ===========================

export const utils = {
  // Format date for display
  formatDate(dateString) {
    return new Date(dateString).toLocaleString()
  },

  // Get severity color
  getSeverityColor(severity) {
    const colors = {
      low: '#4CAF50',
      medium: '#FF9800',
      high: '#F44336',
      critical: '#9C27B0'
    }
    return colors[severity] || '#666'
  },

  // Validate email
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Validate phone number
  isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
    return phoneRegex.test(phone)
  }
}

// Export all APIs as a single object
export const guardianAPI = {
  auth: authAPI,
  alerts: alertsAPI,
  insights: insightsAPI,
  devices: devicesAPI,
  emergencyContacts: emergencyContactsAPI,
  emergency: emergencyAPI,
  activity: activityAPI,
  settings: settingsAPI,
  realtime: realtimeAPI,
  notifications: notificationsAPI,
  utils
}

export default guardianAPI
