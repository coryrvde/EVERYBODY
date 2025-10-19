import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Home, Users, ClipboardList, Settings, ArrowLeft, User } from 'lucide-react';

export default function ParentalControlScreen() {
  const [activeTab, setActiveTab] = useState('parent-control');

  const handleDeviceLinking = () => {
    console.log('Device Linking pressed');
  };

  const handleAppBlocking = () => {
    console.log('App & Site Blocking pressed');
  };

  const handleManageProfile = () => {
    console.log('Manage Profile pressed');
  };

  const handleBack = () => {
    console.log('Back pressed');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#001a3d" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft color="#ffffff" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Parental Control</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileBanner}>
            <View style={styles.profileBadge}>
              <View style={styles.avatar} />
              <Text style={styles.profileName}>Zemi Robert</Text>
            </View>
          </View>
          
          <View style={styles.zoneSection}>
            <Text style={styles.zoneTitle}>Parental Control Zone</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleDeviceLinking}
          >
            <Text style={styles.actionButtonText}>Device{'\n'}Linking</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAppBlocking}
          >
            <Text style={styles.actionButtonText}>App & Site{'\n'}Blocking</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleManageProfile}
          >
            <Text style={styles.actionButtonText}>Manage{'\n'}Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
        >
          <Home 
            color={activeTab === 'home' ? '#001a3d' : '#999999'} 
            size={28} 
          />
          <Text style={[
            styles.navText,
            activeTab === 'home' && styles.navTextActive
          ]}>HOME</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('parent-control')}
        >
          <Users 
            color={activeTab === 'parent-control' ? '#001a3d' : '#999999'} 
            size={28} 
            fill={activeTab === 'parent-control' ? '#001a3d' : 'none'}
          />
          <Text style={[
            styles.navText,
            activeTab === 'parent-control' && styles.navTextActive
          ]}>Parent Control</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('log')}
        >
          <ClipboardList 
            color={activeTab === 'log' ? '#001a3d' : '#999999'} 
            size={28} 
          />
          <Text style={[
            styles.navText,
            activeTab === 'log' && styles.navTextActive
          ]}>Log</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => setActiveTab('settings')}
        >
          <Settings 
            color={activeTab === 'settings' ? '#001a3d' : '#999999'} 
            size={28} 
          />
          <Text style={[
            styles.navText,
            activeTab === 'settings' && styles.navTextActive
          ]}>SETTINGS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: '#001a3d',
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 20,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  profileBanner: {
    backgroundColor: '#d4d8dd',
    padding: 30,
    position: 'relative',
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignSelf: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#000000',
    marginRight: 12,
  },
  profileName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  zoneSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  zoneTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  actionButton: {
    backgroundColor: '#e5e5e5',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 30,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#999999',
    marginTop: 4,
    fontWeight: '500',
  },
  navTextActive: {
    color: '#001a3d',
    fontWeight: '600',
  },
});