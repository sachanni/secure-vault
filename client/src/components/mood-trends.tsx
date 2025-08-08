import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell } from 'recharts';
import { Calendar, TrendingUp, BarChart3, Activity } from 'lucide-react';
import { useState } from 'react';

interface MoodEntry {
  id: string;
  mood: string;
  emoji: string;
  notes?: string;
  createdAt: string;
}

interface MoodTrendData {
  date: string;
  mood: string;
  emoji: string;
  moodScore: number;
  dayOfWeek: string;
  timeOfDay: string;
}

interface MoodStats {
  averageScore: number;
  dominantMood: string;
  moodVariability: number;
  totalEntries: number;
  streak: number;
}

const moodColors = {
  happy: '#FEF3C7',
  excited: '#FED7AA', 
  calm: '#DBEAFE',
  content: '#F3F4F6',
  tired: '#E9D5FF',
  stressed: '#FECACA',
  sad: '#BFDBFE',
  anxious: '#FEF3C7'
};

const moodScores = {
  happy: 8,
  excited: 9,
  calm: 7,
  content: 6,
  tired: 4,
  stressed: 3,
  sad: 2,
  anxious: 3
};

export default function MoodTrends() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [viewType, setViewType] = useState<'line' | 'area' | 'bar'>('line');

  // Fetch mood entries
  const { data: moodEntries = [], isLoading } = useQuery({
    queryKey: ['/api/mood/entries'],
  }) as { data: MoodEntry[]; isLoading: boolean };

  const processChartData = (): MoodTrendData[] => {
    const cutoffDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const filteredEntries = moodEntries
      .filter(entry => new Date(entry.createdAt) >= cutoffDate)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return filteredEntries.map(entry => {
      const date = new Date(entry.createdAt);
      return {
        date: date.toISOString().split('T')[0],
        mood: entry.mood,
        emoji: entry.emoji,
        moodScore: moodScores[entry.mood as keyof typeof moodScores] || 5,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        timeOfDay: date.getHours() < 12 ? 'Morning' : date.getHours() < 17 ? 'Afternoon' : 'Evening'
      };
    });
  };

  const getMoodStats = (): MoodStats => {
    const chartData = processChartData();
    if (chartData.length === 0) {
      return {
        averageScore: 0,
        dominantMood: 'No data',
        moodVariability: 0,
        totalEntries: 0,
        streak: 0
      };
    }

    const scores = chartData.map(d => d.moodScore);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const moodCounts = chartData.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'No data';
    
    const moodVariability = Math.sqrt(
      scores.reduce((acc, score) => acc + Math.pow(score - averageScore, 2), 0) / scores.length
    );

    return {
      averageScore: Math.round(averageScore * 10) / 10,
      dominantMood,
      moodVariability: Math.round(moodVariability * 10) / 10,
      totalEntries: chartData.length,
      streak: calculateCurrentStreak()
    };
  };

  const calculateCurrentStreak = (): number => {
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < moodEntries.length; i++) {
      const entryDate = new Date(moodEntries[i].createdAt);
      entryDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === streak) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getWeeklyPattern = () => {
    const chartData = processChartData();
    const weeklyData = chartData.reduce((acc, entry) => {
      const day = entry.dayOfWeek;
      if (!acc[day]) {
        acc[day] = { day, totalScore: 0, count: 0, averageScore: 0 };
      }
      acc[day].totalScore += entry.moodScore;
      acc[day].count++;
      acc[day].averageScore = Math.round((acc[day].totalScore / acc[day].count) * 10) / 10;
      return acc;
    }, {} as Record<string, any>);

    const dayOrder = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return dayOrder.map(day => weeklyData[day] || { day, averageScore: 0, count: 0 });
  };

  const getTimeOfDayPattern = () => {
    const chartData = processChartData();
    const timeData = chartData.reduce((acc, entry) => {
      const time = entry.timeOfDay;
      if (!acc[time]) {
        acc[time] = { time, totalScore: 0, count: 0, averageScore: 0 };
      }
      acc[time].totalScore += entry.moodScore;
      acc[time].count++;
      acc[time].averageScore = Math.round((acc[time].totalScore / acc[time].count) * 10) / 10;
      return acc;
    }, {} as Record<string, any>);

    return ['Morning', 'Afternoon', 'Evening'].map(time => 
      timeData[time] || { time, averageScore: 0, count: 0 }
    );
  };

  const chartData = processChartData();
  const moodStats = getMoodStats();
  const weeklyPattern = getWeeklyPattern();
  const timePattern = getTimeOfDayPattern();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{new Date(label).toLocaleDateString()}</p>
          <p className="flex items-center">
            <span className="text-2xl mr-2">{data.emoji}</span>
            <span className="capitalize">{data.mood}</span>
          </p>
          <p className="text-sm text-gray-600">Score: {data.moodScore}/10</p>
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    const commonProps = {
      width: "100%",
      height: 300,
      data: chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (viewType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="moodScore" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="moodScore">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={moodColors[entry.mood as keyof typeof moodColors] || '#9CA3AF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 10]} />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="moodScore" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="animate-pulse">
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Mood Data Yet</h3>
          <p className="text-gray-600">Start tracking your mood to see beautiful visualizations and insights!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mood Trends</h2>
          <p className="text-gray-600">Visualize your emotional journey over time</p>
        </div>
        <div className="flex gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
              <SelectItem value="1y">1 Year</SelectItem>
            </SelectContent>
          </Select>
          <Select value={viewType} onValueChange={(value: any) => setViewType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">Line Chart</SelectItem>
              <SelectItem value="area">Area Chart</SelectItem>
              <SelectItem value="bar">Bar Chart</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{moodStats.averageScore}/10</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <span className="text-2xl mr-3">😊</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Dominant Mood</p>
                <p className="text-2xl font-bold text-gray-900 capitalize">{moodStats.dominantMood}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Variability</p>
                <p className="text-2xl font-bold text-gray-900">{moodStats.moodVariability}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{moodStats.streak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Mood Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {renderChart()}
        </CardContent>
      </Card>

      {/* Pattern Analysis */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value: any) => [`${value}/10`, 'Average Score']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="averageScore" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Time of Day Pattern */}
        <Card>
          <CardHeader>
            <CardTitle>Time of Day Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timePattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[0, 10]} />
                <Tooltip 
                  formatter={(value: any) => [`${value}/10`, 'Average Score']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="averageScore" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Emotional Journey Map */}
      <Card>
        <CardHeader>
          <CardTitle>Emotional Journey Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.slice(-14).map((entry, index) => (
              <div key={entry.date} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                <div className="flex-shrink-0">
                  <span className="text-2xl">{entry.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 capitalize">{entry.mood}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="mt-1">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(entry.moodScore / 10) * 100}%`,
                          backgroundColor: moodColors[entry.mood as keyof typeof moodColors] || '#9CA3AF'
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="text-sm font-medium text-gray-600">{entry.moodScore}/10</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}