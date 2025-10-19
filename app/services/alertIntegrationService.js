import { supabase } from '../supabase';
import { AIContentDetector } from './aiContentDetector';

class AlertIntegrationService {
  constructor() {
    this.subscriptions = new Map();
    this.alertCallbacks = [];
    this.isInitialized = false;
    this.aiDetector = new AIContentDetector();
  }

  /**
   * Initialize the alert integration service
   */
  async initialize() {
    try {
      console.log('🔧 Initializing Alert Integration Service...');
      
      // Set up real-time subscriptions for alerts
      await this.setupRealtimeSubscriptions();
      
      this.isInitialized = true;
      console.log('✅ Alert Integration Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Alert Integration Service:', error);
      return false;
    }
  }

  /**
   * Set up real-time subscriptions for different alert types
   */
  async setupRealtimeSubscriptions() {
    try {
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

      // Subscribe to flagged content
      const flaggedChannel = supabase
        .channel('flagged-content')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'flagged_content'
        }, (payload) => {
          console.log('🚩 New flagged content received:', payload.new);
          this.handleFlaggedContent(payload.new);
        })
        .subscribe();

      // Subscribe to conversation logs
      const conversationChannel = supabase
        .channel('conversation-logs')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'conversation_logs'
        }, (payload) => {
          console.log('💬 New conversation log received:', payload.new);
          this.handleConversationLog(payload.new);
        })
        .subscribe();

      // Store subscriptions for cleanup
      this.subscriptions.set('alerts', alertsChannel);
      this.subscriptions.set('flagged', flaggedChannel);
      this.subscriptions.set('conversation', conversationChannel);

    } catch (error) {
      console.error('❌ Error setting up real-time subscriptions:', error);
    }
  }

  /**
   * Handle new real-time alerts
   */
  async handleNewAlert(alert) {
    try {
      console.log('🚨 Processing new alert:', alert);

      // Add AI analysis if not present
      if (!alert.ai_reasoning) {
        const aiAnalysis = await this.analyzeContentWithAI(alert.flagged_content);
        alert.ai_reasoning = aiAnalysis.reasoning;
        alert.confidence = aiAnalysis.confidence;
      }

      // Notify all registered callbacks
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('❌ Error in alert callback:', error);
        }
      });

      // Update alert with AI analysis
      await this.updateAlertWithAIAnalysis(alert.id, {
        ai_reasoning: alert.ai_reasoning,
        confidence: alert.confidence
      });

    } catch (error) {
      console.error('❌ Error handling new alert:', error);
    }
  }

  /**
   * Handle flagged content
   */
  async handleFlaggedContent(flaggedContent) {
    try {
      console.log('🚩 Processing flagged content:', flaggedContent);

      // Create a real-time alert from flagged content
      const alert = {
        child_id: flaggedContent.child_id,
        alert_type: 'content_flag',
        severity: flaggedContent.severity,
        app_name: flaggedContent.app_name || 'Unknown App',
        contact: flaggedContent.contact || 'Unknown Contact',
        flagged_content: flaggedContent.content_data,
        confidence: flaggedContent.confidence,
        ai_reasoning: flaggedContent.analysis_reasons?.join(', ') || 'Content flagged by AI analysis',
        timestamp: new Date().toISOString()
      };

      // Insert into real_time_alerts table
      const { data, error } = await supabase
        .from('real_time_alerts')
        .insert(alert)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating alert from flagged content:', error);
      } else {
        console.log('✅ Alert created from flagged content:', data);
      }

    } catch (error) {
      console.error('❌ Error handling flagged content:', error);
    }
  }

  /**
   * Handle conversation logs
   */
  async handleConversationLog(conversationLog) {
    try {
      console.log('💬 Processing conversation log:', conversationLog);

      // Check if this conversation log should trigger an alert
      if (conversationLog.severity === 'high' || conversationLog.severity === 'critical') {
        const alert = {
          child_id: conversationLog.child_id,
          alert_type: 'suspicious_activity',
          severity: conversationLog.severity,
          app_name: conversationLog.app_name,
          contact: conversationLog.contact,
          flagged_content: conversationLog.flagged_content || 'Suspicious conversation pattern detected',
          confidence: conversationLog.confidence,
          ai_reasoning: 'Multiple concerning messages detected in conversation',
          timestamp: new Date().toISOString()
        };

        // Insert into real_time_alerts table
        const { data, error } = await supabase
          .from('real_time_alerts')
          .insert(alert)
          .select()
          .single();

        if (error) {
          console.error('❌ Error creating alert from conversation log:', error);
        } else {
          console.log('✅ Alert created from conversation log:', data);
        }
      }

    } catch (error) {
      console.error('❌ Error handling conversation log:', error);
    }
  }

  /**
   * Analyze content with AI (similar to ChatGPT)
   */
  async analyzeContentWithAI(content) {
    try {
      // Use the existing AI content detector
      const analysis = await this.aiDetector.analyzeContent(content);
      
      return {
        reasoning: analysis.reasons?.join(', ') || 'Content analyzed by AI',
        confidence: analysis.confidence || 0.8,
        severity: analysis.severity || 'medium',
        categories: analysis.categories || []
      };
    } catch (error) {
      console.error('❌ Error analyzing content with AI:', error);
      return {
        reasoning: 'AI analysis failed - content flagged by pattern matching',
        confidence: 0.6,
        severity: 'medium',
        categories: ['unknown']
      };
    }
  }

  /**
   * Update alert with AI analysis
   */
  async updateAlertWithAIAnalysis(alertId, aiData) {
    try {
      const { error } = await supabase
        .from('real_time_alerts')
        .update({
          ai_reasoning: aiData.ai_reasoning,
          confidence: aiData.confidence,
          updated_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) {
        console.error('❌ Error updating alert with AI analysis:', error);
      }
    } catch (error) {
      console.error('❌ Error updating alert with AI analysis:', error);
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
   * Get recent alerts for a parent
   */
  async getRecentAlerts(parentId, limit = 10) {
    try {
      // Get linked children for this parent
      const { data: children, error: childrenError } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', parentId);

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
   * Get unread alert count for a parent
   */
  async getUnreadAlertCount(parentId) {
    try {
      // Get linked children for this parent
      const { data: children, error: childrenError } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', parentId);

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
   * Mark alert as read
   */
  async markAlertAsRead(alertId) {
    try {
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

      return true;
    } catch (error) {
      console.error('❌ Error marking alert as read:', error);
      return false;
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

      if (error) {
        console.error('❌ Error marking alert as acknowledged:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('❌ Error marking alert as acknowledged:', error);
      return false;
    }
  }

  /**
   * Create a test alert (for testing purposes)
   */
  async createTestAlert(childId, content, severity = 'medium') {
    try {
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

      console.log('✅ Test alert created:', data);
      return data;

    } catch (error) {
      console.error('❌ Error creating test alert:', error);
      return null;
    }
  }

  /**
   * Cleanup subscriptions
   */
  cleanup() {
    try {
      this.subscriptions.forEach((subscription, key) => {
        supabase.removeChannel(subscription);
        console.log(`🧹 Cleaned up subscription: ${key}`);
      });
      
      this.subscriptions.clear();
      this.alertCallbacks = [];
      this.isInitialized = false;
      
      console.log('🧹 Alert Integration Service cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const alertIntegrationService = new AlertIntegrationService();
export default alertIntegrationService;
