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
  Palette,
  Check,
  Shield
} from 'lucide-react-native';

export default function AppAppearanceScreen() {
  const [selectedTheme, setSelectedTheme] = useState('security');

  const securityTheme = {
    id: 'security',
    name: 'Security Theme',
    description: 'Professional blue, white and black color scheme',
    colors: {
      primary: '#5B8DEF',
      secondary: '#FFFFFF',
      accent: '#1A1A1A',
      background: '#F8F9FC',
    }
  };

  const handleBack = () => {
    console.log('Back pressed');
  };

  const handleSelectTheme = () => {
    setSelectedTheme('security');
    console.log('Security theme selected');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <ChevronLeft size={28} color="#000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>App Appearance</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Palette size={40} color="#5B8DEF" strokeWidth={2} />
          </View>
          <Text style={styles.sectionTitle}>Color Scheme</Text>
          <Text style={styles.sectionDescription}>
            Customize the appearance of your parental control app
          </Text>
        </View>

        {/* Theme Section */}
        <View style={styles.themeSection}>
          <Text style={styles.themeSectionTitle}>Available Theme</Text>
          
          {/* Security Theme Card */}
          <TouchableOpacity 
            style={[
              styles.themeCard,
              selectedTheme === securityTheme.id && styles.themeCardSelected
            ]} 
            onPress={handleSelectTheme}
            activeOpacity={0.8}
          >
            {/* Theme Header */}
            <View style={styles.themeCardHeader}>
              <View style={styles.themeInfo}>
                <View style={styles.themeIconContainer}>
                  <Shield size={24} color="#5B8DEF" strokeWidth={2.5} />
                </View>
                <View style={styles.themeNameContainer}>
                  <Text style={styles.themeName}>{securityTheme.name}</Text>
                  <Text style={styles.themeDescription}>{securityTheme.description}</Text>
                </View>
              </View>
              {selectedTheme === securityTheme.id && (
                <View style={styles.checkmarkContainer}>
                  <Check size={24} color="#FFFFFF" strokeWidth={3} />
                </View>
              )}
            </View>

            {/* Color Preview */}
            <View style={styles.colorPreviewSection}>
              <Text style={styles.colorPreviewTitle}>Color Preview</Text>
              <View style={styles.colorPalette}>
                <View style={styles.colorItem}>
                  <View style={[styles.colorCircle, { backgroundColor: securityTheme.colors.primary }]} />
                  <Text style={styles.colorLabel}>Primary</Text>
                  <Text style={styles.colorCode}>{securityTheme.colors.primary}</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorCircle, { backgroundColor: securityTheme.colors.secondary, borderWidth: 1, borderColor: '#E0E0E0' }]} />
                  <Text style={styles.colorLabel}>Secondary</Text>
                  <Text style={styles.colorCode}>{securityTheme.colors.secondary}</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorCircle, { backgroundColor: securityTheme.colors.accent }]} />
                  <Text style={styles.colorLabel}>Accent</Text>
                  <Text style={styles.colorCode}>{securityTheme.colors.accent}</Text>
                </View>
                <View style={styles.colorItem}>
                  <View style={[styles.colorCircle, { backgroundColor: securityTheme.colors.background }]} />
                  <Text style={styles.colorLabel}>Background</Text>
                  <Text style={styles.colorCode}>{securityTheme.colors.background}</Text>
                </View>
              </View>
            </View>

            {/* Preview Components */}
            <View style={styles.previewSection}>
              <Text style={styles.previewTitle}>Component Preview</Text>
              
              {/* Button Preview */}
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Primary Button</Text>
                <View style={[styles.previewButton, { backgroundColor: securityTheme.colors.primary }]}>
                  <Text style={styles.previewButtonText}>Lock Phone</Text>
                </View>
              </View>

              {/* Card Preview */}
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Feature Card</Text>
                <View style={[styles.previewCard, { backgroundColor: securityTheme.colors.secondary }]}>
                  <View style={styles.previewCardHeader}>
                    <Shield size={20} color={securityTheme.colors.primary} strokeWidth={2} />
                    <Text style={[styles.previewCardTitle, { color: securityTheme.colors.accent }]}>
                      Device Protection
                    </Text>
                  </View>
                  <Text style={styles.previewCardText}>Monitor and protect device</Text>
                </View>
              </View>

              {/* Alert Preview */}
              <View style={styles.previewItem}>
                <Text style={styles.previewLabel}>Alert Banner</Text>
                <View style={[styles.previewAlert, { backgroundColor: '#EBF3FE', borderLeftColor: securityTheme.colors.primary }]}>
                  <Text style={[styles.previewAlertText, { color: securityTheme.colors.primary }]}>
                    Security settings updated successfully
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Shield size={20} color="#5B8DEF" strokeWidth={2} />
            <Text style={styles.infoText}>
              This theme is professionally designed for security and parental control applications, 
              providing a trustworthy and clean interface.
            </Text>
          </View>
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
  headerSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EBF3FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 15,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 22,
  },
  themeSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  themeSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  themeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  themeCardSelected: {
    borderColor: '#5B8DEF',
    borderWidth: 3,
  },
  themeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  themeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EBF3FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  themeNameContainer: {
    flex: 1,
  },
  themeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  themeDescription: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
  },
  checkmarkContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#5B8DEF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorPreviewSection: {
    marginBottom: 24,
  },
  colorPreviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colorItem: {
    alignItems: 'center',
    flex: 1,
  },
  colorCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  colorLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  colorCode: {
    fontSize: 10,
    color: '#757575',
  },
  previewSection: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  previewItem: {
    marginBottom: 16,
  },
  previewLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 8,
  },
  previewButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  previewCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  previewCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewCardText: {
    fontSize: 13,
    color: '#757575',
  },
  previewAlert: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
  },
  previewAlertText: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#EBF3FE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#5B8DEF',
    lineHeight: 20,
    marginLeft: 12,
  },
});