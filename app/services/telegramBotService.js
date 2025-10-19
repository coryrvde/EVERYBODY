import { supabase } from '../supabase';

class TelegramBotService {
  constructor() {
    this.botToken = process.env.EXPO_PUBLIC_TELEGRAM_BOT_TOKEN;
    this.webhookUrl = process.env.EXPO_PUBLIC_WEBHOOK_URL;
    this.isInitialized = false;
  }

  /**
   * Initialize Telegram Bot API
   */
  async initialize() {
    try {
      if (!this.botToken) {
        console.error('❌ Telegram Bot Token not found');
        return false;
      }

      console.log('🤖 Initializing Telegram Bot Service...');
      
      // Set up webhook for real-time updates
      await this.setupWebhook();
      
      this.isInitialized = true;
      console.log('✅ Telegram Bot Service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('❌ Error initializing Telegram Bot Service:', error);
      return false;
    }
  }

  /**
   * Set up webhook for receiving updates
   */
  async setupWebhook() {
    try {
      const webhookUrl = `${this.webhookUrl}/telegram-webhook`;
      
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/setWebhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'edited_message']
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Telegram webhook set up successfully');
      } else {
        console.error('❌ Failed to set up webhook:', result.description);
      }
    } catch (error) {
      console.error('❌ Error setting up webhook:', error);
    }
  }

  /**
   * Process incoming Telegram message
   */
  async processMessage(message) {
    try {
      console.log('📱 Processing Telegram message:', message);

      // Extract message data
      const messageData = {
        child_id: message.from.id.toString(),
        contact: message.chat.title || `${message.from.first_name} ${message.from.last_name || ''}`.trim(),
        content: message.text || '[Media Message]',
        timestamp: new Date(message.date * 1000).toISOString(),
        app_name: 'Telegram',
        message_type: message.text ? 'text' : 'media',
        chat_id: message.chat.id,
        message_id: message.message_id
      };

      // Analyze content for inappropriate material
      const analysis = await this.analyzeContent(messageData.content);
      
      if (analysis.isFlagged) {
        // Store flagged message in database
        await this.storeFlaggedMessage({
          ...messageData,
          severity: analysis.severity,
          flagged_content: analysis.flaggedContent,
          confidence: analysis.confidence,
          flagged_words: analysis.flaggedWords
        });

        // Send real-time alert to parent
        await this.sendAlertToParent(messageData, analysis);
      }

      // Store all messages for conversation history
      await this.storeConversationLog(messageData);

    } catch (error) {
      console.error('❌ Error processing Telegram message:', error);
    }
  }

  /**
   * Analyze message content for inappropriate material
   */
  async analyzeContent(content) {
    try {
      // Basic content analysis (you can enhance this with AI)
      const inappropriateWords = [
        'drugs', 'weed', 'marijuana', 'alcohol', 'drunk',
        'sex', 'sexual', 'nude', 'naked', 'porn',
        'kill', 'suicide', 'hurt', 'violence', 'weapon',
        'ugly', 'fat', 'stupid', 'loser', 'hate',
        'address', 'phone', 'password', 'meet me at'
      ];

      const lowerContent = content.toLowerCase();
      const foundWords = inappropriateWords.filter(word => 
        lowerContent.includes(word.toLowerCase())
      );

      if (foundWords.length > 0) {
        return {
          isFlagged: true,
          severity: foundWords.length > 2 ? 'high' : 'medium',
          flaggedContent: `Inappropriate content detected: ${foundWords.join(', ')}`,
          confidence: Math.min(0.5 + (foundWords.length * 0.1), 0.9),
          flaggedWords: foundWords
        };
      }

      return {
        isFlagged: false,
        severity: 'low',
        flaggedContent: null,
        confidence: 0.1,
        flaggedWords: []
      };

    } catch (error) {
      console.error('❌ Error analyzing content:', error);
      return {
        isFlagged: false,
        severity: 'low',
        flaggedContent: null,
        confidence: 0.1,
        flaggedWords: []
      };
    }
  }

  /**
   * Store flagged message in database
   */
  async storeFlaggedMessage(messageData) {
    try {
      const { error } = await supabase
        .from('flagged_content')
        .insert({
          child_id: messageData.child_id,
          app_name: messageData.app_name,
          contact: messageData.contact,
          content_type: messageData.message_type,
          content_data: messageData.content,
          severity: messageData.severity,
          flagged_phrases: messageData.flagged_words,
          confidence: messageData.confidence,
          analysis_reasons: [messageData.flagged_content]
        });

      if (error) {
        console.error('❌ Error storing flagged message:', error);
      } else {
        console.log('✅ Flagged message stored successfully');
      }
    } catch (error) {
      console.error('❌ Error storing flagged message:', error);
    }
  }

  /**
   * Store conversation log
   */
  async storeConversationLog(messageData) {
    try {
      const { error } = await supabase
        .from('conversation_logs')
        .insert({
          child_id: messageData.child_id,
          app_name: messageData.app_name,
          contact: messageData.contact,
          severity: messageData.severity || 'low',
          flagged_content: messageData.flagged_content || null,
          confidence: messageData.confidence || 0.1,
          message_count: 1
        });

      if (error) {
        console.error('❌ Error storing conversation log:', error);
      }
    } catch (error) {
      console.error('❌ Error storing conversation log:', error);
    }
  }

  /**
   * Send alert to parent
   */
  async sendAlertToParent(messageData, analysis) {
    try {
      // Get parent ID from child ID
      const { data: familyLink, error: linkError } = await supabase
        .from('family_links')
        .select('parent_id')
        .eq('child_id', messageData.child_id)
        .single();

      if (linkError || !familyLink) {
        console.error('❌ No parent found for child:', messageData.child_id);
        return;
      }

      // Create real-time alert
      const { error: alertError } = await supabase
        .from('real_time_alerts')
        .insert({
          child_id: messageData.child_id,
          alert_type: 'content_flag',
          severity: analysis.severity,
          app_name: messageData.app_name,
          contact: messageData.contact,
          flagged_content: messageData.content,
          confidence: analysis.confidence,
          ai_reasoning: analysis.flaggedContent
        });

      if (alertError) {
        console.error('❌ Error creating alert:', alertError);
      } else {
        console.log('✅ Alert sent to parent');
      }
    } catch (error) {
      console.error('❌ Error sending alert to parent:', error);
    }
  }

  /**
   * Get bot information
   */
  async getBotInfo() {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/getMe`);
      const data = await response.json();
      
      if (data.ok) {
        return data.result;
      } else {
        console.error('❌ Failed to get bot info:', data.description);
        return null;
      }
    } catch (error) {
      console.error('❌ Error getting bot info:', error);
      return null;
    }
  }

  /**
   * Generate bot invite link
   */
  generateBotInviteLink() {
    if (!this.botToken) return null;
    
    const botUsername = this.botToken.split(':')[0]; // Extract bot username from token
    return `https://t.me/${botUsername}`;
  }

  /**
   * Send message to child
   */
  async sendMessageToChild(chatId, message) {
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();
      
      if (result.ok) {
        console.log('✅ Message sent to child successfully');
        return true;
      } else {
        console.error('❌ Failed to send message:', result.description);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending message to child:', error);
      return false;
    }
  }
}

// Export singleton instance
export const telegramBotService = new TelegramBotService();
export default telegramBotService;
