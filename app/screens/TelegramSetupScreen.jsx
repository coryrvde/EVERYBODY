import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { telegramBotService } from '../services/telegramBotService';

export default function TelegramSetupScreen() {
  const navigation = useNavigation();
  const [parentId, setParentId] = useState(null);
  const [childId, setChildId] = useState(null);
  const [botToken, setBotToken] = useState('');
  const [parentChatId, setParentChatId] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [monitoredChats, setMonitoredChats] = useState([]);
  const [setupStep, setSetupStep] = useState('phone'); // phone, code, connected

  useEffect(() => {
    initializeSetup();
  }, []);

  const initializeSetup = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        Alert.alert('Error', 'You must be logged in to set up Telegram monitoring');
        navigation.goBack();
        return;
      }

      setParentId(user.id);

      // Get first child ID for testing
      const { data: children, error } = await supabase
        .from('family_links')
        .select('child_id')
        .eq('parent_id', user.id)
        .limit(1);

      if (error) throw error;

      if (!children || children.length === 0) {
        Alert.alert('No Children', 'Please link a child account first to set up Telegram monitoring');
        navigation.goBack();
        return;
      }

      setChildId(children[0].child_id);

      // Check if Telegram Bot is already connected
      const status = telegramBotService.getStatus();
      if (status.isMonitoring) {
        setIsConnected(true);
        setSetupStep('connected');
        loadMonitoredChats();
      }

    } catch (error) {
      console.error('Error initializing setup:', error);
      Alert.alert('Error', 'Failed to initialize Telegram setup');
    }
  };

  const startTelegramConnection = async () => {
    try {
      setIsConnecting(true);
      
      if (!botToken.trim()) {
        Alert.alert('Error', 'Please enter your Telegram Bot Token');
        return;
      }

      if (!parentChatId.trim()) {
        Alert.alert('Error', 'Please enter your Telegram Chat ID');
        return;
      }

      // Store parent chat ID for notifications
      await supabase
        .from('parent_telegram_chats')
        .upsert({
          parent_id: parentId,
          chat_id: parentChatId,
          chat_type: 'private',
          is_active: true
        });

      // Initialize Telegram Bot
      const success = await telegramBotService.initializeBot(childId, parentId, botToken);
      
      if (success) {
        setIsConnected(true);
        setSetupStep('connected');
        loadMonitoredChats();
        Alert.alert('Success', 'Telegram Bot monitoring has been set up successfully!');
      } else {
        Alert.alert('Error', 'Failed to connect to Telegram Bot. Please check your Bot Token.');
      }

    } catch (error) {
      console.error('Error connecting to Telegram Bot:', error);
      Alert.alert('Error', 'Failed to connect to Telegram Bot');
    } finally {
      setIsConnecting(false);
    }
  };

  const loadMonitoredChats = async () => {
    try {
      const chats = await telegramBotService.getMonitoredChats();
      setMonitoredChats(chats || []);
    } catch (error) {
      console.error('Error loading monitored chats:', error);
    }
  };

  const toggleChatMonitoring = async (chatId, isMonitored) => {
    try {
      const { error } = await supabase
        .from('telegram_chats')
        .update({ is_monitored: !isMonitored })
        .eq('chat_id', chatId)
        .eq('child_id', childId);

      if (error) throw error;

      await loadMonitoredChats();
    } catch (error) {
      console.error('Error toggling chat monitoring:', error);
    }
  };

  const disconnectTelegram = async () => {
    try {
      await telegramBotService.stopMonitoring();
      setIsConnected(false);
      setSetupStep('phone');
      setMonitoredChats([]);
      Alert.alert('Disconnected', 'Telegram Bot monitoring has been disconnected');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  };

  const testTelegramMonitoring = async () => {
    try {
      const status = telegramBotService.getStatus();
      
      Alert.alert(
        'Telegram Bot Status',
        `Monitoring: ${status.isMonitoring ? 'Yes' : 'No'}\nBot Token: ${status.botToken}\nMonitored Chats: ${status.monitoredChats}\nChild ID: ${status.childId}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing monitoring:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Telegram Setup</Text>
        <Text style={styles.headerSubtitle}>Real-time Message Monitoring</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Setup Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📱 Telegram Monitoring Status</Text>
            
            <View style={[styles.statusCard, isConnected ? styles.statusConnected : styles.statusDisconnected]}>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, isConnected ? styles.statusDotConnected : styles.statusDotDisconnected]} />
                <Text style={[styles.statusText, isConnected ? styles.statusTextConnected : styles.statusTextDisconnected]}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </View>
              <Text style={styles.statusDescription}>
                {isConnected 
                  ? 'Telegram monitoring is active and analyzing messages in real-time'
                  : 'Telegram monitoring is not connected. Set up below to start monitoring.'
                }
              </Text>
            </View>
          </View>

          {/* Connection Setup */}
          {!isConnected && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🤖 Setup Telegram Bot</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Bot Token</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                  value={botToken}
                  onChangeText={setBotToken}
                  secureTextEntry={true}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Your Telegram Chat ID</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="123456789"
                  value={parentChatId}
                  onChangeText={setParentChatId}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity 
                style={[styles.connectButton, isConnecting && styles.connectButtonDisabled]}
                onPress={startTelegramConnection}
                disabled={isConnecting}
              >
                <Text style={styles.connectButtonText}>
                  {isConnecting ? 'Connecting...' : '🤖 Connect Bot'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.setupNote}>
                📝 Note: You need to create a Telegram Bot using @BotFather and get your Chat ID. 
                The bot will monitor messages and send alerts to your Telegram account.
              </Text>
            </View>
          )}

          {/* Monitored Chats */}
          {isConnected && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>👁️ Monitored Chats ({monitoredChats.length})</Text>
                <TouchableOpacity style={styles.refreshButton} onPress={loadMonitoredChats}>
                  <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
                </TouchableOpacity>
              </View>

              {monitoredChats.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No chats found</Text>
                  <Text style={styles.emptyStateSubtext}>Telegram monitoring will automatically detect chats when messages are exchanged</Text>
                </View>
              ) : (
                <View style={styles.chatsList}>
                  {monitoredChats.map((chat, index) => (
                    <View key={index} style={styles.chatItem}>
                      <View style={styles.chatInfo}>
                        <Text style={styles.chatTitle}>{chat.title}</Text>
                        <Text style={styles.chatType}>{chat.type}</Text>
                        <Text style={styles.chatId}>ID: {chat.chat_id}</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.toggleButton, chat.is_monitored && styles.toggleButtonActive]}
                        onPress={() => toggleChatMonitoring(chat.chat_id, chat.is_monitored)}
                      >
                        <Text style={[styles.toggleButtonText, chat.is_monitored && styles.toggleButtonTextActive]}>
                          {chat.is_monitored ? 'ON' : 'OFF'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚙️ Actions</Text>
            
            <View style={styles.actionsGrid}>
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={testTelegramMonitoring}
              >
                <Text style={styles.actionButtonText}>🧪 Test Status</Text>
              </TouchableOpacity>

              {isConnected && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.disconnectButton]}
                  onPress={disconnectTelegram}
                >
                  <Text style={styles.actionButtonText}>🔌 Disconnect</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ℹ️ How It Works</Text>
            
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Real-time Monitoring</Text>
              <Text style={styles.infoText}>
                • Monitors all Telegram messages in real-time{'\n'}
                • Uses AI to analyze message content{'\n'}
                • Sends instant alerts for flagged content{'\n'}
                • Respects privacy while ensuring safety{'\n'}
                • Works with private chats and groups
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#2563EB',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  statusCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusConnected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusDisconnected: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#10B981',
  },
  statusDotDisconnected: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusTextConnected: {
    color: '#166534',
  },
  statusTextDisconnected: {
    color: '#DC2626',
  },
  statusDescription: {
    fontSize: 14,
    color: '#374151',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
  },
  connectButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  connectButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  setupNote: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  chatsList: {
    gap: 12,
  },
  chatItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatInfo: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  chatType: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  chatId: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  toggleButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: '#10B981',
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  toggleButtonTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    backgroundColor: '#F9FAFB',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    flex: 1,
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  refreshButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },
  refreshButtonText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});
