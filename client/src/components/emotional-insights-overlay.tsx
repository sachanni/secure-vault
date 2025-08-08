import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  X,
  RefreshCw,
  Sparkles
} from 'lucide-react';

interface MoodInsight {
  overallTrend: string;
  emotionalPatterns: string[];
  recommendations: string[];
  riskFactors: string[];
  positiveIndicators: string[];
  confidence: number;
}

interface EmotionalInsightsOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmotionalInsightsOverlay({ isOpen, onClose }: EmotionalInsightsOverlayProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: insights, isLoading, refetch } = useQuery<MoodInsight>({
    queryKey: ['/api/emotional-insights'],
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRegenerateInsights = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Emotional Intelligence Insights</h2>
              <p className="text-gray-600">Personalized analysis of your emotional patterns</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegenerateInsights}
              disabled={isGenerating || isLoading}
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isLoading || isGenerating ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-gray-900">Analyzing Your Emotional Patterns</h3>
                  <p className="text-gray-600">Our AI is generating personalized insights...</p>
                </div>
              </div>
            </div>
          ) : insights ? (
            <>
              {/* Confidence Score */}
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Analysis Confidence</h3>
                    <Badge variant={insights.confidence > 0.7 ? "default" : "secondary"}>
                      {Math.round(insights.confidence * 100)}%
                    </Badge>
                  </div>
                  <Progress value={insights.confidence * 100} className="h-2" />
                  <p className="text-sm text-gray-600 mt-2">
                    Based on your mood tracking data quality and quantity
                  </p>
                </CardContent>
              </Card>

              {/* Overall Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    <span>Overall Emotional Trend</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">{insights.overallTrend}</p>
                </CardContent>
              </Card>

              {/* Emotional Patterns */}
              {insights.emotionalPatterns.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Brain className="w-5 h-5 text-purple-500" />
                      <span>Emotional Patterns Detected</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {insights.emotionalPatterns.map((pattern, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-gray-700">{pattern}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid md:grid-cols-2 gap-6">
                {/* Positive Indicators */}
                {insights.positiveIndicators.length > 0 && (
                  <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Positive Indicators</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {insights.positiveIndicators.map((indicator, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{indicator}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Risk Factors */}
                {insights.riskFactors.length > 0 && (
                  <Card className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span>Areas of Attention</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {insights.riskFactors.map((factor, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700">{factor}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Recommendations */}
              {insights.recommendations.length > 0 && (
                <Card className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5 text-blue-500" />
                      <span>Personalized Recommendations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.recommendations.map((recommendation, index) => (
                        <div key={index} className="bg-blue-50 p-4 rounded-lg">
                          <div className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                              {index + 1}
                            </div>
                            <p className="text-gray-700">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 text-center">
                  These insights are generated by AI based on your mood patterns. For professional mental health support, 
                  please consult with a qualified healthcare provider.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Insights Available</h3>
              <p className="text-gray-600">Start tracking your mood to receive AI-powered emotional insights.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}