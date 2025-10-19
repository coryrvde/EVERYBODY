import { supabase } from '../supabase';

class DatabaseInitializer {
  constructor() {
    this.isInitialized = false;
  }

  /**
   * Initialize the database with required tables and sample data
   */
  async initializeDatabase() {
    try {
      console.log('🔄 Initializing Guardian AI database...');
      
      // Check if tables exist by trying to query them
      const { data: tables, error: tablesError } = await supabase
        .from('monitored_messages')
        .select('id')
        .limit(1);

      if (tablesError && tablesError.code === 'PGRST205') {
        console.log('📊 Database tables not found. Creating sample data...');
        await this.createSampleData();
      } else {
        console.log('✅ Database tables already exist');
      }

      this.isInitialized = true;
      console.log('✅ Database initialization complete');
      return true;
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      return false;
    }
  }

  /**
   * Create sample data for testing
   */
  async createSampleData() {
    try {
      // Create sample child profile
      const { error: childError } = await supabase
        .from('child_profiles')
        .upsert({
          child_id: 'olivia',
          name: 'Olivia Johnson',
          age: 15,
          grade: '10th Grade',
          school: 'Lincoln High School',
          parent_email: 'parent@example.com'
        });

      if (childError) {
        console.error('Error creating child profile:', childError);
      }

      // Create monitoring settings
      const { error: settingsError } = await supabase
        .from('monitoring_settings')
        .upsert({
          child_id: 'olivia',
          enabled: true,
          text_monitoring: true,
          image_monitoring: true,
          real_time_alerts: true,
          push_notifications: true,
          email_alerts: true,
          confidence_threshold: 0.7
        });

      if (settingsError) {
        console.error('Error creating monitoring settings:', settingsError);
      }

      // Create sample flagged content
      const sampleFlaggedContent = [
        {
          child_id: 'olivia',
          app_name: 'WhatsApp',
          contact: 'Unknown Number',
          content_type: 'text',
          content_data: 'Hey, want to meet up alone? Send me some photos',
          severity: 'high',
          flagged_phrases: ['meet up alone', 'send photos'],
          confidence: 0.85,
          analysis_reasons: ['meeting alone request', 'photo request']
        },
        {
          child_id: 'olivia',
          app_name: 'Telegram',
          contact: 'Unknown Contact',
          content_type: 'text',
          content_data: 'Want to smoke some greens tonight? I got some bud',
          severity: 'medium',
          flagged_phrases: ['greens', 'smoke', 'bud'],
          confidence: 0.75,
          analysis_reasons: ['marijuana smoking context', 'late night drug activity context']
        },
        {
          child_id: 'olivia',
          app_name: 'Instagram',
          contact: '@stranger_account',
          content_type: 'text',
          content_data: 'You look really beautiful today',
          severity: 'low',
          flagged_phrases: ['beautiful'],
          confidence: 0.45,
          analysis_reasons: ['compliment context']
        }
      ];

      const { error: flaggedError } = await supabase
        .from('flagged_content')
        .insert(sampleFlaggedContent);

      if (flaggedError) {
        console.error('Error creating flagged content:', flaggedError);
      }

      // Create sample conversation logs
      const sampleLogs = [
        {
          child_id: 'olivia',
          app_name: 'WhatsApp',
          contact: 'Unknown Number',
          severity: 'high',
          flagged_content: 'Explicit language detected',
          confidence: 0.85,
          message_count: 12
        },
        {
          child_id: 'olivia',
          app_name: 'Telegram',
          contact: 'Unknown Contact',
          severity: 'medium',
          flagged_content: 'Drug slang detected',
          confidence: 0.75,
          message_count: 6
        },
        {
          child_id: 'olivia',
          app_name: 'Instagram',
          contact: '@stranger_account',
          severity: 'medium',
          flagged_content: 'Suspicious behavior',
          confidence: 0.65,
          message_count: 8
        }
      ];

      const { error: logsError } = await supabase
        .from('conversation_logs')
        .insert(sampleLogs);

      if (logsError) {
        console.error('Error creating conversation logs:', logsError);
      }

      console.log('✅ Sample data created successfully');
    } catch (error) {
      console.error('❌ Error creating sample data:', error);
    }
  }

  /**
   * Check if database is properly initialized
   */
  async checkDatabaseStatus() {
    try {
      const { data, error } = await supabase
        .from('child_profiles')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Database check failed:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Database check error:', error);
      return false;
    }
  }

  /**
   * Get initialization status
   */
  getInitializationStatus() {
    return this.isInitialized;
  }
}

export default new DatabaseInitializer();
