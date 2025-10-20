import { supabase } from '../supabase';
import { smartAIAnalyzer } from './smartAIAnalyzer';
import { notificationService } from './notificationService';

class TelegramBotService {
  constructor() {
    this.botToken = null;
    this.webhookUrl = null;
    this.isMonitoring = false;
    this.monitoredChats = new Map();
    this.parentId = null;
    this.childId = null;
    this.baseUrl = 'https://api.telegram.org/bot';
  }

  /**
   * Initialize Telegram Bot for monitoring
   */
  async initializeBot(parentId, childId, botToken) {
    try {
      console.log('🤖 Initializing Telegram Bot for monitoring...');
      
      this.parentId = parentId;
      this.childId = childId;
      this.botToken = botToken;
      
      // Set up webhook for real-time message monitoring
      await this.setupWebhook();
      
      // Get bot info
      const botInfo = await this.getBotInfo();
      console.log('✅ Bot initialized:', botInfo);
      
      // Store bot configuration
      await this.storeBotConfig(botToken);
      
      this.isMonitoring = true;
      return true;
      
    } catch (error) {
      console.error('❌ Error initializing Telegram Bot:', error);
      return false;
    }
  }

  /**
   * Set up webhook for real-time message monitoring
   */
  async setupWebhook() {
    try {
      // For development, we'll use polling instead of webhook
      // In production, you would set up a webhook URL
      console.log('🔗 Setting up Telegram Bot webhook...');
      
      // Start polling for updates
      this.startPolling();
      
    } catch (error) {
      console.error('❌ Error setting up webhook:', error);
    }
  }

  /**
   * Start polling for new messages
   */
  startPolling() {
    if (this.isMonitoring) return;
    
    console.log('👁️ Starting Telegram Bot message polling...');
    this.isMonitoring = true;
    
    // Poll for updates every 2 seconds
    this.pollInterval = setInterval(async () => {
      await this.getUpdates();
    }, 2000);
  }

  /**
   * Stop polling
   */
  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
      this.isMonitoring = false;
      console.log('🛑 Stopped Telegram Bot polling');
    }
  }

  /**
   * Get updates from Telegram Bot
   */
  async getUpdates() {
    try {
      if (!this.botToken) return;
      
      const response = await fetch(`${this.baseUrl}${this.botToken}/getUpdates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.ok && data.result.length > 0) {
        for (const update of data.result) {
          await this.handleUpdate(update);
        }
      }
      
    } catch (error) {
      console.error('❌ Error getting updates:', error);
    }
  }

  /**
   * Handle incoming updates
   */
  async handleUpdate(update) {
    try {
      if (update.message) {
        await this.handleMessage(update.message);
      } else if (update.channel_post) {
        await this.handleChannelPost(update.channel_post);
      }
    } catch (error) {
      console.error('❌ Error handling update:', error);
    }
  }

  /**
   * Handle incoming messages
   */
  async handleMessage(message) {
    try {
      console.log('📨 New Telegram message received:', {
        chatId: message.chat.id,
        messageId: message.message_id,
        text: message.text,
        from: message.from
      });
      
      // Store message in database
      const messageData = await this.storeMessage(message);
      
      // Analyze message with AI if it has text content
      if (message.text && message.text.length > 0) {
        await this.analyzeMessage(messageData);
      }
      
      // Add chat to monitored chats if not already there
      await this.addMonitoredChat(message.chat);
      
    } catch (error) {
      console.error('❌ Error handling message:', error);
    }
  }

  /**
   * Handle channel posts
   */
  async handleChannelPost(channelPost) {
    try {
      console.log('📢 New Telegram channel post received:', {
        chatId: channelPost.chat.id,
        messageId: channelPost.message_id,
        text: channelPost.text
      });
      
      // Store channel post in database
      const messageData = await this.storeChannelPost(channelPost);
      
      // Analyze content with AI
      if (channelPost.text && channelPost.text.length > 0) {
        await this.analyzeMessage(messageData);
      }
      
    } catch (error) {
      console.error('❌ Error handling channel post:', error);
    }
  }

  /**
   * Store message in database
   */
  async storeMessage(message) {
    try {
      const messageData = {
        child_id: this.childId,
        parent_id: this.parentId,
        chat_id: message.chat.id.toString(),
        message_id: message.message_id.toString(),
        message_text: message.text || '',
        message_type: 'text',
        sender_name: `${message.from.first_name} ${message.from.last_name || ''}`.trim(),
        sender_id: message.from.id.toString(),
        chat_type: message.chat.type,
        chat_title: message.chat.title || message.chat.first_name,
        flagged: false,
        timestamp: new Date(message.date * 1000).toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('telegram_messages')
        .upsert(messageData, { 
          onConflict: 'child_id,chat_id,message_id' 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('❌ Error storing message:', error);
      return null;
    }
  }

  /**
   * Store channel post in database
   */
  async storeChannelPost(channelPost) {
    try {
      const messageData = {
        child_id: this.childId,
        parent_id: this.parentId,
        chat_id: channelPost.chat.id.toString(),
        message_id: channelPost.message_id.toString(),
        message_text: channelPost.text || '',
        message_type: 'text',
        sender_name: 'Channel',
        sender_id: channelPost.chat.id.toString(),
        chat_type: 'channel',
        chat_title: channelPost.chat.title,
        flagged: false,
        timestamp: new Date(channelPost.date * 1000).toISOString(),
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('telegram_messages')
        .upsert(messageData, { 
          onConflict: 'child_id,chat_id,message_id' 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
      
    } catch (error) {
      console.error('❌ Error storing channel post:', error);
      return null;
    }
  }

  /**
   * Analyze message with AI
   */
  async analyzeMessage(messageData) {
    try {
      console.log('🧠 Analyzing Telegram message with AI...');
      
      // Get parent's custom filters
      const customFilters = await this.getCustomFilters();
      
      // Analyze with AI
      const analysis = await smartAIAnalyzer.analyzeWithCustomFilters(
        messageData.message_text,
        this.parentId,
        customFilters
      );
      
      console.log('🤖 AI Analysis result:', analysis);
      
      // If flagged, create alert
      if (analysis.flagged && analysis.confidence > 0.7) {
        await this.createAlert(messageData, analysis);
      }
      
      // Update message with analysis
      await this.updateMessageAnalysis(messageData.id, analysis);
      
    } catch (error) {
      console.error('❌ Error analyzing message:', error);
    }
  }

  /**
   * Create alert for flagged content
   */
  async createAlert(messageData, analysis) {
    try {
      console.log('🚨 Creating alert for flagged Telegram content');
      
      // Create real-time alert
      const alertData = {
        parent_id: this.parentId,
        child_id: this.childId,
        alert_type: 'ai_flagged_content',
        severity: analysis.severity,
        flagged_content: messageData.message_text,
        app_name: 'Telegram',
        contact: messageData.sender_name || 'Unknown',
        confidence: analysis.confidence,
        ai_reasoning: analysis.reasoning,
        is_acknowledged: false
      };
      
      const { data: alert, error } = await supabase
        .from('real_time_alerts')
        .insert(alertData)
        .select()
        .single();
      
      if (error) throw error;
      
      // Create recent alert for home page
      const recentAlertData = {
        guardian_id: this.parentId,
        child_id: this.childId,
        alert_type: 'ai_flagged_content',
        severity: analysis.severity,
        title: 'AI Flagged Content - Telegram',
        message: `Inappropriate content detected in Telegram message from ${messageData.sender_name}`,
        app_name: 'Telegram',
        flagged_content: messageData.message_text,
        confidence: analysis.confidence,
        ai_reasoning: analysis.reasoning,
        is_acknowledged: false
      };
      
      const { data: recentAlert, error: recentError } = await supabase
        .from('recent_alerts')
        .insert(recentAlertData)
        .select()
        .single();
      
      if (recentError) {
        console.error('Error creating recent alert:', recentError);
      }
      
      // Send notification to parent via Telegram Bot
      await this.sendParentNotification(alert);
      
      console.log('✅ Alert created successfully');
      
    } catch (error) {
      console.error('❌ Error creating alert:', error);
    }
  }

  /**
   * Send notification to parent via Telegram Bot
   */
  async sendParentNotification(alert) {
    try {
      // Get parent's Telegram chat ID from database
      const { data: parentChat, error } = await supabase
        .from('parent_telegram_chats')
        .select('chat_id')
        .eq('parent_id', this.parentId)
        .single();
      
      if (error || !parentChat) {
        console.log('Parent Telegram chat ID not found, skipping notification');
        return;
      }
      
      const message = `🚨 *ALERT: Flagged Content Detected*\n\n` +
        `📱 *App:* ${alert.app_name}\n` +
        `👤 *Contact:* ${alert.contact}\n` +
        `⚠️ *Severity:* ${alert.severity.toUpperCase()}\n` +
        `🎯 *Confidence:* ${Math.round(alert.confidence * 100)}%\n\n` +
        `📝 *Content:* ${alert.flagged_content}\n\n` +
        `🤖 *AI Analysis:* ${alert.ai_reasoning}\n\n` +
        `⏰ *Time:* ${new Date(alert.created_at).toLocaleString()}`;
      
      await this.sendMessage(parentChat.chat_id, message, 'Markdown');
      
    } catch (error) {
      console.error('❌ Error sending parent notification:', error);
    }
  }

  /**
   * Send message via Telegram Bot
   */
  async sendMessage(chatId, text, parseMode = 'HTML') {
    try {
      const response = await fetch(`${this.baseUrl}${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: parseMode
        })
      });
      
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description);
      }
      
      return data.result;
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  }

  /**
   * Get custom filters for parent
   */
  async getCustomFilters() {
    try {
      const { data, error } = await supabase
        .from('custom_filters')
        .select('*')
        .eq('parent_id', this.parentId)
        .eq('is_active', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting custom filters:', error);
      return [];
    }
  }

  /**
   * Update message with analysis results
   */
  async updateMessageAnalysis(messageId, analysis) {
    try {
      const { error } = await supabase
        .from('telegram_messages')
        .update({
          flagged: analysis.flagged,
          severity: analysis.severity,
          confidence: analysis.confidence,
          flagged_phrases: analysis.keywords_detected || [],
          flagged_categories: [analysis.category].filter(Boolean),
          analysis_result: {
            reasoning: analysis.reasoning,
            suggested_action: analysis.suggested_action,
            confidence: analysis.confidence
          }
        })
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (error) {
      console.error('❌ Error updating message analysis:', error);
    }
  }

  /**
   * Add monitored chat
   */
  async addMonitoredChat(chat) {
    try {
      const chatData = {
        child_id: this.childId,
        parent_id: this.parentId,
        chat_id: chat.id.toString(),
        title: chat.title || chat.first_name || 'Unknown Chat',
        type: chat.type,
        is_monitored: true,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('telegram_chats')
        .upsert(chatData, { onConflict: 'child_id,chat_id' });
      
      if (error) throw error;
      
    } catch (error) {
      console.error('❌ Error adding monitored chat:', error);
    }
  }

  /**
   * Store bot configuration
   */
  async storeBotConfig(botToken) {
    try {
      const { error } = await supabase
        .from('telegram_bot_configs')
        .upsert({
          parent_id: this.parentId,
          child_id: this.childId,
          bot_token: botToken,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'parent_id,child_id' });
      
      if (error) throw error;
    } catch (error) {
      console.error('❌ Error storing bot config:', error);
    }
  }

  /**
   * Get bot information
   */
  async getBotInfo() {
    try {
      const response = await fetch(`${this.baseUrl}${this.botToken}/getMe`);
      const data = await response.json();
      
      if (!data.ok) {
        throw new Error(data.description);
      }
      
      return data.result;
    } catch (error) {
      console.error('❌ Error getting bot info:', error);
      return null;
    }
  }

  /**
   * Get monitored chats
   */
  async getMonitoredChats() {
    try {
      const { data, error } = await supabase
        .from('telegram_chats')
        .select('*')
        .eq('child_id', this.childId)
        .eq('is_monitored', true);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('❌ Error getting monitored chats:', error);
      return [];
    }
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    try {
      this.stopPolling();
      
      // Update bot config as inactive
      const { error } = await supabase
        .from('telegram_bot_configs')
        .update({ is_active: false })
        .eq('parent_id', this.parentId)
        .eq('child_id', this.childId);
      
      if (error) throw error;
      
      console.log('🛑 Telegram Bot monitoring stopped');
      
    } catch (error) {
      console.error('❌ Error stopping monitoring:', error);
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      botToken: this.botToken ? '***' + this.botToken.slice(-4) : null,
      monitoredChats: this.monitoredChats.size,
      parentId: this.parentId,
      childId: this.childId
    };
  }
}

export const telegramBotService = new TelegramBotService();