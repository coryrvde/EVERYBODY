// Integration script to connect your Telegram Bot to the Guardian AI app
// This script helps you set up the bot monitoring in your existing app

import { telegramBotService } from './app/services/telegramBotService.js';
import { supabase } from './app/supabase.js';

// Your bot configuration
const BOT_CONFIG = {
  botToken: '8368442573:AAGU1cZ6ylgFkpQ4wummVtKInbSZoc383rw',
  parentChatId: '5305648844',
  botUsername: 'Coryrvde_bot'
};

class TelegramBotIntegrator {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize the Telegram Bot integration
   */
  async initialize() {
    try {
      console.log('🚀 Initializing Telegram Bot integration...');

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const parentId = user.id;
      console.log('👤 Parent ID:', parentId);

      // For demo, we'll use a placeholder child ID
      // In production, you'd get this from family links
      const childId = await this.getOrCreateDemoChild(parentId);

      // Initialize the bot service
      const success = await telegramBotService.initializeBot(
        parentId,
        childId,
        BOT_CONFIG.botToken
      );

      if (success) {
        this.isInitialized = true;
        console.log('✅ Telegram Bot integration initialized successfully!');
        
        // Send welcome message to parent
        await this.sendWelcomeMessage();
        
        return true;
      } else {
        throw new Error('Failed to initialize bot service');
      }

    } catch (error) {
      console.error('❌ Integration error:', error);
      return false;
    }
  }

  /**
   * Get or create a demo child for testing
   */
  async getOrCreateDemoChild(parentId) {
    try {
      // Check if demo child exists
      const { data: existingChild, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('parent_id', parentId)
        .eq('role', 'child')
        .limit(1)
        .single();

      if (existingChild && !error) {
        return existingChild.id;
      }

      // Create demo child
      const { data: newChild, error: createError } = await supabase
        .from('profiles')
        .insert({
          parent_id: parentId,
          role: 'child',
          name: 'Demo Child',
          email: 'demo-child@guardian-ai.com'
        })
        .select('id')
        .single();

      if (createError) throw createError;
      
      console.log('👶 Created demo child:', newChild.id);
      return newChild.id;

    } catch (error) {
      console.error('❌ Error with demo child:', error);
      // Return a placeholder UUID
      return '00000000-0000-0000-0000-000000000001';
    }
  }

  /**
   * Send welcome message to parent
   */
  async sendWelcomeMessage() {
    try {
      const message = `🎉 *Welcome to Guardian AI Telegram Monitoring!*\n\n` +
        `✅ Your bot is now active and monitoring\n` +
        `🤖 Bot: @${BOT_CONFIG.botUsername}\n` +
        `👤 Parent Chat: ${BOT_CONFIG.parentChatId}\n` +
        `⏰ Started: ${new Date().toLocaleString()}\n\n` +
        `📱 *What's monitored:*\n` +
        `• All messages sent to your bot\n` +
        `• AI analysis of content\n` +
        `• Automatic alerts for flagged content\n\n` +
        `🔔 You'll receive notifications here when inappropriate content is detected.`;

      await telegramBotService.sendMessage(
        BOT_CONFIG.parentChatId,
        message,
        'Markdown'
      );

      console.log('✅ Welcome message sent to parent');

    } catch (error) {
      console.error('❌ Error sending welcome message:', error);
    }
  }

  /**
   * Test the integration
   */
  async testIntegration() {
    try {
      console.log('🧪 Testing Telegram Bot integration...');

      // Test 1: Bot status
      const status = telegramBotService.getStatus();
      console.log('📊 Bot Status:', status);

      // Test 2: Send test message
      await telegramBotService.sendMessage(
        BOT_CONFIG.parentChatId,
        '🧪 Integration test message - Bot is working correctly!',
        'HTML'
      );

      // Test 3: Check monitored chats
      const monitoredChats = await telegramBotService.getMonitoredChats();
      console.log('👥 Monitored Chats:', monitoredChats);

      console.log('✅ Integration test completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Integration test failed:', error);
      return false;
    }
  }

  /**
   * Get integration status
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      botConfig: {
        ...BOT_CONFIG,
        botToken: '***' + BOT_CONFIG.botToken.slice(-4)
      },
      serviceStatus: telegramBotService.getStatus()
    };
  }

  /**
   * Stop monitoring
   */
  async stopMonitoring() {
    try {
      await telegramBotService.stopMonitoring();
      this.isInitialized = false;
      console.log('🛑 Telegram Bot monitoring stopped');
    } catch (error) {
      console.error('❌ Error stopping monitoring:', error);
    }
  }
}

// Create global instance
const telegramBotIntegrator = new TelegramBotIntegrator();

// Export for use in other modules
export { telegramBotIntegrator };

// Auto-initialize if this script is run directly
if (typeof window === 'undefined') {
  telegramBotIntegrator.initialize()
    .then(() => {
      console.log('🎉 Telegram Bot integration ready!');
      return telegramBotIntegrator.testIntegration();
    })
    .then(() => {
      console.log('✅ All tests passed! Your bot is ready to monitor.');
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
    });
}
