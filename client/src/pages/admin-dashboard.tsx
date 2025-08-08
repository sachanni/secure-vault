import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Users, 
  Shield, 
  AlertTriangle, 
  Activity, 
  UserCheck, 
  UserX, 
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  Clock,
  ArrowLeft,
  User
} from 'lucide-react';
import { useLocation } from 'wouter';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deactivatedUsers: number;
  totalAssets: number;
  totalNominees: number;
  usersAtRisk: number;
  recentActivities: ActivityLog[];
}

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  accountStatus: string;
  wellBeingCounter: number;
  maxWellBeingLimit: number;
  lastWellBeingCheck: string;
  lastLoginAt: string;
  alertFrequency: string;
  createdAt: string;
  isActive: boolean;
}

interface ActivityLog {
  id: string;
  userId: string | null;
  adminId: string | null;
  action: string;
  category: string;
  description: string;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  severity: string;
  createdAt: string;
}

interface UserRiskAssessment {
  id: string;
  userId: string;
  riskLevel: string;
  riskFactors: string[];
  assessmentReason: string;
  assessedBy: string | null;
  isResolved: boolean;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminDashboard() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [activeTab, setActiveTab] = useState('user-management');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const { data: users = [], isLoading: usersLoading } = useQuery<AdminUser[]>({
    queryKey: ['/api/admin/users'],
  });

  const { data: logs = [] } = useQuery({
    queryKey: ['/api/admin/logs'],
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, accountStatus, reason }: { userId: string; accountStatus: string; reason: string }) => {
      return apiRequest(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: { accountStatus, reason },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: 'User status updated successfully' });
      setSelectedUser(null);
      setActionReason('');
    },
    onError: () => {
      toast({ title: 'Failed to update user status', variant: 'destructive' });
    },
  });

  const triggerAlertMutation = useMutation({
    mutationFn: async ({ userId, message }: { userId: string; message: string }) => {
      return apiRequest(`/api/admin/users/${userId}/alert`, {
        method: 'POST',
        body: { message },
      });
    },
    onSuccess: () => {
      toast({ title: 'Alert triggered successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to trigger alert', variant: 'destructive' });
    },
  });

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-yellow-100 text-yellow-800',
    deactivated: 'bg-red-100 text-red-800',
  };

  const riskLevel = (user: AdminUser) => {
    const ratio = user.wellBeingCounter / user.maxWellBeingLimit;
    if (ratio >= 0.8) return 'high';
    if (ratio >= 0.5) return 'medium';
    return 'low';
  };

  const riskColors = {
    high: 'bg-red-100 text-red-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
  };

  // Chart data preparation
  const userStatusData = [
    { name: 'Active', value: stats?.activeUsers || 0, color: '#10B981' },
    { name: 'Suspended', value: stats?.suspendedUsers || 0, color: '#F59E0B' },
    { name: 'Deactivated', value: stats?.deactivatedUsers || 0, color: '#EF4444' },
  ];

  const wellBeingRiskData = users.reduce((acc, user) => {
    const risk = riskLevel(user);
    acc[risk] = (acc[risk] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const riskChartData = [
    { name: 'Low Risk', value: wellBeingRiskData.low || 0, color: '#10B981' },
    { name: 'Medium Risk', value: wellBeingRiskData.medium || 0, color: '#F59E0B' },
    { name: 'High Risk', value: wellBeingRiskData.high || 0, color: '#EF4444' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to User Panel
              </Button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SecureVault Admin</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="w-4 h-4 mr-1" />
                Administrator Access
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="text-gray-600 hover:text-gray-900"
              >
                <User className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 mt-1">Monitor user activity and manage system operations</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.activeUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Users at Risk</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.usersAtRisk || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalAssets || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                User Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={userStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Well-being Risk Levels
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={riskChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Well-being Counter</TableHead>
                      <TableHead>Last Check-in</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="hover:bg-blue-50/50">
                        <TableCell>
                          <div>
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColors[user.accountStatus as keyof typeof statusColors]}>
                            {user.accountStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={riskColors[riskLevel(user)]}>
                            {riskLevel(user)} risk
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono">
                            {user.wellBeingCounter}/{user.maxWellBeingLimit}
                          </span>
                        </TableCell>
                        <TableCell>
                          {user.lastWellBeingCheck 
                            ? new Date(user.lastWellBeingCheck).toLocaleDateString()
                            : 'Never'
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedUser(user)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Manage User: {user.fullName}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Change Status
                                    </label>
                                    <Select
                                      onValueChange={(value) => {
                                        if (actionReason.trim()) {
                                          updateUserStatusMutation.mutate({
                                            userId: user.id,
                                            accountStatus: value,
                                            reason: actionReason,
                                          });
                                        }
                                      }}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="suspended">Suspended</SelectItem>
                                        <SelectItem value="deactivated">Deactivated</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">
                                      Reason for Action
                                    </label>
                                    <Textarea
                                      placeholder="Enter reason for status change..."
                                      value={actionReason}
                                      onChange={(e) => setActionReason(e.target.value)}
                                    />
                                  </div>
                                  <div className="flex space-x-2">
                                    <Button
                                      onClick={() => {
                                        triggerAlertMutation.mutate({
                                          userId: user.id,
                                          message: 'Admin triggered well-being check',
                                        });
                                      }}
                                      className="bg-yellow-500 hover:bg-yellow-600"
                                    >
                                      Trigger Alert
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monitoring">
            <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Real-time Monitoring</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {users.filter(u => riskLevel(u) === 'high').map((user) => (
                    <Card key={user.id} className="border-red-200 bg-red-50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">{user.fullName}</p>
                            <p className="text-sm text-red-700">
                              Counter: {user.wellBeingCounter}/{user.maxWellBeingLimit}
                            </p>
                          </div>
                          <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Activity Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {logs.map((log: any, index: number) => (
                    <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.action}</p>
                        <p className="text-xs text-gray-500">{log.details}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}