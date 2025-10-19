import { supabase } from '../supabase';

class SimpleAlertService {
  constructor() {
    this.isInitialized = false;
    this.parentId = null;
    this.alertCallbacks = [];
    this.alertsChannel = null;
  }

  /**
   * Initialize the alert service for a parent
   */
  async initialize(parentId) {
    try {
      console.log('🔔 Initializing Simple Alert Service for parent:', parentId);
      
      this.parentId = parentId;
      
      // Set up real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      this.isInitialized = true;
      console.log('✅ Simple Alert Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Simple Alert Service:', error);
      return false;
    }
  }

  /**
   * Set up real-time subscriptions for alerts
   */
  async setupRealtimeSubscriptions() {
    try {
      // Subscribe to real-time alerts
      this.alertsChannel = supabase
        .channel('simple-realtime-alerts')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'real_time_alerts'
        }, (payload) => {
          console.log('🚨 New alert received:', payload.new);
          this.handleNewAlert(payload.new);
        })
        .subscribe();

    } catch (error) {
      console.error('❌ Error setting up real-time subscriptions:', error);
    }
  }

  /**
   * Handle new alerts
   */
  async handleNewAlert(alert) {
    try {
      // Check if this alert is relevant to this parent
      if (this.parentId) {
        const isRelevant = await this.isAlertRelevant(alert);
        if (!isRelevant) {
          console.log('🔔 Alert not relevant to this parent, skipping');
          return;
        }
      }

      // Notify registered callbacks
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('❌ Error in alert callback:', error);
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
      if (!this.parentId) return true;

      // Get linked children for this parent
      const { data: children, error } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', this.parentId);

      if (error) {
        console.error('❌ Error getting linked children:', error);
        return true; // Default to showing alert if we can't determine relevance
      }

      const childIds = children.map(child => child.child_id);
      return childIds.includes(alert.child_id);

    } catch (error) {
      console.error('❌ Error checking alert relevance:', error);
      return true;
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
   * Create a test alert
   */
  async createTestAlert(childId, content, severity = 'medium') {
    try {
      console.log('🧪 Creating test alert...');
      
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
   * Add alert callback
   */
  addAlertCallback(callback) {
    this.alertCallbacks.push(callback);
    console.log('📞 Alert callback added. Total callbacks:', this.alertCallbacks.length);
  }

  /**
   * Remove alert callback
   */
  removeAlertCallback(callback) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
      console.log('📞 Alert callback removed. Total callbacks:', this.alertCallbacks.length);
    }
  }

  /**
   * Cleanup
   */
  cleanup() {
    try {
      // Clean up real-time subscription
      if (this.alertsChannel) {
        supabase.removeChannel(this.alertsChannel);
        this.alertsChannel = null;
      }
      
      this.alertCallbacks = [];
      this.parentId = null;
      this.isInitialized = false;
      
      console.log('🧹 Simple Alert Service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const simpleAlertService = new SimpleAlertService();
export default simpleAlertService;
