import { supabase } from '../supabase'

// Minimal client-safe API used by the app screens

export const recentAlertsAPI = {
  async getRecentAlerts(guardianId) {
    const { data, error } = await supabase
      .from('recent_alerts')
      .select(`
        *,
        child_profiles (
          name,
          age
        )
      `)
      .eq('guardian_id', guardianId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error
    return data
  },

  async getUnreadAlertsCount(guardianId) {
    const { count, error } = await supabase
      .from('recent_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('guardian_id', guardianId)
      .eq('read', false)

    if (error) throw error
    return count || 0
  }
}

export const summaryAPI = {
  async getSummary(childId) {
    const { data, error } = await supabase
      .from('summary')
      .select('*')
      .eq('child_id', childId)
      .order('date', { ascending: false })
      .limit(7)

    if (error) throw error
    return data
  }
}

export const guardianClient = {
  recentAlerts: recentAlertsAPI,
  summary: summaryAPI,
}

export default guardianClient


