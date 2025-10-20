# 🤖 Telegram Bot Setup Guide for Guardian AI

## 🎯 **Complete Telegram Bot Implementation**

### **Step 1: Create a Telegram Bot**

1. **Open Telegram** and search for `@BotFather`
2. **Click Start** to begin
3. **Type `/newbot`** and send
4. **Follow the instructions:**
   - Choose a name for your bot (e.g., "Guardian AI Monitor")
   - Choose a username (e.g., "guardian_ai_monitor_bot")
5. **Save the Bot Token** - you'll receive a message like:
   ```
   Use this token to access the HTTP API:
   123456789:ABCdefGHIjklMNOpqrsTUVwxyz
   ```

### **Step 2: Get Your Chat ID**

#### **Method 1: Using Bot API**

1. **Start a chat with your bot** (search for your bot's username)
2. **Send `/start`** to your bot
3. **Open this URL in your browser:**
   ```
   https://api.telegram.org/bot{your_bot_token}/getUpdates
   ```
   Replace `{your_bot_token}` with your actual bot token
4. **Look for the chat ID** in the response:
   ```json
   {
     "chat": {
       "id": 123456789,
       "type": "private"
     }
   }
   ```

#### **Method 2: Using @userinfobot**

1. **Search for `@userinfobot`** in Telegram
2. **Send `/start`** to get your user info
3. **Your Chat ID will be displayed**

### **Step 3: Database Setup**

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of telegram_bot_tables.sql
```

This creates all necessary tables for Telegram Bot monitoring.

### **Step 4: Configure the Bot**

1. **Navigate to Telegram Setup** in your Guardian AI app
2. **Enter your Bot Token** (from Step 1)
3. **Enter your Chat ID** (from Step 2)
4. **Click "🤖 Connect Bot"**

## 🚀 **How It Works**

### **Real-Time Monitoring Flow:**

1. **📱 Child sends message** → Bot receives it instantly
2. **🤖 AI Analysis** → OpenAI GPT-4 analyzes content
3. **🔍 Custom Filter Check** → Compares against parent's filters
4. **🚨 Alert Generation** → Creates alert if content is flagged
5. **📲 Parent Notification** → Sends alert to parent's Telegram
6. **📊 Home Page Update** → Alert appears in Recent Alerts

### **Key Features:**

- **✅ Real-time message monitoring** via Telegram Bot
- **✅ AI-powered content analysis** with OpenAI GPT-4
- **✅ Custom filter support** for personalized monitoring
- **✅ Instant Telegram notifications** to parents
- **✅ Multi-chat support** - private chats, groups, channels
- **✅ Privacy-focused** - only monitors flagged content
- **✅ Chat management** - enable/disable monitoring per chat

## 🔧 **Technical Implementation**

### **Services Created:**

1. **`telegramBotService.js`** - Main Telegram Bot integration
2. **`TelegramSetupScreen.jsx`** - Bot configuration interface
3. **Database tables** - Store bot configs, chats, messages, alerts

### **Database Tables:**

- **`telegram_bot_configs`** - Store bot tokens and configurations
- **`parent_telegram_chats`** - Store parent chat IDs for notifications
- **`telegram_chats`** - Store monitored chat information
- **`telegram_messages`** - Store all monitored messages
- **`telegram_bot_webhooks`** - Store webhook configurations

### **Security Features:**

- **Row Level Security (RLS)** on all tables
- **Parent-only access** to their children's data
- **Encrypted bot token storage**
- **Secure message monitoring**
- **Audit logging** for all monitoring activities

## 📋 **Testing Instructions**

### **Test 1: Bot Connection**

1. Go to **Telegram Setup** screen
2. Enter your Bot Token and Chat ID
3. Click **"🤖 Connect Bot"**
4. Verify connection status shows "Connected"

### **Test 2: Message Monitoring**

1. Send a test message to your bot
2. Check if message appears in monitored chats
3. Verify message is stored in database

### **Test 3: AI Analysis**

1. Send message with flagged content to your bot
2. Check if alert is generated
3. Verify alert appears in Recent Alerts on home page

### **Test 4: Parent Notifications**

1. Send inappropriate content via Telegram to your bot
2. Verify parent receives instant notification on Telegram
3. Check alert details and AI reasoning

## 🎉 **Expected Results**

### **✅ Success Indicators:**

- Bot connects successfully
- Messages are monitored in real-time
- AI analysis works correctly
- Alerts are generated for flagged content
- Parent receives Telegram notifications
- Alerts appear in Recent Alerts section

### **🔍 What You'll See:**

- **Connection Status**: "Connected" with green indicator
- **Monitored Chats**: List of all detected chats
- **Real-time Alerts**: Instant notifications for flagged content
- **Telegram Notifications**: Alerts sent directly to parent's Telegram
- **AI Analysis**: Detailed reasoning for each alert

## 🆘 **Troubleshooting**

### **❌ Bot Connection Issues:**

1. Verify Bot Token is correct
2. Check Chat ID is valid
3. Ensure bot is started with `/start`
4. Check internet connection

### **❌ No Messages Detected:**

1. Check if bot is receiving messages
2. Verify polling is active
3. Check database for stored messages
4. Review console logs for errors

### **❌ Alerts Not Generated:**

1. Verify custom filters are set up
2. Check AI analysis is working
3. Ensure alert threshold is appropriate
4. Review OpenAI API key and quota

### **❌ Parent Notifications Not Sent:**

1. Verify parent Chat ID is correct
2. Check bot can send messages to parent
3. Ensure notification service is active
4. Review Telegram API limits

## 🚀 **Ready to Monitor!**

Your Telegram Bot monitoring system is now fully set up and ready to protect your children! The system will:

- **Monitor all Telegram messages** in real-time via Bot API
- **Analyze content** with advanced AI
- **Send instant alerts** to parents via Telegram
- **Respect privacy** while ensuring safety
- **Provide detailed insights** about online activity

The monitoring is now active and will protect your children from inappropriate content on Telegram! 🛡️

## 📞 **Support**

If you need help with setup or encounter any issues:

1. **Check the console logs** for detailed error messages
2. **Verify your Bot Token** and Chat ID are correct
3. **Test the Bot API** directly using the URLs provided
4. **Review the database** to ensure tables are created correctly

Your Guardian AI Telegram Bot monitoring system is ready to keep your children safe! 🚀
