import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Switch } from 'react-native';

export default function ContentBlockingScreen() {
  const [selectedChild, setSelectedChild] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addType, setAddType] = useState('app'); // 'app' or 'website'
  const [itemName, setItemName] = useState('');
  const [itemUrl, setItemUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('blocked');

  const [children] = useState([
    { id: 1, name: 'Emma', avatar: '👧', color: '#FDE1EC', age: 8 },
    { id: 2, name: 'Jake', avatar: '👦', color: '#DBEAFE', age: 12 }
  ]);

  const [blockedApps, setBlockedApps] = useState([
    { id: 1, childId: 1, name: 'TikTok', icon: '📱', category: 'Social Media', blocked: true },
    { id: 2, childId: 1, name: 'Instagram', icon: '📷', category: 'Social Media', blocked: true },
    { id: 3, childId: 1, name: 'Snapchat', icon: '👻', category: 'Social Media', blocked: true },
    { id: 4, childId: 2, name: 'Twitter', icon: '🐦', category: 'Social Media', blocked: true },
    { id: 5, childId: 2, name: 'Reddit', icon: '🤖', category: 'Social Media', blocked: true },
  ]);

  const [blockedWebsites, setBlockedWebsites] = useState([
    { id: 1, childId: 1, url: 'facebook.com', category: 'Social Media', blocked: true },
    { id: 2, childId: 1, url: 'youtube.com', category: 'Video Streaming', blocked: true },
    { id: 3, childId: 2, url: 'twitch.tv', category: 'Video Streaming', blocked: true },
    { id: 4, childId: 2, url: 'discord.com', category: 'Communication', blocked: true },
  ]);

  const [categories] = useState([
    { id: 1, name: 'Adult Content', icon: '🔞', blocked: true, count: 0 },
    { id: 2, name: 'Gambling', icon: '🎰', blocked: true, count: 0 },
    { id: 3, name: 'Violence', icon: '⚔️', blocked: true, count: 0 },
    { id: 4, name: 'Social Media', icon: '📱', blocked: false, count: 8 },
  ]);

  const [schedules] = useState([
    { id: 1, childId: 1, name: 'School Hours', days: 'Mon-Fri', time: '8:00 AM - 3:00 PM', active: true },
    { id: 2, childId: 1, name: 'Bedtime', days: 'Daily', time: '9:00 PM - 7:00 AM', active: true },
    { id: 3, childId: 2, name: 'Homework Time', days: 'Mon-Fri', time: '4:00 PM - 6:00 PM', active: true },
  ]);

  const addBlockedItem = () => {
    if (addType === 'app' && itemName && selectedChild) {
      const newApp = {
        id: Date.now(),
        childId: selectedChild.id,
        name: itemName,
        icon: '📱',
        category: 'Custom',
        blocked: true
      };
      setBlockedApps([...blockedApps, newApp]);
      setItemName('');
      setShowAddModal(false);
    } else if (addType === 'website' && itemUrl && selectedChild) {
      const newWebsite = {
        id: Date.now(),
        childId: selectedChild.id,
        url: itemUrl,
        category: 'Custom',
        blocked: true
      };
      setBlockedWebsites([...blockedWebsites, newWebsite]);
      setItemUrl('');
      setShowAddModal(false);
    }
  };

  const toggleAppBlock = (id) => {
    setBlockedApps(blockedApps.map(app => 
      app.id === id ? { ...app, blocked: !app.blocked } : app
    ));
  };

  const toggleWebsiteBlock = (id) => {
    setBlockedWebsites(blockedWebsites.map(site => 
      site.id === id ? { ...site, blocked: !site.blocked } : site
    ));
  };

  const deleteApp = (id) => {
    setBlockedApps(blockedApps.filter(app => app.id !== id));
  };

  const deleteWebsite = (id) => {
    setBlockedWebsites(blockedWebsites.filter(site => site.id !== id));
  };

  const filteredApps = selectedChild 
    ? blockedApps.filter(app => 
        app.childId === selectedChild.id && 
        app.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const filteredWebsites = selectedChild
    ? blockedWebsites.filter(site => 
        site.childId === selectedChild.id && 
        site.url.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  if (!selectedChild) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Text style={styles.headerIconText}>🛡️</Text>
            </View>
            <Text style={styles.headerTitle}>Content Blocking</Text>
            <Text style={styles.headerSubtitle}>Block inappropriate apps and websites</Text>
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
                    <Text style={styles.childAge}>{child.age} years old</Text>
                  </View>
                </View>

                <View style={styles.statsGrid}>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {blockedApps.filter(a => a.childId === child.id && a.blocked).length}
                    </Text>
                    <Text style={styles.statLabel}>Blocked Apps</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {blockedWebsites.filter(w => w.childId === child.id && w.blocked).length}
                    </Text>
                    <Text style={styles.statLabel}>Blocked Sites</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statValue}>
                      {schedules.filter(s => s.childId === child.id && s.active).length}
                    </Text>
                    <Text style={styles.statLabel}>Schedules</Text>
                  </View>
                </View>

                <View style={styles.viewDetailsButton}>
                  <Text style={styles.viewDetailsText}>🛡️ Manage Restrictions →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.quickActionGrid}>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>🔞</Text>
                <Text style={styles.quickActionText}>Block Adult Content</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>🎰</Text>
                <Text style={styles.quickActionText}>Block Gambling</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>🎮</Text>
                <Text style={styles.quickActionText}>Gaming Limits</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.quickActionCard}>
                <Text style={styles.quickActionIcon}>📱</Text>
                <Text style={styles.quickActionText}>Social Media</Text>
              </TouchableOpacity>
            </View>
          </View>
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
            <Text style={styles.profileAge}>{selectedChild.age} years old</Text>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            onPress={() => setActiveTab('blocked')}
            style={[styles.tab, activeTab === 'blocked' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'blocked' && styles.activeTabText]}>
              🚫 Blocked Content
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('categories')}
            style={[styles.tab, activeTab === 'categories' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'categories' && styles.activeTabText]}>
              📂 Categories
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('schedules')}
            style={[styles.tab, activeTab === 'schedules' && styles.activeTab]}
          >
            <Text style={[styles.tabText, activeTab === 'schedules' && styles.activeTabText]}>
              ⏰ Schedules
            </Text>
          </TouchableOpacity>
        </View>

        {/* Blocked Content Tab */}
        {activeTab === 'blocked' && (
          <>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search apps or websites..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.addButtonsRow}>
              <TouchableOpacity 
                onPress={() => {
                  setAddType('app');
                  setShowAddModal(true);
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Block App</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setAddType('website');
                  setShowAddModal(true);
                }}
                style={styles.addButton}
              >
                <Text style={styles.addButtonText}>+ Block Website</Text>
              </TouchableOpacity>
            </View>

            {/* Blocked Apps */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📱 Blocked Apps ({filteredApps.length})</Text>
              {filteredApps.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No blocked apps yet</Text>
                </View>
              ) : (
                filteredApps.map(app => (
                  <View key={app.id} style={styles.itemCard}>
                    <View style={styles.itemIcon}>
                      <Text style={styles.itemIconText}>{app.icon}</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{app.name}</Text>
                      <Text style={styles.itemCategory}>{app.category}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <Switch
                        value={app.blocked}
                        onValueChange={() => toggleAppBlock(app.id)}
                        trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                        thumbColor={app.blocked ? '#FFFFFF' : '#F3F4F6'}
                      />
                      <TouchableOpacity
                        onPress={() => deleteApp(app.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Blocked Websites */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🌐 Blocked Websites ({filteredWebsites.length})</Text>
              {filteredWebsites.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No blocked websites yet</Text>
                </View>
              ) : (
                filteredWebsites.map(site => (
                  <View key={site.id} style={styles.itemCard}>
                    <View style={styles.itemIcon}>
                      <Text style={styles.itemIconText}>🌐</Text>
                    </View>
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{site.url}</Text>
                      <Text style={styles.itemCategory}>{site.category}</Text>
                    </View>
                    <View style={styles.itemActions}>
                      <Switch
                        value={site.blocked}
                        onValueChange={() => toggleWebsiteBlock(site.id)}
                        trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                        thumbColor={site.blocked ? '#FFFFFF' : '#F3F4F6'}
                      />
                      <TouchableOpacity
                        onPress={() => deleteWebsite(site.id)}
                        style={styles.deleteButton}
                      >
                        <Text style={styles.deleteButtonText}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📂 Content Categories</Text>
            <Text style={styles.sectionDescription}>
              Block entire categories of content automatically
            </Text>
            {categories.map(category => (
              <View key={category.id} style={styles.categoryCard}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                  <View style={styles.categoryInfo}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.categoryCount}>
                      {category.count > 0 ? `${category.count} items` : 'System filter'}
                    </Text>
                  </View>
                  <Switch
                    value={category.blocked}
                    trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                    thumbColor={category.blocked ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>
                {category.blocked && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>✓ Protected</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Schedules Tab */}
        {activeTab === 'schedules' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⏰ Blocking Schedules</Text>
              <TouchableOpacity style={styles.addScheduleButton}>
                <Text style={styles.addScheduleButtonText}>+ Add</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.sectionDescription}>
              Automatically block content during specific times
            </Text>
            {schedules.filter(s => s.childId === selectedChild.id).map(schedule => (
              <View key={schedule.id} style={styles.scheduleCard}>
                <View style={styles.scheduleHeader}>
                  <View style={styles.scheduleInfo}>
                    <Text style={styles.scheduleName}>{schedule.name}</Text>
                    <Text style={styles.scheduleDays}>{schedule.days}</Text>
                    <Text style={styles.scheduleTime}>⏰ {schedule.time}</Text>
                  </View>
                  <Switch
                    value={schedule.active}
                    trackColor={{ false: '#D1D5DB', true: '#4F46E5' }}
                    thumbColor={schedule.active ? '#FFFFFF' : '#F3F4F6'}
                  />
                </View>
                {schedule.active && (
                  <View style={styles.scheduleActiveBadge}>
                    <Text style={styles.scheduleActiveBadgeText}>🟢 Active</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Add Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {addType === 'app' ? 'Block App' : 'Block Website'}
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>
                  {addType === 'app' ? 'App Name' : 'Website URL'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={addType === 'app' ? itemName : itemUrl}
                  onChangeText={addType === 'app' ? setItemName : setItemUrl}
                  placeholder={addType === 'app' ? 'e.g., TikTok' : 'e.g., example.com'}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  onPress={addBlockedItem}
                  style={styles.saveButton}
                >
                  <Text style={styles.saveButtonText}>Block Now</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowAddModal(false);
                    setItemName('');
                    setItemUrl('');
                  }}
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
    alignItems: 'center',
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
  childAge: {
    fontSize: 14,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'center',
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
  quickActionsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
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
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
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
  profileAge: {
    fontSize: 16,
    color: '#6B7280',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  tab: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
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
  sectionDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  itemIcon: {
    width: 48,
    height: 48,
    backgroundColor: '#EEF2FF',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: {
    fontSize: 24,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 13,
    color: '#6B7280',
  },
  itemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    fontSize: 20,
  },
  categoryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 13,
    color: '#6B7280',
  },
  categoryBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addScheduleButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addScheduleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  scheduleCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  scheduleDays: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 13,
    color: '#4B5563',
  },
  scheduleActiveBadge: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  scheduleActiveBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
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
    backgroundColor: '#EF4444',
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