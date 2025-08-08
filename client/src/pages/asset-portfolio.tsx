import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocation } from 'wouter';
import { 
  ArrowLeft, 
  Plus, 
  Settings, 
  Building2, 
  Banknote, 
  Coins, 
  CreditCard, 
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react';

interface Asset {
  _id: string;
  assetType: string;
  title: string;
  description?: string;
  value?: string;
  currency: string;
  contactInfo?: string;
  storageLocation: string;
  accessInstructions?: string;
  createdAt: string;
  updatedAt: string;
}

const assetTypeIcons = {
  bank_account: Banknote,
  real_estate: Building2,
  cryptocurrency: Coins,
  investment: TrendingUp,
  loan: CreditCard,
};

const assetTypeLabels = {
  bank_account: 'Bank Account',
  real_estate: 'Real Estate',
  cryptocurrency: 'Cryptocurrency',
  investment: 'Investment',
  loan: 'Loan',
};

const storageLabels = {
  local: 'Local Server',
  google_drive: 'Google Drive',
  digilocker: 'DigiLocker',
};

interface ColumnConfig {
  key: string;
  label: string;
  visible: boolean;
  sortable?: boolean;
}

const defaultColumns: ColumnConfig[] = [
  { key: 'assetType', label: 'Asset Type', visible: true, sortable: true },
  { key: 'nameDescription', label: 'Name/Description', visible: true, sortable: true },
  { key: 'contactDetails', label: "Relative's Contact Details", visible: true },
  { key: 'relationUser', label: 'Relation with User', visible: true },
  { key: 'storage', label: 'Storage', visible: true },
  { key: 'lastUpdated', label: 'Last Updated', visible: true, sortable: true },
  { key: 'actions', label: 'Actions', visible: true },
];

export default function AssetPortfolioPage() {
  const [, setLocation] = useLocation();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [columns, setColumns] = useState<ColumnConfig[]>(defaultColumns);
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Fetch assets - use default query function that handles auth automatically
  const { data: assetsData, isLoading } = useQuery({
    queryKey: ['/api/assets'],
    enabled: isAuthenticated, // Only fetch when authenticated
  });

  // Ensure assets is always an array - extract from server response structure
  const assets: Asset[] = Array.isArray(assetsData?.assets) ? assetsData.assets : [];

  const filteredAssets = assets.filter((asset: Asset) => 
    selectedCategory === 'all' || asset.assetType === selectedCategory
  );

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortBy) return 0;
    
    let aValue = '';
    let bValue = '';
    
    switch (sortBy) {
      case 'assetType':
        aValue = assetTypeLabels[a.assetType as keyof typeof assetTypeLabels] || a.assetType;
        bValue = assetTypeLabels[b.assetType as keyof typeof assetTypeLabels] || b.assetType;
        break;
      case 'nameDescription':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'lastUpdated':
        aValue = a.updatedAt;
        bValue = b.updatedAt;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue.localeCompare(bValue);
    } else {
      return bValue.localeCompare(aValue);
    }
  });

  const handleColumnToggle = (columnKey: string) => {
    setColumns(prev => 
      prev.map(col => 
        col.key === columnKey ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAssetIcon = (assetType: string) => {
    const IconComponent = assetTypeIcons[assetType as keyof typeof assetTypeIcons] || Coins;
    return <IconComponent className="w-4 h-4" />;
  };

  const assetCategories = [
    { value: 'all', label: 'All Categories' },
    { value: 'bank_account', label: 'Bank Accounts' },
    { value: 'real_estate', label: 'Real Estate' },
    { value: 'cryptocurrency', label: 'Cryptocurrency' },
    { value: 'investment', label: 'Investments' },
    { value: 'loan', label: 'Loans' },
  ];

  const visibleColumns = Array.isArray(columns) ? columns.filter(col => col.visible) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="mr-4 hover:bg-white/50 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Asset Portfolio
              </h1>
              <p className="text-gray-600 mt-1">Manage your digital assets and legacy information securely</p>
            </div>
          </div>
          <Button 
            onClick={() => setLocation("/add-asset")}
            className="bg-gradient-assets hover:scale-105 transition-all duration-200 shadow-lg text-gray-800 border-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        </div>

        {/* Controls */}
        <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-white/80 border-gray-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {assetCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white/80 border-gray-200 hover:bg-white/90">
                    <Settings className="w-4 h-4 mr-2" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {columns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.key}
                      checked={column.visible}
                      onCheckedChange={() => handleColumnToggle(column.key)}
                    >
                      {column.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Assets Table */}
        <Card className="hover-lift border-0 shadow-lg bg-white/70 backdrop-blur-sm">
          <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortBy === column.key && (
                        <span className="text-xs">
                          {sortOrder === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [...Array(3)].map((_, i) => (
                  <TableRow key={i}>
                    {visibleColumns.map((column) => (
                      <TableCell key={column.key}>
                        <div className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sortedAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={visibleColumns.length} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <Coins className="w-8 h-8 text-gray-400" />
                      <p className="text-gray-500">No assets found</p>
                      <p className="text-sm text-gray-400">
                        {selectedCategory === 'all' 
                          ? 'Start by adding your first asset' 
                          : 'No assets in this category'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                sortedAssets.map((asset) => (
                  <TableRow key={asset._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                    {visibleColumns.map((column) => {
                      switch (column.key) {
                        case 'assetType':
                          return (
                            <TableCell key={column.key}>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-lg">
                                  {getAssetIcon(asset.assetType)}
                                </div>
                                <span className="font-semibold text-gray-800">
                                  {assetTypeLabels[asset.assetType as keyof typeof assetTypeLabels] || asset.assetType}
                                </span>
                              </div>
                            </TableCell>
                          );
                        case 'nameDescription':
                          return (
                            <TableCell key={column.key}>
                              <div>
                                <p className="font-medium text-gray-900">{asset.title}</p>
                                {asset.description && (
                                  <p className="text-sm text-gray-500 line-clamp-2">{asset.description}</p>
                                )}
                                {asset.value && (
                                  <p className="text-sm text-blue-600 font-medium">
                                    {asset.currency} {asset.value}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                          );
                        case 'contactDetails':
                          return (
                            <TableCell key={column.key}>
                              {asset.contactInfo ? (
                                <div className="text-sm">
                                  <p className="font-medium">Contact Info</p>
                                  <p className="text-gray-600">{asset.contactInfo}</p>
                                </div>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </TableCell>
                          );
                        case 'relationUser':
                          return (
                            <TableCell key={column.key}>
                              <Badge variant="outline">
                                Owner
                              </Badge>
                            </TableCell>
                          );
                        case 'storage':
                          return (
                            <TableCell key={column.key}>
                              <Badge variant="secondary">
                                {storageLabels[asset.storageLocation as keyof typeof storageLabels] || asset.storageLocation}
                              </Badge>
                            </TableCell>
                          );
                        case 'lastUpdated':
                          return (
                            <TableCell key={column.key} className="text-sm text-gray-600">
                              {formatDate(asset.updatedAt)}
                            </TableCell>
                          );
                        case 'actions':
                          return (
                            <TableCell key={column.key}>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          );
                        default:
                          return <TableCell key={column.key}>-</TableCell>;
                      }
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </CardContent>
        </Card>

        {/* Summary */}
        {!isLoading && sortedAssets.length > 0 && (
          <div className="text-center text-sm text-gray-500">
            Showing {sortedAssets.length} of {assets.length} assets
            {selectedCategory !== 'all' && ` in ${assetCategories.find(c => c.value === selectedCategory)?.label}`}
          </div>
        )}
      </div>
    </div>
  );
}