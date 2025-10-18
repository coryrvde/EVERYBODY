# Guardian AI Backend

This directory contains the complete backend infrastructure for the Guardian AI mobile application.

## 🏗️ Architecture

The backend is built using Supabase with the following components:

- **Database**: PostgreSQL with custom tables and Row Level Security
- **Authentication**: Supabase Auth with custom user profiles
- **Edge Functions**: Server-side logic for AI processing and emergency response
- **Real-time**: Live updates for alerts, insights, and device status
- **API**: Comprehensive API layer for frontend integration

## 📁 Directory Structure

```
backend/
├── supabase/
│   ├── migrations/
│   │   └── 001_initial_schema.sql    # Database schema
│   └── functions/
│       ├── process-alert/
│       │   └── index.ts              # AI alert processing
│       └── emergency-response/
│           └── index.ts              # Emergency coordination
├── api/
│   └── guardian-api.js               # Frontend API functions
└── README.md                         # This file
```

## 🗄️ Database Schema

### Core Tables

- **`profiles`** - Extended user information
- **`security_alerts`** - Security incidents and alerts
- **`activity_logs`** - User activity tracking
- **`ai_insights`** - AI-generated insights and recommendations
- **`devices`** - Registered user devices
- **`emergency_contacts`** - Emergency contact information
- **`system_settings`** - User preferences and settings

### Security Features

- Row Level Security (RLS) on all tables
- User-specific data isolation
- Secure authentication flows
- Audit logging for sensitive operations

## 🚀 Edge Functions

### Process Alert (`/process-alert`)

- AI-powered alert analysis
- Severity determination
- Automated notifications
- Insight generation

**Usage:**

```javascript
const { data } = await supabase.functions.invoke("process-alert", {
  body: {
    alertData: {
      userId: "user-uuid",
      alertType: "intrusion",
      title: "Motion detected",
      location: { lat: 40.7128, lng: -74.006 },
    },
  },
});
```

### Emergency Response (`/emergency-response`)

- Emergency protocol activation
- Contact notification system
- Authority coordination
- Response tracking

**Usage:**

```javascript
const { data } = await supabase.functions.invoke("emergency-response", {
  body: {
    emergencyData: {
      userId: "user-uuid",
      emergencyType: "medical_emergency",
      severity: "critical",
      location: { lat: 40.7128, lng: -74.006, address: "123 Main St" },
    },
  },
});
```

## 📱 API Integration

Import the API functions in your React Native app:

```javascript
import { guardianAPI } from "./backend/api/guardian-api";

// Get user alerts
const alerts = await guardianAPI.alerts.getAlerts({ status: "active" });

// Create new alert
const alert = await guardianAPI.alerts.createAlert({
  alert_type: "suspicious_activity",
  title: "Unusual activity detected",
  severity: "medium",
});

// Real-time subscriptions
const subscription = guardianAPI.realtime.subscribeToAlerts((payload) => {
  console.log("New alert:", payload.new);
});
```

## 🔧 Setup Instructions

### 1. Database Setup

Run the migration in your Supabase dashboard:

```sql
-- Execute the contents of backend/supabase/migrations/001_initial_schema.sql
```

### 2. Deploy Edge Functions

Deploy the functions to Supabase:

```bash
supabase functions deploy process-alert
supabase functions deploy emergency-response
```

### 3. Environment Variables

Set these in your Supabase Edge Functions:

```bash
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
```

### 4. API Integration

Import and use the API in your React Native app:

```javascript
import { guardianAPI } from "./backend/api/guardian-api";

// Use throughout your app
const user = await guardianAPI.auth.getCurrentUser();
const alerts = await guardianAPI.alerts.getAlerts();
```

## 🔐 Security Considerations

- All database queries include user ID filtering
- Row Level Security prevents unauthorized access
- Authentication required for all operations
- Sensitive data encrypted at rest
- Audit logs for security events

## 📊 Real-time Features

### Available Subscriptions

- **Alerts**: Live security alert notifications
- **Insights**: Real-time AI insights
- **Devices**: Device status updates

### Usage Example

```javascript
// Subscribe to new alerts
const alertSub = guardianAPI.realtime.subscribeToAlerts((payload) => {
  if (payload.eventType === "INSERT") {
    showNotification(payload.new);
  }
});

// Subscribe to AI insights
const insightSub = guardianAPI.realtime.subscribeToInsights((payload) => {
  updateInsightsList(payload.new);
});

// Cleanup subscriptions
alertSub.unsubscribe();
insightSub.unsubscribe();
```

## 🧪 Testing

### Manual Testing

1. Create test user accounts
2. Generate sample alerts
3. Test emergency response
4. Verify real-time updates
5. Check notification delivery

### API Testing

```javascript
// Test authentication
await guardianAPI.auth.getCurrentUser();

// Test alert creation
await guardianAPI.alerts.createAlert({
  alert_type: "test",
  title: "Test Alert",
  severity: "low",
});

// Test emergency response
await guardianAPI.emergency.triggerEmergency({
  emergencyType: "test_emergency",
  severity: "medium",
});
```

## 🚨 Emergency Response Flow

1. **Detection**: Alert triggered by app or sensor
2. **AI Analysis**: Edge function analyzes threat level
3. **Notification**: Emergency contacts alerted
4. **Escalation**: Authorities notified for critical emergencies
5. **Response**: Coordinated emergency response
6. **Resolution**: Status updates and follow-up

## 🔄 Data Flow

```
Mobile App → Supabase Auth → API Functions → Database
              ↓
       Edge Functions ← AI Processing
              ↓
       Real-time Updates → Mobile App
```

## 📈 Scaling Considerations

- Edge Functions auto-scale with demand
- Database indexes optimize query performance
- Real-time subscriptions use efficient change detection
- CDN caching for static assets

## 🔧 Maintenance

### Regular Tasks

- Monitor Edge Function performance
- Review and optimize database queries
- Update AI models and analysis logic
- Maintain emergency contact accuracy

### Backup Strategy

- Daily automated database backups
- User data export capabilities
- Recovery testing procedures

## 📞 Support

For backend issues or questions:

1. Check Supabase dashboard for function logs
2. Review database query performance
3. Monitor real-time connection health
4. Validate API response formats
