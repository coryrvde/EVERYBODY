import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Camera, Lock, Pause, Clock, Globe, Grid, Shield, MapPin } from 'lucide-react-native';

export default function ParentalControlScreen() {
  const [childName] = useState('Olivia');
  const [lastActive] = useState('1hr 30 min');
  const [blockedApps] = useState(4);
  const [blockedWebsites] = useState(50);
  const [appsLimits] = useState(12);
  const [savedLocations] = useState(2);

  const handleLockPhone = () => {
    console.log('Lock phone pressed');
  };

  const handlePause = () => {
    console.log('Pause pressed');
  };

  const handleAddTime = () => {
    console.log('Add time pressed');
  };

  const handleBlockApps = () => {
    console.log('Block apps pressed');
  };

  const handleAppsLimits = () => {
    console.log('Apps limits pressed');
  };

  const handleDeviceProtection = () => {
    console.log('Device protection pressed');
  };

  const handleGPS = () => {
    console.log('GPS pressed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{childName}'s Phone</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <View style={styles.avatarFace} />
              </View>
            </View>
          </View>
          <Text style={styles.childName}>{childName}</Text>
          <Text style={styles.lastActive}>{lastActive}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLockPhone}>
            <Lock size={24} color="#4A90E2" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Lock Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handlePause}>
            <Pause size={24} color="#4A90E2" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleAddTime}>
            <Clock size={24} color="#4A90E2" strokeWidth={2} />
            <Text style={styles.actionButtonText}>Add Time</Text>
          </TouchableOpacity>
        </View>

        {/* Features Section */}
        <Text style={styles.featuresTitle}>Features</Text>

        <View style={styles.featuresGrid}>
          {/* Block Apps & Websites */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.blockAppsCard]} 
            onPress={handleBlockApps}
          >
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Block Apps &</Text>
              <Text style={styles.featureTitle}>Websites</Text>
              <Text style={styles.featureSubtext}>{blockedApps} Apps</Text>
              <Text style={styles.featureSubtext}>{blockedWebsites} Websites</Text>
            </View>
            <View style={styles.featureIconContainer}>
              <Globe size={32} color="#4A90E2" strokeWidth={2} />
            </View>
          </TouchableOpacity>

          {/* Apps Limits */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.appsLimitsCard]} 
            onPress={handleAppsLimits}
          >
            <View style={styles.featureIconContainer}>
              <Grid size={32} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitleWhite}>Apps Limits</Text>
              <Text style={styles.featureSubtextWhite}>{appsLimits} Apps</Text>
            </View>
          </TouchableOpacity>

          {/* Device Protection */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.deviceProtectionCard]} 
            onPress={handleDeviceProtection}
          >
            <View style={styles.featureIconContainer}>
              <Shield size={32} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitleWhite}>Device</Text>
              <Text style={styles.featureTitleWhite}>Protection</Text>
            </View>
          </TouchableOpacity>

          {/* GPS */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.gpsCard]} 
            onPress={handleGPS}
          >
            <View style={styles.featureIconContainer}>
              <MapPin size={32} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitleWhite}>GPS</Text>
              <Text style={styles.featureSubtextWhite}>{savedLocations} Saved</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4DD0E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#EF9A9A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFace: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D32F2F',
    marginTop: 20,
  },
  childName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lastActive: {
    fontSize: 14,
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFF',
    marginBottom: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#4A90E2',
    marginTop: 4,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
  },
  featureCard: {
    borderRadius: 16,
    padding: 16,
    minHeight: 120,
    marginBottom: 12,
  },
  blockAppsCard: {
    backgroundColor: '#E3F2FD',
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  appsLimitsCard: {
    backgroundColor: '#FFB74D',
    width: '48%',
  },
  deviceProtectionCard: {
    backgroundColor: '#9575CD',
    width: '48%',
  },
  gpsCard: {
    backgroundColor: '#4DB6AC',
    width: '48%',
  },
  featureContent: {
    flex: 1,
  },
  featureIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  featureTitleWhite: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  featureSubtext: {
    fontSize: 12,
    color: '#E57373',
    marginTop: 4,
  },
  featureSubtextWhite: {
    fontSize: 12,
    color: '#FFF',
    marginTop: 4,
  },
});