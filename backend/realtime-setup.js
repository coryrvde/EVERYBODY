// ============================================================================
// GUARDIAN AI REAL-TIME SETUP
// This file demonstrates how to set up real-time subscriptions in your React Native app
// ============================================================================

import { guardianAPI } from './api/guardian-api'
import { supabase } from '../app/supabase'

// ===========================
// REAL-TIME SUBSCRIPTION MANAGER
// ===========================

class RealtimeManager {
  constructor() {
    this.subscriptions = new Map()
    this.isConnected = false
  }

  // Initialize all real-time subscriptions
  async initialize() {
    try {
      console.log('Initializing real-time subscriptions...')

      // Check authentication
      const user = await guardianAPI.auth.getCurrentUser()
      if (!user) {
        console.warn('No authenticated user for real-time subscriptions')
        return
      }

      // Set up all subscriptions
      this.setupAlertSubscription()
      this.setupInsightSubscription()
      this.setupDeviceSubscription()

      this.isConnected = true
      console.log('Real-time subscriptions initialized')

    } catch (error) {
      console.error('Failed to initialize real-time subscriptions:', error)
    }
  }

  // Set up alert notifications
  setupAlertSubscription() {
    const subscription = guardianAPI.realtime.subscribeToAlerts((payload) => {
      this.handleAlertUpdate(payload)
    })

    this.subscriptions.set('alerts', subscription)
  }

  // Set up AI insights notifications
  setupInsightSubscription() {
    const subscription = guardianAPI.realtime.subscribeToInsights((payload) => {
      this.handleInsightUpdate(payload)
    })

    this.subscriptions.set('insights', subscription)
  }

  // Set up device status updates
  setupDeviceSubscription() {
    const subscription = guardianAPI.realtime.subscribeToDevices((payload) => {
      this.handleDeviceUpdate(payload)
    })

    this.subscriptions.set('devices', subscription)
  }

  // Handle incoming alert updates
  async handleAlertUpdate(payload) {
    const { eventType, new: alertData, old: oldAlertData } = payload

    console.log('Alert update received:', eventType, alertData)

    switch (eventType) {
      case 'INSERT':
        await this.onAlertCreated(alertData)
        break
      case 'UPDATE':
        await this.onAlertUpdated(alertData, oldAlertData)
        break
      case 'DELETE':
        await this.onAlertDeleted(alertData)
        break
    }
  }

  // Handle incoming insight updates
  async handleInsightUpdate(payload) {
    const { eventType, new: insightData } = payload

    console.log('Insight update received:', eventType, insightData)

    if (eventType === 'INSERT') {
      await this.onInsightCreated(insightData)
    }
  }

  // Handle device updates
  async handleDeviceUpdate(payload) {
    const { eventType, new: deviceData } = payload

    console.log('Device update received:', eventType, deviceData)

    switch (eventType) {
      case 'INSERT':
        await this.onDeviceAdded(deviceData)
        break
      case 'UPDATE':
        await this.onDeviceUpdated(deviceData)
        break
    }
  }

  // Alert event handlers
  async onAlertCreated(alert) {
    // Show push notification
    this.showPushNotification({
      title: 'Security Alert',
      body: alert.title,
      data: { alertId: alert.id, type: 'alert' }
    })

    // Update UI (emit event to React components)
    this.emitToUI('alertCreated', alert)

    // Auto-process critical alerts
    if (alert.severity === 'critical') {
      await this.handleCriticalAlert(alert)
    }
  }

  async onAlertUpdated(newAlert, oldAlert) {
    // Only notify if status changed to resolved
    if (oldAlert.status !== 'resolved' && newAlert.status === 'resolved') {
      this.showPushNotification({
        title: 'Alert Resolved',
        body: `${newAlert.title} has been resolved`,
        data: { alertId: newAlert.id, type: 'alert_resolved' }
      })
    }

    this.emitToUI('alertUpdated', { new: newAlert, old: oldAlert })
  }

  async onAlertDeleted(alert) {
    this.emitToUI('alertDeleted', alert)
  }

  // Insight event handlers
  async onInsightCreated(insight) {
    this.showPushNotification({
      title: 'AI Insight',
      body: insight.title,
      data: { insightId: insight.id, type: 'insight' }
    })

    this.emitToUI('insightCreated', insight)
  }

  // Device event handlers
  async onDeviceAdded(device) {
    this.emitToUI('deviceAdded', device)
  }

  async onDeviceUpdated(device) {
    this.emitToUI('deviceUpdated', device)
  }

  // Critical alert handling
  async handleCriticalAlert(alert) {
    console.log('Handling critical alert:', alert.id)

    // Could trigger emergency response automatically
    // await guardianAPI.emergency.triggerEmergency({
    //   emergencyType: 'critical_alert',
    //   severity: 'critical',
    //   description: alert.description
    // })

    // Enhanced notification for critical alerts
    this.showCriticalNotification(alert)
  }

  // Push notification helper
  showPushNotification(notification) {
    // Implementation depends on your push notification service
    // Example with Expo Notifications
    /*
    import * as Notifications from 'expo-notifications'

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: notification.data,
        sound: 'default',
      },
      trigger: null, // Show immediately
    })
    */

    console.log('Push notification:', notification)
  }

  // Critical notification (different styling/sound)
  showCriticalNotification(alert) {
    this.showPushNotification({
      title: '🚨 CRITICAL ALERT',
      body: alert.title,
      data: { alertId: alert.id, type: 'critical_alert', priority: 'max' }
    })
  }

  // Emit events to React components
  emitToUI(eventType, data) {
    // Implementation depends on your state management solution
    // Example with React Native EventEmitter or Context

    /*
    // If using EventEmitter
    import { EventEmitter } from 'events'
    const eventEmitter = new EventEmitter()
    eventEmitter.emit(eventType, data)

    // If using Context or Redux
    // dispatch({ type: eventType, payload: data })
    */

    console.log('Emitting to UI:', eventType, data)
  }

  // Cleanup all subscriptions
  disconnect() {
    console.log('Disconnecting real-time subscriptions...')

    this.subscriptions.forEach((subscription, name) => {
      subscription.unsubscribe()
      console.log(`Unsubscribed from ${name}`)
    })

    this.subscriptions.clear()
    this.isConnected = false
  }

  // Get connection status
  getStatus() {
    return {
      isConnected: this.isConnected,
      activeSubscriptions: Array.from(this.subscriptions.keys())
    }
  }

  // Reconnect (useful after network issues)
  async reconnect() {
    this.disconnect()
    await this.initialize()
  }
}

// ===========================
// REACT HOOK FOR REAL-TIME UPDATES
// ===========================

// Custom hook for using real-time updates in React components
export const useRealtimeUpdates = () => {
  const [alerts, setAlerts] = React.useState([])
  const [insights, setInsights] = React.useState([])
  const [devices, setDevices] = React.useState([])
  const [isConnected, setIsConnected] = React.useState(false)

  React.useEffect(() => {
    const realtimeManager = new RealtimeManager()

    // Set up event listeners for UI updates
    const alertHandler = (alert) => {
      setAlerts(prev => [alert, ...prev.slice(0, 49)]) // Keep last 50
    }

    const insightHandler = (insight) => {
      setInsights(prev => [insight, ...prev.slice(0, 49)])
    }

    const deviceHandler = (device) => {
      setDevices(prev => {
        const existing = prev.find(d => d.id === device.id)
        if (existing) {
          return prev.map(d => d.id === device.id ? device : d)
        }
        return [device, ...prev]
      })
    }

    // Initialize subscriptions
    realtimeManager.initialize().then(() => {
      setIsConnected(true)
    })

    // Cleanup on unmount
    return () => {
      realtimeManager.disconnect()
      setIsConnected(false)
    }
  }, [])

  return {
    alerts,
    insights,
    devices,
    isConnected,
    clearAlerts: () => setAlerts([]),
    clearInsights: () => setInsights([]),
    markInsightAsRead: async (insightId) => {
      await guardianAPI.insights.markInsightAsRead(insightId)
      setInsights(prev => prev.map(i =>
        i.id === insightId ? { ...i, is_read: true } : i
      ))
    }
  }
}

// ===========================
// NOTIFICATION SETUP
// ===========================

export const setupNotifications = async () => {
  // Request permissions and set up notification handling
  /*
  import * as Notifications from 'expo-notifications'

  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') {
    alert('Notification permissions are required for Guardian AI')
    return
  }

  // Set notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  // Handle notification taps
  Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data

    // Navigate to appropriate screen based on notification type
    if (data.type === 'alert') {
      navigation.navigate('AlertDetails', { alertId: data.alertId })
    } else if (data.type === 'insight') {
      navigation.navigate('Insights')
    }
  })
  */

  console.log('Notification setup completed')
}

// ===========================
// EXPORT SINGLETON INSTANCE
// ===========================

export const realtimeManager = new RealtimeManager()

export default {
  RealtimeManager,
  useRealtimeUpdates,
  setupNotifications,
  realtimeManager
}
