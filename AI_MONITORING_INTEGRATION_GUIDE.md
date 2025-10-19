# AI Monitoring Integration Guide

## 🚀 Overview

This guide explains how to integrate real-time Telegram monitoring alerts into your Guardian AI app. The system provides smart AI-powered content analysis similar to ChatGPT, allowing parents to add custom words/phrases for monitoring.

## 📁 Files Created/Modified

### New Services
- `app/services/alertIntegrationService.js` - Core alert integration service
- `app/services/alertNotificationService.js` - Alert notification management
- `app/services/smartAIService.js` - AI-powered content analysis (ChatGPT-like)

### New Screens
- `app/screens/CustomPhrasesScreen.jsx` - Parent interface for managing custom phrases

### Database
- `backend/supabase/migrations/005_custom_phrases.sql` - Custom phrases table and functions

### Modified Files
- `app/screens/HomeScreen.jsx` - Integrated alert notifications
- `App.js` - Added CustomPhrasesScreen navigation

## 🔧 How It Works

### 1. Alert Flow
```
Telegram App → AI Analysis → Database → Real-time Alerts → Parent Notifications
```

### 2. AI Analysis Process
1. **Content Detection**: Telegram messages are captured
2. **AI Analysis**: Smart AI service analyzes content using OpenAI GPT-3.5
3. **Custom Phrases**: Parent-defined phrases are included in analysis
4. **Severity Assessment**: AI determines risk level (low/medium/high/critical)
5. **Alert Generation**: Real-time alerts are created and sent to parents

### 3. Parent Experience
1. **Custom Phrases**: Parents can add/remove monitoring keywords
2. **Real-time Alerts**: Instant notifications when concerning content is detected
3. **AI Insights**: Detailed AI analysis explaining why content was flagged
4. **Smart Actions**: AI recommends appropriate responses (monitor/block/discuss)

## 🛠️ Setup Instructions

### 1. Database Setup
Run the migration to create the custom phrases table:
```sql
-- Run this in your Supabase SQL editor
-- File: backend/supabase/migrations/005_custom_phrases.sql
```

### 2. Environment Variables
Add your OpenAI API key to your environment:
```bash
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
```

### 3. Initialize Services
The services are automatically initialized when the HomeScreen loads, but you can manually initialize them:

```javascript
import { alertNotificationService } from './app/services/alertNotificationService';

// Initialize for a parent
await alertNotificationService.initialize(parentId);

// Add callback for new alerts
alertNotificationService.addAlertCallback((alert) => {
  console.log('New alert:', alert);
});
```

## 📱 Usage Examples

### Adding Custom Phrases
```javascript
// Navigate to Custom Phrases screen
navigation.navigate('CustomPhrases');

// Parents can add phrases like:
// - "meet me at" (personal info sharing)
// - "my password is" (security risk)
// - "skip school" (truancy)
// - "buy drugs" (substance abuse)
```

### Creating Test Alerts
```javascript
import { alertNotificationService } from './app/services/alertNotificationService';

// Create a test alert
const testAlert = await alertNotificationService.createTestAlert(
  'child-id',
  'I want to skip school today',
  'medium'
);
```

### AI Analysis
```javascript
import { smartAIService } from './app/services/smartAIService';

// Analyze content with AI
const analysis = await smartAIService.analyzeContent(
  'I hate school and want to hurt myself',
  { 
    parentId: 'parent-id',
    childAge: '14',
    appName: 'Telegram',
    contact: 'Unknown'
  }
);

// Result:
// {
//   severity: 'high',
//   categories: ['violence', 'bullying'],
//   confidence: 0.9,
//   reasoning: 'Message contains concerning language about self-harm and school avoidance',
//   flaggedPhrases: ['hate', 'hurt myself'],
//   recommendedAction: 'discuss'
// }
```

## 🔔 Alert Types

### Real-time Alerts
- **Content Flag**: Inappropriate content detected
- **Suspicious Activity**: Pattern of concerning behavior
- **Emergency**: Critical safety concerns

### Severity Levels
- **Critical**: Immediate danger (self-harm, violence)
- **High**: Serious concerns (drugs, sexual content)
- **Medium**: Moderate concerns (bullying, inappropriate language)
- **Low**: Minor concerns (excessive screen time)

## 🎯 AI Features

### Smart Analysis
- **Context Awareness**: Considers child's age, app, and contact
- **Custom Phrases**: Incorporates parent-defined monitoring terms
- **Confidence Scoring**: AI provides confidence levels for decisions
- **Reasoning**: Detailed explanations for why content was flagged

### Categories Detected
- Sexual content
- Violence and threats
- Drugs and alcohol
- Bullying and harassment
- Personal information sharing
- Inappropriate language
- Custom categories (parent-defined)

### Recommended Actions
- **Monitor**: Keep watching this conversation
- **Block**: Block the contact or app
- **Discuss**: Talk to your child about this
- **Emergency**: Take immediate action

## 📊 Database Schema

### Custom Phrases Table
```sql
CREATE TABLE custom_phrases (
    id SERIAL PRIMARY KEY,
    parent_id UUID REFERENCES profiles(id),
    phrase TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'custom',
    severity VARCHAR(20) DEFAULT 'medium',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Real-time Alerts Table
```sql
CREATE TABLE real_time_alerts (
    id SERIAL PRIMARY KEY,
    child_id VARCHAR(50) NOT NULL,
    alert_type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    app_name VARCHAR(100) NOT NULL,
    contact VARCHAR(255) NOT NULL,
    flagged_content TEXT NOT NULL,
    confidence DECIMAL(3,2) DEFAULT 0.0,
    ai_reasoning TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔄 Integration with Telegram

### 1. Telegram Monitoring Service
The existing `telegramMonitor.js` service can be enhanced to use the new AI analysis:

```javascript
// In telegramMonitor.js
import { smartAIService } from './smartAIService';

async analyzeTelegramMessage(message) {
  // Get AI analysis
  const aiAnalysis = await smartAIService.analyzeContent(
    message.content,
    {
      parentId: this.parentId,
      childAge: message.childAge,
      appName: 'Telegram',
      contact: message.contact
    }
  );

  // Create alert if concerning content detected
  if (aiAnalysis.severity !== 'low') {
    await this.createAlert(message, aiAnalysis);
  }
}
```

### 2. Real-time Subscriptions
The system uses Supabase real-time subscriptions to instantly notify parents:

```javascript
// Subscribe to new alerts
const channel = supabase
  .channel('realtime-alerts')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'real_time_alerts'
  }, (payload) => {
    // Show alert to parent
    showAlertNotification(payload.new);
  })
  .subscribe();
```

## 🚨 Alert Notifications

### Parent Notifications
When an alert is triggered, parents receive:
1. **Push Notification**: Immediate alert on their device
2. **In-App Alert**: Detailed alert with AI analysis
3. **Dashboard Update**: Alert appears in the home screen
4. **Action Options**: View details, acknowledge, or dismiss

### Alert Format
```
🚨 HIGH Alert 🚩

App: Telegram
Contact: Unknown
Content: I want to skip school today

AI Analysis: Message suggests truancy and school avoidance
Confidence: 85%
Recommended Action: discuss

Flagged Phrases: skip school
```

## 🔧 Customization

### Adding New Categories
1. Update the categories array in `CustomPhrasesScreen.jsx`
2. Add corresponding patterns in `smartAIService.js`
3. Update the AI prompt to include new categories

### Modifying AI Analysis
1. Edit the prompt in `createAnalysisPrompt()` method
2. Adjust confidence thresholds in `parseAIResponse()`
3. Add custom analysis logic in `fallbackAnalysis()`

### Custom Alert Actions
1. Add new action types in the alert notification service
2. Update the alert UI to show new actions
3. Implement action handlers in the parent interface

## 🧪 Testing

### Test Alerts
```javascript
// Create test alerts for different scenarios
await alertNotificationService.createTestAlert('child-id', 'I hate school', 'medium');
await alertNotificationService.createTestAlert('child-id', 'Let me buy drugs', 'high');
await alertNotificationService.createTestAlert('child-id', 'I want to hurt myself', 'critical');
```

### AI Service Testing
```javascript
// Test AI connectivity
const isConnected = await smartAIService.testConnection();
console.log('AI Service Connected:', isConnected);
```

## 📈 Performance Considerations

### AI API Limits
- OpenAI API has rate limits and costs
- Consider caching analysis results
- Implement fallback pattern matching
- Monitor API usage and costs

### Real-time Subscriptions
- Limit number of active subscriptions
- Clean up subscriptions on component unmount
- Handle connection drops gracefully

### Database Optimization
- Index frequently queried columns
- Use pagination for large result sets
- Implement data retention policies

## 🔒 Security Considerations

### Data Privacy
- All content analysis happens server-side
- No sensitive data stored in client
- Parent data is isolated by user ID
- AI analysis results are encrypted

### Access Control
- Row Level Security (RLS) enabled
- Parents can only see their own data
- Child data is protected by family links
- API keys are environment variables

## 🚀 Next Steps

1. **Deploy Database Migration**: Run the custom phrases migration
2. **Set Environment Variables**: Add OpenAI API key
3. **Test Integration**: Create test alerts and verify notifications
4. **Customize AI Prompts**: Adjust analysis criteria for your needs
5. **Monitor Performance**: Track API usage and response times
6. **User Training**: Educate parents on using custom phrases effectively

## 📞 Support

For issues or questions:
1. Check the console logs for error messages
2. Verify database connections and permissions
3. Test AI service connectivity
4. Review Supabase real-time subscription status

The system is designed to be robust with fallbacks, so even if AI analysis fails, basic pattern matching will still work to protect children.
