import { supabase } from '../supabase';

class AIContentDetector {
  constructor() {
    this.filteredPhrases = [
      // Sexual content
      'nude', 'naked', 'sex', 'sexual', 'porn', 'pornography', 'adult content',
      'hook up', 'hookup', 'fuck', 'fucking', 'shit', 'bitch', 'whore',
      
      // Violence and threats
      'kill', 'murder', 'suicide', 'hurt', 'violence', 'weapon', 'gun', 'knife',
      'threat', 'threaten', 'beat up', 'fight', 'attack',
      
      // Drugs and alcohol - Direct terms
      'drugs', 'marijuana', 'weed', 'cocaine', 'heroin', 'alcohol', 'drunk',
      'high', 'stoned', 'party drugs', 'pills',
      
      // Drug slang and code words
      'greens', 'green stuff', 'bud', 'buds', 'herb', 'grass', 'pot', 'mary jane',
      'smoke', 'smoking', 'hit', 'hits', 'joint', 'joints', 'blunt', 'blunts',
      'bowl', 'bowls', 'bong', 'bongs', 'pipe', 'pipes', 'vape', 'vaping',
      'edibles', 'gummies', 'cookies', 'brownies', 'tincture', 'oil', 'wax',
      'dabs', 'concentrate', 'concentrates', 'thc', 'cbd', 'cannabis',
      'white stuff', 'powder', 'lines', 'snort', 'snorting', 'coke', 'crack',
      'speed', 'meth', 'crystal', 'ice', 'ecstasy', 'molly', 'mdma', 'acid',
      'lsd', 'shrooms', 'mushrooms', 'psychedelics', 'tripping', 'rolling',
      'bars', 'xans', 'benzos', 'valium', 'oxy', 'percs', 'vicodin',
      'lean', 'purple drank', 'syrup', 'codeine', 'morphine', 'fentanyl',
      
      // Smoking-related context
      'light up', 'lighting up', 'spark up', 'sparking up', 'roll up', 'rolling up',
      'pack a bowl', 'packing a bowl', 'take a hit', 'taking hits',
      'smoke session', 'smoking session', 'sesh', 'smoke break',
      
      // Bullying and harassment
      'ugly', 'fat', 'stupid', 'loser', 'hate', 'disgusting', 'pathetic',
      'kill yourself', 'die', 'worthless', 'nobody likes you',
      
      // Personal information sharing
      'address', 'phone number', 'social security', 'credit card', 'password',
      'meet me at', 'my house is', 'come over', 'alone',
      
      // Inappropriate requests
      'send me', 'show me', 'take off', 'touch', 'feel', 'private parts',
      'underwear', 'bra', 'panties', 'intimate'
    ];

    this.severityLevels = {
      high: [
        'nude', 'naked', 'sex', 'sexual', 'porn', 'kill', 'murder', 'suicide', 
        'drugs', 'cocaine', 'heroin', 'meth', 'crystal', 'ice', 'ecstasy', 'molly',
        'acid', 'lsd', 'shrooms', 'mushrooms', 'bars', 'xans', 'oxy', 'percs',
        'fentanyl', 'lean', 'purple drank', 'codeine', 'morphine'
      ],
      medium: [
        'fuck', 'shit', 'bitch', 'threat', 'violence', 'weapon', 'alcohol', 'drunk', 
        'ugly', 'fat', 'stupid', 'greens', 'green stuff', 'bud', 'buds', 'herb', 
        'grass', 'pot', 'mary jane', 'smoke', 'smoking', 'hit', 'hits', 'joint', 
        'joints', 'blunt', 'blunts', 'bowl', 'bowls', 'bong', 'bongs', 'pipe', 
        'pipes', 'vape', 'vaping', 'edibles', 'gummies', 'cookies', 'brownies',
        'thc', 'cbd', 'cannabis', 'white stuff', 'powder', 'lines', 'snort', 
        'snorting', 'coke', 'crack', 'speed', 'psychedelics', 'tripping', 'rolling',
        'benzos', 'valium', 'vicodin', 'syrup', 'light up', 'lighting up', 'spark up',
        'sparking up', 'roll up', 'rolling up', 'pack a bowl', 'packing a bowl',
        'take a hit', 'taking hits', 'smoke session', 'smoking session', 'sesh'
      ],
      low: [
        'hate', 'disgusting', 'pathetic', 'loser', 'address', 'phone number', 
        'meet me at', 'tincture', 'oil', 'wax', 'dabs', 'concentrate', 'concentrates',
        'smoke break'
      ]
    };

    this.imageAnalysisEndpoint = 'https://api.example-ai-service.com/analyze-image';
    this.textAnalysisEndpoint = 'https://api.example-ai-service.com/analyze-text';
  }

  /**
   * Analyze text content for inappropriate phrases
   * @param {string} text - The text to analyze
   * @param {string} context - Additional context (app name, contact, etc.)
   * @returns {Object} Analysis result with severity and flagged content
   */
  async analyzeText(text, context = {}) {
    try {
      const lowerText = text.toLowerCase();
      const flaggedPhrases = [];
      let maxSeverity = 'low';

      // Check against filtered phrases
      for (const phrase of this.filteredPhrases) {
        if (lowerText.includes(phrase.toLowerCase())) {
          flaggedPhrases.push(phrase);
          
          // Determine severity
          if (this.severityLevels.high.includes(phrase)) {
            maxSeverity = 'high';
          } else if (this.severityLevels.medium.includes(phrase) && maxSeverity !== 'high') {
            maxSeverity = 'medium';
          }
        }
      }

      // Advanced AI analysis (simulated - replace with actual AI service)
      const aiAnalysis = await this.performAITextAnalysis(text, context);
      
      if (aiAnalysis.flagged) {
        flaggedPhrases.push(...aiAnalysis.reasons);
        if (aiAnalysis.severity === 'high') maxSeverity = 'high';
        else if (aiAnalysis.severity === 'medium' && maxSeverity !== 'high') maxSeverity = 'medium';
      }

      return {
        flagged: flaggedPhrases.length > 0,
        severity: maxSeverity,
        flaggedPhrases: flaggedPhrases,
        confidence: this.calculateConfidence(flaggedPhrases, text),
        analysis: {
          textLength: text.length,
          context: context,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error analyzing text:', error);
      return {
        flagged: false,
        severity: 'low',
        flaggedPhrases: [],
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Analyze image content for inappropriate material
   * @param {string} imageUrl - URL or base64 of the image
   * @param {Object} metadata - Image metadata
   * @returns {Object} Analysis result
   */
  async analyzeImage(imageUrl, metadata = {}) {
    try {
      // Simulate AI image analysis (replace with actual AI service)
      const aiAnalysis = await this.performAIImageAnalysis(imageUrl, metadata);
      
      return {
        flagged: aiAnalysis.flagged,
        severity: aiAnalysis.severity,
        categories: aiAnalysis.categories,
        confidence: aiAnalysis.confidence,
        analysis: {
          imageSize: metadata.size || 'unknown',
          format: metadata.format || 'unknown',
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('Error analyzing image:', error);
      return {
        flagged: false,
        severity: 'low',
        categories: [],
        confidence: 0,
        error: error.message
      };
    }
  }

  /**
   * Enhanced AI text analysis with contextual awareness
   */
  async performAITextAnalysis(text, context) {
    // This would integrate with services like:
    // - OpenAI Moderation API
    // - Google Cloud Natural Language API
    // - Azure Content Moderator
    // - Custom trained models
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = {
          flagged: false,
          severity: 'low',
          reasons: []
        };

        const lowerText = text.toLowerCase();

        // Contextual drug detection patterns
        const drugContextPatterns = [
          // Smoking context with "greens" or similar
          { pattern: /(greens?|green stuff|bud|buds|herb|grass|pot|mary jane).*(smoke|smoking|hit|hits|joint|blunt|bowl|bong|pipe)/i, severity: 'medium', reason: 'marijuana smoking context' },
          { pattern: /(smoke|smoking|hit|hits|joint|blunt|bowl|bong|pipe).*(greens?|green stuff|bud|buds|herb|grass|pot|mary jane)/i, severity: 'medium', reason: 'marijuana smoking context' },
          
          // Getting high context
          { pattern: /(greens?|bud|buds|herb|grass|pot).*(high|stoned|baked|blazed|fried)/i, severity: 'medium', reason: 'marijuana intoxication context' },
          { pattern: /(high|stoned|baked|blazed|fried).*(greens?|bud|buds|herb|grass|pot)/i, severity: 'medium', reason: 'marijuana intoxication context' },
          
          // Smoking session context
          { pattern: /(smoke|smoking).*(session|sesh|break).*(greens?|bud|buds|herb|grass|pot)/i, severity: 'medium', reason: 'marijuana session context' },
          { pattern: /(greens?|bud|buds|herb|grass|pot).*(session|sesh|break).*(smoke|smoking)/i, severity: 'medium', reason: 'marijuana session context' },
          
          // Rolling/smoking context
          { pattern: /(roll|rolling|roll up).*(greens?|bud|buds|herb|grass|pot|joint|blunt)/i, severity: 'medium', reason: 'marijuana preparation context' },
          { pattern: /(greens?|bud|buds|herb|grass|pot|joint|blunt).*(roll|rolling|roll up)/i, severity: 'medium', reason: 'marijuana preparation context' },
          
          // Meeting to smoke context
          { pattern: /(meet|meeting|come over|hang out).*(smoke|smoking|greens?|bud|buds|herb|grass|pot)/i, severity: 'medium', reason: 'marijuana meeting context' },
          { pattern: /(smoke|smoking|greens?|bud|buds|herb|grass|pot).*(meet|meeting|come over|hang out)/i, severity: 'medium', reason: 'marijuana meeting context' },
          
          // Buying/selling context
          { pattern: /(buy|buying|get|getting|pick up|picking up).*(greens?|bud|buds|herb|grass|pot|weed)/i, severity: 'medium', reason: 'marijuana acquisition context' },
          { pattern: /(sell|selling|have|got).*(greens?|bud|buds|herb|grass|pot|weed)/i, severity: 'medium', reason: 'marijuana dealing context' },
          
          // Edibles context
          { pattern: /(eat|eating|gummies|cookies|brownies).*(high|stoned|baked|greens?|thc)/i, severity: 'medium', reason: 'marijuana edibles context' },
          { pattern: /(high|stoned|baked|greens?|thc).*(eat|eating|gummies|cookies|brownies)/i, severity: 'medium', reason: 'marijuana edibles context' },
          
          // Vaping context
          { pattern: /(vape|vaping|hit|hits).*(greens?|bud|buds|herb|grass|pot|oil|wax)/i, severity: 'medium', reason: 'marijuana vaping context' },
          { pattern: /(greens?|bud|buds|herb|grass|pot|oil|wax).*(vape|vaping|hit|hits)/i, severity: 'medium', reason: 'marijuana vaping context' }
        ];

        // Check contextual patterns
        for (const pattern of drugContextPatterns) {
          if (pattern.pattern.test(text)) {
            analysis.flagged = true;
            if (pattern.severity === 'medium' && analysis.severity !== 'high') {
              analysis.severity = 'medium';
            }
            analysis.reasons.push(pattern.reason);
          }
        }

        // Additional contextual patterns
        if (lowerText.includes('meet') && lowerText.includes('alone')) {
          analysis.flagged = true;
          if (analysis.severity !== 'high') analysis.severity = 'medium';
          analysis.reasons.push('meeting alone request');
        }

        if (lowerText.includes('send') && (lowerText.includes('photo') || lowerText.includes('picture'))) {
          analysis.flagged = true;
          analysis.severity = 'high';
          analysis.reasons.push('photo request');
        }

        // Detect suspicious time references (late night drug activity)
        if ((lowerText.includes('greens') || lowerText.includes('bud') || lowerText.includes('smoke')) && 
            (lowerText.includes('tonight') || lowerText.includes('late') || lowerText.includes('midnight'))) {
          analysis.flagged = true;
          if (analysis.severity !== 'high') analysis.severity = 'medium';
          analysis.reasons.push('late night drug activity context');
        }

        // Detect quantity references (buying/selling)
        if ((lowerText.includes('greens') || lowerText.includes('bud') || lowerText.includes('weed')) && 
            (lowerText.includes('gram') || lowerText.includes('ounce') || lowerText.includes('pound') || 
             lowerText.includes('bag') || lowerText.includes('dime') || lowerText.includes('eighth'))) {
          analysis.flagged = true;
          if (analysis.severity !== 'high') analysis.severity = 'medium';
          analysis.reasons.push('drug quantity context');
        }

        resolve(analysis);
      }, 100);
    });
  }

  /**
   * Simulated AI image analysis (replace with actual AI service)
   */
  async performAIImageAnalysis(imageUrl, metadata) {
    // This would integrate with services like:
    // - Google Cloud Vision API
    // - AWS Rekognition
    // - Azure Computer Vision
    // - Custom trained models for NSFW detection
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate AI analysis
        const analysis = {
          flagged: false,
          severity: 'low',
          categories: [],
          confidence: 0
        };

        // Simulate detection based on image characteristics
        // In real implementation, this would use actual AI models
        const randomFlag = Math.random() < 0.1; // 10% chance of flagging for demo
        
        if (randomFlag) {
          analysis.flagged = true;
          analysis.severity = 'high';
          analysis.categories = ['inappropriate content'];
          analysis.confidence = 0.85;
        }

        resolve(analysis);
      }, 200);
    });
  }

  /**
   * Calculate confidence score based on flagged phrases and context
   */
  calculateConfidence(flaggedPhrases, text) {
    if (flaggedPhrases.length === 0) return 0;
    
    const phraseCount = flaggedPhrases.length;
    const textLength = text.length;
    const phraseDensity = phraseCount / (textLength / 100); // phrases per 100 characters
    
    let confidence = Math.min(phraseCount * 0.2, 0.8); // Base confidence
    confidence += Math.min(phraseDensity * 0.1, 0.2); // Density bonus
    
    return Math.min(confidence, 1.0);
  }

  /**
   * Get real-time monitoring status
   */
  async getMonitoringStatus() {
    try {
      const { data, error } = await supabase
        .from('monitoring_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching monitoring status:', error);
        return {
          enabled: true,
          textMonitoring: true,
          imageMonitoring: true,
          realTimeAlerts: true
        };
      }

      return data;
    } catch (error) {
      console.error('Error getting monitoring status:', error);
      return {
        enabled: true,
        textMonitoring: true,
        imageMonitoring: true,
        realTimeAlerts: true
      };
    }
  }

  /**
   * Save flagged content to database
   */
  async saveFlaggedContent(content) {
    try {
      const { data, error } = await supabase
        .from('flagged_content')
        .insert([{
          app_name: content.app,
          contact: content.contact,
          content_type: content.type, // 'text' or 'image'
          content_data: content.data,
          severity: content.severity,
          flagged_phrases: content.flaggedPhrases,
          confidence: content.confidence,
          timestamp: new Date().toISOString(),
          child_id: content.childId || 'default'
        }]);

      if (error) {
        console.error('Error saving flagged content:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving flagged content:', error);
      return false;
    }
  }

  /**
   * Update filtered phrases list
   */
  updateFilteredPhrases(newPhrases) {
    this.filteredPhrases = [...this.filteredPhrases, ...newPhrases];
  }

  /**
   * Get current filtered phrases
   */
  getFilteredPhrases() {
    return this.filteredPhrases;
  }
}

export default new AIContentDetector();
