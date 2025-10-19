# Guardian AI - Database Setup Guide

## 🚀 Quick Setup

The AI monitoring system requires a Supabase database. Here are the setup options:

### Option 1: Use Local Supabase (Recommended for Development)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase project:**
   ```bash
   supabase init
   ```

3. **Start Supabase locally:**
   ```bash
   supabase start
   ```

4. **Apply database migrations:**
   ```bash
   supabase db reset
   ```

5. **Update your .env file with local credentials:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```

### Option 2: Use Cloud Supabase (Production)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the migration script** in your Supabase dashboard:
   - Copy the contents of `backend/supabase/migrations/002_ai_monitoring_schema.sql`
   - Paste into the SQL Editor in your Supabase dashboard
   - Execute the script

3. **Update your .env file:**
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_project_anon_key
   ```

## 📊 Database Tables Created

The migration script creates the following tables:

- **`monitored_messages`** - Stores messages from various apps
- **`flagged_content`** - Stores content flagged by AI
- **`real_time_alerts`** - Stores real-time alerts
- **`conversation_logs`** - Stores conversation history
- **`monitoring_settings`** - Stores monitoring configuration
- **`ai_analysis_history`** - Stores AI analysis results
- **`child_profiles`** - Stores child information
- **`parent_accounts`** - Stores parent accounts
- **`parent_child_relationships`** - Links parents to children

## 🧪 Sample Data

The migration includes sample data for testing:

- **Child Profile:** Olivia Johnson (15 years old)
- **Sample Flagged Content:** Various examples including drug slang detection
- **Monitoring Settings:** Default configuration for AI monitoring

## 🔧 Troubleshooting

### Error: "Could not find the table 'public.monitored_messages'"

This error occurs when the database tables haven't been created yet. To fix:

1. **Check if Supabase is running:**
   ```bash
   supabase status
   ```

2. **Apply migrations:**
   ```bash
   supabase db reset
   ```

3. **Restart your Expo app** to reload the database connection

### Error: "Auth session missing"

This is expected during development. The AI monitoring system works independently of authentication.

## 🎯 Testing the AI System

Once the database is set up, you can test the AI detection:

1. **Use the Test AI button** in the ConversationHistoryScreen
2. **Try the demo screen** with sample texts
3. **Check the logs** for AI analysis results

## 📱 Features Available After Setup

- ✅ **Real-time AI monitoring**
- ✅ **Contextual drug slang detection** (e.g., "greens", "bud", "smoke")
- ✅ **Severity classification** (High/Medium/Low risk)
- ✅ **Confidence scoring** for AI detections
- ✅ **Database storage** of flagged content
- ✅ **Real-time alerts** for parents
- ✅ **Conversation history** with AI analysis

## 🛡️ AI Detection Capabilities

The system now detects:

- **Drug Slang:** "greens", "bud", "herb", "smoke", "high", "stoned"
- **Contextual Patterns:** "Want to smoke some greens tonight?"
- **Meeting Context:** "Meet me to smoke some herb"
- **Acquisition Context:** "Pick up some green stuff"
- **Intoxication Context:** "I'm so high from those gummies"

The AI intelligently combines multiple signals to determine risk levels and provide contextual analysis.
