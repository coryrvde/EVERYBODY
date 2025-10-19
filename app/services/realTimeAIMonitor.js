import { supabase } from '../supabase';
import { smartAIAnalyzer } from './smartAIAnalyzer';

class RealTimeAIMonitor {
  constructor() {
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.monitoredChildren = new Set();
  }

  /**
   * Start monitoring for a specific child
   */
  async startMonitoring(childId, parentId) {
    try {
      console.log(`Starting AI monitoring for child: ${childId}`);
      
      // Add to monitored children set
      this.monitoredChildren.add(childId);
      
      // Get monitoring settings
      const settings = await this.getMonitoringSettings(parentId);
      
      if (!settings.ai_enabled) {
        console.log('AI monitoring is disabled for this parent');
        return;
      }

      // Start periodic monitoring if not already running
      if (!this.isMonitoring) {
        this.startPeriodicMonitoring();
      }

      // Set up real-time subscriptions
      await this.setupRealtimeSubscriptions(childId, parentId);

    } catch (error) {
      console.error('Error starting AI monitoring:', error);
    }
  }

  /**
   * Stop monitoring for a specific child
   */
  async stopMonitoring(childId) {
    try {
      console.log(`Stopping AI monitoring for child: ${childId}`);
      
      // Remove from monitored children set
      this.monitoredChildren.delete(childId);
      
      // If no children being monitored, stop periodic monitoring
      if (this.monitoredChildren.size === 0) {
        this.stopPeriodicMonitoring();
      }

    } catch (error) {
      console.error('Error stopping AI monitoring:', error);
    }
  }

  /**
   * Start periodic monitoring of messages
   */
  startPeriodicMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('Starting periodic AI monitoring...');

    // Check for new messages every 30 seconds
    this.monitoringInterval = setInterval(async () => {
      await this.checkForNewMessages();
    }, 30000);

    // Initial check
    this.checkForNewMessages();
  }

  /**
   * Stop periodic monitoring
   */
  stopPeriodicMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    console.log('Stopping periodic AI monitoring...');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  /**
   * Check for new messages and analyze them
   */
  async checkForNewMessages() {
    try {
      if (this.monitoredChildren.size === 0) return;

      // Get messages from the last 30 seconds
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();

      // Check monitored messages (from various apps)
      const { data: messages, error } = await supabase
        .from('monitored_messages')
        .select('*')
        .gte('created_at', thirtySecondsAgo)
        .in('child_id', Array.from(this.monitoredChildren));

      if (error) {
        console.error('Error fetching monitored messages:', error);
        return;
      }

      // Check telegram messages
      const { data: telegramMessages, error: telegramError } = await supabase
        .from('telegram_messages')
        .select('*')
        .gte('created_at', thirtySecondsAgo)
        .in('child_id', Array.from(this.monitoredChildren));

      if (telegramError) {
        console.error('Error fetching telegram messages:', telegramError);
      }

      // Process all messages
      const allMessages = [...(messages || []), ...(telegramMessages || [])];
      
      for (const message of allMessages) {
        await this.analyzeMessage(message);
      }

    } catch (error) {
      console.error('Error in checkForNewMessages:', error);
    }
  }

  /**
   * Analyze a single message using AI
   */
  async analyzeMessage(message) {
    try {
      // Get parent ID for this child
      const parentId = await this.getParentId(message.child_id);
      if (!parentId) {
        console.log('No parent found for child:', message.child_id);
        return;
      }

      // Get monitoring settings
      const settings = await this.getMonitoringSettings(parentId);
      
      // Analyze content with custom filters first
      const analysis = await smartAIAnalyzer.analyzeWithCustomFilters(
        message.content,
        parentId
      );

      // Check if analysis meets threshold
      if (analysis.flagged && this.meetsThreshold(analysis, settings)) {
        // Store analysis result
        await smartAIAnalyzer.storeAnalysisResult(
          message.child_id,
          message.content,
          analysis,
          message.app_name || 'Unknown',
          message.contact || 'Unknown'
        );

        console.log(`AI flagged content for child ${message.child_id}:`, analysis);
      }

    } catch (error) {
      console.error('Error analyzing message:', error);
    }
  }

  /**
   * Check if analysis meets severity threshold
   */
  meetsThreshold(analysis, settings) {
    const threshold = settings.severity_thresholds[analysis.severity] || 0.5;
    return analysis.confidence >= threshold;
  }

  /**
   * Get parent ID for a child
   */
  async getParentId(childId) {
    try {
      const { data, error } = await supabase
        .from('family_links')
        .select('parent_id')
        .eq('child_id', childId)
        .single();

      if (error) throw error;
      return data?.parent_id;
    } catch (error) {
      console.error('Error getting parent ID:', error);
      return null;
    }
  }

  /**
   * Get monitoring settings for a parent
   */
  async getMonitoringSettings(parentId) {
    try {
      const { data, error } = await supabase
        .from('smart_monitoring_settings')
        .select('*')
        .eq('parent_id', parentId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      // Return default settings if none found
      return data || {
        ai_enabled: true,
        custom_filters_enabled: true,
        context_analysis_enabled: true,
        confidence_threshold: 0.7,
        severity_thresholds: {
          low: 0.3,
          medium: 0.5,
          high: 0.7,
          critical: 0.9
        },
        monitored_apps: ['WhatsApp', 'Telegram', 'Instagram', 'Snapchat', 'TikTok', 'Discord', 'Messenger'],
        alert_preferences: {
          immediate_alerts: true,
          daily_summary: true,
          weekly_report: true,
          email_notifications: true,
          push_notifications: true
        }
      };
    } catch (error) {
      console.error('Error getting monitoring settings:', error);
      return {
        ai_enabled: true,
        custom_filters_enabled: true,
        context_analysis_enabled: true,
        confidence_threshold: 0.7,
        severity_thresholds: {
          low: 0.3,
          medium: 0.5,
          high: 0.7,
          critical: 0.9
        },
        monitored_apps: ['WhatsApp', 'Telegram', 'Instagram', 'Snapchat', 'TikTok', 'Discord', 'Messenger'],
        alert_preferences: {
          immediate_alerts: true,
          daily_summary: true,
          weekly_report: true,
          email_notifications: true,
          push_notifications: true
        }
      };
    }
  }

  /**
   * Set up real-time subscriptions for immediate message monitoring
   */
  async setupRealtimeSubscriptions(childId, parentId) {
    try {
      // Subscribe to monitored_messages
      const messagesChannel = supabase
        .channel(`monitored_messages_${childId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'monitored_messages',
          filter: `child_id=eq.${childId}`
        }, async (payload) => {
          console.log('New monitored message detected:', payload.new);
          await this.analyzeMessage(payload.new);
        })
        .subscribe();

      // Subscribe to telegram_messages
      const telegramChannel = supabase
        .channel(`telegram_messages_${childId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'telegram_messages',
          filter: `child_id=eq.${childId}`
        }, async (payload) => {
          console.log('New telegram message detected:', payload.new);
          await this.analyzeMessage(payload.new);
        })
        .subscribe();

      console.log(`Real-time subscriptions set up for child: ${childId}`);

    } catch (error) {
      console.error('Error setting up real-time subscriptions:', error);
    }
  }

  /**
   * Get AI analysis statistics for a parent
   */
  async getAIStats(parentId) {
    try {
      // Get children for this parent
      const { data: children, error: childrenError } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', parentId);

      if (childrenError) throw childrenError;

      const childIds = children.map(c => c.child_id);

      if (childIds.length === 0) {
        return {
          totalAnalyzed: 0,
          flaggedContent: 0,
          severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
          categoryBreakdown: {}
        };
      }

      // Get analysis stats
      const { data: stats, error: statsError } = await supabase
        .from('ai_analysis_results')
        .select('flagged, severity, category')
        .in('child_id', childIds)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()); // Last 7 days

      if (statsError) throw statsError;

      const totalAnalyzed = stats.length;
      const flaggedContent = stats.filter(s => s.flagged).length;
      
      const severityBreakdown = {
        low: stats.filter(s => s.severity === 'low').length,
        medium: stats.filter(s => s.severity === 'medium').length,
        high: stats.filter(s => s.severity === 'high').length,
        critical: stats.filter(s => s.severity === 'critical').length
      };

      const categoryBreakdown = {};
      stats.forEach(s => {
        if (s.category) {
          categoryBreakdown[s.category] = (categoryBreakdown[s.category] || 0) + 1;
        }
      });

      return {
        totalAnalyzed,
        flaggedContent,
        severityBreakdown,
        categoryBreakdown
      };

    } catch (error) {
      console.error('Error getting AI stats:', error);
      return {
        totalAnalyzed: 0,
        flaggedContent: 0,
        severityBreakdown: { low: 0, medium: 0, high: 0, critical: 0 },
        categoryBreakdown: {}
      };
    }
  }
}

export const realTimeAIMonitor = new RealTimeAIMonitor();
