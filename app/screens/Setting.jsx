import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [activeTab, setActiveTab] = useState('SETTINGS');

  const handleNavigation = (tab) => {
    setActiveTab(tab);
    console.log(`Navigating to ${tab}`);
  };

  const handleBackPress = () => {
    console.log('Back button pressed');
  };

  const handleProfilePress = () => {
    console.log('Profile button pressed');
  };

  const handleSettingPress = (setting) => {
    console.log(`${setting} pressed`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Setting</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
            <Text style={styles.profileIcon}>👤</Text>
            <Text style={styles.profileIconSmall}>−</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Text style={styles.shareIcon}>⇄</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Insert App{'\n'}Logo</Text>
          </View>
        </View>

        <View style={styles.buttonGrid}>
          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => handleSettingPress('App appearance')}
          >
            <Text style={styles.gridButtonText}>App appearance</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => handleSettingPress('Privacy and Data')}
          >
            <Text style={styles.gridButtonText}>Privacy and{'\n'}Data</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => handleSettingPress('User access & Permissions')}
          >
            <Text style={styles.gridButtonText}>User access &{'\n'}Permissions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.gridButton}
            onPress={() => handleSettingPress('Support & Feedback')}
          >
            <Text style={styles.gridButtonText}>Support &{'\n'}Feedback</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomNav}>
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

        {/* <TouchableOpacity 
          style={styles.navItem}
          onPress={() => handleNavigation('SETTINGS')}
        >
          <View style={styles.navIcon}>
            <Text style={styles.navIconText}⚙️</Text>
          </View>
          <Text style={[styles.navLabel, activeTab === 'SETTINGS' && styles.navLabelActive]}>
            SETTINGS
          </Text>
        </TouchableOpacity> */}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#0A1E4A',
    paddingTop: 40,
    paddingBottom: 25,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    fontSize: 32,
    color: '#000000',
  },
  profileIconSmall: {
    fontSize: 24,
    color: '#000000',
    marginLeft: -8,
  },
  shareButton: {
    padding: 8,
  },
  shareIcon: {
    fontSize: 28,
    color: '#000000',
    fontWeight: 'bold',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoPlaceholder: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
    minHeight: 100,
  },
  gridButtonText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 22,
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