import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('HOME');
  const [alertCount] = useState(10);

  // Sample data for the chart
  const chartData = [
    { date: 'Oct 10', value: 3 },
    { date: 'Oct 11', value: 5 },
    { date: 'Oct 12', value: 2 },
    { date: 'Oct 13', value: 1 },
    { date: 'Oct 14', value: 7 },
    { date: 'Oct 15', value: 8 },
    { date: 'Oct 16', value: 4 },
  ];

  const maxValue = Math.max(...chartData.map(d => d.value));

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    console.log(`Navigating to ${tab}`);
  };

  const handleButtonPress = (button) => {
    console.log(`${button} pressed`);
    // alert(`Opening ${button}`);
    navigation.navigate(button);

  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Home</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.taglineContainer}>
            <Text style={styles.tagline}>Guarding the Mind.</Text>
            <Text style={styles.tagline}>Protecting the Conversation</Text>
          </View>

          <View style={styles.chartContainer}>
            <View style={styles.alertBadge}>
              <Text style={styles.alertText}>{alertCount} Alerts</Text>
            </View>
            
            <View style={styles.chart}>
              {chartData.map((item, index) => {
                const height = (item.value / maxValue) * 150;
                return (
                  <View key={index} style={styles.barContainer}>
                    <View style={[styles.bar, { height: height }]} />
                    <Text style={styles.barLabel}>{item.date}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.buttonGrid}>
            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Child Profiles')}
            >
              <Text style={styles.gridButtonText}>Child Profiles</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Quick Actions')}
            >
              <Text style={styles.gridButtonText}>Quick Actions</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Summary')}
            >
              <Text style={styles.gridButtonText}>Summary</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gridButton}
              onPress={() => handleButtonPress('Recent Alerts')}
            >
              <Text style={styles.gridButtonText}>Recent Alerts</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('HOME')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>🏠</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'HOME' && styles.navLabelActive]}>
            HOME
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Parent Control')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>👥</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Parent Control' && styles.navLabelActive]}>
            Parent Control
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('Log')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>📋</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'Log' && styles.navLabelActive]}>
            Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('SETTINGS')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}>⚙️</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'SETTINGS' && styles.navLabelActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View> */}
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
  header: {
    backgroundColor: '#0A1E4A',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  tagline: {
    fontSize: 20,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 30,
  },
  chartContainer: {
    marginBottom: 40,
    position: 'relative',
  },
  alertBadge: {
    position: 'absolute',
    top: -10,
    left: '50%',
    transform: [{ translateX: -40 }],
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  alertText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingTop: 30,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 30,
    backgroundColor: '#D0D0D0',
    borderRadius: 4,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    color: '#666666',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridButton: {
    width: '48%',
    backgroundColor: '#E0E0E0',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridButtonText: {
    fontSize: 18,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  navIcon: {
    marginBottom: 4,
  },
  navIconText: {
    fontSize: 24,
  },
  navLabel: {
    fontSize: 10,
    color: '#999999',
    fontWeight: '500',
  },
  navLabelActive: {
    color: '#000000',
  },
});