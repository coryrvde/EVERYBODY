import { supabase } from '../supabase';

class SmartAIAnalyzer {
  constructor() {
    this.apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || 'your-openai-api-key';
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * Analyze content using OpenAI GPT for intelligent detection
   */
  async analyzeContent(content, context = {}) {
    try {
      const systemPrompt = this.buildSystemPrompt(context);
      const userPrompt = this.buildUserPrompt(content);

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.1,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseAIResponse(data.choices[0]?.message?.content);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      // Fallback to rule-based analysis
      return this.fallbackAnalysis(content);
    }
  }

  /**
   * Build system prompt for AI analysis
   */
  buildSystemPrompt(context) {
    return `You are a specialized AI safety monitor for children's online communications. Your job is to analyze messages and detect potential dangers, inappropriate content, or concerning behavior patterns.

Analysis Guidelines:
1. Detect grooming behavior, inappropriate requests, cyberbullying, drug references, violence, or sexual content
2. Consider context - a message about "candy" in a drug context is different from actual candy
3. Identify hidden meanings, code words, or disguised inappropriate requests
4. Flag concerning behavioral patterns (isolation attempts, secret-keeping, etc.)
5. Be sensitive to age-appropriate content vs. genuinely concerning material

Respond in JSON format:
{
  "flagged": true/false,
  "severity": "low/medium/high/critical",
  "category": "grooming/bullying/drugs/violence/inappropriate/other",
  "confidence": 0.0-1.0,
  "reasoning": "explanation of why this was flagged",
  "suggested_action": "monitor/alert/block/emergency",
  "keywords_detected": ["list", "of", "concerning", "terms"],
  "context_analysis": "analysis of conversation context and patterns"
}

Be thorough but not overly sensitive to innocent content.`;
  }

  /**
   * Build user prompt with content to analyze
   */
  buildUserPrompt(content) {
    return `Analyze this message for potential safety concerns:

Message: "${content}"

Consider:
- Direct inappropriate content
- Hidden meanings or implications
- Concerning behavioral patterns
- Age-inappropriate material
- Potential grooming tactics
- Cyberbullying indicators
- Drug or violence references

Provide a detailed analysis focusing on child safety.`;
  }

  /**
   * Parse AI response into structured data
   */
  parseAIResponse(responseText) {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback parsing if JSON extraction fails
      return {
        flagged: responseText.toLowerCase().includes('flagged') || responseText.toLowerCase().includes('concerning'),
        severity: this.extractSeverity(responseText),
        category: this.extractCategory(responseText),
        confidence: this.extractConfidence(responseText),
        reasoning: responseText,
        suggested_action: 'monitor',
        keywords_detected: [],
        context_analysis: responseText
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.fallbackAnalysis(responseText);
    }
  }

  /**
   * Extract severity from response text
   */
  extractSeverity(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('critical') || lowerText.includes('emergency')) return 'critical';
    if (lowerText.includes('high')) return 'high';
    if (lowerText.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Extract category from response text
   */
  extractCategory(text) {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('grooming')) return 'grooming';
    if (lowerText.includes('bullying')) return 'bullying';
    if (lowerText.includes('drug')) return 'drugs';
    if (lowerText.includes('violence')) return 'violence';
    if (lowerText.includes('inappropriate')) return 'inappropriate';
    return 'other';
  }

  /**
   * Extract confidence score from response text
   */
  extractConfidence(text) {
    const confidenceMatch = text.match(/(\d+(?:\.\d+)?)/);
    return confidenceMatch ? Math.min(1.0, Math.max(0.0, parseFloat(confidenceMatch[1]))) : 0.7;
  }

  /**
   * Fallback analysis when AI is unavailable
   */
  fallbackAnalysis(content) {
    const lowerContent = content.toLowerCase();
    
    // Define dangerous patterns
    const dangerousPatterns = {
      grooming: ['meet alone', 'don\'t tell', 'secret', 'special friend', 'send photos', 'nude', 'private'],
      bullying: ['kill yourself', 'worthless', 'nobody likes you', 'ugly', 'fat', 'stupid'],
      drugs: ['weed', 'marijuana', 'cocaine', 'pills', 'high', 'smoke', 'party', '420'],
      violence: ['fight', 'hurt', 'kill', 'weapon', 'gun', 'knife', 'violence'],
      inappropriate: ['sex', 'porn', 'naked', 'adult', 'mature', 'explicit']
    };

    let flagged = false;
    let severity = 'low';
    let category = 'other';
    let keywords = [];

    for (const [cat, patterns] of Object.entries(dangerousPatterns)) {
      problematicKeywords = patterns.filter(keyword => lowerContent.includes(keyword));
      if (problematicKeywords.length > 0) {
        flagged = true;
        category = cat;
        keywords = problematicKeywords;
        
        // Determine severity based on number of matches
        if (problematicKeywords.length >= 3) severity = 'high';
        else if (problematicKeywords.length >= 2) severity = 'medium';
        break;
      }
    }

    return {
      flagged,
      severity,
      category,
      confidence: flagged ? 0.8 : 0.1,
      reasoning: flagged ? `Detected ${category} content with keywords: ${keywords.join(', ')}` : 'No concerning content detected',
      suggested_action: flagged ? 'alert' : 'monitor',
      keywords_detected: keywords,
      context_analysis: 'Rule-based analysis applied'
    };
  }

  /**
   * Get custom filters for a parent and analyze content
   */
  async analyzeWithCustomFilters(content, parentId) {
    try {
      // Get custom filters from database
      const { data: filters, error } = await supabase
        .from('custom_filters')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true);

      if (error) throw error;

      // Check against custom filters
      const customFilterResults = this.checkCustomFilters(content, filters || []);
      
      // If custom filters flag content, return that result
      if (customFilterResults.flagged) {
        return customFilterResults;
      }

      // Otherwise, run AI analysis
      return await this.analyzeContent(content);
    } catch (error) {
      console.error('Error in custom filter analysis:', error);
      return this.fallbackAnalysis(content);
    }
  }

  /**
   * Check content against custom filters
   */
  checkCustomFilters(content, filters) {
    const lowerContent = content.toLowerCase();
    let flagged = false;
    let severity = 'low';
    let category = 'custom';
    let keywords = [];

    for (const filter of filters) {
      const filterText = filter.filter_text.toLowerCase();
      
      switch (filter.filter_type) {
        case 'exact':
          if (lowerContent.includes(filterText)) {
            flagged = true;
            severity = filter.severity;
            keywords.push(filter.filter_text);
          }
          break;
          
        case 'similar':
          if (this.findSimilarWords(lowerContent, filterText)) {
            flagged = true;
            severity = filter.severity;
            keywords.push(filter.filter_text);
          }
          break;
          
        case 'context':
          if (this.analyzeContext(lowerContent, filterText)) {
            flagged = true;
            severity = filter.severity;
            keywords.push(filter.filter_text);
          }
          break;
      }
    }

    return {
      flagged,
      severity,
      category: 'custom',
      confidence: flagged ? 0.9 : 0.1,
      reasoning: flagged ? `Custom filter triggered: ${keywords.join(', ')}` : 'No custom filter matches',
      suggested_action: flagged ? 'alert' : 'monitor',
      keywords_detected: keywords,
      context_analysis: 'Custom filter analysis applied'
    };
  }

  /**
   * Find similar words using basic string similarity
   */
  findSimilarWords(content, target) {
    const words = content.split(' ');
    const targetWords = target.split(' ');
    
    for (const word of words) {
      for (const targetWord of targetWords) {
        if (this.calculateSimilarity(word, targetWord) > 0.7) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Calculate string similarity using Levenshtein distance
   */
  calculateSimilarity(str1, str2) {
    const matrix = [];
    const len1 = str1.length;
    const len2 = str2.length;

    for (let i = 0; i <= len2; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len1; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len2; i++) {
      for (let j = 1; j <= len1; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return 1 - matrix[len2][len1] / Math.max(len1, len2);
  }

  /**
   * Analyze context for meaning
   */
  analyzeContext(content, target) {
    // Simple context analysis - look for target word in concerning contexts
    const concerningContexts = ['alone', 'secret', 'private', 'meet', 'send', 'show'];
    const hasTarget = content.includes(target);
    const hasContext = concerningContexts.some(context => content.includes(context));
    
    return hasTarget && hasContext;
  }

  /**
   * Store analysis result in database
   */
  async storeAnalysisResult(childId, content, analysis, appName, contact) {
    try {
      const { error } = await supabase
        .from('ai_analysis_results')
        .insert({
          child_id: childId,
          content: content,
          flagged: analysis.flagged,
          severity: analysis.severity,
          category: analysis.category,
          confidence: analysis.confidence,
          reasoning: analysis.reasoning,
          suggested_action: analysis.suggested_action,
          keywords_detected: analysis.keywords_detected,
          context_analysis: analysis.context_analysis,
          app_name: appName,
          contact: contact,
          analyzed_at: new Date().toISOString()
        });

      if (error) throw error;

      // If content is flagged, create an alert
      if (analysis.flagged) {
        await this.createAlert(childId, content, analysis, appName, contact);
      }
    } catch (error) {
      console.error('Error storing analysis result:', error);
    }
  }

  /**
   * Create alert for flagged content
   */
  async createAlert(childId, content, analysis, appName, contact) {
    try {
      // Get parent ID from child
      const { data: familyLink, error: linkError } = await supabase
        .from('family_links')
        .select('parent_id')
        .eq('child_id', childId)
        .single();

      if (linkError) throw linkError;

      const { error } = await supabase
        .from('real_time_alerts')
        .insert({
          child_id: childId,
          parent_id: familyLink.parent_id,
          alert_type: 'ai_flagged_content',
          severity: analysis.severity,
          app_name: appName,
          contact: contact,
          flagged_content: content,
          confidence: analysis.confidence,
          ai_reasoning: analysis.reasoning,
          suggested_action: analysis.suggested_action,
          keywords_detected: analysis.keywords_detected,
          context_analysis: analysis.context_analysis,
          is_read: false,
          is_acknowledged: false
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }
}

export const smartAIAnalyzer = new SmartAIAnalyzer();
