import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView, TextInput, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { guardianClient } from '../api/guardian-client';

export default function AIMonitoringScreen() {
  const navigation = useNavigation();
  const [customFilters, setCustomFilters] = useState([]);
  const [newFilter, setNewFilter] = useState('');
  const [filterType, setFilterType] = useState('exact'); // exact, similar, context
  const [severity, setSeverity] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [addingFilter, setAddingFilter] = useState(false);

  useEffect(() => {
    loadCustomFilters();
  }, []);

  const loadCustomFilters = async () => {
    try {
      setLoading(true);
      console.log('Loading custom filters...');
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        console.log('No user session found');
        Alert.alert('Error', 'You must be logged in to load filters');
        return;
      }

      console.log('Loading filters for user:', user.id);
      
      // Load custom filters from database
      const { data, error } = await supabase
        .from('custom_filters')
        .select('*')
        .eq('parent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Loaded filters:', data);
      setCustomFilters(data || []);
    } catch (error) {
      console.error('Error loading custom filters:', error);
      Alert.alert('Error', `Failed to load filters: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const addCustomFilter = async () => {
    if (!newFilter.trim()) {
      Alert.alert('Error', 'Please enter a word or phrase to filter');
      return;
    }

    try {
      setAddingFilter(true);
      console.log('Adding custom filter:', { newFilter: newFilter.trim(), filterType, severity });
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        console.log('No user session found for adding filter');
        Alert.alert('Error', 'You must be logged in to add filters');
        return;
      }

      console.log('Adding filter for user:', user.id);

      // Add to database
      const { data, error } = await supabase
        .from('custom_filters')
        .insert({
          parent_id: user.id,
          filter_text: newFilter.trim(),
          filter_type: filterType,
          severity: severity,
          is_active: true
        })
        .select();

      if (error) {
        console.error('Database error when adding filter:', error);
        throw error;
      }

      console.log('Filter added successfully:', data);
      
      // Reload filters
      await loadCustomFilters();
      setNewFilter('');
      
      Alert.alert('Success', 'Custom filter added successfully!');
    } catch (error) {
      console.error('Error adding filter:', error);
      Alert.alert('Error', `Failed to add filter: ${error.message}`);
    } finally {
      setAddingFilter(false);
    }
  };

  const deleteFilter = async (filterId) => {
    try {
      const { error } = await supabase
        .from('custom_filters')
        .delete()
        .eq('id', filterId);

      if (error) throw error;

      await loadCustomFilters();
      Alert.alert('Success', 'Filter deleted successfully!');
    } catch (error) {
      console.error('Error deleting filter:', error);
      Alert.alert('Error', 'Failed to delete filter');
    }
  };

  const toggleFilter = async (filterId, isActive) => {
    try {
      const { error } = await supabase
        .from('custom_filters')
        .update({ is_active: !isActive })
        .eq('id', filterId);

      if (error) throw error;

      await loadCustomFilters();
    } catch (error) {
      console.error('Error toggling filter:', error);
      Alert.alert('Error', 'Failed to update filter');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'low': return '#10B981';
      case 'medium': return '#F59E0B';
      case 'high': return '#EF4444';
      case 'critical': return '#DC2626';
      default: return '#6B7280';
    }
  };

  const getFilterTypeIcon = (type) => {
    switch (type) {
      case 'exact': return '🎯';
      case 'similar': return '🔍';
      case 'context': return '🧠';
      default: return '📝';
    }
  };

  const testDatabaseConnection = async () => {
    try {
      console.log('Testing database connection...');
      
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;

      if (!user) {
        Alert.alert('Test Result', '❌ No user session found');
        return;
      }

      console.log('User session found:', user.id);

      // Test if we can query the custom_filters table
      const { data, error } = await supabase
        .from('custom_filters')
        .select('count')
        .eq('parent_id', user.id);

      if (error) {
        console.error('Database test failed:', error);
        Alert.alert('Test Result', `❌ Database Error: ${error.message}`);
        return;
      }

      console.log('Database test successful');
      Alert.alert('Test Result', '✅ Database connection successful!\n\nYou can now add custom filters.');
      
    } catch (error) {
      console.error('Test connection error:', error);
      Alert.alert('Test Result', `❌ Connection Error: ${error.message}`);
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
        <Text style={styles.headerTitle}>AI Monitoring</Text>
        <Text style={styles.headerSubtitle}>Smart Content Detection</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          
          {/* Add New Filter Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔧 Add Custom Filter</Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Enter word or phrase to filter..."
                value={newFilter}
                onChangeText={setNewFilter}
                multiline
              />
            </View>

            <View style={styles.optionsContainer}>
              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Filter Type:</Text>
                <View style={styles.optionButtons}>
                  <TouchableOpacity 
                    style={[styles.optionButton, filterType === 'exact' && styles.optionButtonActive]}
                    onPress={() => setFilterType('exact')}
                  >
                    <Text style={[styles.optionButtonText, filterType === 'exact' && styles.optionButtonTextActive]}>
                      🎯 Exact Match
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.optionButton, filterType === 'similar' && styles.optionButtonActive]}
                    onPress={() => setFilterType('similar')}
                  >
                    <Text style={[styles.optionButtonText, filterType === 'similar' && styles.optionButtonTextActive]}>
                      🔍 Similar Words
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.optionButton, filterType === 'context' && styles.optionButtonActive]}
                    onPress={() => setFilterType('context')}
                  >
                    <Text style={[styles.optionButtonText, filterType === 'context' && styles.optionButtonTextActive]}>
                      🧠 Smart Context
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.optionGroup}>
                <Text style={styles.optionLabel}>Severity Level:</Text>
                <View style={styles.optionButtons}>
                  <TouchableOpacity 
                    style={[styles.severityButton, severity === 'low' && styles.severityButtonActive]}
                    onPress={() => setSeverity('low')}
                  >
                    <Text style={[styles.severityButtonText, severity === 'low' && styles.severityButtonTextActive]}>
                      Low
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.severityButton, severity === 'medium' && styles.severityButtonActive]}
                    onPress={() => setSeverity('medium')}
                  >
                    <Text style={[styles.severityButtonText, severity === 'medium' && styles.severityButtonTextActive]}>
                      Medium
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.severityButton, severity === 'high' && styles.severityButtonActive]}
                    onPress={() => setSeverity('high')}
                  >
                    <Text style={[styles.severityButtonText, severity === 'high' && styles.severityButtonTextActive]}>
                      High
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.severityButton, severity === 'critical' && styles.severityButtonActive]}
                    onPress={() => setSeverity('critical')}
                  >
                    <Text style={[styles.severityButtonText, severity === 'critical' && styles.severityButtonTextActive]}>
                      Critical
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.addButton} 
                onPress={addCustomFilter}
                disabled={addingFilter}
              >
                <Text style={styles.addButtonText}>
                  {addingFilter ? 'Adding...' : '➕ Add Filter'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.testButton} 
                onPress={testDatabaseConnection}
                disabled={loading}
              >
                <Text style={styles.testButtonText}>
                  🔧 Test Connection
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AI Intelligence Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🧠 AI Intelligence Features</Text>
            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>Smart Context Detection</Text>
              <Text style={styles.infoText}>
                Our AI analyzes conversation context, not just keywords. It can detect:
              </Text>
              <Text style={styles.infoList}>• Hidden meanings and implications</Text>
              <Text style={styles.infoList}>• Inappropriate requests disguised as innocent messages</Text>
              <Text style={styles.infoList}>• Grooming behavior patterns</Text>
              <Text style={styles.infoList}>• Cyberbullying and harassment</Text>
              <Text style={styles.infoList}>• Drug-related conversations</Text>
            </View>
          </View>

          {/* Custom Filters List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Your Custom Filters ({customFilters.length})</Text>
            
            {loading ? (
              <Text style={styles.loadingText}>Loading filters...</Text>
            ) : customFilters.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No custom filters yet</Text>
                <Text style={styles.emptyStateSubtext}>Add your first filter above to get started</Text>
              </View>
            ) : (
              <FlatList
                data={customFilters}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.filterItem}>
                    <View style={styles.filterHeader}>
                      <View style={styles.filterInfo}>
                        <Text style={styles.filterText}>{item.filter_text}</Text>
                        <View style={styles.filterMeta}>
                          <Text style={styles.filterType}>
                            {getFilterTypeIcon(item.filter_type)} {item.filter_type}
                          </Text>
                          <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
                            <Text style={styles.severityBadgeText}>{item.severity.toUpperCase()}</Text>
                          </View>
                        </View>
                      </View>
                      <View style={styles.filterActions}>
                        <TouchableOpacity 
                          style={[styles.toggleButton, item.is_active && styles.toggleButtonActive]}
                          onPress={() => toggleFilter(item.id, item.is_active)}
                        >
                          <Text style={[styles.toggleButtonText, item.is_active && styles.toggleButtonTextActive]}>
                            {item.is_active ? 'ON' : 'OFF'}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => deleteFilter(item.id)}
                        >
                          <Text style={styles.deleteButtonText}>🗑️</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={styles.filterDate}>
                      Added: {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>

          {/* Real-time Monitoring Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📡 Real-time Monitoring</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
              <Text style={styles.statusDescription}>
                AI is monitoring all conversations in real-time using your custom filters and intelligent analysis.
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionGroup: {
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  optionButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  optionButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#374151',
  },
  optionButtonTextActive: {
    color: '#FFFFFF',
  },
  severityButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  severityButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  severityButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
  },
  severityButtonTextActive: {
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  testButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
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
    marginBottom: 12,
  },
  infoList: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
    paddingLeft: 8,
  },
  filterItem: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filterInfo: {
    flex: 1,
    marginRight: 12,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  filterMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterType: {
    fontSize: 12,
    color: '#6B7280',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  filterActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  deleteButton: {
    padding: 6,
  },
  deleteButtonText: {
    fontSize: 16,
  },
  filterDate: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 8,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#6B7280',
    padding: 20,
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
  statusCard: {
    backgroundColor: '#F0FDF4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BBF7D0',
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
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#166534',
  },
  statusDescription: {
    fontSize: 14,
    color: '#16A34A',
  },
});
