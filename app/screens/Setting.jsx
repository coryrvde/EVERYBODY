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
import { 
  ChevronLeft,
  Lock, 
  Pause, 
  Clock, 
  Globe, 
  Grid, 
  Shield, 
  MapPin 
} from 'lucide-react-native';

export default function ParentalControlSettings() {
  const [childName] = useState('Olivia');
  const [lastActive] = useState('1hr 30 min');
  const [blockedApps] = useState(4);
  const [blockedWebsites] = useState(50);
  const [appsLimits] = useState(12);
  const [savedLocations] = useState(2);

  const handleBack = () => {
    console.log('Back pressed');
  };

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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={28} color="#000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{childName}'s Phone</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <View style={styles.avatarHead} />
                <View style={styles.avatarBody} />
              </View>
            </View>
          </View>
          <Text style={styles.childName}>{childName}</Text>
          <Text style={styles.lastActive}>{lastActive}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleLockPhone}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Lock size={22} color="#5B8DEF" strokeWidth={2.5} />
            </View>
            <Text style={styles.actionButtonText}>Lock Phone</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handlePause}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Pause size={22} color="#5B8DEF" strokeWidth={2.5} />
            </View>
            <Text style={styles.actionButtonText}>Pause</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleAddTime}
            activeOpacity={0.7}
          >
            <View style={styles.actionIconContainer}>
              <Clock size={22} color="#5B8DEF" strokeWidth={2.5} />
            </View>
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
            activeOpacity={0.8}
          >
            <View style={styles.featureTopRow}>
              <View style={styles.featureTextContent}>
                <Text style={styles.featureTitle}>Block Apps &</Text>
                <Text style={styles.featureTitle}>Websites</Text>
              </View>
            </View>
            <View style={styles.featureBottomRow}>
              <View>
                <Text style={styles.featureSubtext}>{blockedApps} Apps</Text>
                <Text style={styles.featureSubtext}>{blockedWebsites} Websites</Text>
              </View>
              <View style={styles.featureIconCircle}>
                <Globe size={28} color="#5B8DEF" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Apps Limits */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.appsLimitsCard]} 
            onPress={handleAppsLimits}
            activeOpacity={0.8}
          >
            <View style={styles.featureIconCircleTop}>
              <Grid size={28} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureBottomContent}>
              <Text style={styles.featureTitleWhite}>Apps Limits</Text>
              <Text style={styles.featureSubtextWhite}>{appsLimits} Apps</Text>
            </View>
          </TouchableOpacity>

          {/* Device Protection */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.deviceProtectionCard]} 
            onPress={handleDeviceProtection}
            activeOpacity={0.8}
          >
            <View style={styles.featureIconCircleTop}>
              <Shield size={28} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureBottomContent}>
              <Text style={styles.featureTitleWhite}>Device</Text>
              <Text style={styles.featureTitleWhite}>Protection</Text>
            </View>
          </TouchableOpacity>

          {/* GPS */}
          <TouchableOpacity 
            style={[styles.featureCard, styles.gpsCard]} 
            onPress={handleGPS}
            activeOpacity={0.8}
          >
            <View style={styles.featureIconCircleTop}>
              <MapPin size={28} color="#FFF" strokeWidth={2} />
            </View>
            <View style={styles.featureBottomContent}>
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
    backgroundColor: '#F8F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: '#FFFFFF',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatarRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#4DD0E1',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EF9A9A',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarHead: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8D6E63',
    marginTop: 20,
  },
  avatarBody: {
    width: 50,
    height: 30,
    backgroundColor: '#4CAF50',
    marginTop: 4,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  childName: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 6,
  },
  lastActive: {
    fontSize: 15,
    color: '#757575',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 32,
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EBF3FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 13,
    color: '#5B8DEF',
    fontWeight: '600',
  },
  featuresTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 16,
  },
  featureCard: {
    borderRadius: 20,
    padding: 20,
    width: '46%',
    minHeight: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  blockAppsCard: {
    backgroundColor: '#E3F2FD',
  },
  appsLimitsCard: {
    backgroundColor: '#FFB74D',
  },
  deviceProtectionCard: {
    backgroundColor: '#9575CD',
  },
  gpsCard: {
    backgroundColor: '#4DB6AC',
  },
  featureTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featureTextContent: {
    flex: 1,
  },
  featureBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 'auto',
  },
  featureIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconCircleTop: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureBottomContent: {
    marginTop: 'auto',
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  featureTitleWhite: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  featureSubtext: {
    fontSize: 13,
    color: '#E57373',
    marginTop: 4,
    fontWeight: '600',
  },
  featureSubtextWhite: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4,
    fontWeight: '600',
  },
});