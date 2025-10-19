import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://uizxwrbuvfqrafmcfnak.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpenh3cmJ1dmZxcmFmbWNmbmFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3OTAxNTUsImV4cCI6MjA3NjM2NjE1NX0.1DQjhyS36rSwS5-Wq__KehefSLxz77YqkVfleaWVFQY';

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Disable automatic session refresh for development
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'guardian-ai-app'
    }
  }
});

// Database initialization helper
export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing Guardian AI database...');
    
    // Test database connection
    const { data, error } = await supabase
      .from('child_profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.log('📊 Database tables not found. Creating sample data...');
      await createSampleData();
    } else {
      console.log('✅ Database connection successful');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
};

// Create sample data for testing
const createSampleData = async () => {
  try {
    // Create child profile
    const { error: profileError } = await supabase
      .from('child_profiles')
      .upsert({
        child_id: 'olivia',
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
      .upsert({
        child_id: 'olivia',
        telegram_monitoring_enabled: true,
        text_analysis_enabled: true,
        image_analysis_enabled: true,
        voice_analysis_enabled: true,
        link_analysis_enabled: true,
        real_time_alerts: true,
        confidence_threshold: 0.7
      });

    if (settingsError) {
      console.error('Error creating monitoring settings:', settingsError);
    }

    // Create sample Telegram contacts
    const { error: contactsError } = await supabase
      .from('telegram_contacts')
      .upsert([
        {
          child_id: 'olivia',
          contact_id: '123456789',
          username: '@alex_smith',
          first_name: 'Alex',
          last_name: 'Smith',
          risk_level: 'medium',
          is_contact: true
        },
        {
          child_id: 'olivia',
          contact_id: '987654321',
          username: '@unknown_user',
          first_name: 'Unknown',
          last_name: 'User',
          risk_level: 'high',
          is_contact: false
        }
      ]);

    if (contactsError) {
      console.error('Error creating Telegram contacts:', contactsError);
    }

    // Create sample Telegram messages with drug slang
    const { error: messagesError } = await supabase
      .from('telegram_messages')
      .upsert([
        {
          child_id: 'olivia',
          message_id: 'msg001',
          chat_id: '123456789',
          chat_type: 'private',
          sender_id: '123456789',
          sender_username: '@alex_smith',
          sender_name: 'Alex Smith',
          message_text: 'Hey Olivia, want to smoke some greens tonight? I got some bud',
          message_type: 'text',
          message_date: new Date().toISOString(),
          is_outgoing: false
        },
        {
          child_id: 'olivia',
          message_id: 'msg002',
          chat_id: '123456789',
          chat_type: 'private',
          sender_id: 'olivia',
          sender_username: '@olivia_j',
          sender_name: 'Olivia Johnson',
          message_text: 'Sure, where should we meet?',
          message_type: 'text',
          message_date: new Date().toISOString(),
          is_outgoing: true
        },
        {
          child_id: 'olivia',
          message_id: 'msg003',
          chat_id: '123456789',
          chat_type: 'private',
          sender_id: '123456789',
          sender_username: '@alex_smith',
          sender_name: 'Alex Smith',
          message_text: 'Come over to my place, I have a bong ready',
          message_type: 'text',
          message_date: new Date().toISOString(),
          is_outgoing: false
        }
      ]);

    if (messagesError) {
      console.error('Error creating Telegram messages:', messagesError);
    }

    // Create sample AI analysis results
    const { error: analysisError } = await supabase
      .from('ai_analysis_results')
      .upsert([
        {
          child_id: 'olivia',
          message_id: 'msg001',
          analysis_type: 'text',
          content_hash: 'hash001',
          analysis_data: {
            flagged: true,
            reasons: ['marijuana smoking context', 'late night drug activity context']
          },
          severity: 'medium',
          confidence: 0.85,
          flagged_phrases: ['greens', 'smoke', 'bud'],
          flagged_categories: ['drugs'],
          contextual_patterns: ['marijuana smoking context', 'late night drug activity context'],
          risk_factors: ['drug_use', 'peer_pressure']
        },
        {
          child_id: 'olivia',
          message_id: 'msg003',
          analysis_type: 'text',
          content_hash: 'hash003',
          analysis_data: {
            flagged: true,
            reasons: ['marijuana smoking context', 'home meeting context']
          },
          severity: 'high',
          confidence: 0.90,
          flagged_phrases: ['bong', 'place'],
          flagged_categories: ['drugs', 'personal_info'],
          contextual_patterns: ['marijuana smoking context', 'home meeting context'],
          risk_factors: ['drug_use', 'home_meeting', 'paraphernalia']
        }
      ]);

    if (analysisError) {
      console.error('Error creating AI analysis results:', analysisError);
    }

    // Create sample flagged content
    const { error: flaggedError } = await supabase
      .from('flagged_content')
      .upsert([
        {
          child_id: 'olivia',
          message_id: 'msg001',
          chat_id: '123456789',
          chat_type: 'private',
          content_type: 'text',
          content_data: 'Hey Olivia, want to smoke some greens tonight? I got some bud',
          severity: 'medium',
          flagged_phrases: ['greens', 'smoke', 'bud'],
          flagged_categories: ['drugs'],
          confidence: 0.85,
          analysis_reasons: ['marijuana smoking context', 'late night drug activity context'],
          contextual_indicators: ['drug_slang', 'smoking_reference', 'time_context']
        },
        {
          child_id: 'olivia',
          message_id: 'msg003',
          chat_id: '123456789',
          chat_type: 'private',
          content_type: 'text',
          content_data: 'Come over to my place, I have a bong ready',
          severity: 'high',
          flagged_phrases: ['bong', 'place'],
          flagged_categories: ['drugs', 'personal_info'],
          confidence: 0.90,
          analysis_reasons: ['marijuana smoking context', 'home meeting context'],
          contextual_indicators: ['drug_paraphernalia', 'home_meeting', 'high_risk']
        }
      ]);

    if (flaggedError) {
      console.error('Error creating flagged content:', flaggedError);
    }

    // Create sample real-time alerts
    const { error: alertsError } = await supabase
      .from('real_time_alerts')
      .upsert([
        {
          child_id: 'olivia',
          alert_type: 'content_flag',
          severity: 'medium',
          message_id: 'msg001',
          chat_id: '123456789',
          chat_type: 'private',
          contact_id: '123456789',
          contact_name: 'Alex Smith',
          alert_title: 'Drug Slang Detected',
          alert_message: 'Marijuana-related language detected in conversation with Alex Smith',
          flagged_content: 'Hey Olivia, want to smoke some greens tonight? I got some bud',
          confidence: 0.85,
          risk_factors: ['drug_use', 'peer_pressure']
        },
        {
          child_id: 'olivia',
          alert_type: 'content_flag',
          severity: 'high',
          message_id: 'msg003',
          chat_id: '123456789',
          chat_type: 'private',
          contact_id: '123456789',
          contact_name: 'Alex Smith',
          alert_title: 'High-Risk Drug Content',
          alert_message: 'Drug paraphernalia and home meeting context detected',
          flagged_content: 'Come over to my place, I have a bong ready',
          confidence: 0.90,
          risk_factors: ['drug_use', 'home_meeting', 'paraphernalia']
        }
      ]);

    if (alertsError) {
      console.error('Error creating real-time alerts:', alertsError);
    }

    // Create sample conversation logs
    const { error: logsError } = await supabase
      .from('conversation_logs')
      .upsert([
        {
          child_id: 'olivia',
          chat_id: '123456789',
          chat_type: 'private',
          contact_name: 'Alex Smith',
          contact_id: '123456789',
          conversation_summary: 'Conversation with Alex Smith containing drug-related content and meeting arrangements',
          message_count: 3,
          flagged_message_count: 2,
          highest_severity: 'high',
          last_message_date: new Date().toISOString(),
          last_flagged_date: new Date().toISOString(),
          risk_score: 0.85,
          is_active: true
        }
      ]);

    if (logsError) {
      console.error('Error creating conversation logs:', logsError);
    }

    console.log('✅ Sample data created successfully');
  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  }
};

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('✅ Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
};

// Get child profile
export const getChildProfile = async (childId = 'olivia') => {
  try {
    const { data, error } = await supabase
      .from('child_profiles')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (error) {
      console.error('Error fetching child profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching child profile:', error);
    return null;
  }
};

// Get monitoring settings
export const getMonitoringSettings = async (childId = 'olivia') => {
  try {
    const { data, error } = await supabase
      .from('monitoring_settings')
      .select('*')
      .eq('child_id', childId)
      .single();

    if (error) {
      console.error('Error fetching monitoring settings:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching monitoring settings:', error);
    return null;
  }
};

// Get recent alerts
export const getRecentAlerts = async (childId = 'olivia', limit = 10) => {
  try {
    const { data, error } = await supabase
      .from('real_time_alerts')
      .select('*')
      .eq('child_id', childId)
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
};

// Get conversation logs
export const getConversationLogs = async (childId = 'olivia') => {
  try {
    const { data, error } = await supabase
      .from('conversation_logs')
      .select('*')
      .eq('child_id', childId)
      .order('last_message_date', { ascending: false });

    if (error) {
      console.error('Error fetching conversation logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching conversation logs:', error);
    return [];
  }
};