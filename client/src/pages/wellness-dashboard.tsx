import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, TrendingUp, BarChart3, Activity, Heart, Smile, Zap } from "lucide-react";
// Removed AI Emotional Insights feature per user request
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { format, startOfWeek, endOfWeek, subDays, subWeeks, subMonths } from "date-fns";

// Mood emojis mapping
const MOOD_EMOJIS = {
  "very-happy": "😄",
  "happy": "😊",
  "content": "😌",
  "neutral": "😐",
  "slightly-sad": "🙁",
  "sad": "😢",
  "angry": "😠",
  "stressed": "😰",
  "anxious": "😟",
  "excited": "🤩",
  "grateful": "🙏",
  "energetic": "⚡"
};

// Mood colors mapping
const MOOD_COLORS = {
  "very-happy": "#10B981",
  "happy": "#3B82F6",
  "content": "#8B5CF6",
  "neutral": "#6B7280",
  "slightly-sad": "#F59E0B",
  "sad": "#EF4444",
  "angry": "#DC2626",
  "stressed": "#F97316",
  "anxious": "#EAB308",
  "excited": "#EC4899",
  "grateful": "#06B6D4",
  "energetic": "#84CC16"
};



interface MoodEntry {
  _id: string;
  mood: string;
  intensity: number;
  notes?: string;
  context?: string;
  createdAt: string;
}

interface MoodStats {
  totalEntries: number;
  averageIntensity: number;
  moodDistribution: { mood: string; count: number; color: string }[];
  weeklyProgress: { week: string; average: number }[];
  monthlyTrends: { month: string; positive: number; negative: number; neutral: number }[];
  streakCount: number;
  topMoods: string[];
}

export default function WellnessDashboard() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  // Removed AI Emotional Insights overlay state per user request

  // Fetch mood entries
  const { data: moodEntries = [], isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood/entries"],
  });

  // Calculate mood statistics
  const moodStats: MoodStats = calculateMoodStats(moodEntries, timeRange);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const chartVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, delay: 0.2 } }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Wellness Dashboard
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Track your emotional journey and discover patterns in your wellbeing
          </p>
        </motion.div>

        {/* Time Range Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center"
        >
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)} className="w-fit">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
              <TabsTrigger value="1y">1 Year</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <StatsCard
              title="Total Check-ins"
              value={moodStats.totalEntries}
              icon={<Activity className="h-5 w-5" />}
              color="bg-blue-500"
            />
          </motion.div>
          
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <StatsCard
              title="Average Mood"
              value={`${moodStats.averageIntensity.toFixed(1)}/10`}
              icon={<Heart className="h-5 w-5" />}
              color="bg-pink-500"
            />
          </motion.div>
          
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <StatsCard
              title="Current Streak"
              value={`${moodStats.streakCount} days`}
              icon={<Zap className="h-5 w-5" />}
              color="bg-yellow-500"
            />
          </motion.div>
          
          <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <StatsCard
              title="Wellness Score"
              value={`${Math.round(moodStats.averageIntensity * 10)}%`}
              icon={<TrendingUp className="h-5 w-5" />}
              color="bg-green-500"
            />
          </motion.div>
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Progression Line Chart */}
          <motion.div variants={chartVariants} initial="hidden" animate="visible">
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Mood Progression
                </CardTitle>
                <CardDescription>Your emotional journey over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodStats.weeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip 
                      formatter={(value) => [`${value}/10`, 'Average Mood']}
                      labelFormatter={(label) => `Week of ${label}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#8B5CF6"
                      strokeWidth={3}
                      dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Mood Distribution Pie Chart */}
          <motion.div variants={chartVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Card className="h-[400px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Mood Distribution
                </CardTitle>
                <CardDescription>How your emotions are distributed</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodStats.moodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ mood, percent }) => `${MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {moodStats.moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Monthly Trends and Patterns */}
        <motion.div
          variants={chartVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Monthly Emotional Patterns
              </CardTitle>
              <CardDescription>Positive, neutral, and negative mood trends by month</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={moodStats.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="positive"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="neutral"
                    stackId="1"
                    stroke="#6B7280"
                    fill="#6B7280"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="negative"
                    stackId="1"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Moods and Insights */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smile className="h-5 w-5" />
                Mood Insights
              </CardTitle>
              <CardDescription>Your most common emotional states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {moodStats.topMoods.map((mood, index) => (
                  <motion.div
                    key={mood}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Badge
                      variant="secondary"
                      className="text-lg px-4 py-2 cursor-pointer hover:scale-105 transition-transform"
                      style={{ backgroundColor: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] + "20" }}
                      onClick={() => setSelectedMood(mood)}
                    >
                      {MOOD_EMOJIS[mood as keyof typeof MOOD_EMOJIS]} {mood.replace('-', ' ')}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Mood Entries */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Check-ins</CardTitle>
              <CardDescription>Your latest mood entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodEntries.slice(0, 5).map((entry, index) => (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {MOOD_EMOJIS[entry.mood as keyof typeof MOOD_EMOJIS]}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {entry.mood.replace('-', ' ')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{entry.intensity}/10</div>
                      <Progress value={entry.intensity * 10} className="w-20 h-2" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* AI Emotional Insights feature removed per user request */}
    </div>
  );
}

// Helper component for stats cards
interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`${color} p-3 rounded-full text-white`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper function to calculate mood statistics
function calculateMoodStats(entries: MoodEntry[], timeRange: string): MoodStats {
  if (!entries.length) {
    return {
      totalEntries: 0,
      averageIntensity: 0,
      moodDistribution: [],
      weeklyProgress: [],
      monthlyTrends: [],
      streakCount: 0,
      topMoods: []
    };
  }

  // Filter entries based on time range
  const now = new Date();
  let cutoffDate: Date;
  
  switch (timeRange) {
    case "7d":
      cutoffDate = subDays(now, 7);
      break;
    case "30d":
      cutoffDate = subDays(now, 30);
      break;
    case "90d":
      cutoffDate = subDays(now, 90);
      break;
    case "1y":
      cutoffDate = subDays(now, 365);
      break;
    default:
      cutoffDate = subDays(now, 30);
  }

  const filteredEntries = entries.filter(entry => new Date(entry.createdAt) >= cutoffDate);

  // Calculate basic stats
  const totalEntries = filteredEntries.length;
  const averageIntensity = filteredEntries.reduce((sum, entry) => sum + entry.intensity, 0) / totalEntries || 0;

  // Mood distribution
  const moodCounts = filteredEntries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
    color: MOOD_COLORS[mood as keyof typeof MOOD_COLORS] || "#9CA3AF"
  }));

  // Weekly progress
  const weeklyProgress = [];
  for (let i = 0; i < 8; i++) {
    const weekStart = startOfWeek(subWeeks(now, i));
    const weekEnd = endOfWeek(weekStart);
    
    const weekEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= weekStart && entryDate <= weekEnd;
    });

    if (weekEntries.length > 0) {
      const weekAverage = weekEntries.reduce((sum, entry) => sum + entry.intensity, 0) / weekEntries.length;
      weeklyProgress.unshift({
        week: format(weekStart, 'MMM d'),
        average: Number(weekAverage.toFixed(1))
      });
    }
  }

  // Monthly trends
  const monthlyTrends = [];
  for (let i = 0; i < 6; i++) {
    const monthStart = subMonths(now, i);
    const monthEntries = filteredEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate.getMonth() === monthStart.getMonth() && 
             entryDate.getFullYear() === monthStart.getFullYear();
    });

    const positive = monthEntries.filter(entry => entry.intensity >= 7).length;
    const neutral = monthEntries.filter(entry => entry.intensity >= 4 && entry.intensity < 7).length;
    const negative = monthEntries.filter(entry => entry.intensity < 4).length;

    monthlyTrends.unshift({
      month: format(monthStart, 'MMM'),
      positive,
      neutral,
      negative
    });
  }

  // Calculate streak
  const sortedEntries = [...filteredEntries].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  let streakCount = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.createdAt);
    entryDate.setHours(0, 0, 0, 0);
    
    if (entryDate.getTime() === currentDate.getTime()) {
      streakCount++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (entryDate.getTime() < currentDate.getTime()) {
      break;
    }
  }

  // Top moods
  const topMoods = Object.entries(moodCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([mood]) => mood);

  return {
    totalEntries,
    averageIntensity,
    moodDistribution,
    weeklyProgress,
    monthlyTrends,
    streakCount,
    topMoods
  };
}