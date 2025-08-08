import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import MoodTracker from '@/components/mood-tracker';
import MoodTrends from '@/components/mood-trends';
import { Calendar, TrendingUp, Heart, BarChart3, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  notes?: string;
  createdAt: string;
}

export default function MoodTrackingPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Show login prompt if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access mood tracking.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  // Show login screen if not authenticated
  if (!isLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Authentication Required
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-gray-600">
              <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
              <p>Please log in to access your mood tracking dashboard and start monitoring your wellness journey.</p>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={() => setLocation('/login')} 
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Go to Login
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setLocation('/register/step1')} 
                className="w-full"
              >
                Create Account
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/')} 
                className="w-full"
              >
                Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: moodEntries = [], isLoading: moodEntriesLoading } = useQuery<MoodEntry[]>({
    queryKey: ['/api/mood/entries'],
    enabled: isAuthenticated,
  });

  const { data: latestMood } = useQuery<MoodEntry>({
    queryKey: ['/api/mood/latest'],
    enabled: isAuthenticated,
  });

  const todaysMoods = moodEntries.filter(entry => 
    new Date(entry.createdAt).toDateString() === new Date().toDateString()
  );

  const thisWeeksMoods = moodEntries.filter(entry => {
    const entryDate = new Date(entry.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (moodEntriesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wellness Mood Tracking
              </h1>
              <p className="text-gray-600 mt-1">Monitor your emotional well-being and track patterns over time</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Heart className="w-6 h-6 text-pink-500" />
            <Badge variant="outline" className="bg-pink-50 text-pink-700 border-pink-200">
              Wellness Tracking Active
            </Badge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Current Mood</p>
                  <div className="flex items-center space-x-2">
                    {latestMood ? (
                      <>
                        <span className="text-xl">{latestMood.emoji}</span>
                        <span className="text-lg font-bold text-gray-900">{latestMood.mood}</span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-400">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{todaysMoods.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-gray-900">{thisWeeksMoods.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{moodEntries.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mood Tracker */}
          <div className="lg:col-span-1">
            <MoodTracker />
          </div>

          {/* Mood Trends */}
          <div className="lg:col-span-2">
            <MoodTrends />
          </div>
        </div>

        {/* Recent Mood Entries */}
        <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Recent Mood Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No mood entries yet</h3>
                <p className="text-gray-500 mb-4">Start tracking your mood to see patterns and insights over time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {moodEntries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="text-3xl">{entry.emoji}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge className="bg-purple-100 text-purple-800">
                          {entry.mood}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {new Date(entry.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.notes && (
                        <p className="text-sm text-gray-600">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}