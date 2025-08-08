import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Heart, Smile, Calendar, TrendingUp } from 'lucide-react';

interface MoodOption {
  id: string;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

const moodOptions: MoodOption[] = [
  { id: 'amazing', emoji: '🤩', label: 'Amazing', color: 'text-purple-700', bgColor: 'bg-purple-100 hover:bg-purple-200' },
  { id: 'happy', emoji: '😊', label: 'Happy', color: 'text-green-700', bgColor: 'bg-green-100 hover:bg-green-200' },
  { id: 'good', emoji: '🙂', label: 'Good', color: 'text-blue-700', bgColor: 'bg-blue-100 hover:bg-blue-200' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: 'text-gray-700', bgColor: 'bg-gray-100 hover:bg-gray-200' },
  { id: 'sad', emoji: '😢', label: 'Sad', color: 'text-indigo-700', bgColor: 'bg-indigo-100 hover:bg-indigo-200' },
  { id: 'anxious', emoji: '😰', label: 'Anxious', color: 'text-orange-700', bgColor: 'bg-orange-100 hover:bg-orange-200' },
  { id: 'stressed', emoji: '😤', label: 'Stressed', color: 'text-red-700', bgColor: 'bg-red-100 hover:bg-red-200' },
  { id: 'tired', emoji: '😴', label: 'Tired', color: 'text-slate-700', bgColor: 'bg-slate-100 hover:bg-slate-200' },
  { id: 'excited', emoji: '🎉', label: 'Excited', color: 'text-pink-700', bgColor: 'bg-pink-100 hover:bg-pink-200' },
  { id: 'calm', emoji: '😌', label: 'Calm', color: 'text-teal-700', bgColor: 'bg-teal-100 hover:bg-teal-200' },
  { id: 'grateful', emoji: '🙏', label: 'Grateful', color: 'text-amber-700', bgColor: 'bg-amber-100 hover:bg-amber-200' },
  { id: 'confused', emoji: '😕', label: 'Confused', color: 'text-cyan-700', bgColor: 'bg-cyan-100 hover:bg-cyan-200' },
];

interface MoodTrackerProps {
  compact?: boolean;
}

export default function MoodTracker({ compact = false }: MoodTrackerProps) {
  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [notes, setNotes] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveMoodMutation = useMutation({
    mutationFn: async (data: { mood: string; intensity: number; notes?: string }) => {
      const response = await apiRequest('/api/mood', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: 'Mood tracked successfully!',
        description: 'Your emotional wellness data has been recorded.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/mood/entries'] });
      queryClient.invalidateQueries({ queryKey: ['/api/mood/latest'] });
      setSelectedMood(null);
      setNotes('');
      if (compact) setIsExpanded(false);
    },
    onError: () => {
      toast({
        title: 'Failed to track mood',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    },
  });

  const handleMoodSelect = (mood: MoodOption) => {
    setSelectedMood(mood);
    if (compact && !notes) {
      // Quick save for compact mode without notes
      saveMoodMutation.mutate({
        mood: mood.label,
        intensity: getMoodIntensity(mood.id),
      });
    }
  };

  const getMoodIntensity = (moodId: string): number => {
    const intensityMap: Record<string, number> = {
      'amazing': 10,
      'happy': 8,
      'excited': 9,
      'good': 7,
      'calm': 6,
      'grateful': 8,
      'okay': 5,
      'confused': 4,
      'tired': 3,
      'sad': 2,
      'anxious': 3,
      'stressed': 2,
    };
    return intensityMap[moodId] || 5;
  };

  const handleSave = () => {
    if (!selectedMood) return;
    
    saveMoodMutation.mutate({
      mood: selectedMood.label,
      intensity: getMoodIntensity(selectedMood.id),
      notes: notes.trim() || undefined,
    });
  };

  if (compact && !isExpanded) {
    return (
      <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm md:text-base font-semibold text-gray-900">Quick Mood Check</h3>
                <p className="text-xs md:text-sm text-gray-500">How are you feeling?</p>
              </div>
            </div>
            <Button
              onClick={() => setIsExpanded(true)}
              variant="outline"
              size="sm"
              className="bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200 hover:from-pink-100 hover:to-purple-100 text-xs md:text-sm w-full md:w-auto"
            >
              <Smile className="w-4 h-4 mr-2" />
              Track Mood
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <span>Mood Tracker</span>
          {compact && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(false)}
              className="ml-auto"
            >
              ×
            </Button>
          )}
        </CardTitle>
        <p className="text-sm text-gray-600">Select how you're feeling right now</p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Mood Selection Grid */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-3 block">
            How are you feeling?
          </Label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {moodOptions.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className={`
                  p-3 rounded-xl border-2 transition-all duration-200 
                  ${selectedMood?.id === mood.id 
                    ? 'border-purple-400 bg-purple-50 scale-105 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                  ${mood.bgColor}
                `}
              >
                <div className="text-center">
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className={`text-xs font-medium ${mood.color}`}>
                    {mood.label}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Mood Display */}
        {selectedMood && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{selectedMood.emoji}</div>
              <div>
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  Feeling {selectedMood.label}
                </Badge>
                <p className="text-sm text-gray-600 mt-1">
                  Great! Your mood has been selected.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div>
          <Label htmlFor="mood-notes" className="text-sm font-medium text-gray-700 mb-2 block">
            Additional Notes (Optional)
          </Label>
          <Textarea
            id="mood-notes"
            placeholder="What's on your mind? Share any thoughts about your current mood..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px] resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            disabled={!selectedMood || saveMoodMutation.isPending}
            className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
          >
            {saveMoodMutation.isPending ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Save Mood</span>
              </div>
            )}
          </Button>
          
          {selectedMood && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedMood(null);
                setNotes('');
              }}
              className="border-gray-300 hover:border-gray-400"
            >
              Clear
            </Button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-gray-50 rounded-xl p-4 border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Wellness Tracking</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Daily Check-in
            </Badge>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Regular mood tracking helps understand your emotional patterns and supports overall well-being.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}