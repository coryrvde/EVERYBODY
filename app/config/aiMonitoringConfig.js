// AI Monitoring Configuration
export const AIMonitoringConfig = {
  // Text Analysis Settings
  textAnalysis: {
    enabled: true,
    realTimeAnalysis: true,
    confidenceThreshold: 0.7,
    maxAnalysisDelay: 2000, // 2 seconds max delay
    
    // Severity thresholds
    severityThresholds: {
      high: 0.8,
      medium: 0.6,
      low: 0.4
    },
    
    // Analysis categories
    categories: {
      sexual: {
        enabled: true,
        phrases: [
          'nude', 'naked', 'sex', 'sexual', 'porn', 'pornography',
          'hook up', 'hookup', 'intimate', 'private parts'
        ],
        severity: 'high'
      },
      violence: {
        enabled: true,
        phrases: [
          'kill', 'murder', 'suicide', 'hurt', 'violence', 'weapon',
          'gun', 'knife', 'threat', 'beat up', 'attack'
        ],
        severity: 'high'
      },
      drugs: {
        enabled: true,
        phrases: [
          'drugs', 'marijuana', 'weed', 'cocaine', 'heroin',
          'pills', 'party drugs', 'high', 'stoned',
          // Marijuana slang
          'greens', 'green stuff', 'bud', 'buds', 'herb', 'grass', 'pot', 'mary jane',
          'smoke', 'smoking', 'hit', 'hits', 'joint', 'joints', 'blunt', 'blunts',
          'bowl', 'bowls', 'bong', 'bongs', 'pipe', 'pipes', 'vape', 'vaping',
          'edibles', 'gummies', 'cookies', 'brownies', 'tincture', 'oil', 'wax',
          'dabs', 'concentrate', 'concentrates', 'thc', 'cbd', 'cannabis',
          // Other drug slang
          'white stuff', 'powder', 'lines', 'snort', 'snorting', 'coke', 'crack',
          'speed', 'meth', 'crystal', 'ice', 'ecstasy', 'molly', 'mdma', 'acid',
          'lsd', 'shrooms', 'mushrooms', 'psychedelics', 'tripping', 'rolling',
          'bars', 'xans', 'benzos', 'valium', 'oxy', 'percs', 'vicodin',
          'lean', 'purple drank', 'syrup', 'codeine', 'morphine', 'fentanyl'
        ],
        severity: 'high'
      },
      drugContext: {
        enabled: true,
        patterns: [
          'smoking context', 'marijuana session context', 'marijuana preparation context',
          'marijuana meeting context', 'marijuana acquisition context', 'marijuana dealing context',
          'marijuana edibles context', 'marijuana vaping context', 'late night drug activity context',
          'drug quantity context'
        ],
        severity: 'medium'
      },
      bullying: {
        enabled: true,
        phrases: [
          'ugly', 'fat', 'stupid', 'loser', 'hate', 'disgusting',
          'pathetic', 'worthless', 'nobody likes you'
        ],
        severity: 'medium'
      },
      personalInfo: {
        enabled: true,
        phrases: [
          'address', 'phone number', 'social security', 'credit card',
          'password', 'meet me at', 'my house is', 'come over'
        ],
        severity: 'medium'
      },
      inappropriateRequests: {
        enabled: true,
        phrases: [
          'send me', 'show me', 'take off', 'touch', 'feel',
          'underwear', 'bra', 'panties', 'alone'
        ],
        severity: 'high'
      }
    }
  },

  // Image Analysis Settings
  imageAnalysis: {
    enabled: true,
    realTimeAnalysis: true,
    confidenceThreshold: 0.8,
    maxImageSize: 10 * 1024 * 1024, // 10MB max
    
    // Analysis categories
    categories: {
      nudity: {
        enabled: true,
        severity: 'high',
        confidenceThreshold: 0.8
      },
      violence: {
        enabled: true,
        severity: 'high',
        confidenceThreshold: 0.7
      },
      drugs: {
        enabled: true,
        severity: 'high',
        confidenceThreshold: 0.7
      },
      weapons: {
        enabled: true,
        severity: 'high',
        confidenceThreshold: 0.7
      }
    }
  },

  // Real-time Monitoring Settings
  realTimeMonitoring: {
    enabled: true,
    checkInterval: 30000, // 30 seconds
    maxConcurrentAnalysis: 5,
    alertCooldown: 300000, // 5 minutes between alerts for same content
    
    // Apps to monitor
    monitoredApps: [
      'WhatsApp',
      'Telegram',
      'Instagram',
      'Snapchat',
      'TikTok',
      'Discord',
      'Facebook Messenger',
      'Twitter',
      'YouTube',
      'Reddit'
    ]
  },

  // Alert Settings
  alerts: {
    enabled: true,
    realTimeAlerts: true,
    pushNotifications: true,
    emailAlerts: true,
    
    // Alert thresholds
    thresholds: {
      immediate: ['high'], // Immediate alerts for high severity
      delayed: ['medium'], // Delayed alerts for medium severity
      summary: ['low'] // Summary alerts for low severity
    },
    
    // Alert recipients
    recipients: {
      primary: 'parent@example.com',
      secondary: 'guardian@example.com',
      emergency: 'emergency@example.com'
    }
  },

  // AI Service Configuration
  aiServices: {
    // Text Analysis Services
    textAnalysis: {
      primary: {
        provider: 'openai',
        endpoint: 'https://api.openai.com/v1/moderations',
        apiKey: process.env.OPENAI_API_KEY,
        model: 'text-moderation-latest'
      },
      fallback: {
        provider: 'google',
        endpoint: 'https://language.googleapis.com/v1/documents:analyzeSentiment',
        apiKey: process.env.GOOGLE_API_KEY
      }
    },
    
    // Image Analysis Services
    imageAnalysis: {
      primary: {
        provider: 'google',
        endpoint: 'https://vision.googleapis.com/v1/images:annotate',
        apiKey: process.env.GOOGLE_VISION_API_KEY
      },
      fallback: {
        provider: 'aws',
        endpoint: 'https://rekognition.us-east-1.amazonaws.com',
        apiKey: process.env.AWS_ACCESS_KEY_ID
      }
    }
  },

  // Privacy and Safety Settings
  privacy: {
    dataRetention: 30, // days
    anonymizeData: true,
    encryptSensitiveData: true,
    
    // Content handling
    contentHandling: {
      blurImages: true,
      redactText: true,
      storeOriginal: false // Don't store original flagged content
    }
  },

  // Performance Settings
  performance: {
    maxAnalysisTime: 5000, // 5 seconds max analysis time
    batchSize: 10, // Process up to 10 items at once
    retryAttempts: 3,
    retryDelay: 1000, // 1 second between retries
    
    // Caching
    cache: {
      enabled: true,
      ttl: 3600, // 1 hour cache TTL
      maxSize: 1000 // Max cached items
    }
  }
};

// Helper functions
export const getSeverityColor = (severity) => {
  const colors = {
    high: '#EF5350',
    medium: '#FFA726',
    low: '#FFC107'
  };
  return colors[severity] || '#9E9E9E';
};

export const getSeverityBackground = (severity) => {
  const backgrounds = {
    high: '#FFEBEE',
    medium: '#FFF3E0',
    low: '#FFF9C4'
  };
  return backgrounds[severity] || '#F5F5F5';
};

export const formatConfidence = (confidence) => {
  return `${Math.round(confidence * 100)}%`;
};

export const shouldAlert = (severity, confidence) => {
  const config = AIMonitoringConfig.alerts.thresholds;
  const threshold = AIMonitoringConfig.textAnalysis.severityThresholds[severity] || 0.5;
  
  return confidence >= threshold && config.immediate.includes(severity);
};

export default AIMonitoringConfig;
