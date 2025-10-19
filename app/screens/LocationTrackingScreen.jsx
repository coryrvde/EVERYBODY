import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal } from 'react-native';

export default function LocationTrackingScreen() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [showGeofenceModal, setShowGeofenceModal] = useState(false);
  const [geofenceName, setGeofenceName] = useState('');
  const [geofenceRadius, setGeofenceRadius] = useState('100');
  const [locationHistory, setLocationHistory] = useState(true);
  const [realTimeTracking, setRealTimeTracking] = useState(true);
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const [children] = useState([
    { 
      id: 1, 
      name: 'Emma', 
      avatar: '👧',
      color: '#FDE1EC',
      currentLocation: { lat: 18.0179, lng: -76.8099, address: 'Kingston High School' },
      battery: 85,
      lastUpdated: '2 mins ago',
      status: 'safe'
    },
    { 
      id: 2, 
      name: 'Jake', 
      avatar: '👦',
      color: '#DBEAFE',
      currentLocation: { lat: 18.0199, lng: -76.8089, address: 'King Street Park' },
      battery: 45,
      lastUpdated: '5 mins ago',
      status: 'safe'
    }
  ]);

  const [geofences, setGeofences] = useState([
    { id: 1, childId: 1, name: 'School', radius: 150, lat: 18.0179, lng: -76.8099, active: true },
    { id: 2, childId: 1, name: 'Home', radius: 200, lat: 18.0189, lng: -76.8079, active: true },
    { id: 3, childId: 2, name: 'Basketball Court', radius: 100, lat: 18.0199, lng: -76.8089, active: true }
  ]);

  const [locationHistoryData] = useState([
    { id: 1, childId: 1, location: 'Kingston High School', time: '8:30 AM', date: 'Today' },
    { id: 2, childId: 1, location: 'Hope Road Café', time: '12:15 PM', date: 'Today' },
    { id: 3, childId: 1, location: 'Home', time: '3:45 PM', date: 'Today' },
    { id: 4, childId: 2, location: 'Home', time: '7:00 AM', date: 'Today' },
    { id: 5, childId: 2, location: 'King Street Park', time: '2:30 PM', date: 'Today' }
  ]);

  const [alerts] = useState([
    { id: 1, childId: 1, type: 'entered', zone: 'School', time: '2 hours ago', read: false },
    { id: 2, childId: 2, type: 'low-battery', message: 'Battery below 50%', time: '30 mins ago', read: false },
    { id: 3, childId: 1, type: 'left', zone: 'Home', time: '5 hours ago', read: true }
  ]);

  const addGeofence = () => {
    if (geofenceName && geofenceRadius && selectedChild) {
      const newGeofence = {
        id: Date.now(),
        childId: selectedChild.id,
        name: geofenceName,
        radius: parseInt(geofenceRadius),
        lat: selectedChild.currentLocation.lat + (Math.random() - 0.5) * 0.01,
        lng: selectedChild.currentLocation.lng + (Math.random() - 0.5) * 0.01,
        active: true
      };
      setGeofences([...geofences, newGeofence]);
      setGeofenceName('');
      setGeofenceRadius('100');
      setShowGeofenceModal(false);
    }
  };

  const toggleGeofence = (id) => {
    setGeofences(geofences.map(g => 
      g.id === id ? { ...g, active: !g.active } : g
    ));
  };

  const deleteGeofence = (id) => {
    setGeofences(geofences.filter(g => g.id !== id));
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'entered': return '✅';
      case 'left': return '⚠️';
      case 'low-battery': return '🔋';
      default: return '📍';
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'entered': return '#10B981';
      case 'left': return '#F59E0B';
      case 'low-battery': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const ToggleSwitch = ({ value, onValueChange }) => (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={[styles.toggleContainer, value ? styles.toggleActive : styles.toggleInactive]}
    >
      <View style={[styles.toggleThumb, value ? styles.toggleThumbActive : styles.toggleThumbInactive]} />
    </TouchableOpacity>
  );

  if (!selectedChild) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>📍</Text>
            </View>
            <Text style={styles.headerTitle}>Location Tracking</Text>
            <Text style={styles.headerSubtitle}>Monitor your children's location in real-time</Text>
          </View>

          <View style={styles.childList}>
            {children.map(child => (
              <TouchableOpacity
                key={child.id}
                onPress={() => setSelectedChild(child)}
                style={[styles.childCard, { backgroundColor: child.color }]}
              >
                <View style={styles.childCardHeader}>
                  <Text style={styles.childAvatar}>{child.avatar}</Text>
                  <View style={styles.childInfo}>
                    <Text style={styles.childName}>{child.name}</Text>
                    <Text style={styles.locationAddress}>📍 {child.currentLocation.address}</Text>
                    <Text style={styles.lastUpdated}>Updated {child.lastUpdated}</Text>
                  </View>
                </View>
                
                <View style={styles.childStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Battery</Text>
                    <View style={styles.batteryContainer}>
                      <Text style={[styles.batteryText, child.battery < 50 && styles.lowBattery]}>
                        🔋 {child.battery}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statLabel}>Status</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>✓ Safe</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>📈 View Map & Details →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {alerts.filter(a => !a.read).length > 0 && (
            <View style={styles.alertsSection}>
              <Text style={styles.sectionTitle}>⚠️ Recent Alerts</Text>
              {alerts.filter(a => !a.read).map(alert => (
                <View 
                  key={alert.id} 
                  style={[styles.alertCard, { borderLeftColor: getAlertColor(alert.type) }]}
                >
                  <Text style={styles.alertIcon}>{getAlertIcon(alert.type)}</Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>
                      {children.find(c => c.id === alert.childId)?.name}
                    </Text>
                    <Text style={styles.alertMessage}>
                      {alert.zone ? `${alert.type} ${alert.zone}` : alert.message}
                    </Text>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          onPress={() => setSelectedChild(null)}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Back to Children</Text>
        </TouchableOpacity>

        <View style={[styles.profileHeader, { backgroundColor: selectedChild.color }]}>
          <Text style={styles.avatarLarge}>{selectedChild.avatar}</Text>
          <View>
            <Text style={styles.profileNameLarge}>{selectedChild.name}</Text>
            <Text style={styles.locationText}>📍 {selectedChild.currentLocation.address}</Text>
            <Text style={styles.coordsText}>
              {selectedChild.currentLocation.lat.toFixed(4)}, {selectedChild.currentLocation.lng.toFixed(4)}
            </Text>
          </View>
        </View>

        {/* Interactive Map */}
        <View style={styles.mapContainer}>
          <View style={styles.gridBackground} />
          
          <View style={styles.mapContent}>
            <Text style={styles.mapIcon}>🗺️</Text>
            <Text style={styles.mapTitle}>Live Location Map</Text>
            <Text style={styles.mapSubtitle}>Real-time tracking enabled</Text>
            
            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapControlButton}>
                <Text style={styles.controlButtonText}>🎯 Center</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.mapControlButton}>
                <Text style={styles.controlButtonText}>🔄 Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Child Location Marker */}
            <View style={styles.locationMarkerContainer}>
              <View style={styles.locationPulse} />
              <View style={styles.locationMarker}>
                <Text style={styles.markerText}>{selectedChild.avatar}</Text>
              </View>
            </View>

            {/* Geofence Zones */}
            {geofences.filter(g => g.childId === selectedChild.id && g.active).map((zone, idx) => (
              <View 
                key={zone.id}
                style={[
                  styles.geofenceZone,
                  { top: 100 + idx * 50, left: 50 + idx * 60 }
                ]}
              >
                <View style={styles.geofenceLabel}>
                  <Text style={styles.geofenceLabelText}>{zone.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🔋</Text>
            <Text style={styles.statValue}>{selectedChild.battery}%</Text>
            <Text style={styles.statBoxLabel}>Battery</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>⏱️</Text>
            <Text style={styles.statValueSmall}>{selectedChild.lastUpdated}</Text>
            <Text style={styles.statBoxLabel}>Last Update</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statIcon}>🛡️</Text>
            <Text style={styles.statValue}>Safe</Text>
            <Text style={styles.statBoxLabel}>Status</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>⚙️ Tracking Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Real-Time Tracking</Text>
              <Text style={styles.settingDescription}>Live location updates</Text>
            </View>
            <ToggleSwitch value={realTimeTracking} onValueChange={setRealTimeTracking} />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Location History</Text>
              <Text style={styles.settingDescription}>Store past locations</Text>
            </View>
            <ToggleSwitch value={locationHistory} onValueChange={setLocationHistory} />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Geofence Alerts</Text>
              <Text style={styles.settingDescription}>Notify zone changes</Text>
            </View>
            <ToggleSwitch value={alertsEnabled} onValueChange={setAlertsEnabled} />
          </View>
        </View>

        {/* Geofences */}
        <View style={styles.geofenceSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏠 Safe Zones (Geofences)</Text>
            <TouchableOpacity
              onPress={() => setShowGeofenceModal(true)}
              style={styles.addGeofenceButton}
            >
              <Text style={styles.addGeofenceButtonText}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {geofences.filter(g => g.childId === selectedChild.id).map(geofence => (
            <View key={geofence.id} style={styles.geofenceCard}>
              <View style={styles.geofenceInfo}>
                <Text style={styles.geofenceName}>{geofence.name}</Text>
                <Text style={styles.geofenceRadius}>Radius: {geofence.radius}m</Text>
                <Text style={styles.geofenceCoords}>
                  {geofence.lat.toFixed(4)}, {geofence.lng.toFixed(4)}
                </Text>
              </View>
              <View style={styles.geofenceActions}>
                <ToggleSwitch value={geofence.active} onValueChange={() => toggleGeofence(geofence.id)} />
                <TouchableOpacity
                  onPress={() => deleteGeofence(geofence.id)}
                  style={styles.deleteGeofenceButton}
                >
                  <Text style={styles.deleteGeofenceText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Location History */}
        {locationHistory && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>📜 Location History</Text>
            {locationHistoryData
              .filter(h => h.childId === selectedChild.id)
              .map(history => (
                <View key={history.id} style={styles.historyCard}>
                  <View style={styles.historyMarker}>
                    <Text style={styles.historyMarkerText}>📍</Text>
                  </View>
                  <View style={styles.historyInfo}>
                    <Text style={styles.historyLocation}>{history.location}</Text>
                    <Text style={styles.historyTime}>{history.time} • {history.date}</Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Add Geofence Modal */}
        <Modal
          visible={showGeofenceModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGeofenceModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Safe Zone</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Zone Name</Text>
                <TextInput
                  style={styles.input}
                  value={geofenceName}
                  onChangeText={setGeofenceName}
                  placeholder="e.g., School, Home, Park"
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Radius (meters)</Text>
                <TextInput
                  style={styles.input}
                  value={geofenceRadius}
                  onChangeText={setGeofenceRadius}
                  placeholder="100"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={addGeofence}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Add Zone</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowGeofenceModal(false)}
                  style={styles.cancelButton}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  headerIconText: {
    fontSize: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  childList: {
    marginBottom: 20,
  },
  childCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  childCardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  childAvatar: {
    fontSize: 48,
    marginRight: 16,
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationAddress: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
  },
  childStats: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  batteryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 8,
    padding: 8,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10B981',
  },
  lowBattery: {
    color: '#EF4444',
  },
  statusBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 8,
    padding: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  viewDetailsButton: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.5)',
  },
  viewDetailsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  avatarLarge: {
    fontSize: 64,
    marginRight: 16,
  },
  profileNameLarge: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  coordsText: {
    fontSize: 12,
    color: '#6B7280',
  },
  mapContainer: {
    height: 400,
    borderRadius: 20,
    marginBottom: 20,
    backgroundColor: '#E0E7FF',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    position: 'relative',
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundColor: 'transparent',
  },
  mapContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  mapIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 4,
  },
  mapSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  mapControls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  mapControlButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  locationMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -25,
    marginTop: -25,
  },
  locationPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4F46E5',
    opacity: 0.3,
  },
  locationMarker: {
    width: 50,
    height: 50,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 4,
    borderColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  markerText: {
    fontSize: 24,
  },
  geofenceZone: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#4F46E5',
    backgroundColor: 'rgba(79, 70, 229, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  geofenceLabel: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  geofenceLabelText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statValueSmall: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  settingsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
  },
  toggleContainer: {
    width: 56,
    height: 32,
    borderRadius: 16,
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#4F46E5',
  },
  toggleInactive: {
    backgroundColor: '#D1D5DB',
  },
  toggleThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  toggleThumbInactive: {
    alignSelf: 'flex-start',
  },
  geofenceSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addGeofenceButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addGeofenceButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  geofenceCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  geofenceInfo: {
    flex: 1,
  },
  geofenceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  geofenceRadius: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  geofenceCoords: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  geofenceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteGeofenceButton: {
    padding: 8,
  },
  deleteGeofenceText: {
    fontSize: 20,
  },
  historySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  historyMarker: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyMarkerText: {
    fontSize: 20,
  },
  historyInfo: {
    flex: 1,
  },
  historyLocation: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 13,
    color: '#6B7280',
  },
  alertsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  alertMessage: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 2,
  },
  alertTime: {
    fontSize: 12,
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});