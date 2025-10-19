import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  TextInput,
  Alert
} from 'react-native';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  MessageCircle, 
  Clock,
  ChevronRight,
  TrendingUp,
  Shield,
  Bot,
  Activity
} from 'lucide-react-native';
import AIContentDetector from '../services/aiContentDetector';
import RealTimeMonitor from '../services/realTimeMonitor';
import TelegramMonitor from '../services/telegramMonitor';
import { AIMonitoringConfig, getSeverityColor, getSeverityBackground } from '../config/aiMonitoringConfig';

export default function ConversationHistoryScreen() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [aiMonitoringStatus, setAiMonitoringStatus] = useState({
    enabled: true,
    realTimeAnalysis: true,
    lastAnalysis: null
  });
  const [realTimeAlerts, setRealTimeAlerts] = useState([]);
  const [telegramMonitoringStatus, setTelegramMonitoringStatus] = useState({
    enabled: true,
    active: false
  });

  // Initialize AI monitoring
  useEffect(() => {
    initializeAIMonitoring();
    initializeTelegramMonitoring();
    return () => {
      RealTimeMonitor.stopMonitoring();
      TelegramMonitor.stopTelegramMonitoring();
    };
  }, []);

  const initializeAIMonitoring = async () => {
    try {
      // Start real-time monitoring
      await RealTimeMonitor.startMonitoring('olivia');
      
      // Set up alert callback
      RealTimeMonitor.addAlertCallback((alert) => {
        setRealTimeAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        showAlertNotification(alert);
      });
      
      // Update monitoring status
      setAiMonitoringStatus(prev => ({
        ...prev,
        lastAnalysis: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('Error initializing AI monitoring:', error);
    }
  };

  const initializeTelegramMonitoring = async () => {
    try {
      // Start Telegram monitoring
      await TelegramMonitor.startTelegramMonitoring('olivia');
      
      // Set up Telegram alert callback
      TelegramMonitor.addAlertCallback((alert) => {
        setRealTimeAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep last 10 alerts
        showAlertNotification(alert);
      });
      
      // Update Telegram monitoring status
      setTelegramMonitoringStatus(prev => ({
        ...prev,
        active: true
      }));
      
    } catch (error) {
      console.error('Error initializing Telegram monitoring:', error);
    }
  };

  const showAlertNotification = (alert) => {
    Alert.alert(
      '🚨 Guardian AI Alert',
      `${alert.app}: ${alert.flaggedContent}`,
      [
        { text: 'View Details', onPress: () => handleViewAlertDetails(alert) },
        { text: 'Dismiss', style: 'cancel' }
      ],
      { cancelable: true }
    );
  };

  const handleViewAlertDetails = (alert) => {
    console.log('Viewing alert details:', alert);
    // Navigate to detailed alert view
  };

  const testAIAnalysis = async () => {
    try {
      const testText = "Want to smoke some greens tonight? I got some bud";
      const analysis = await AIContentDetector.analyzeText(testText, {
        app: 'Test App',
        contact: 'Test Contact'
      });
      
      Alert.alert(
        'AI Analysis Test',
        `Flagged: ${analysis.flagged}\nSeverity: ${analysis.severity}\nConfidence: ${Math.round(analysis.confidence * 100)}%\nPhrases: ${analysis.flaggedPhrases.join(', ')}\nContext: ${analysis.analysis?.reasons?.join(', ') || 'None'}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing AI analysis:', error);
    }
  };

  // Sample data - in production, this would come from your monitoring service
  const conversationLogs = [
    {
      id: 1,
      app: 'WhatsApp',
      contact: 'Unknown Number',
      timestamp: '2 hours ago',
      severity: 'high',
      flaggedContent: 'Explicit language detected',
      preview: 'Hey, want to meet up...',
      flaggedWords: ['inappropriate content'],
      messageCount: 12,
      date: 'Today'
    },
    {
      id: 2,
      app: 'Instagram',
      contact: '@stranger_account',
      timestamp: '5 hours ago',
      severity: 'medium',
      flaggedContent: 'Suspicious behavior',
      preview: 'You look really...',
      flaggedWords: ['concerning phrase'],
      messageCount: 8,
      date: 'Today'
    },
    {
      id: 3,
      app: 'Snapchat',
      contact: 'Alex M.',
      timestamp: 'Yesterday',
      severity: 'low',
      flaggedContent: 'Mild profanity',
      preview: 'That test was so...',
      flaggedWords: ['mild language'],
      messageCount: 3,
      date: 'Yesterday'
    },
    {
      id: 4,
      app: 'Discord',
      contact: 'Gaming Group',
      timestamp: 'Yesterday',
      severity: 'high',
      flaggedContent: 'Bullying detected',
      preview: 'Stop being such a...',
      flaggedWords: ['bullying', 'harassment'],
      messageCount: 15,
      date: 'Yesterday'
    },
    {
      id: 5,
      app: 'TikTok',
      contact: '@random_user',
      timestamp: '2 days ago',
      severity: 'medium',
      flaggedContent: 'Personal info shared',
      preview: 'My address is...',
      flaggedWords: ['personal information'],
      messageCount: 5,
      date: '2 days ago'
    },
    {
      id: 6,
      app: 'Telegram',
      contact: 'Unknown Contact',
      timestamp: '2 days ago',
      severity: 'high',
      flaggedContent: 'Inappropriate content detected',
      preview: 'Hey, want to see some...',
      flaggedWords: ['inappropriate content', 'explicit material'],
      messageCount: 20,
      date: '2 days ago'
    },
    {
      id: 7,
      app: 'Telegram',
      contact: 'Group Chat',
      timestamp: '3 days ago',
      severity: 'medium',
      flaggedContent: 'Suspicious link shared',
      preview: 'Check out this cool site...',
      flaggedWords: ['suspicious link', 'external site'],
      messageCount: 8,
      date: '3 days ago'
    },
    {
      id: 8,
      app: 'WhatsApp',
      contact: 'Unknown Contact',
      timestamp: '4 days ago',
      severity: 'medium',
      flaggedContent: 'Drug slang detected',
      preview: 'Want to smoke some greens tonight? I got some bud...',
      flaggedWords: ['greens', 'smoke', 'bud', 'marijuana smoking context'],
      messageCount: 6,
      date: '4 days ago'
    }
  ];

  const stats = {
    totalFlags: 55,
    thisWeek: 15,
    highRisk: 10
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return '#EF5350';
      case 'medium': return '#FFA726';
      case 'low': return '#FFC107';
      default: return '#9E9E9E';
    }
  };

  const getSeverityBg = (severity) => {
    switch(severity) {
      case 'high': return '#FFEBEE';
      case 'medium': return '#FFF3E0';
      case 'low': return '#FFF9C4';
      default: return '#F5F5F5';
    }
  };

  const handleViewDetails = (log) => {
    console.log('View details for:', log.id);
  };

  const filteredLogs = conversationLogs.filter(log => {
    if (selectedFilter !== 'all' && log.severity !== selectedFilter) return false;
    if (searchQuery && !log.contact.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#6366F1" />
      <ScrollView>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Safety Monitor</Text>
          <Text style={styles.headerSubtitle}>Olivia's Activity</Text>
        </View>
        <TouchableOpacity style={styles.shieldButton}>
          <Shield size={24} color="#FFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardPrimary]}>
          <View style={styles.statIcon}>
            <AlertTriangle size={20} color="#FFF" strokeWidth={2.5} />
          </View>
          <Text style={styles.statValue}>{stats.totalFlags}</Text>
          <Text style={styles.statLabel}>Total Flags</Text>
        </View>

        <View style={[styles.statCard, styles.statCardSecondary]}>
          <View style={styles.statIcon}>
            <TrendingUp size={20} color="#6366F1" strokeWidth={2.5} />
          </View>
          <Text style={[styles.statValue, styles.statValueDark]}>{stats.thisWeek}</Text>
          <Text style={[styles.statLabel, styles.statLabelDark]}>This Week</Text>
        </View>

        <View style={[styles.statCard, styles.statCardWarning]}>
          <View style={[styles.statIcon, styles.statIconWarning]}>
            <AlertTriangle size={20} color="#EF5350" strokeWidth={2.5} />
          </View>
          <Text style={[styles.statValue, styles.statValueDark]}>{stats.highRisk}</Text>
          <Text style={[styles.statLabel, styles.statLabelDark]}>High Risk</Text>
        </View>
      </ScrollView>

      {/* AI Monitoring Status */}
      <View style={styles.aiMonitoringContainer}>
        <View style={styles.aiStatusCard}>
          <View style={styles.aiStatusHeader}>
            <Bot size={20} color="#6366F1" strokeWidth={2} />
            <Text style={styles.aiStatusTitle}>AI Monitoring</Text>
            <View style={[styles.statusIndicator, { backgroundColor: aiMonitoringStatus.enabled ? '#10B981' : '#EF4444' }]} />
          </View>
          <Text style={styles.aiStatusText}>
            {aiMonitoringStatus.enabled ? 'Active' : 'Inactive'} • Real-time Analysis
          </Text>
          <TouchableOpacity style={styles.testButton} onPress={testAIAnalysis}>
            <Activity size={16} color="#6366F1" strokeWidth={2} />
            <Text style={styles.testButtonText}>Test AI</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.aiStatusCard}>
          <View style={styles.aiStatusHeader}>
            <MessageCircle size={20} color="#0088CC" strokeWidth={2} />
            <Text style={styles.aiStatusTitle}>Telegram Monitor</Text>
            <View style={[styles.statusIndicator, { backgroundColor: telegramMonitoringStatus.active ? '#10B981' : '#EF4444' }]} />
          </View>
          <Text style={styles.aiStatusText}>
            {telegramMonitoringStatus.active ? 'Active' : 'Inactive'} • Drug Slang Detection
          </Text>
          <Text style={styles.telegramFeatures}>
            • "greens" + "smoke" detection{'\n'}
            • Contextual pattern analysis{'\n'}
            • Real-time conversation monitoring
          </Text>
        </View>
        
        {realTimeAlerts.length > 0 && (
          <View style={styles.realTimeAlertsContainer}>
            <Text style={styles.alertsTitle}>Recent AI Alerts</Text>
            {realTimeAlerts.slice(0, 3).map((alert, index) => (
              <View key={alert.id} style={styles.alertItem}>
                <View style={[styles.alertSeverity, { backgroundColor: getSeverityColor(alert.severity) }]} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertApp}>{alert.app}</Text>
                  <Text style={styles.alertMessage} numberOfLines={1}>{alert.flaggedContent}</Text>
                </View>
                <Text style={styles.alertTime}>
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Search and Filter */}
      <View style={styles.searchFilterContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9E9E9E" strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by contact..."
            placeholderTextColor="#9E9E9E"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
        <TouchableOpacity 
          style={[styles.chip, selectedFilter === 'all' && styles.chipActive]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.chipText, selectedFilter === 'all' && styles.chipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.chip, selectedFilter === 'high' && styles.chipActive]}
          onPress={() => setSelectedFilter('high')}
        >
          <Text style={[styles.chipText, selectedFilter === 'high' && styles.chipTextActive]}>
            High Risk
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.chip, selectedFilter === 'medium' && styles.chipActive]}
          onPress={() => setSelectedFilter('medium')}
        >
          <Text style={[styles.chipText, selectedFilter === 'medium' && styles.chipTextActive]}>
            Medium
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.chip, selectedFilter === 'low' && styles.chipActive]}
          onPress={() => setSelectedFilter('low')}
        >
          <Text style={[styles.chipText, selectedFilter === 'low' && styles.chipTextActive]}>
            Low Risk
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Conversation Logs */}
      <ScrollView style={styles.logsList} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        
        {filteredLogs.map((log) => (
          <TouchableOpacity 
            key={log.id} 
            style={styles.logCard}
            onPress={() => handleViewDetails(log)}
            activeOpacity={0.7}
          >
            {/* Severity Indicator */}
            <View style={[styles.severityBar, { backgroundColor: getSeverityColor(log.severity) }]} />
            
            <View style={styles.logContent}>
              {/* Header */}
              <View style={styles.logHeader}>
                <View style={styles.logHeaderLeft}>
                  <View style={[styles.appBadge, { backgroundColor: getSeverityBg(log.severity) }]}>
                    <MessageCircle size={16} color={getSeverityColor(log.severity)} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={styles.appName}>{log.app}</Text>
                    <Text style={styles.contactName}>{log.contact}</Text>
                  </View>
                </View>
                <View style={styles.timestampContainer}>
                  <Clock size={14} color="#9E9E9E" strokeWidth={2} />
                  <Text style={styles.timestamp}>{log.timestamp}</Text>
                </View>
              </View>

              {/* Flagged Content Alert */}
              <View style={[styles.alertBanner, { backgroundColor: getSeverityBg(log.severity) }]}>
                <AlertTriangle size={16} color={getSeverityColor(log.severity)} strokeWidth={2} />
                <Text style={[styles.alertText, { color: getSeverityColor(log.severity) }]}>
                  {log.flaggedContent}
                </Text>
              </View>

              {/* Preview */}
              <Text style={styles.previewText} numberOfLines={2}>
                {log.preview}
              </Text>

              {/* Tags */}
              <View style={styles.tagsContainer}>
                {log.flaggedWords.map((word, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{word}</Text>
                  </View>
                ))}
                <Text style={styles.messageCount}>{log.messageCount} messages</Text>
              </View>

              {/* View Details Button */}
              <View style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsText}>View Full Conversation</Text>
                <ChevronRight size={16} color="#6366F1" strokeWidth={2.5} />
              </View>
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.bottomPadding} />
      </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  shieldButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: -40,
  },
  statCard: {
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    width: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statCardPrimary: {
    backgroundColor: '#EF5350',
  },
  statCardSecondary: {
    backgroundColor: '#FFF',
  },
  statCardWarning: {
    backgroundColor: '#FFF',
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statIconWarning: {
    backgroundColor: '#FFEBEE',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statValueDark: {
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statLabelDark: {
    color: '#6B7280',
  },
  searchFilterContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  filterChips: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  chipTextActive: {
    color: '#FFF',
  },
  logsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  logCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  severityBar: {
    height: 4,
  },
  logContent: {
    padding: 16,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  logHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
  },
  contactName: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  timestampContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: '#9E9E9E',
    marginLeft: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  previewText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  messageCount: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginTop: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginRight: 4,
  },
  bottomPadding: {
    height: 24,
  },
  // AI Monitoring Styles
  aiMonitoringContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  aiStatusCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  aiStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiStatusTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  aiStatusText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  testButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  telegramFeatures: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
    lineHeight: 16,
  },
  realTimeAlertsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  alertsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  alertSeverity: {
    width: 4,
    height: 32,
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertApp: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  alertMessage: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  alertTime: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '500',
  },
});