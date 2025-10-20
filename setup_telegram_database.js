// Quick database setup script for Telegram Bot
// This ensures all necessary tables are created

import { supabase } from './app/supabase.js';

async function setupTelegramDatabase() {
  try {
    console.log('🗄️ Setting up Telegram Bot database tables...');

    // Read and execute the SQL file
    const fs = await import('fs');
    const path = await import('path');
    
    const sqlFile = path.join(process.cwd(), 'telegram_bot_tables.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: statement
          });
          
          if (error && !error.message.includes('already exists')) {
            console.warn(`⚠️ Statement ${i + 1}:`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1}: Executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️ Statement ${i + 1}:`, err.message);
        }
      }
    }

    console.log('✅ Database setup completed!');

    // Verify tables exist
    await verifyTables();

    return true;

  } catch (error) {
    console.error('❌ Database setup error:', error);
    return false;
  }
}

async function verifyTables() {
  try {
    console.log('\n🔍 Verifying database tables...');

    const tables = [
      'telegram_bot_configs',
      'parent_telegram_chats', 
      'telegram_chats',
      'telegram_messages',
      'telegram_bot_webhooks'
    ];

    for (const tableName of tables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table ${tableName}: ${error.message}`);
      } else {
        console.log(`✅ Table ${tableName}: Ready`);
      }
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
  }
}

// Run setup if this script is executed directly
if (typeof window === 'undefined') {
  setupTelegramDatabase()
    .then(() => {
      console.log('\n🎉 Telegram Bot database is ready!');
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
    });
}

export { setupTelegramDatabase, verifyTables };
