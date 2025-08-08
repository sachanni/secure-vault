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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  ArrowLeft,
  Calendar,
  Clock,
  Filter,
  Search,
  RefreshCw,
  TrendingUp,
  Monitor,
  FileText
} from 'lucide-react';
import { useLocation } from 'wouter';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  deactivatedUsers: number;
  usersAtRisk: number;
  totalAssets: number;
  totalNominees: number;
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

export default function AdminPanel() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskFilter, setRiskFilter] = useState('all');
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Data fetching with error handling
  const { data: statsResponse, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['/api/admin/stats'],
    retry: false,
  });
  
  // Extract stats from response
  const stats = statsResponse?.stats;

  const { data: usersResponse, isLoading: usersLoading, error: usersError } = useQuery({
    queryKey: ['/api/admin/users'],
    retry: false,
  });
  
  const { data: logsResponse, isLoading: logsLoading, error: logsError } = useQuery({
    queryKey: ['/api/admin/activity-logs'],
    retry: false,
  });

  const { data: riskResponse, error: riskError } = useQuery({
    queryKey: ['/api/admin/users-at-risk'],
    retry: false,
  });
  
  // Extract data from responses
  const allUsers = usersResponse?.users || [];
  const activityLogs = logsResponse?.logs || [];
  const usersAtRisk = riskResponse?.users || [];

  // Mutations
  const updateUserStatusMutation = useMutation({
    mutationFn: ({ userId, status, reason }: { userId: string; status: string; reason: string }) =>
      apiRequest(`/api/admin/users/${userId}/status`, 'PATCH', { status, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/activity-logs'] });
      toast({ title: 'User status updated successfully' });
      setSelectedUser(null);
      setActionReason('');
    },
    onError: () => {
      toast({ title: 'Failed to update user status', variant: 'destructive' });
    },
  });

  // Utility functions
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getRiskLevel = (user: AdminUser) => {
    const ratio = user.wellBeingCounter / user.maxWellBeingLimit;
    if (ratio >= 0.8) return { level: 'High', color: 'text-red-600 bg-red-50' };
    if (ratio >= 0.5) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600 bg-green-50' };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'suspended': return 'text-yellow-600 bg-yellow-50';
      case 'deactivated': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'error': return 'text-red-600 bg-red-50';
      case 'info': 
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const handleUpdateUserStatus = (user: AdminUser, status: string) => {
    if (!actionReason.trim()) {
      toast({ title: 'Please provide a reason for this action', variant: 'destructive' });
      return;
    }
    
    updateUserStatusMutation.mutate({
      userId: user.id,
      status,
      reason: actionReason,
    });
  };

  // Filtered users
  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || user.accountStatus === statusFilter;
    
    const userRisk = getRiskLevel(user);
    const matchesRisk = riskFilter === 'all' || userRisk.level.toLowerCase() === riskFilter;
    
    return matchesSearch && matchesStatus && matchesRisk;
  });

  if (statsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (statsError || usersError) {
    const error = statsError || usersError;
    if (error && error.message.includes('401')) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You need administrator privileges to access this panel.</p>
              <Button onClick={() => setLocation('/login')} className="w-full">
                Return to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={() => setLocation('/dashboard')}
              variant="ghost"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-gray-600">Comprehensive system management and monitoring</p>
            </div>
          </div>
          <Button 
            onClick={() => queryClient.invalidateQueries()}
            size="sm"
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.activeUsers || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users at Risk</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.usersAtRisk || 0}</div>
              <p className="text-xs text-muted-foreground">
                Require attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Monitor className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.recentActivities?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="user-management" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="user-management" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="monitoring" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              Monitoring
            </TabsTrigger>
            <TabsTrigger value="activity-logs" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Activity Logs
            </TabsTrigger>
          </TabsList>

          {/* User Management Tab */}
          <TabsContent value="user-management">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management
                </CardTitle>
                <div className="flex items-center gap-4">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="deactivated">Deactivated</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={riskFilter} onValueChange={setRiskFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Risk" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Risk</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    {filteredUsers.map((user) => {
                      const risk = getRiskLevel(user);
                      return (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{user.fullName}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(user.accountStatus)}>
                              {user.accountStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={risk.color}>
                              {risk.level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {user.wellBeingCounter} / {user.maxWellBeingLimit}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {formatDate(user.lastWellBeingCheck)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => setSelectedUser(user)}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Manage User: {user.fullName}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Email</Label>
                                        <div className="text-sm text-gray-600">{user.email}</div>
                                      </div>
                                      <div>
                                        <Label>Current Status</Label>
                                        <Badge className={getStatusColor(user.accountStatus)}>
                                          {user.accountStatus}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>Risk Level</Label>
                                        <Badge className={risk.color}>
                                          {risk.level}
                                        </Badge>
                                      </div>
                                      <div>
                                        <Label>Member Since</Label>
                                        <div className="text-sm text-gray-600">
                                          {formatDate(user.createdAt)}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      <Label htmlFor="reason">Action Reason</Label>
                                      <Textarea
                                        id="reason"
                                        placeholder="Provide a reason for this action..."
                                        value={actionReason}
                                        onChange={(e) => setActionReason(e.target.value)}
                                      />
                                    </div>
                                    
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateUserStatus(user, 'active')}
                                        disabled={user.accountStatus === 'active'}
                                      >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Activate
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleUpdateUserStatus(user, 'suspended')}
                                        disabled={user.accountStatus === 'suspended'}
                                      >
                                        <Ban className="w-4 h-4 mr-2" />
                                        Suspend
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleUpdateUserStatus(user, 'deactivated')}
                                        disabled={user.accountStatus === 'deactivated'}
                                      >
                                        <UserX className="w-4 h-4 mr-2" />
                                        Deactivate
                                      </Button>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Users at Risk
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Risk Level</TableHead>
                        <TableHead>Well-being Counter</TableHead>
                        <TableHead>Last Activity</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usersAtRisk.map((user) => {
                        const risk = getRiskLevel(user);
                        return (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{user.fullName}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={risk.color}>
                                {risk.level}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {user.wellBeingCounter} / {user.maxWellBeingLimit}
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-red-500 h-2 rounded-full" 
                                    style={{ width: `${(user.wellBeingCounter / user.maxWellBeingLimit) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="text-sm">
                                {formatDate(user.lastWellBeingCheck)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline">
                                Review
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Activity Logs Tab */}
          <TabsContent value="activity-logs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  System Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(log.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {log.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-sm">
                            {log.action}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600">
                            {log.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.severity}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}