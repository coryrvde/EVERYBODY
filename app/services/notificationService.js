import { supabase } from '../supabase';
import { realTimeAIMonitor } from './realTimeAIMonitor';

class NotificationService {
  constructor() {
    this.subscriptions = new Map();
    this.notificationCallbacks = new Map();
  }

  /**
   * Start real-time notifications for a parent
   */
  async startNotifications(parentId) {
    try {
      console.log('Starting real-time notifications for parent:', parentId);

      // Set up real-time alerts subscription
      const alertsChannel = supabase
        .channel(`notifications_${parentId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_alerts',
          filter: `parent_id=eq.${parentId}`
        }, async (payload) => {
          console.log('New notification received:', payload.new);
          const alert = payload.new;
          
          // Trigger notification callbacks
          this.triggerNotificationCallbacks(alert);
        })
        .subscribe();

      this.subscriptions.set(parentId, alertsChannel);
      console.log('Real-time notifications started');

    } catch (error) {
      console.error('Error starting notifications:', error);
    }
  }

  /**
   * Stop real-time notifications for a parent
   */
  async stopNotifications(parentId) {
    try {
      const channel = this.subscriptions.get(parentId);
      if (channel) {
        await supabase.removeChannel(channel);
        this.subscriptions.delete(parentId);
        console.log('Real-time notifications stopped');
      }
    } catch (error) {
      console.error('Error stopping notifications:', error);
    }
  }

  /**
   * Add notification callback
   */
  addNotificationCallback(parentId, callback) {
    if (!this.notificationCallbacks.has(parentId)) {
      this.notificationCallbacks.set(parentId, []);
    }
    this.notificationCallbacks.get(parentId).push(callback);
  }

  /**
   * Remove notification callback
   */
  removeNotificationCallback(parentId, callback) {
    const callbacks = this.notificationCallbacks.get(parentId);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Trigger notification callbacks
   */
  triggerNotificationCallbacks(alert) {
    const parentId = alert.parent_id;
    const callbacks = this.notificationCallbacks.get(parentId);
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in notification callback:', error);
        }
      });
    }
  }

  /**
   * Get recent alerts for a parent
   */
  async getRecentAlerts(parentId, limit = 10) {
    try {
      const { data, error } = await supabase
        .from('real_time_alerts')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting recent alerts:', error);
      return [];
    }
  }

  /**
   * Mark alert as read
   */
  async markAlertAsRead(alertId) {
    try {
      const { error } = await supabase
        .from('real_time_alerts')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking alert as read:', error);
    }
  }

  /**
   * Mark alert as acknowledged
   */
  async markAlertAsAcknowledged(alertId) {
    try {
      const { error } = await supabase
        .from('real_time_alerts')
        .update({ 
          is_acknowledged: true, 
          acknowledged_at: new Date().toISOString() 
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking alert as acknowledged:', error);
    }
  }

  /**
   * Get unread alert count for a parent
   */
  async getUnreadAlertCount(parentId) {
    try {
      const { count, error } = await supabase
        .from('real_time_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parentId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting unread alert count:', error);
      return 0;
    }
  }

  /**
   * Get high priority alert count for a parent
   */
  async getHighPriorityAlertCount(parentId) {
    try {
      const { count, error } = await supabase
        .from('real_time_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('parent_id', parentId)
        .in('severity', ['high', 'critical'])
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting high priority alert count:', error);
      return 0;
    }
  }

  /**
   * Create a test alert (for testing purposes)
   */
  async createTestAlert(parentId, childId, content = "Test message with concerning content") {
    try {
      const { data, error } = await supabase
        .from('real_time_alerts')
        .insert({
          parent_id: parentId,
          child_id: childId,
          alert_type: 'ai_flagged_content',
          severity: 'medium',
          app_name: 'Test App',
          contact: 'Test Contact',
          flagged_content: content,
          confidence: 0.85,
          ai_reasoning: 'Test alert created for demonstration purposes',
          suggested_action: 'monitor',
          keywords_detected: ['test', 'concerning'],
          context_analysis: 'This is a test alert to demonstrate the notification system',
          is_read: false,
          is_acknowledged: false
        });

      if (error) throw error;
      console.log('Test alert created:', data);
      return data;
    } catch (error) {
      console.error('Error creating test alert:', error);
    }
  }
}

export const notificationService = new NotificationService();
