import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image
} from 'react-native';
import { Bot, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react-native';
import AIContentDetector from '../services/aiContentDetector';
import { getSeverityColor, getSeverityBackground, formatConfidence } from '../config/aiMonitoringConfig';

export default function AIDetectionDemo() {
  const [testText, setTestText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sampleTexts = [
    "Hey, want to meet up alone? Send me some photos",
    "You look really beautiful today",
    "Let's go to the movies together",
    "I hate school, I want to die",
    "Can you send me your address?",
    "That test was so hard, I'm stupid",
    "Want to see some inappropriate content?",
    "Let's hang out at the park",
    // Drug slang examples
    "Want to smoke some greens tonight?",
    "I got some bud, want to roll up?",
    "Let's have a smoke session with the greens",
    "Can you pick up some green stuff for me?",
    "I'm so high from those gummies",
    "Meet me later to smoke some herb",
    "Got any greens? I need a hit",
    "Let's pack a bowl with this bud",
    "Want to vape some oil tonight?",
    "I ate some brownies and I'm baked"
  ];

  const analyzeText = async () => {
    if (!testText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await AIContentDetector.analyzeText(testText, {
        app: 'Demo App',
        contact: 'Test Contact'
      });
      
      setAnalysisResult(result);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze text: ' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useSampleText = (text) => {
    setTestText(text);
    setAnalysisResult(null);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle size={20} color="#EF5350" strokeWidth={2} />;
      case 'medium':
        return <AlertTriangle size={20} color="#FFA726" strokeWidth={2} />;
      case 'low':
        return <AlertTriangle size={20} color="#FFC107" strokeWidth={2} />;
      default:
        return <CheckCircle size={20} color="#10B981" strokeWidth={2} />;
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Bot size={24} color="#6366F1" strokeWidth={2} />
        <Text style={styles.headerTitle}>AI Content Detection Demo</Text>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.sectionTitle}>Test Text Analysis</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter text to analyze for inappropriate content..."
          placeholderTextColor="#9E9E9E"
          value={testText}
          onChangeText={setTestText}
          multiline
          numberOfLines={4}
        />
        
        <TouchableOpacity 
          style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
          onPress={analyzeText}
          disabled={isAnalyzing}
        >
          <Activity size={16} color="#FFF" strokeWidth={2} />
          <Text style={styles.analyzeButtonText}>
            {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
          </Text>
        </TouchableOpacity>
      </View>

      {analysisResult && (
        <View style={styles.resultSection}>
          <Text style={styles.sectionTitle}>Analysis Result</Text>
          
          <View style={[styles.resultCard, { backgroundColor: getSeverityBackground(analysisResult.severity) }]}>
            <View style={styles.resultHeader}>
              {getSeverityIcon(analysisResult.severity)}
              <Text style={[styles.severityText, { color: getSeverityColor(analysisResult.severity) }]}>
                {analysisResult.severity.toUpperCase()} RISK
              </Text>
            </View>
            
            <View style={styles.resultDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Flagged:</Text>
                <View style={styles.flaggedIndicator}>
                  {analysisResult.flagged ? (
                    <XCircle size={16} color="#EF5350" strokeWidth={2} />
                  ) : (
                    <CheckCircle size={16} color="#10B981" strokeWidth={2} />
                  )}
                  <Text style={[styles.detailValue, { color: analysisResult.flagged ? '#EF5350' : '#10B981' }]}>
                    {analysisResult.flagged ? 'YES' : 'NO'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Confidence:</Text>
                <Text style={styles.detailValue}>{formatConfidence(analysisResult.confidence)}</Text>
              </View>
              
              {analysisResult.flaggedPhrases.length > 0 && (
                <View style={styles.phrasesSection}>
                  <Text style={styles.detailLabel}>Flagged Phrases:</Text>
                  <View style={styles.phrasesContainer}>
                    {analysisResult.flaggedPhrases.map((phrase, index) => (
                      <View key={index} style={styles.phraseTag}>
                        <Text style={styles.phraseText}>{phrase}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={styles.samplesSection}>
        <Text style={styles.sectionTitle}>Sample Texts</Text>
        <Text style={styles.samplesSubtitle}>Tap any sample to test the AI detection</Text>
        
        {sampleTexts.map((text, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.sampleCard}
            onPress={() => useSampleText(text)}
          >
            <Text style={styles.sampleText} numberOfLines={2}>{text}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>AI Detection Capabilities</Text>
        
        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>🔍 Text Analysis</Text>
          <Text style={styles.capabilityText}>
            • Detects inappropriate language and phrases{'\n'}
            • Identifies bullying and harassment{'\n'}
            • Flags personal information sharing{'\n'}
            • Recognizes sexual content and requests
          </Text>
        </View>

        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>🖼️ Image Analysis</Text>
          <Text style={styles.capabilityText}>
            • Detects nude and inappropriate images{'\n'}
            • Identifies violent content{'\n'}
            • Flags drug-related imagery{'\n'}
            • Recognizes weapons and dangerous objects
          </Text>
        </View>

        <View style={styles.capabilityCard}>
          <Text style={styles.capabilityTitle}>⚡ Real-time Monitoring</Text>
          <Text style={styles.capabilityText}>
            • Continuous content analysis{'\n'}
            • Instant alerts for high-risk content{'\n'}
            • Multi-app monitoring{'\n'}
            • Confidence-based severity scoring
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#6366F1',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginLeft: 12,
  },
  inputSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  analyzeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultSection: {
    padding: 20,
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  severityText: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  resultDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  flaggedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phrasesSection: {
    marginTop: 8,
  },
  phrasesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  phraseTag: {
    backgroundColor: '#EF5350',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  phraseText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  samplesSection: {
    padding: 20,
  },
  samplesSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  sampleCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sampleText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
  },
  capabilityCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  capabilityTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  capabilityText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});
