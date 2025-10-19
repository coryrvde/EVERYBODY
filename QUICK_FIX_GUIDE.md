# Fix AuthSessionMissingError - Quick Setup Guide

## 🚨 The Error You're Seeing

```
Error initializing data: AuthSessionMissingError: Auth session missing!
```

This error occurs because the database tables don't exist yet in your Supabase project.

## ✅ Quick Fix (2 Steps)

### Step 1: Run Database Setup Script

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `uizxwrbuvfqrafmcfnak`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste the Setup Script:**
   - Copy the entire contents of `database-setup.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute the script

### Step 2: Restart Your App

1. **Stop your Expo development server** (Ctrl+C)
2. **Restart it:**
   ```bash
   npx expo start --clear
   ```

## 🎯 What This Fixes

The setup script creates:
- ✅ **All database tables** needed for Telegram monitoring
- ✅ **Sample data** including "greens" drug slang detection
- ✅ **Proper permissions** for the app to access data
- ✅ **Indexes** for better performance

## 🧪 Test the Fix

After running the setup script, you should see:
- ✅ No more "AuthSessionMissingError"
- ✅ AI monitoring status shows "Active"
- ✅ Telegram monitoring shows "Active"
- ✅ Sample conversation logs appear
- ✅ Test AI button works with "greens" detection

## 📊 Sample Data Included

The setup creates realistic test data:
- **Child:** Olivia Johnson (15 years old)
- **Contact:** Alex Smith (medium risk)
- **Messages:** Including "Want to smoke some greens tonight?"
- **AI Analysis:** Drug slang detection results
- **Alerts:** Real-time parent notifications

## 🔍 Verify It's Working

1. **Check the Console:** No more auth errors
2. **AI Monitoring Card:** Shows "Active" status
3. **Telegram Monitor Card:** Shows "Active" status
4. **Test AI Button:** Try the "greens" detection
5. **Conversation Logs:** Sample flagged content appears

## 🚨 If You Still Get Errors

If you still see errors after running the setup script:

1. **Check Supabase Project:**
   - Make sure you're in the correct project
   - Verify the URL matches: `uizxwrbuvfqrafmcfnak.supabase.co`

2. **Check API Key:**
   - The anon key should match what's in `app/supabase.js`

3. **Run the Script Again:**
   - Sometimes it needs to be run twice
   - Check for any error messages in the SQL Editor

4. **Clear App Cache:**
   ```bash
   npx expo start --clear
   ```

## 🎉 Success!

Once the setup is complete, your Guardian AI app will have:
- ✅ **Full Telegram monitoring** with drug slang detection
- ✅ **Real-time AI analysis** of conversations
- ✅ **Parent alerts** for inappropriate content
- ✅ **"Greens" detection** working perfectly
- ✅ **No more authentication errors**

The system is now ready to detect when a child uses slang like "greens" in contexts that suggest drug use! 🛡️
