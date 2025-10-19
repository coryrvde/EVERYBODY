import { supabase, initializeDatabase } from '../supabase';

class TelegramMonitor {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.alertCallbacks = [];
    this.childId = 'olivia'; // Default child ID
  }

  /**
   * Start comprehensive Telegram monitoring
   */
  async startTelegramMonitoring(childId = 'olivia') {
    try {
      this.childId = childId;
      this.isMonitoring = true;
      
      console.log('🔍 Starting comprehensive Telegram monitoring for:', childId);
      
      // Initialize database
      await initializeDatabase();
      
      // Set up real-time subscriptions
      await this.setupRealtimeSubscriptions();
      
      // Start periodic monitoring
      this.monitoringInterval = setInterval(() => {
        this.performPeriodicTelegramCheck();
      }, 30000); // Check every 30 seconds
      
      return true;
    } catch (error) {
      console.error('❌ Error starting Telegram monitoring:', error);
      return false;
    }
  }

  /**
   * Stop Telegram monitoring
   */
  stopTelegramMonitoring() {
    this.isMonitoring = false;
    
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    console.log('🛑 Telegram monitoring stopped');
  }

  /**
   * Initialize database with sample data
   */
  async initializeDatabase() {
    try {
      // Check if child profile exists
      const { data: profile, error: profileError } = await supabase
        .from('child_profiles')
        .select('*')
        .eq('child_id', this.childId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        console.log('📊 Creating child profile and sample data...');
        await this.createSampleData();
      }
    } catch (error) {
      console.error('❌ Error initializing database:', error);
    }
  }

  /**
   * Create sample Telegram data for testing
   */
  async createSampleData() {
    try {
      // Create child profile
      const { error: profileError } = await supabase
        .from('child_profiles')
        .insert({
          child_id: this.childId,
          name: 'Olivia Johnson',
          age: 15,
          grade: '10th Grade',
          school: 'Lincoln High School',
          telegram_username: '@olivia_j',
          parent_email: 'parent@example.com'
        });

      if (profileError) {
        console.error('Error creating child profile:', profileError);
      }

      // Create monitoring settings
      const { error: settingsError } = await supabase
        .from('monitoring_settings')
        .insert({
          child_id: this.childId,
          telegram_monitoring_enabled: true,
          text_analysis_enabled: true,
          image_analysis_enabled: true,
          voice_analysis_enabled: true,
          link_analysis_enabled: true,
          real_time_alerts: true
        });

      if (settingsError) {
        console.error('Error creating monitoring settings:', settingsError);
      }

      console.log('✅ Sample Telegram data created');
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
    }
  }

  /**
   * Set up real-time subscriptions for Telegram data
   */
  async setupRealtimeSubscriptions() {
    try {
      // Subscribe to new Telegram messages
      const { data, error } = await supabase
        .channel('telegram_messages')
        .on('postgres_changes', 
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'telegram_messages',
            filter: `child_id=eq.${this.childId}`
          }, 
          (payload) => {
            this.handleNewTelegramMessage(payload.new);
          }
        )
        .subscribe();

      if (error) {
        console.error('Error setting up Telegram subscription:', error);
      }
    } catch (error) {
      console.error('Error setting up subscriptions:', error);
    }
  }

  /**
   * Handle new Telegram message
   */
  async handleNewTelegramMessage(message) {
    try {
      console.log('📨 New Telegram message detected:', message);
      
      // Analyze the message content
      const analysis = await this.analyzeTelegramMessage(message);
      
      if (analysis.flagged) {
        await this.handleFlaggedTelegramContent({
          message: message,
          analysis: analysis
        });
      }
    } catch (error) {
      console.error('Error handling Telegram message:', error);
    }
  }

  /**
   * Analyze Telegram message content
   */
  async analyzeTelegramMessage(message) {
    try {
      const analysis = {
        flagged: false,
        severity: 'low',
        confidence: 0.0,
        flaggedPhrases: [],
        flaggedCategories: [],
        contextualPatterns: [],
        riskFactors: []
      };

      if (!message.message_text) {
        return analysis;
      }

      const text = message.message_text.toLowerCase();

      // Drug slang detection patterns
      const drugPatterns = [
        { pattern: /greens?|green stuff|bud|buds|herb|grass|pot|mary jane/i, category: 'drugs', severity: 'medium' },
        { pattern: /smoke|smoking|hit|hits|joint|joints|blunt|blunts/i, category: 'drugs', severity: 'medium' },
        { pattern: /bowl|bowls|bong|bongs|pipe|pipes|vape|vaping/i, category: 'drugs', severity: 'medium' },
        { pattern: /high|stoned|baked|blazed|fried/i, category: 'drugs', severity: 'medium' },
        { pattern: /edibles|gummies|cookies|brownies|thc|cbd/i, category: 'drugs', severity: 'medium' }
      ];

      // Check drug patterns
      for (const pattern of drugPatterns) {
        if (pattern.pattern.test(text)) {
          analysis.flagged = true;
          analysis.severity = pattern.severity;
          analysis.flaggedCategories.push(pattern.category);
          analysis.confidence = Math.max(analysis.confidence, 0.7);
          
          // Extract matched phrases
          const matches = text.match(pattern.pattern);
          if (matches) {
            analysis.flaggedPhrases.push(...matches);
          }
        }
      }

      // Contextual patterns
      const contextualPatterns = [
        { pattern: /(greens?|bud|buds|herb|grass|pot).*(smoke|smoking|hit|hits)/i, reason: 'marijuana smoking context' },
        { pattern: /(smoke|smoking|hit|hits).*(greens?|bud|buds|herb|grass|pot)/i, reason: 'marijuana smoking context' },
        { pattern: /(meet|meeting|come over|hang out).*(smoke|smoking|greens?|bud|buds)/i, reason: 'marijuana meeting context' },
        { pattern: /(tonight|late|midnight).*(greens?|bud|buds|smoke|smoking)/i, reason: 'late night drug activity context' },
        { pattern: /(send|show).*(photo|picture|image)/i, reason: 'photo request' },
        { pattern: /(alone|private).*(meet|meeting)/i, reason: 'meeting alone context' }
      ];

      for (const pattern of contextualPatterns) {
        if (pattern.pattern.test(text)) {
          analysis.flagged = true;
          analysis.contextualPatterns.push(pattern.reason);
          analysis.confidence = Math.max(analysis.confidence, 0.8);
        }
      }

      // Risk factors
      if (analysis.flagged) {
        if (analysis.flaggedCategories.includes('drugs')) {
          analysis.riskFactors.push('drug_use');
        }
        if (analysis.contextualPatterns.some(p => p.includes('meeting'))) {
          analysis.riskFactors.push('meeting_context');
        }
        if (analysis.contextualPatterns.some(p => p.includes('photo'))) {
          analysis.riskFactors.push('photo_request');
        }
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing Telegram message:', error);
      return { flagged: false, severity: 'low', confidence: 0.0, flaggedPhrases: [], flaggedCategories: [], contextualPatterns: [], riskFactors: [] };
    }
  }

  /**
   * Handle flagged Telegram content
   */
  async handleFlaggedTelegramContent(data) {
    try {
      const { message, analysis } = data;
      
      console.log('🚨 Flagged Telegram content detected:', analysis);
      
      // Save AI analysis result
      await this.saveAIAnalysisResult(message, analysis);
      
      // Save flagged content
      await this.saveFlaggedContent(message, analysis);
      
      // Create real-time alert
      await this.createRealTimeAlert(message, analysis);
      
      // Update conversation log
      await this.updateConversationLog(message, analysis);
      
    } catch (error) {
      console.error('Error handling flagged Telegram content:', error);
    }
  }

  /**
   * Save AI analysis result to database
   */
  async saveAIAnalysisResult(message, analysis) {
    try {
      const contentHash = this.generateContentHash(message.message_text);
      
      const { error } = await supabase
        .from('ai_analysis_results')
        .insert({
          child_id: this.childId,
          message_id: message.message_id,
          analysis_type: 'text',
          content_hash: contentHash,
          analysis_data: analysis,
          severity: analysis.severity,
          confidence: analysis.confidence,
          flagged_phrases: analysis.flaggedPhrases,
          flagged_categories: analysis.flaggedCategories,
          contextual_patterns: analysis.contextualPatterns,
          risk_factors: analysis.riskFactors
        });

      if (error) {
        console.error('Error saving AI analysis result:', error);
      }
    } catch (error) {
      console.error('Error saving AI analysis result:', error);
    }
  }

  /**
   * Save flagged content to database
   */
  async saveFlaggedContent(message, analysis) {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .insert({
          child_id: this.childId,
          message_id: message.message_id,
          chat_id: message.chat_id,
          chat_type: message.chat_type,
          content_type: 'text',
          content_data: message.message_text,
          severity: analysis.severity,
          flagged_phrases: analysis.flaggedPhrases,
          flagged_categories: analysis.flaggedCategories,
          confidence: analysis.confidence,
          analysis_reasons: analysis.contextualPatterns,
          contextual_indicators: analysis.riskFactors
        });

      if (error) {
        console.error('Error saving flagged content:', error);
      }
    } catch (error) {
      console.error('Error saving flagged content:', error);
    }
  }

  /**
   * Create real-time alert
   */
  async createRealTimeAlert(message, analysis) {
    try {
      const alert = {
        child_id: this.childId,
        alert_type: 'content_flag',
        severity: analysis.severity,
        message_id: message.message_id,
        chat_id: message.chat_id,
        chat_type: message.chat_type,
        contact_id: message.sender_id,
        contact_name: message.sender_name || message.sender_username,
        alert_title: this.generateAlertTitle(analysis),
        alert_message: this.generateAlertMessage(message, analysis),
        flagged_content: message.message_text,
        confidence: analysis.confidence,
        risk_factors: analysis.riskFactors
      };

      const { error } = await supabase
        .from('real_time_alerts')
        .insert([alert]);

      if (error) {
        console.error('Error creating real-time alert:', error);
      }

      // Trigger callbacks
      this.alertCallbacks.forEach(callback => {
        try {
          callback(alert);
        } catch (error) {
          console.error('Error in alert callback:', error);
        }
      });

    } catch (error) {
      console.error('Error creating real-time alert:', error);
    }
  }

  /**
   * Update conversation log
   */
  async updateConversationLog(message, analysis) {
    try {
      const { data: existingLog, error: fetchError } = await supabase
        .from('conversation_logs')
        .select('*')
        .eq('child_id', this.childId)
        .eq('chat_id', message.chat_id)
        .single();

      if (fetchError && fetchError.code === 'PGRST116') {
        // Create new conversation log
        const { error: insertError } = await supabase
          .from('conversation_logs')
          .insert({
            child_id: this.childId,
            chat_id: message.chat_id,
            chat_type: message.chat_type,
            contact_name: message.sender_name || message.sender_username,
            contact_id: message.sender_id,
            conversation_summary: `Conversation with ${message.sender_name || message.sender_username}`,
            message_count: 1,
            flagged_message_count: analysis.flagged ? 1 : 0,
            highest_severity: analysis.flagged ? analysis.severity : 'safe',
            last_message_date: message.message_date,
            last_flagged_date: analysis.flagged ? message.message_date : null,
            risk_score: analysis.flagged ? analysis.confidence : 0.1,
            is_active: true
          });

        if (insertError) {
          console.error('Error creating conversation log:', insertError);
        }
      } else if (!fetchError) {
        // Update existing conversation log
        const updates = {
          message_count: existingLog.message_count + 1,
          last_message_date: message.message_date,
          risk_score: Math.max(existingLog.risk_score, analysis.confidence)
        };

        if (analysis.flagged) {
          updates.flagged_message_count = existingLog.flagged_message_count + 1;
          updates.last_flagged_date = message.message_date;
          
          if (this.getSeverityLevel(analysis.severity) > this.getSeverityLevel(existingLog.highest_severity)) {
            updates.highest_severity = analysis.severity;
          }
        }

        const { error: updateError } = await supabase
          .from('conversation_logs')
          .update(updates)
          .eq('id', existingLog.id);

        if (updateError) {
          console.error('Error updating conversation log:', updateError);
        }
      }
    } catch (error) {
      console.error('Error updating conversation log:', error);
    }
  }

  /**
   * Perform periodic Telegram check
   */
  async performPeriodicTelegramCheck() {
    try {
      if (!this.isMonitoring) return;

      // Check for new messages in the last 30 seconds
      const thirtySecondsAgo = new Date(Date.now() - 30000).toISOString();
      
      const { data: messages, error } = await supabase
        .from('telegram_messages')
        .select('*')
        .eq('child_id', this.childId)
        .gte('message_date', thirtySecondsAgo);

      if (error) {
        console.error('Error fetching recent Telegram messages:', error);
        return;
      }

      // Analyze each new message
      for (const message of messages || []) {
        await this.handleNewTelegramMessage(message);
      }
    } catch (error) {
      console.error('Error in periodic Telegram check:', error);
    }
  }

  /**
   * Generate alert title based on analysis
   */
  generateAlertTitle(analysis) {
    if (analysis.flaggedCategories.includes('drugs')) {
      return 'Drug Content Detected';
    } else if (analysis.contextualPatterns.some(p => p.includes('photo'))) {
      return 'Inappropriate Photo Request';
    } else if (analysis.contextualPatterns.some(p => p.includes('meeting'))) {
      return 'Suspicious Meeting Request';
    } else {
      return 'Content Flagged';
    }
  }

  /**
   * Generate alert message
   */
  generateAlertMessage(message, analysis) {
    const contactName = message.sender_name || message.sender_username || 'Unknown Contact';
    const chatType = message.chat_type === 'private' ? 'private message' : `${message.chat_type} chat`;
    
    let messageText = `Content flagged in ${chatType} with ${contactName}`;
    
    if (analysis.flaggedCategories.includes('drugs')) {
      messageText += '. Drug-related language detected.';
    } else if (analysis.contextualPatterns.some(p => p.includes('photo'))) {
      messageText += '. Inappropriate photo request detected.';
    } else if (analysis.contextualPatterns.some(p => p.includes('meeting'))) {
      messageText += '. Suspicious meeting context detected.';
    }
    
    return messageText;
  }

  /**
   * Generate content hash for deduplication
   */
  generateContentHash(content) {
    // Simple hash function for content deduplication
    let hash = 0;
    if (content.length === 0) return hash.toString();
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString();
  }

  /**
   * Get severity level as number for comparison
   */
  getSeverityLevel(severity) {
    const levels = { 'low': 1, 'medium': 2, 'high': 3 };
    return levels[severity] || 0;
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
   * Get Telegram conversation summary
   */
  async getConversationSummary(chatId) {
    try {
      const { data, error } = await supabase
        .from('conversation_logs')
        .select('*')
        .eq('child_id', this.childId)
        .eq('chat_id', chatId)
        .single();

      if (error) {
        console.error('Error fetching conversation summary:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching conversation summary:', error);
      return null;
    }
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('real_time_alerts')
        .select('*')
        .eq('child_id', this.childId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent alerts:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recent alerts:', error);
      return [];
    }
  }
}

export default new TelegramMonitor();
