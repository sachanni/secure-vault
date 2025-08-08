import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface MoodInsight {
  overallTrend: string;
  emotionalPatterns: string[];
  recommendations: string[];
  riskFactors: string[];
  positiveIndicators: string[];
  confidence: number;
}

export interface MoodEntry {
  mood: string;
  intensity: number;
  notes?: string;
  context?: string;
  createdAt: Date;
}

export async function generateEmotionalInsights(moodEntries: MoodEntry[]): Promise<MoodInsight> {
  if (moodEntries.length === 0) {
    return {
      overallTrend: "Insufficient data",
      emotionalPatterns: ["No mood data available for analysis"],
      recommendations: ["Start tracking your daily mood to receive personalized insights"],
      riskFactors: [],
      positiveIndicators: [],
      confidence: 0
    };
  }

  try {
    // Prepare mood data for AI analysis
    const moodSummary = moodEntries.map(entry => ({
      mood: entry.mood,
      intensity: entry.intensity,
      context: entry.context || 'general',
      notes: entry.notes || '',
      date: entry.createdAt.toISOString().split('T')[0]
    }));

    const prompt = `Analyze the following mood tracking data and provide emotional intelligence insights:

${JSON.stringify(moodSummary, null, 2)}

Please provide a comprehensive analysis in JSON format with the following structure:
{
  "overallTrend": "Brief summary of overall emotional trend",
  "emotionalPatterns": ["Pattern 1", "Pattern 2", "Pattern 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "riskFactors": ["Risk factor 1", "Risk factor 2"],
  "positiveIndicators": ["Positive indicator 1", "Positive indicator 2"],
  "confidence": 0.85
}

Focus on:
- Emotional patterns and trends
- Work-life balance indicators
- Stress and anxiety patterns
- Social and relationship patterns
- Health and wellness insights
- Actionable recommendations for emotional well-being
- Risk factors that need attention
- Positive aspects to reinforce

Keep recommendations practical and specific. Confidence should be between 0-1 based on data quality and quantity.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert emotional intelligence analyst specializing in mood pattern analysis and mental health insights. Provide thoughtful, evidence-based analysis while being supportive and constructive."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    return {
      overallTrend: result.overallTrend || "Unable to determine trend",
      emotionalPatterns: result.emotionalPatterns || [],
      recommendations: result.recommendations || [],
      riskFactors: result.riskFactors || [],
      positiveIndicators: result.positiveIndicators || [],
      confidence: Math.max(0, Math.min(1, result.confidence || 0.5))
    };

  } catch (error) {
    console.error("Error generating emotional insights:", error);
    throw new Error("Failed to generate emotional insights");
  }
}

export async function generateMoodRecommendation(currentMood: string, intensity: number, context?: string): Promise<string> {
  try {
    const prompt = `The user is currently feeling ${currentMood} with an intensity of ${intensity}/10${context ? ` in the context of ${context}` : ''}. 

Provide a brief, supportive, and actionable recommendation (2-3 sentences) to help them with their current emotional state. Focus on practical steps they can take right now.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system", 
          content: "You are a compassionate emotional wellness advisor. Provide brief, practical, and supportive recommendations for immediate emotional support."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    return response.choices[0].message.content || "Take a moment to breathe deeply and acknowledge your feelings.";

  } catch (error) {
    console.error("Error generating mood recommendation:", error);
    return "Take a moment to breathe deeply and acknowledge your feelings.";
  }
}