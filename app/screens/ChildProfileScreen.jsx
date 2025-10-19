import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';

export default function ChildProfileScreen() {
  const [profiles, setProfiles] = useState([
    { 
      id: 1, 
      name: 'Emma', 
      age: 8, 
      avatar: '👧', 
      color: '#FDE1EC',
      activities: [
        { id: 1, platform: 'YouTube', action: 'Watched', content: 'DIY Crafts Tutorial', time: '2 hours ago', duration: '15 min' },
        { id: 2, platform: 'Instagram', action: 'Browsed', content: 'Art & Drawing Posts', time: '4 hours ago', duration: '20 min' },
        { id: 3, platform: 'Messenger', action: 'Messaged', content: 'Sarah K.', time: '5 hours ago', duration: '10 min' }
      ],
      conversations: [
        { id: 1, platform: 'Messenger', contact: 'Sarah K.', lastMessage: 'See you at school tomorrow!', time: '5 hours ago', unread: 0 },
        { id: 2, platform: 'Instagram', contact: 'Art Club Group', lastMessage: 'Emma shared a drawing', time: '1 day ago', unread: 2 }
      ]
    },
    { 
      id: 2, 
      name: 'Jake', 
      age: 12, 
      avatar: '👦', 
      color: '#DBEAFE',
      activities: [
        { id: 1, platform: 'YouTube', action: 'Watched', content: 'Minecraft Building Guide', time: '1 hour ago', duration: '25 min' },
        { id: 2, platform: 'Twitter', action: 'Posted', content: 'Just beat level 50!', time: '3 hours ago', duration: '2 min' },
        { id: 3, platform: 'Facebook', action: 'Commented', content: 'School Project Group', time: '6 hours ago', duration: '5 min' }
      ],
      conversations: [
        { id: 1, platform: 'WhatsApp', contact: 'Gaming Squad', lastMessage: 'Anyone online for a match?', time: '2 hours ago', unread: 5 },
        { id: 2, platform: 'Messenger', contact: 'Dad', lastMessage: 'Can I stay up until 9pm?', time: '3 hours ago', unread: 0 }
      ]
    }
  ]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('activities');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', age: '', avatar: '👶' });
  const [searchTerm, setSearchTerm] = useState('');

  const avatars = ['👶', '👧', '👦', '🧒', '👨', '👩', '🧑'];

  const platformColors = {
    Instagram: '#E1306C',
    Facebook: '#1877F2',
    Twitter: '#1DA1F2',
    Messenger: '#0084FF',
    WhatsApp: '#25D366',
    YouTube: '#FF0000'
  };

  const handleAdd = () => {
    if (formData.name && formData.age) {
      const colors = ['#FDE1EC', '#DBEAFE', '#E9D5FF', '#D1FAE5', '#FEF3C7'];
      setProfiles([...profiles, {
        id: Date.now(),
        name: formData.name,
        age: parseInt(formData.age),
        avatar: formData.avatar,
        color: colors[Math.floor(Math.random() * colors.length)],
        activities: [],
        conversations: []
      }]);
      setFormData({ name: '', age: '', avatar: '👶' });
      setIsAdding(false);
    }
  };

  const handleUpdate = () => {
    if (formData.name && formData.age) {
      setProfiles(profiles.map(p => 
        p.id === editingId 
          ? { ...p, name: formData.name, age: parseInt(formData.age), avatar: formData.avatar }
          : p
      ));
      setEditingId(null);
      setFormData({ name: '', age: '', avatar: '👶' });
    }
  };

  const handleDelete = (id) => {
    setProfiles(profiles.filter(p => p.id !== id));
    if (selectedProfile?.id === id) {
      setSelectedProfile(null);
    }
  };

  const startEdit = (profile) => {
    setEditingId(profile.id);
    setFormData({ name: profile.name, age: profile.age.toString(), avatar: profile.avatar });
    setIsAdding(false);
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', age: '', avatar: '👶' });
  };

  const viewProfile = (profile) => {
    setSelectedProfile(profile);
    setActiveTab('activities');
  };

  const filteredActivities = selectedProfile?.activities.filter(activity =>
    activity.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.platform.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredConversations = selectedProfile?.conversations.filter(conv =>
    conv.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.platform.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (selectedProfile) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity 
            onPress={() => setSelectedProfile(null)}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Back to Profiles</Text>
          </TouchableOpacity>

          <View style={[styles.profileHeader, { backgroundColor: selectedProfile.color }]}>
            <Text style={styles.avatarLarge}>{selectedProfile.avatar}</Text>
            <View>
              <Text style={styles.profileNameLarge}>{selectedProfile.name}</Text>
              <Text style={styles.profileAge}>{selectedProfile.age} years old</Text>
            </View>
          </View>

          <View style={styles.tabContainer}>
            <TouchableOpacity
              onPress={() => setActiveTab('activities')}
              style={[styles.tab, activeTab === 'activities' && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === 'activities' && styles.activeTabText]}>
                📊 Activities
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab('conversations')}
              style={[styles.tab, activeTab === 'conversations' && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === 'conversations' && styles.activeTabText]}>
                💬 Conversations
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder={`Search ${activeTab}...`}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {activeTab === 'activities' && (
            <View style={styles.listContainer}>
              {filteredActivities.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No activities found</Text>
                </View>
              ) : (
                filteredActivities.map(activity => (
                  <View key={activity.id} style={styles.activityCard}>
                    <View style={[styles.platformBadge, { backgroundColor: platformColors[activity.platform] }]}>
                      <Text style={styles.platformText}>{activity.platform[0]}</Text>
                    </View>
                    <View style={styles.activityContent}>
                      <View style={styles.activityHeader}>
                        <Text style={styles.platformName}>{activity.platform}</Text>
                        <Text style={styles.separator}>•</Text>
                        <Text style={styles.actionText}>{activity.action}</Text>
                      </View>
                      <Text style={styles.contentText}>{activity.content}</Text>
                      <View style={styles.activityFooter}>
                        <Text style={styles.timeText}>🕐 {activity.time}</Text>
                        <Text style={styles.durationText}>Duration: {activity.duration}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === 'conversations' && (
            <View style={styles.listContainer}>
              {filteredConversations.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>No conversations found</Text>
                </View>
              ) : (
                filteredConversations.map(conv => (
                  <TouchableOpacity key={conv.id} style={styles.conversationCard}>
                    <View style={[styles.platformBadge, { backgroundColor: platformColors[conv.platform] }]}>
                      <Text style={styles.platformText}>{conv.platform[0]}</Text>
                    </View>
                    <View style={styles.conversationContent}>
                      <View style={styles.conversationHeader}>
                        <Text style={styles.contactName}>{conv.contact}</Text>
                        <Text style={styles.platformTag}>via {conv.platform}</Text>
                      </View>
                      <Text style={styles.lastMessage}>{conv.lastMessage}</Text>
                      <Text style={styles.convTime}>{conv.time}</Text>
                    </View>
                    {conv.unread > 0 && (
                      <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{conv.unread}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>👤</Text>
          </View>
          <Text style={styles.headerTitle}>Child Profiles</Text>
          <Text style={styles.headerSubtitle}>Manage your children's accounts</Text>
        </View>

        <View style={styles.profileList}>
          {profiles.map(profile => (
            <View key={profile.id} style={[styles.profileCard, { backgroundColor: profile.color }]}>
              <View style={styles.profileCardContent}>
                <Text style={styles.avatar}>{profile.avatar}</Text>
                <View style={styles.profileInfo}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.ageText}>{profile.age} years old</Text>
                  <TouchableOpacity onPress={() => viewProfile(profile)} style={styles.viewActivityButton}>
                    <Text style={styles.viewActivityText}>📈 View Activity</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={() => startEdit(profile)} style={styles.editButton}>
                  <Text style={styles.buttonEmoji}>✏️</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(profile.id)} style={styles.deleteButton}>
                  <Text style={styles.buttonEmoji}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {(isAdding || editingId) && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {editingId ? 'Edit Profile' : 'Add New Child'}
            </Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder="Enter child's name"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Age</Text>
              <TextInput
                style={styles.input}
                value={formData.age}
                onChangeText={(text) => setFormData({ ...formData, age: text })}
                placeholder="Enter age"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Avatar</Text>
              <View style={styles.avatarPicker}>
                {avatars.map(av => (
                  <TouchableOpacity
                    key={av}
                    onPress={() => setFormData({ ...formData, avatar: av })}
                    style={[
                      styles.avatarOption,
                      formData.avatar === av && styles.avatarOptionSelected
                    ]}
                  >
                    <Text style={styles.avatarOptionText}>{av}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={editingId ? handleUpdate : handleAdd}
                style={styles.saveButton}
              >
                <Text style={styles.saveButtonText}>
                  {editingId ? '💾 Update' : '💾 Add'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelForm} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>✖️ Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!isAdding && !editingId && (
          <TouchableOpacity onPress={() => setIsAdding(true)} style={styles.addButton}>
            <Text style={styles.addButtonText}>➕ Add New Child</Text>
          </TouchableOpacity>
        )}
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
  },
  profileList: {
    marginBottom: 20,
  },
  profileCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profileCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 48,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ageText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  viewActivityButton: {
    alignSelf: 'flex-start',
  },
  viewActivityText: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deleteButton: {
    width: 44,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonEmoji: {
    fontSize: 20,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
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
  avatarPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  avatarOption: {
    width: 56,
    height: 56,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarOptionSelected: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: '#4F46E5',
  },
  avatarOptionText: {
    fontSize: 32,
  },
  formActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginRight: 8,
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
  addButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
  },
  addButtonText: {
    color: '#4F46E5',
    fontSize: 16,
    fontWeight: 'bold',
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
    padding: 14,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4F46E5',
  },
  searchContainer: {
    marginBottom: 20,
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
  listContainer: {
    gap: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6B7280',
    fontSize: 16,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  platformBadge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  platformName: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 14,
  },
  separator: {
    color: '#9CA3AF',
    marginHorizontal: 6,
  },
  actionText: {
    color: '#6B7280',
    fontSize: 14,
  },
  contentText: {
    color: '#374151',
    fontSize: 15,
    marginBottom: 8,
  },
  activityFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  timeText: {
    fontSize: 13,
    color: '#6B7280',
  },
  durationText: {
    fontSize: 13,
    color: '#6B7280',
  },
  conversationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  contactName: {
    fontWeight: 'bold',
    color: '#1F2937',
    fontSize: 15,
  },
  platformTag: {
    fontSize: 12,
    color: '#6B7280',
  },
  lastMessage: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  convTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});