import { Alert } from 'react-native';

class AlertNotificationService {
  constructor() {
    this.isInitialized = false;
    this.parentId = null;
    this.alertCallbacks = [];
  }

  /**
   * Initialize the notification service for a parent
   */
  async initialize(parentId) {
    try {
      console.log('🔔 Initializing Alert Notification Service for parent:', parentId);
      
      this.parentId = parentId;
      
      // Set up real-time subscriptions directly
      await this.setupRealtimeSubscriptions();
      
      this.isInitialized = true;
      console.log('✅ Alert Notification Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Alert Notification Service:', error);
      return false;
    }
  }

  /**
   * Set up real-time subscriptions for alerts
   */
  async setupRealtimeSubscriptions() {
    try {
      // Import supabase
      const { supabase } = await import('../supabase');
      
      // Subscribe to real-time alerts
      const alertsChannel = supabase
        .channel('realtime-alerts')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_alerts'
        }, (payload) => {
          console.log('🚨 New real-time alert received:', payload.new);
          this.handleNewAlert(payload.new);
        })
        .subscribe();

      // Store subscription for cleanup
      this.alertsChannel = alertsChannel;

    } catch (error) {
      console.error('❌ Error setting up real-time subscriptions:', error);
    }
  }

  /**
   * Handle new alerts from the integration service
   */
  async handleNewAlert(alert) {
    try {
      console.log('🔔 Handling new alert:', alert);

      // Check if this alert is for one of our linked children
      if (this.parentId) {
        const isRelevant = await this.isAlertRelevant(alert);
        if (!isRelevant) {
          console.log('🔔 Alert not relevant to this parent, skipping');
          return;
        }
      }

      // Show notification to parent
      this.showAlertNotification(alert);

      // Notify registered callbacks
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('❌ Error in alert notification callback:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error handling new alert:', error);
    }
  }

  /**
   * Check if alert is relevant to this parent
   */
  async isAlertRelevant(alert) {
    try {
      if (!this.parentId) return true; // If no parent ID, show all alerts

      // Get recent alerts to check if this parent has access to this child
      const recentAlerts = await alertIntegrationService.getRecentAlerts(this.parentId, 1);
      const hasAccess = recentAlerts.some(recentAlert => recentAlert.child_id === alert.child_id);
      
      return hasAccess;
    } catch (error) {
      console.error('❌ Error checking alert relevance:', error);
      return true; // Default to showing alert if we can't determine relevance
    }
  }

  /**
   * Show alert notification to parent
   */
  showAlertNotification(alert) {
    try {
      const severityEmoji = this.getSeverityEmoji(alert.severity);
      const alertTypeEmoji = this.getAlertTypeEmoji(alert.alert_type);
      
      const title = `${severityEmoji} ${alert.severity.toUpperCase()} Alert - ${alertTypeEmoji}`;
      const message = this.formatAlertMessage(alert);

      Alert.alert(
        title,
        message,
        [
          {
            text: 'View Details',
            onPress: () => this.handleViewAlert(alert)
          },
          {
            text: 'Acknowledge',
            onPress: () => this.handleAcknowledgeAlert(alert.id)
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

  /**
   * Format alert message for display
   */
  formatAlertMessage(alert) {
    const confidence = Math.round((alert.confidence || 0.8) * 100);
    const timestamp = new Date(alert.timestamp).toLocaleString();
    
    return `📱 App: ${alert.app_name}
👤 Contact: ${alert.contact}
📝 Content: ${alert.flagged_content}
🤖 AI Analysis: ${alert.ai_reasoning || 'Content flagged by AI'}
🎯 Confidence: ${confidence}%
⏰ Time: ${timestamp}`;
  }

  /**
   * Get severity emoji
   */
  getSeverityEmoji(severity) {
    switch (severity?.toLowerCase()) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🔶';
      case 'low': return '🔵';
      default: return '📢';
    }
  }

  /**
   * Get alert type emoji
   */
  getAlertTypeEmoji(alertType) {
    switch (alertType?.toLowerCase()) {
      case 'content_flag': return '🚩';
      case 'suspicious_activity': return '👁️';
      case 'emergency': return '🚨';
      case 'location': return '📍';
      case 'app_usage': return '📱';
      default: return '📢';
    }
  }

  /**
   * Handle view alert action
   */
  handleViewAlert(alert) {
    try {
      console.log('👁️ Viewing alert details:', alert);
      
      // Mark as read
      this.markAlertAsRead(alert.id);
      
      // Notify callbacks that user wants to view alert
      this.alertCallbacks.forEach(callback => {
        try {
          callback({ ...alert, action: 'view' });
        } catch (error) {
          console.error('❌ Error in view alert callback:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error handling view alert:', error);
    }
  }

  /**
   * Handle acknowledge alert action
   */
  async handleAcknowledgeAlert(alertId) {
    try {
      console.log('✅ Acknowledging alert:', alertId);
      
      const { supabase } = await import('../supabase');
      
      const { error } = await supabase
        .from('real_time_alerts')
        .update({ 
          is_acknowledged: true,
          acknowledged_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('❌ Error acknowledging alert:', error);
        return;
      }

      console.log('✅ Alert acknowledged successfully');
      
      // Notify callbacks that alert was acknowledged
      this.alertCallbacks.forEach(callback => {
        try {
          callback({ id: alertId, action: 'acknowledge' });
        } catch (error) {
          console.error('❌ Error in acknowledge alert callback:', error);
        }
      });

    } catch (error) {
      console.error('❌ Error acknowledging alert:', error);
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId) {
    try {
      const { supabase } = await import('../supabase');
      
      const { error } = await supabase
        .from('real_time_alerts')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('❌ Error marking alert as read:', error);
        return false;
      }

      console.log('✅ Alert marked as read');
      return true;
    } catch (error) {
      console.error('❌ Error marking alert as read:', error);
      return false;
    }
  }

  /**
   * Get recent alerts for this parent
   */
  async getRecentAlerts(limit = 10) {
    try {
      if (!this.parentId) {
        console.warn('⚠️ No parent ID set, cannot get recent alerts');
        return [];
      }

      const { supabase } = await import('../supabase');
      
      // Get linked children for this parent
      const { data: children, error: childrenError } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', this.parentId);

      if (childrenError) {
        console.error('❌ Error getting linked children:', childrenError);
        return [];
      }

      const childIds = children.map(child => child.child_id);

      if (childIds.length === 0) {
        return [];
      }

      // Get recent alerts for linked children
      const { data: alerts, error: alertsError } = await supabase
        .from('real_time_alerts')
        .select('*')
        .in('child_id', childIds)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (alertsError) {
        console.error('❌ Error getting recent alerts:', alertsError);
        return [];
      }

      return alerts || [];

    } catch (error) {
      console.error('❌ Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Get unread alert count for this parent
   */
  async getUnreadAlertCount() {
    try {
      if (!this.parentId) {
        console.warn('⚠️ No parent ID set, cannot get unread count');
        return 0;
      }

      const { supabase } = await import('../supabase');
      
      // Get linked children for this parent
      const { data: children, error: childrenError } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', this.parentId);

      if (childrenError) {
        console.error('❌ Error getting linked children:', childrenError);
        return 0;
      }

      const childIds = children.map(child => child.child_id);

      if (childIds.length === 0) {
        return 0;
      }

      // Get unread alert count
      const { count, error: countError } = await supabase
        .from('real_time_alerts')
        .select('*', { count: 'exact', head: true })
        .in('child_id', childIds)
        .eq('is_read', false);

      if (countError) {
        console.error('❌ Error getting unread alert count:', countError);
        return 0;
      }

      return count || 0;

    } catch (error) {
      console.error('❌ Error getting unread alert count:', error);
      return 0;
    }
  }

  /**
   * Add alert callback
   */
  addAlertCallback(callback) {
    this.alertCallbacks.push(callback);
    console.log('📞 Alert notification callback added. Total callbacks:', this.alertCallbacks.length);
  }

  /**
   * Remove alert callback
   */
  removeAlertCallback(callback) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
      console.log('📞 Alert notification callback removed. Total callbacks:', this.alertCallbacks.length);
    }
  }

  /**
   * Create a test alert (for testing purposes)
   */
  async createTestAlert(childId, content, severity = 'medium') {
    try {
      console.log('🧪 Creating test alert...');
      
      const { supabase } = await import('../supabase');
      
      const alert = {
        child_id: childId,
        alert_type: 'content_flag',
        severity: severity,
        app_name: 'Telegram',
        contact: 'Test Contact',
        flagged_content: content,
        confidence: 0.85,
        ai_reasoning: 'Test alert created for demonstration',
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('real_time_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating test alert:', error);
        return null;
      }

      console.log('✅ Test alert created successfully');
      return data;

    } catch (error) {
      console.error('❌ Error creating test alert:', error);
      return null;
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    try {
      // Clean up real-time subscription
      if (this.alertsChannel) {
        const { supabase } = require('../supabase');
        supabase.removeChannel(this.alertsChannel);
        this.alertsChannel = null;
      }
      
      this.alertCallbacks = [];
      this.parentId = null;
      this.isInitialized = false;
      
      console.log('🧹 Alert Notification Service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const alertNotificationService = new AlertNotificationService();
export default alertNotificationService;
