# Guardian AI - Complete Telegram Monitoring System

## 🚀 Overview

This is a comprehensive Telegram monitoring system designed specifically for parental control and child safety. The system uses advanced AI to detect inappropriate content, drug slang, and contextual patterns in Telegram conversations.

## 📊 Database Schema

The system includes a complete database schema with the following tables:

### Core Tables
- **`telegram_messages`** - All Telegram messages (text, media, voice, etc.)
- **`telegram_contacts`** - Contact information and risk assessment
- **`telegram_groups`** - Group chat monitoring
- **`telegram_channels`** - Channel subscription monitoring
- **`telegram_media`** - Photos, videos, documents, stickers
- **`telegram_voice_messages`** - Voice message transcription and analysis
- **`telegram_links`** - URL safety analysis
- **`telegram_sessions`** - Active device sessions

### AI Analysis Tables
- **`ai_analysis_results`** - Comprehensive AI analysis results
- **`flagged_content`** - Content that triggered alerts
- **`real_time_alerts`** - Immediate parent notifications
- **`conversation_logs`** - Conversation summaries and risk scores

### Configuration Tables
- **`monitoring_settings`** - AI monitoring configuration
- **`child_profiles`** - Child information and settings
- **`parent_accounts`** - Parent account management

## 🧠 AI Detection Capabilities

### Drug Slang Detection
The system intelligently detects marijuana-related slang and contextual patterns:

#### Direct Slang Terms:
- **"greens"** - Primary marijuana slang
- **"green stuff"** - Alternative phrasing
- **"bud", "buds"** - Common references
- **"herb", "grass", "pot", "mary jane"** - Classic slang
- **"smoke", "smoking", "hit", "hits"** - Smoking references
- **"joint", "joints", "blunt", "blunts"** - Smoking paraphernalia
- **"bowl", "bowls", "bong", "bongs", "pipe", "pipes"** - Smoking devices
- **"vape", "vaping"** - Modern consumption methods
- **"edibles", "gummies", "cookies", "brownies"** - Edible forms
- **"oil", "wax", "dabs", "concentrates"** - Concentrated forms
- **"thc", "cbd", "cannabis"** - Chemical compounds

#### Contextual Pattern Detection:
- **"Want to smoke some greens tonight?"** → Medium Risk
  - Detected: "greens" + "smoke" + "tonight"
  - Context: "marijuana smoking context" + "late night drug activity context"

- **"I got some bud, want to roll up?"** → Medium Risk
  - Detected: "bud" + "roll up"
  - Context: "marijuana preparation context"

- **"Come over to my place, I have a bong ready"** → High Risk
  - Detected: "bong" + "place"
  - Context: "marijuana smoking context" + "home meeting context"

### Other Detection Categories:
- **Sexual Content** - Inappropriate language and requests
- **Violence** - Threats and violent content
- **Bullying** - Harassment and mean language
- **Personal Information** - Address, phone, meeting requests
- **Photo Requests** - Inappropriate photo requests
- **Stranger Danger** - Unknown contacts requesting content

## 🎯 Real-World Examples

### Example 1: Drug Slang Detection
```
Message: "Hey Olivia, want to smoke some greens tonight? I got some bud"
Analysis:
- Severity: Medium
- Confidence: 85%
- Flagged Phrases: ["greens", "smoke", "bud"]
- Categories: ["drugs"]
- Contextual Patterns: ["marijuana smoking context", "late night drug activity context"]
- Risk Factors: ["drug_use", "peer_pressure"]
```

### Example 2: High-Risk Context
```
Message: "Come over to my place, I have a bong ready"
Analysis:
- Severity: High
- Confidence: 90%
- Flagged Phrases: ["bong", "place"]
- Categories: ["drugs", "personal_info"]
- Contextual Patterns: ["marijuana smoking context", "home meeting context"]
- Risk Factors: ["drug_use", "home_meeting", "paraphernalia"]
```

### Example 3: Photo Request
```
Message: "Send me some photos"
Analysis:
- Severity: High
- Confidence: 95%
- Flagged Phrases: ["send", "photos"]
- Categories: ["inappropriate_requests"]
- Contextual Patterns: ["photo request"]
- Risk Factors: ["photo_request", "stranger_danger"]
```

## 🚨 Alert System

### Alert Types:
- **Content Flag** - Inappropriate content detected
- **Suspicious Contact** - Unknown or high-risk contact
- **Dangerous Link** - Unsafe URL detected
- **Voice Analysis** - Inappropriate voice content
- **Context Pattern** - Suspicious conversation patterns

### Severity Levels:
- **🔴 High Risk** - Immediate parent notification
- **🟡 Medium Risk** - Delayed notification
- **🟢 Low Risk** - Summary notification

### Notification Channels:
- **Push Notifications** - Real-time mobile alerts
- **Email Alerts** - Detailed email notifications
- **SMS Alerts** - Emergency text messages
- **In-App Alerts** - Dashboard notifications

## 📱 Setup Instructions

### 1. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init
supabase start
supabase db reset
```

### 2. Environment Configuration
```env
EXPO_PUBLIC_SUPABASE_URL=http://localhost:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
```

### 3. Start Monitoring
The system automatically initializes when the app starts:
- Creates sample data for testing
- Sets up real-time subscriptions
- Begins monitoring Telegram conversations
- Starts AI analysis engine

## 🔧 Configuration Options

### Monitoring Settings:
```javascript
{
  telegram_monitoring_enabled: true,
  text_analysis_enabled: true,
  image_analysis_enabled: true,
  voice_analysis_enabled: true,
  link_analysis_enabled: true,
  sticker_analysis_enabled: true,
  real_time_alerts: true,
  confidence_threshold: 0.7,
  severity_thresholds: {
    high: 0.8,
    medium: 0.6,
    low: 0.4
  }
}
```

### Monitored Chat Types:
- **Private Messages** - One-on-one conversations
- **Group Chats** - Group conversations
- **Supergroups** - Large group chats
- **Channels** - Broadcast channels

## 📊 Sample Data Included

The system comes with comprehensive sample data:

### Child Profile:
- **Name:** Olivia Johnson
- **Age:** 15 years old
- **Grade:** 10th Grade
- **School:** Lincoln High School
- **Telegram:** @olivia_j

### Sample Conversations:
1. **Alex Smith** - Drug slang conversation with "greens" detection
2. **Unknown User** - Inappropriate photo request
3. **School Friends Group** - Safe group conversation

### Sample Alerts:
- Drug slang detection alerts
- High-risk content alerts
- Photo request alerts
- Meeting context alerts

## 🧪 Testing the System

### Test AI Button:
The "Test AI" button uses: `"Want to smoke some greens tonight? I got some bud"`

Expected Result:
- **Flagged:** Yes
- **Severity:** Medium
- **Confidence:** 85%
- **Phrases:** ["greens", "smoke", "bud"]
- **Context:** ["marijuana smoking context", "late night drug activity context"]

### Demo Screen:
Try these sample texts:
- "Want to smoke some greens tonight?"
- "I got some bud, want to roll up?"
- "Let's have a smoke session with the greens"
- "Can you pick up some green stuff for me?"
- "I'm so high from those gummies"

## 🛡️ Privacy & Security

### Data Protection:
- **Encryption** - All sensitive data encrypted
- **Anonymization** - Personal data anonymized when possible
- **Retention** - Configurable data retention periods
- **Access Control** - Row-level security policies

### Compliance:
- **COPPA** - Children's Online Privacy Protection Act
- **GDPR** - General Data Protection Regulation
- **CCPA** - California Consumer Privacy Act

## 🔮 Future Enhancements

### Planned Features:
- **Voice Transcription** - AI-powered voice message analysis
- **Image Analysis** - NSFW image detection
- **Link Safety** - URL safety checking
- **Sticker Analysis** - Inappropriate sticker detection
- **Location Tracking** - Meeting location analysis
- **Time Patterns** - Suspicious activity timing
- **Contact Risk Scoring** - Contact safety assessment

### AI Improvements:
- **Machine Learning** - Continuous learning from patterns
- **Context Understanding** - Better contextual analysis
- **False Positive Reduction** - Improved accuracy
- **Multi-language Support** - Multiple language detection

## 📞 Support

For technical support or questions about the Telegram monitoring system:
- **Documentation:** See `DATABASE_SETUP.md`
- **Issues:** Check the GitHub issues page
- **Updates:** Follow the project repository

---

**⚠️ Important Note:** This system is designed for parental control and child safety. Always ensure compliance with local laws and regulations regarding monitoring and privacy.
