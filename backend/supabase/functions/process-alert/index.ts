import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AlertData {
  userId: string
  alertType: string
  title: string
  description?: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  mediaUrls?: string[]
  sensorData?: any
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { alertData }: { alertData: AlertData } = await req.json()

    if (!alertData.userId || !alertData.alertType || !alertData.title) {
      throw new Error('Missing required alert data')
    }

    // AI Analysis Simulation (replace with actual AI service)
    const aiAnalysis = await analyzeAlertWithAI(alertData)

    // Determine severity based on AI analysis
    const severity = determineSeverity(aiAnalysis.confidence, alertData.alertType)

    // Insert alert into database
    const { data: alert, error: alertError } = await supabaseClient
      .from('security_alerts')
      .insert({
        user_id: alertData.userId,
        alert_type: alertData.alertType,
        severity: severity,
        title: alertData.title,
        description: alertData.description,
        location: alertData.location,
        media_urls: alertData.mediaUrls,
        ai_confidence: aiAnalysis.confidence,
        ai_analysis: aiAnalysis,
        status: 'active'
      })
      .select()
      .single()

    if (alertError) {
      throw alertError
    }

    // Log the activity
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: alertData.userId,
        activity_type: 'alert_created',
        description: `Security alert created: ${alertData.title}`,
        metadata: {
          alert_id: alert.id,
          alert_type: alertData.alertType,
          ai_confidence: aiAnalysis.confidence
        }
      })

    // Send push notifications if critical
    if (severity === 'critical' || severity === 'high') {
      await sendPushNotification(alertData.userId, alert)
    }

    // Generate AI insights if applicable
    if (aiAnalysis.shouldGenerateInsight) {
      await generateAIInsight(supabaseClient, alertData.userId, aiAnalysis)
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert: alert,
        aiAnalysis: aiAnalysis
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error processing alert:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// AI Analysis function (mock implementation - replace with actual AI service)
async function analyzeAlertWithAI(alertData: AlertData) {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock AI analysis based on alert type
  const analysis = {
    threatLevel: 'medium',
    confidence: 0.85,
    detectedObjects: ['person', 'motion'],
    riskFactors: ['unusual_timing', 'unknown_location'],
    recommendations: [
      'Verify identity through camera',
      'Check emergency contacts',
      'Enable additional security measures'
    ],
    shouldGenerateInsight: true,
    insight: {
      type: 'behavioral_pattern',
      description: 'Unusual activity detected outside normal hours'
    }
  }

  // Adjust analysis based on alert type
  switch (alertData.alertType) {
    case 'intrusion':
      analysis.confidence = 0.92
      analysis.threatLevel = 'high'
      break
    case 'emergency':
      analysis.confidence = 0.98
      analysis.threatLevel = 'critical'
      break
    case 'suspicious_activity':
      analysis.confidence = 0.78
      analysis.threatLevel = 'medium'
      break
  }

  return analysis
}

function determineSeverity(confidence: number, alertType: string): string {
  if (alertType === 'emergency') return 'critical'
  if (confidence > 0.9) return 'high'
  if (confidence > 0.7) return 'medium'
  return 'low'
}

async function sendPushNotification(userId: string, alert: any) {
  // Implementation for sending push notifications
  // This would integrate with FCM/APNs or similar service
  console.log(`Sending push notification to user ${userId} for alert ${alert.id}`)
}

async function generateAIInsight(supabaseClient: any, userId: string, aiAnalysis: any) {
  if (!aiAnalysis.shouldGenerateInsight) return

  await supabaseClient
    .from('ai_insights')
    .insert({
      user_id: userId,
      insight_type: aiAnalysis.insight.type,
      title: 'Security Pattern Detected',
      description: aiAnalysis.insight.description,
      confidence_score: aiAnalysis.confidence,
      data: aiAnalysis,
      recommendation: aiAnalysis.recommendations[0]
    })
}
