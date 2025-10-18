import { supabase } from '../app/supabase'

// ============================================================================
// GUARDIAN AI API FUNCTIONS
// These functions provide a clean interface for the React Native app to interact
// with the Supabase backend and Edge Functions
// ============================================================================

// ===========================
// AUTHENTICATION FUNCTIONS
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
  utils
}

export default guardianAPI
