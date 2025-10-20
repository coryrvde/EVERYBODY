// Database verification script for Telegram Bot integration
// This checks if all required tables and columns exist

import { supabase } from './app/supabase.js';

async function verifyTelegramDatabase() {
  try {
    console.log('🔍 Verifying Telegram Bot database schema...\n');

    // Required tables
    const requiredTables = [
      'telegram_bot_configs',
      'parent_telegram_chats',
      'telegram_chats',
      'telegram_messages',
      'telegram_bot_webhooks'
    ];

    // Required columns for telegram_messages table
    const requiredColumns = [
      'id',
      'child_id',
      'parent_id',
      'chat_id',
      'message_id',
      'message_text',
      'message_type',
      'sender_name',
      'sender_id',
      'chat_type',
      'chat_title',
      'flagged',
      'severity',
      'confidence',
      'flagged_phrases',
      'flagged_categories',
      'analysis_result',
      'timestamp',
      'created_at'
    ];

    console.log('📋 Checking required tables...');
    
    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table ${tableName}: Missing or inaccessible`);
          console.log(`   Error: ${error.message}`);
        } else {
          console.log(`✅ Table ${tableName}: Exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${tableName}: Error checking table`);
        console.log(`   Error: ${err.message}`);
      }
    }

    console.log('\n📋 Checking telegram_messages table columns...');
    
    try {
      // Try to insert a test record to check all columns
      const testData = {
        child_id: '00000000-0000-0000-0000-000000000001',
        parent_id: '00000000-0000-0000-0000-000000000002',
        chat_id: 'test_chat_123',
        message_id: 'test_msg_123',
        message_text: 'Test message',
        message_type: 'text',
        sender_name: 'Test User',
        sender_id: 'test_user_123',
        chat_type: 'private',
        chat_title: 'Test Chat',
        flagged: false,
        timestamp: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('telegram_messages')
        .insert(testData)
        .select()
        .single();

      if (error) {
        console.log('❌ telegram_messages table: Column issues detected');
        console.log(`   Error: ${error.message}`);
        
        // Check if it's a column issue
        if (error.message.includes('chat_id')) {
          console.log('   🔧 Issue: Missing chat_id column');
        }
        if (error.message.includes('column')) {
          console.log('   🔧 Issue: Column schema mismatch');
        }
      } else {
        console.log('✅ telegram_messages table: All columns working correctly');
        
        // Clean up test data
        await supabase
          .from('telegram_messages')
          .delete()
          .eq('id', data.id);
      }
    } catch (err) {
      console.log('❌ telegram_messages table: Error testing columns');
      console.log(`   Error: ${err.message}`);
    }

    console.log('\n📊 Database verification completed!');
    
    return true;

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    return false;
  }
}

// Run verification if this script is executed directly
if (typeof window === 'undefined') {
  verifyTelegramDatabase()
    .then(() => {
      console.log('\n🎉 Database verification finished!');
    })
    .catch((error) => {
      console.error('❌ Verification failed:', error);
    });
}

export { verifyTelegramDatabase };
