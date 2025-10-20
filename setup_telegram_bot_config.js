// Script to set up Telegram Bot configuration in your database
// Run this in your Supabase SQL Editor or via the app

import { supabase } from './app/supabase.js';

const BOT_TOKEN = '8368442573:AAGU1cZ6ylgFkpQ4wummVtKInbSZoc383rw';
const PARENT_CHAT_ID = '5305648844'; // Chat ID for "Such Man"

async function setupTelegramBotConfig() {
  try {
    console.log('🤖 Setting up Telegram Bot configuration...');

    // First, let's get the current user (parent)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError);
      return false;
    }

    const parentId = user.id;
    console.log('👤 Parent ID:', parentId);

    // For demo purposes, we'll use a placeholder child ID
    // In a real app, you'd get this from the family links
    const childId = '00000000-0000-0000-0000-000000000001'; // Placeholder

    // 1. Store bot configuration
    console.log('📝 Storing bot configuration...');
    const { data: botConfig, error: botConfigError } = await supabase
      .from('telegram_bot_configs')
      .upsert({
        parent_id: parentId,
        child_id: childId,
        bot_token: BOT_TOKEN,
        bot_username: 'guardian_ai_bot', // You can get this from getMe API
        is_active: true
      }, { 
        onConflict: 'parent_id,child_id' 
      })
      .select()
      .single();

    if (botConfigError) {
      console.error('❌ Error storing bot config:', botConfigError);
      return false;
    }

    console.log('✅ Bot configuration stored:', botConfig.id);

    // 2. Store parent's Telegram chat ID for notifications
    console.log('📱 Storing parent Telegram chat ID...');
    const { data: parentChat, error: parentChatError } = await supabase
      .from('parent_telegram_chats')
      .upsert({
        parent_id: parentId,
        chat_id: PARENT_CHAT_ID,
        chat_type: 'private',
        is_active: true
      }, { 
        onConflict: 'parent_id' 
      })
      .select()
      .single();

    if (parentChatError) {
      console.error('❌ Error storing parent chat:', parentChatError);
      return false;
    }

    console.log('✅ Parent chat ID stored:', parentChat.id);

    // 3. Store webhook configuration
    console.log('🔗 Storing webhook configuration...');
    const { data: webhook, error: webhookError } = await supabase
      .from('telegram_bot_webhooks')
      .upsert({
        bot_token: BOT_TOKEN,
        webhook_url: null, // We're using polling for now
        is_active: true,
        last_update_id: 0
      }, { 
        onConflict: 'bot_token' 
      })
      .select()
      .single();

    if (webhookError) {
      console.error('❌ Error storing webhook config:', webhookError);
      return false;
    }

    console.log('✅ Webhook configuration stored:', webhook.id);

    console.log('\n🎉 Telegram Bot setup completed successfully!');
    console.log('📋 Summary:');
    console.log(`   Bot Token: ${BOT_TOKEN.substring(0, 10)}...`);
    console.log(`   Parent Chat ID: ${PARENT_CHAT_ID}`);
    console.log(`   Parent ID: ${parentId}`);
    console.log(`   Child ID: ${childId}`);

    return true;

  } catch (error) {
    console.error('❌ Setup error:', error);
    return false;
  }
}

// Test the bot connection
async function testBotConnection() {
  try {
    console.log('\n🧪 Testing bot connection...');
    
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Bot is working!');
      console.log('📋 Bot Info:', data.result);
      return true;
    } else {
      console.error('❌ Bot connection failed:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
}

// Send test notification to parent
async function sendTestNotification() {
  try {
    console.log('\n📨 Sending test notification to parent...');
    
    const message = `🚨 *TEST ALERT - Guardian AI Bot*\n\n` +
      `✅ Your Telegram bot is now configured and working!\n\n` +
      `📱 *Bot Status:* Active\n` +
      `👤 *Parent Chat ID:* ${PARENT_CHAT_ID}\n` +
      `⏰ *Time:* ${new Date().toLocaleString()}\n\n` +
      `This is a test message to confirm the bot setup is working correctly.`;

    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: PARENT_CHAT_ID,
        text: message,
        parse_mode: 'Markdown'
      })
    });

    const data = await response.json();

    if (data.ok) {
      console.log('✅ Test notification sent successfully!');
      return true;
    } else {
      console.error('❌ Failed to send notification:', data.description);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return false;
  }
}

// Run the complete setup
async function runSetup() {
  console.log('🚀 Starting Telegram Bot setup...\n');
  
  // Test connection first
  const connectionOk = await testBotConnection();
  if (!connectionOk) {
    console.log('❌ Cannot proceed - bot connection failed');
    return;
  }

  // Set up configuration
  const setupOk = await setupTelegramBotConfig();
  if (!setupOk) {
    console.log('❌ Setup failed');
    return;
  }

  // Send test notification
  await sendTestNotification();

  console.log('\n🎉 Setup completed successfully!');
  console.log('📝 Next steps:');
  console.log('   1. Test the bot by sending messages to it');
  console.log('   2. Check the database tables to verify data was stored');
  console.log('   3. Start monitoring by initializing the TelegramBotService');
}

// Export functions for use in other modules
export { setupTelegramBotConfig, testBotConnection, sendTestNotification };

// Run setup if this script is executed directly
if (typeof window === 'undefined') {
  runSetup();
}
