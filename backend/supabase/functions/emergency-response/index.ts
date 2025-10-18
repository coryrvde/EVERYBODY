import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmergencyData {
  userId: string
  emergencyType: string
  location?: {
    lat: number
    lng: number
    address?: string
  }
  description?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { emergencyData }: { emergencyData: EmergencyData } = await req.json()

    if (!emergencyData.userId || !emergencyData.emergencyType) {
      throw new Error('Missing required emergency data')
    }

    // Get user profile and emergency contacts
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('id', emergencyData.userId)
      .single()

    if (profileError) throw profileError

    const { data: emergencyContacts, error: contactsError } = await supabaseClient
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', emergencyData.userId)
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (contactsError) throw contactsError

    // Create emergency alert
    const { data: alert, error: alertError } = await supabaseClient
      .from('security_alerts')
      .insert({
        user_id: emergencyData.userId,
        alert_type: 'emergency',
        severity: emergencyData.severity,
        title: `Emergency: ${emergencyData.emergencyType}`,
        description: emergencyData.description,
        location: emergencyData.location,
        status: 'active'
      })
      .select()
      .single()

    if (alertError) throw alertError

    // Send notifications to emergency contacts
    const notificationPromises = emergencyContacts.map(contact =>
      sendEmergencyNotification(contact, emergencyData, profile)
    )

    await Promise.all(notificationPromises)

    // Log emergency activation
    await supabaseClient
      .from('activity_logs')
      .insert({
        user_id: emergencyData.userId,
        activity_type: 'emergency_activated',
        description: `Emergency response activated: ${emergencyData.emergencyType}`,
        metadata: {
          alert_id: alert.id,
          emergency_type: emergencyData.emergencyType,
          contacts_notified: emergencyContacts.length,
          location: emergencyData.location
        }
      })

    // If critical emergency, also notify authorities (simulation)
    if (emergencyData.severity === 'critical') {
      await notifyAuthorities(emergencyData, profile)
    }

    return new Response(
      JSON.stringify({
        success: true,
        alert: alert,
        contactsNotified: emergencyContacts.length,
        response: {
          status: 'emergency_protocol_activated',
          estimatedResponseTime: '5-10 minutes',
          nextSteps: [
            'Stay in a safe location if possible',
            'Emergency contacts have been notified',
            'Local authorities alerted for critical emergencies'
          ]
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Emergency response error:', error)
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

async function sendEmergencyNotification(contact: any, emergencyData: EmergencyData, profile: any) {
  // Simulate sending SMS/email to emergency contact
  const message = `EMERGENCY ALERT: ${profile.full_name} has activated an emergency response.

Type: ${emergencyData.emergencyType}
Location: ${emergencyData.location?.address || 'Unknown'}
Time: ${new Date().toISOString()}

Please contact them immediately or call emergency services if you cannot reach them.

Guardian AI Emergency System`

  console.log(`Sending emergency notification to ${contact.name} (${contact.phone}):`, message)

  // In production, integrate with:
  // - Twilio for SMS
  // - SendGrid/Mailgun for email
  // - Push notifications
}

async function notifyAuthorities(emergencyData: EmergencyData, profile: any) {
  // Simulate notifying local authorities
  const authorityAlert = {
    incidentType: emergencyData.emergencyType,
    location: emergencyData.location,
    personDetails: {
      name: profile.full_name,
      phone: profile.phone,
      emergencyContact: profile.emergency_contact
    },
    timestamp: new Date().toISOString(),
    source: 'Guardian AI System'
  }

  console.log('Notifying authorities:', authorityAlert)

  // In production, integrate with:
  // - Local emergency services API
  // - Police non-emergency lines
  // - Emergency dispatch systems
}
