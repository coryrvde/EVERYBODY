import AIContentDetector from './aiContentDetector';
import DatabaseInitializer from './databaseInitializer';
import { supabase } from '../supabase';

class RealTimeMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertCallbacks = [];
    this.contentDetector = AIContentDetector;
  }

  /**
   * Start real-time monitoring
   */
  async startMonitoring(childId = 'default') {
    try {
      this.isMonitoring = true;
      this.childId = childId;
      
      console.log('Starting real-time monitoring for child:', childId);
      
      // Initialize database if needed
      await DatabaseInitializer.initializeDatabase();
      
      // Set up real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      // Start periodic monitoring
      this.monitoringInterval = setInterval(() => {
        this.performPeriodicCheck();
      }, 30000); // Check every 30 seconds
      
      return true;
    } catch (error) {
      console.error('Error starting monitoring:', error);
      return false;
    }
  }

  /**
   * Stop real-time monitoring
   */
  stopMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('Real-time monitoring stopped');
  }

  /**
   * Set up real-time subscriptions for new messages
   */
  async setupRealtimeSubscriptions() {
    try {
      // Subscribe to new messages from various apps
      const { data, error } = await supabase
        .channel('monitored_messages')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'monitored_messages' 
          }, 
          (payload) => {
            this.handleNewMessage(payload.new);
          }
        )
        .subscribe();

      if (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }
  }

  /**
   * Handle new message from real-time subscription
   */
  async handleNewMessage(message) {
    try {
      console.log('New message detected:', message);
      
      // Analyze the message content
      const analysis = await this.contentDetector.analyzeText(
        message.content, 
        {
          app: message.app_name,
          contact: message.contact,
          timestamp: message.timestamp
        }
      );

      if (analysis.flagged) {
        await this.handleFlaggedContent({
          type: 'text',
          app: message.app_name,
          contact: message.contact,
          data: message.content,
          severity: analysis.severity,
          flaggedPhrases: analysis.flaggedPhrases,
          confidence: analysis.confidence,
          childId: this.childId,
          originalMessage: message
        });
      }
    } catch (error) {
      console.error('Error handling new message:', error);
    }
  }

  /**
   * Perform periodic check for new content
   */
  async performPeriodicCheck() {
    try {
      if (!this.isMonitoring) return;

      // Check for new messages in the last 30 seconds
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      
      const { data: messages, error } = await supabase
        .from('monitored_messages')
        .select('*')
        .gte('timestamp', thirtySecondsAgo)
        .eq('child_id', this.childId);

      if (error) {
        console.error('Error fetching recent messages:', error);
        return;
      }

      // Analyze each new message
      for (const message of messages || []) {
        await this.handleNewMessage(message);
      }
    } catch (error) {
      console.error('Error in periodic check:', error);
    }
  }

  /**
   * Handle flagged content
   */
  async handleFlaggedContent(content) {
    try {
      console.log('Flagged content detected:', content);
      
      // Save to database
      await this.contentDetector.saveFlaggedContent(content);
      
      // Send real-time alert
      await this.sendRealTimeAlert(content);
      
      // Update conversation logs
      await this.updateConversationLogs(content);
      
    } catch (error) {
      console.error('Error handling flagged content:', error);
    }
  }

  /**
   * Send real-time alert to parents
   */
  async sendRealTimeAlert(content) {
    try {
      const alert = {
        id: Date.now(),
        type: 'content_flag',
        severity: content.severity,
        app: content.app,
        contact: content.contact,
        flaggedContent: this.generateAlertMessage(content),
        timestamp: new Date().toISOString(),
        childId: this.childId
      };

      // Store alert in database
      const { error } = await supabase
        .from('real_time_alerts')
        .insert([alert]);

      if (error) {
        console.error('Error saving alert:', error);
      }

      // Trigger callbacks
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      });

      // Send push notification (if configured)
      await this.sendPushNotification(alert);
      
    } catch (error) {
      console.error('Error sending real-time alert:', error);
    }
  }

  /**
   * Generate alert message based on content
   */
  generateAlertMessage(content) {
    const severityMessages = {
      high: 'High-risk content detected',
      medium: 'Concerning content detected',
      low: 'Potentially inappropriate content detected'
    };

    let message = severityMessages[content.severity] || 'Content flagged';
    
    if (content.flaggedPhrases && content.flaggedPhrases.length > 0) {
      message += `: ${content.flaggedPhrases.slice(0, 3).join(', ')}`;
    }

    return message;
  }

  /**
   * Update conversation logs with flagged content
   */
  async updateConversationLogs(content) {
    try {
      const logEntry = {
        app: content.app,
        contact: content.contact,
        severity: content.severity,
        flagged_content: content.flaggedPhrases.join(', '),
        confidence: content.confidence,
        timestamp: new Date().toISOString(),
        child_id: this.childId
      };

      const { error } = await supabase
        .from('conversation_logs')
        .insert([logEntry]);

      if (error) {
        console.error('Error updating conversation logs:', error);
      }
    } catch (error) {
      console.error('Error updating conversation logs:', error);
    }
  }

  /**
   * Send push notification
   */
  async sendPushNotification(alert) {
    try {
      // This would integrate with push notification services
      // like Firebase Cloud Messaging, OneSignal, etc.
      
      const notification = {
        title: 'Guardian AI Alert',
        body: `${alert.app}: ${alert.flaggedContent}`,
        data: {
          alertId: alert.id,
          severity: alert.severity,
          app: alert.app
        }
      };

      // Simulate push notification
      console.log('Push notification:', notification);
      
      // In real implementation, send to push service
      // await pushService.send(notification);
      
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  /**
   * Add alert callback
   */
  addAlertCallback(callback) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Remove alert callback
   */
  removeAlertCallback(callback) {
    const index = this.alertCallbacks.indexOf(callback);
    if (index > -1) {
      this.alertCallbacks.splice(index, 1);
    }
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus() {
    return {
      isMonitoring: this.isMonitoring,
      childId: this.childId,
      activeCallbacks: this.alertCallbacks.length
    };
  }

  /**
   * Analyze existing content
   */
  async analyzeExistingContent(content, context = {}) {
    try {
      const analysis = await this.contentDetector.analyzeText(content, context);
      
      if (analysis.flagged) {
        await this.handleFlaggedContent({
          type: 'text',
          app: context.app || 'Unknown',
          contact: context.contact || 'Unknown',
          data: content,
          severity: analysis.severity,
          flaggedPhrases: analysis.flaggedPhrases,
          confidence: analysis.confidence,
          childId: this.childId
        });
      }
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing existing content:', error);
      return { flagged: false, error: error.message };
    }
  }
}

export default new RealTimeMonitor();
