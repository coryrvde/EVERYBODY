# Telegram Bot API Setup Guide

## 🤖 Overview

This guide explains how to set up Telegram Bot API integration for real-time message monitoring in your Guardian AI app.

## 📋 Prerequisites

1. **Telegram Account**: You need a Telegram account
2. **BotFather Access**: Access to @BotFather on Telegram
3. **Server/Webhook**: A server to host webhook endpoints
4. **Environment Variables**: Bot token and webhook URL

## 🚀 Step-by-Step Setup

### 1. Create a Telegram Bot

1. **Open Telegram** and search for `@BotFather`
2. **Start a chat** with BotFather
3. **Send command**: `/newbot`
4. **Enter bot name**: `Guardian AI Monitor`
5. **Enter bot username**: `guardian_ai_monitor_bot` (must end with 'bot')
6. **Copy the bot token** (you'll need this for your app)

### 2. Configure Bot Settings

Send these commands to @BotFather:

```
/setprivacy - Disable (allows bot to read all messages)
/setjoingroups - Enable (allows bot to join groups)
/setcommands - Set up commands menu
```

### 3. Set Up Environment Variables

Add these to your `.env` file:

```bash
# Telegram Bot Configuration
EXPO_PUBLIC_TELEGRAM_BOT_TOKEN=your_bot_token_here
EXPO_PUBLIC_WEBHOOK_URL=https://your-server.com/api
```

### 4. Deploy Webhook Handler

Deploy the webhook handler to your server:

```javascript
// server.js
const express = require('express');
const telegramWebhook = require('./backend/webhooks/telegramWebhook');

const app = express();
app.use(express.json());
app.use('/api', telegramWebhook);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 5. Initialize Bot Service

In your React Native app:

```javascript
import { telegramBotService } from './app/services/telegramBotService';

// Initialize the bot service
useEffect(() => {
  const initBot = async () => {
    await telegramBotService.initialize();
  };
  initBot();
}, []);
```

## 🔧 How It Works

### Real-Time Message Flow:

```
Child's Telegram → Bot API → Webhook → Your Server → Database → Parent Dashboard
```

### 1. **Child Adds Bot**:
   - Child adds your bot to their Telegram
   - Bot can now see messages in that chat

### 2. **Message Monitoring**:
   - Bot receives all messages in real-time
   - Content is analyzed for inappropriate material
   - Flagged messages are stored in database

### 3. **Parent Alerts**:
   - Parents receive real-time alerts
   - Full conversation history is available
   - AI analysis provides context

## 📱 User Experience

### For Parents:
1. **Setup**: Add bot token to app settings
2. **Invite Child**: Send bot invite link to child
3. **Monitor**: View real-time alerts and conversations
4. **Manage**: Block contacts or set restrictions

### For Children:
1. **Add Bot**: Click invite link to add bot to Telegram
2. **Normal Usage**: Use Telegram normally
3. **Transparency**: Bot shows when monitoring is active

## 🛡️ Privacy & Security

### Data Protection:
- **Encryption**: All data is encrypted in transit and at rest
- **Consent**: Child must explicitly add the bot
- **Transparency**: Bot shows monitoring status
- **Control**: Parents can disable monitoring anytime

### Legal Compliance:
- **Consent Required**: Child must add bot voluntarily
- **Data Minimization**: Only flagged content is stored
- **Right to Delete**: Parents can delete all data
- **Audit Trail**: All actions are logged

## 🔍 Monitoring Features

### Real-Time Analysis:
- **Content Filtering**: Detects inappropriate language
- **Context Awareness**: Understands conversation context
- **Severity Levels**: High, Medium, Low risk assessment
- **Confidence Scoring**: AI confidence in analysis

### Alert Types:
- **Immediate Alerts**: Critical content (violence, self-harm)
- **Daily Summaries**: Overview of flagged conversations
- **Weekly Reports**: Detailed analysis and trends
- **Custom Alerts**: Parent-defined keywords

## 📊 Database Schema

### Tables Used:
- `conversation_logs`: All monitored conversations
- `flagged_content`: Inappropriate content detected
- `real_time_alerts`: Immediate parent notifications
- `family_links`: Parent-child relationships

## 🧪 Testing

### Test the Integration:

1. **Create Test Bot**:
   ```bash
   # Use BotFather to create a test bot
   /newbot
   # Name: Test Guardian Bot
   # Username: test_guardian_bot
   ```

2. **Add Bot to Test Chat**:
   - Create a test group with the bot
   - Send test messages with inappropriate content
   - Check if alerts are generated

3. **Verify Webhook**:
   ```bash
   curl -X POST https://your-server.com/api/telegram-webhook \
     -H "Content-Type: application/json" \
     -d '{"message":{"from":{"id":123,"first_name":"Test"},"chat":{"id":456,"title":"Test Chat"},"text":"test message","date":1234567890}}'
   ```

## 🚨 Troubleshooting

### Common Issues:

1. **Bot Not Receiving Messages**:
   - Check if privacy is disabled
   - Verify bot is added to the chat
   - Check webhook URL is accessible

2. **Webhook Not Working**:
   - Verify server is running
   - Check webhook URL is correct
   - Test with curl command

3. **Database Errors**:
   - Check Supabase connection
   - Verify table schemas
   - Check RLS policies

### Debug Commands:

```bash
# Check bot info
curl https://api.telegram.org/bot<TOKEN>/getMe

# Check webhook status
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo

# Test webhook
curl -X POST https://your-server.com/api/telegram-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

## 📈 Performance Considerations

### Optimization:
- **Rate Limiting**: Respect Telegram's API limits
- **Caching**: Cache frequently accessed data
- **Batch Processing**: Process multiple messages together
- **Error Handling**: Robust error handling and retries

### Monitoring:
- **Uptime**: Monitor webhook availability
- **Response Time**: Track API response times
- **Error Rate**: Monitor failed requests
- **Usage**: Track API usage and costs

## 🔄 Maintenance

### Regular Tasks:
1. **Update Bot Commands**: Keep bot commands current
2. **Monitor Performance**: Check response times
3. **Update Content Filters**: Improve detection accuracy
4. **Backup Data**: Regular database backups
5. **Security Updates**: Keep dependencies updated

## 💡 Advanced Features

### Future Enhancements:
- **AI Integration**: Use OpenAI for better content analysis
- **Image Analysis**: Monitor shared images and videos
- **Voice Messages**: Transcribe and analyze voice messages
- **Group Monitoring**: Monitor group conversations
- **Custom Filters**: Parent-defined monitoring rules

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Telegram Bot API documentation
3. Test with the debug commands
4. Check server logs for errors

The Telegram Bot API provides a legal, effective way to monitor Telegram messages in real-time while respecting user privacy and platform policies.
