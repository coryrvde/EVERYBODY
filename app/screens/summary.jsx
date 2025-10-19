import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { guardianClient } from '../api/guardian-client';

export default function SummaryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { child_id } = route.params || {};

  const [summaryData, setSummaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (child_id) {
      loadSummary();
    } else {
      setLoading(false);
    }
  }, [child_id]);

  async function loadSummary() {
    try {
      setLoading(true);
      const data = await guardianClient.summary.getSummary(child_id);
      setSummaryData(data);
    } catch (error) {
      console.error('Error loading summary:', error);
      Alert.alert('Error', 'Failed to load summary data');
    } finally {
      setLoading(false);
    }
  }

  const filteredSummary = summaryData.filter(day =>
    day.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (alerts) => {
    if (alerts === 0) return '#4CAF50'; // Green
    if (alerts <= 2) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading summary...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Weekly Summary</Text>
          <View style={styles.placeholder} />
        </View>

      {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by date (e.g., 2024-01-15)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>

        {/* Summary Content */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Activity Summary</Text>

          {filteredSummary.length > 0 ? (
            <View style={styles.summaryList}>
              {filteredSummary.map((day, index) => (
                <View key={index} style={styles.summaryCard}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.dateText}>{day.date}</Text>
                    <View
                      style={[
                        styles.severityIndicator,
                        { backgroundColor: getSeverityColor(day.total_alerts) }
                      ]}
                    />
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Screen Time</Text>
                      <Text style={styles.statValue}>
                        {Math.floor(day.total_screen_time / 60)}h {day.total_screen_time % 60}m
                      </Text>
                    </View>

                    <View style={styles.statDivider} />

                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Alerts</Text>
                      <Text style={[styles.statValue, { color: getSeverityColor(day.total_alerts) }]}>
                        {day.total_alerts}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min((day.total_screen_time / 480) * 100, 100)}%`, // Max 8 hours = 480 minutes
                          backgroundColor: day.total_screen_time > 240 ? '#F44336' : '#4CAF50' // Red if > 4 hours
                        }
                      ]}
                    />
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No data found for this date' : 'No summary data available'}
              </Text>
              <TouchableOpacity
                style={styles.refreshButton}
                onPress={loadSummary}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#0A1E4A',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  summaryList: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  severityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 15,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 20,
  },
  refreshButton: {
    backgroundColor: '#0A1E4A',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});