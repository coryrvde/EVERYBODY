import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  StatusBar,
  Switch,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../supabase';
import { 
  ChevronRight,
  User,
  Bell,
  Shield,
  Eye,
  Moon,
  Globe,
  HelpCircle,
  Info,
  LogOut,
  Settings as SettingsIcon,
  Smartphone,
  Lock,
  Mail,
  Phone,
  MapPin,
  Clock,
  Palette,
  Volume2,
  Wifi,
  Battery,
  Database,
  Trash2,
  BarChart,
  AlertTriangle,
  Fingerprint,
  FileText,
  ChevronLeft,
  Users,
  Camera,
  Unlink
} from 'lucide-react-native';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('parent'); // 'parent' or 'child'
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [settings, setSettings] = useState({
    notifications: {
      push: true,
      email: true,
      sms: false,
      securityAlerts: true,
      systemUpdates: true,
      aiInsights: false
    },
    privacy: {
      locationTracking: true,
      dataCollection: true,
      analytics: false,
      crashReports: true
    },
    app: {
      theme: 'light',
      language: 'en',
      autoLock: true,
      biometricAuth: false,
      hapticFeedback: true
    }
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  const loadUserProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      // Get user profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else {
        setUserProfile(profile);
        setUserRole(profile.role || 'parent');
      }

      // If user is a parent, load linked children
      if (profile?.role === 'parent') {
        const { data: links, error: linksError } = await supabase
          .from('family_links')
          .select(`
            child_id,
            created_at,
            profiles!family_links_child_id_fkey (
              id,
              full_name,
              created_at
            )
          `)
          .eq('parent_id', user.id);

        if (!linksError && links) {
          const children = links.map(link => ({
            id: link.child_id,
            name: link.profiles?.full_name || 'Unknown Child',
            linkedAt: link.created_at
          }));
          setLinkedChildren(children);
        }
      }
    } catch (e) {
      console.error('Error in loadUserProfile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              navigation.navigate('Onboarding');
            } catch (e) {
              console.error('Logout error:', e);
              Alert.alert('Error', 'Failed to logout');
            }
          }
        }
      ]
    );
  };

  const handleSettingToggle = (category, setting) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting]
      }
    }));
  };

  const handleUnlinkChild = async (childId, childName) => {
    Alert.alert(
      'Unlink Child',
      `Are you sure you want to unlink ${childName}? This will remove your monitoring access to their device.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unlink',
          style: 'destructive',
          onPress: async () => {
            try {
              const { data: { session } } = await supabase.auth.getSession();
              const user = session?.user;
              if (!user) return;

              // Remove the family link from database
              const { error } = await supabase
                .from('family_links')
                .delete()
                .eq('parent_id', user.id)
                .eq('child_id', childId);

              if (error) {
                console.error('Error unlinking child:', error);
                Alert.alert('Error', 'Failed to unlink child. Please try again.');
                return;
              }

              // Update local state
              setLinkedChildren(prev => prev.filter(child => child.id !== childId));

              Alert.alert('Success', `${childName} has been unlinked successfully.`);
            } catch (e) {
              console.error('Error in handleUnlinkChild:', e);
              Alert.alert('Error', 'Failed to unlink child. Please try again.');
            }
          },
        },
      ]
    );
  };


  const SettingItem = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement, 
    showChevron = true,
    danger = false 
  }) => (
    <TouchableOpacity 
      style={[styles.settingItem, danger && styles.dangerItem]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, danger && styles.dangerIcon]}>
          <Icon size={20} color={danger ? '#EF4444' : '#6B7280'} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightElement}
        {showChevron && <ChevronRight size={16} color="#9CA3AF" />}
      </View>
    </TouchableOpacity>
  );

  const SwitchSetting = ({ icon: Icon, title, subtitle, value, onToggle, danger = false }) => (
    <SettingItem
      icon={Icon}
      title={title}
      subtitle={subtitle}
      rightElement={
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#E5E7EB', true: danger ? '#FECACA' : '#3B82F6' }}
          thumbColor={value ? '#FFFFFF' : '#9CA3AF'}
        />
      }
      showChevron={false}
      danger={danger}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading settings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <SettingsIcon size={24} color="#1F2937" />
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={User}
              title="Personal Information"
              subtitle={userProfile?.full_name || 'Not set'}
              onPress={() => console.log('Edit profile')}
            />
            <SettingItem
              icon={Mail}
              title="Email"
              subtitle={userProfile?.email || 'Not set'}
              onPress={() => console.log('Edit email')}
            />
            <SettingItem
              icon={Phone}
              title="Phone Number"
              subtitle={userProfile?.phone || 'Not set'}
              onPress={() => console.log('Edit phone')}
            />
            <SettingItem
              icon={MapPin}
              title="Emergency Contact"
              subtitle={userProfile?.emergency_contact || 'Not set'}
              onPress={() => console.log('Edit emergency contact')}
            />
          </View>
        </View>

        {/* Child Management Section - Only for Parents */}
        {userRole === 'parent' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Manage Children</Text>
            <View style={styles.sectionContent}>
              {linkedChildren.length > 0 ? (
                linkedChildren.map((child) => (
                  <View key={child.id} style={styles.childItem}>
                    <View style={styles.childItemContent}>
                      <View style={styles.childLeft}>
                        <View style={styles.iconContainer}>
                          <Users size={20} color="#6B7280" />
                        </View>
                        <View style={styles.settingText}>
                          <Text style={styles.settingTitle}>{child.name}</Text>
                          <Text style={styles.settingSubtitle}>
                            Linked {new Date(child.linkedAt).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.childRight}>
                        <TouchableOpacity
                          style={styles.unlinkButton}
                          onPress={() => handleUnlinkChild(child.id, child.name)}
                          activeOpacity={0.7}
                        >
                          <Unlink size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyChildrenState}>
                  <Text style={styles.emptyChildrenText}>No children linked yet</Text>
                  <Text style={styles.emptyChildrenSubtext}>Scan a child's QR code to get started</Text>
                </View>
              )}
              <SettingItem
                icon={Camera}
                title="Scan Child QR Code"
                subtitle="Link a new child device"
                onPress={() => navigation.navigate('ParentScan')}
              />
            </View>
          </View>
        )}

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.sectionContent}>
            <SwitchSetting
              icon={Bell}
              title="Push Notifications"
              subtitle="Receive push notifications"
              value={settings.notifications.push}
              onToggle={() => handleSettingToggle('notifications', 'push')}
            />
            <SwitchSetting
              icon={Mail}
              title="Email Alerts"
              subtitle="Receive notifications via email"
              value={settings.notifications.email}
              onToggle={() => handleSettingToggle('notifications', 'email')}
            />
            <SwitchSetting
              icon={Phone}
              title="SMS Alerts"
              subtitle="Receive notifications via SMS"
              value={settings.notifications.sms}
              onToggle={() => handleSettingToggle('notifications', 'sms')}
            />
            <SwitchSetting
              icon={Shield}
              title="Security Alerts"
              subtitle="Get notified about security issues"
              value={settings.notifications.securityAlerts}
              onToggle={() => handleSettingToggle('notifications', 'securityAlerts')}
            />
            <SwitchSetting
              icon={SettingsIcon}
              title="System Updates"
              subtitle="Notifications about app updates"
              value={settings.notifications.systemUpdates}
              onToggle={() => handleSettingToggle('notifications', 'systemUpdates')}
            />
            <SwitchSetting
              icon={Eye}
              title="AI Insights"
              subtitle="Weekly AI analysis reports"
              value={settings.notifications.aiInsights}
              onToggle={() => handleSettingToggle('notifications', 'aiInsights')}
            />
          </View>
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <View style={styles.sectionContent}>
            <SwitchSetting
              icon={MapPin}
              title="Location Tracking"
              subtitle="Allow location monitoring"
              value={settings.privacy.locationTracking}
              onToggle={() => handleSettingToggle('privacy', 'locationTracking')}
            />
            <SwitchSetting
              icon={Database}
              title="Data Collection"
              subtitle="Help improve the app with usage data"
              value={settings.privacy.dataCollection}
              onToggle={() => handleSettingToggle('privacy', 'dataCollection')}
            />
            <SwitchSetting
              icon={BarChart}
              title="Analytics"
              subtitle="Share anonymous usage statistics"
              value={settings.privacy.analytics}
              onToggle={() => handleSettingToggle('privacy', 'analytics')}
            />
            <SwitchSetting
              icon={AlertTriangle}
              title="Crash Reports"
              subtitle="Automatically send crash reports"
              value={settings.privacy.crashReports}
              onToggle={() => handleSettingToggle('privacy', 'crashReports')}
            />
            <SettingItem
              icon={Lock}
              title="Change Password"
              subtitle="Update your account password"
              onPress={() => console.log('Change password')}
            />
            <SettingItem
              icon={Smartphone}
              title="Two-Factor Authentication"
              subtitle="Add extra security to your account"
              onPress={() => console.log('Setup 2FA')}
            />
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Palette}
              title="Theme"
              subtitle={settings.app.theme === 'light' ? 'Light' : 'Dark'}
              onPress={() => console.log('Change theme')}
            />
            <SettingItem
              icon={Globe}
              title="Language"
              subtitle="English"
              onPress={() => console.log('Change language')}
            />
            <SwitchSetting
              icon={Lock}
              title="Auto Lock"
              subtitle="Lock app when inactive"
              value={settings.app.autoLock}
              onToggle={() => handleSettingToggle('app', 'autoLock')}
            />
            <SwitchSetting
              icon={Fingerprint}
              title="Biometric Authentication"
              subtitle="Use fingerprint or face ID"
              value={settings.app.biometricAuth}
              onToggle={() => handleSettingToggle('app', 'biometricAuth')}
            />
            <SwitchSetting
              icon={Volume2}
              title="Haptic Feedback"
              subtitle="Vibrate on interactions"
              value={settings.app.hapticFeedback}
              onToggle={() => handleSettingToggle('app', 'hapticFeedback')}
            />
          </View>
        </View>

        {/* Device & Storage Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device & Storage</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Wifi}
              title="Network Settings"
              subtitle="WiFi and data preferences"
              onPress={() => console.log('Network settings')}
            />
            <SettingItem
              icon={Battery}
              title="Battery Optimization"
              subtitle="Manage battery usage"
              onPress={() => console.log('Battery settings')}
            />
            <SettingItem
              icon={Database}
              title="Storage Usage"
              subtitle="Clear cache and manage storage"
              onPress={() => console.log('Storage settings')}
            />
            <SettingItem
              icon={Clock}
              title="Sync Settings"
              subtitle="Last synced 2 minutes ago"
              onPress={() => console.log('Sync settings')}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={HelpCircle}
              title="Help Center"
              subtitle="Get help and support"
              onPress={() => console.log('Help center')}
            />
            <SettingItem
              icon={Mail}
              title="Contact Support"
              subtitle="Send us a message"
              onPress={() => console.log('Contact support')}
            />
            <SettingItem
              icon={Info}
              title="About"
              subtitle="Version 1.0.0"
              onPress={() => console.log('About app')}
            />
            <SettingItem
              icon={FileText}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onPress={() => console.log('Privacy policy')}
            />
            <SettingItem
              icon={FileText}
              title="Terms of Service"
              subtitle="Read our terms of service"
              onPress={() => console.log('Terms of service')}
            />
          </View>
        </View>

        {/* Account Actions Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <SettingItem
              icon={Trash2}
              title="Delete Account"
              subtitle="Permanently delete your account"
              onPress={() => console.log('Delete account')}
              danger={true}
            />
            <SettingItem
              icon={LogOut}
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              danger={true}
            />
          </View>
        </View>

        {/* Footer Spacing */}
        <View style={styles.footer} />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dangerItem: {
    backgroundColor: '#FEF2F2',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIcon: {
    backgroundColor: '#FECACA',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  dangerText: {
    color: '#EF4444',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footer: {
    height: 40,
  },
  // Child Management Styles
  childItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  childItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  childLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  childRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unlinkButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emptyChildrenState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyChildrenText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  emptyChildrenSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});
