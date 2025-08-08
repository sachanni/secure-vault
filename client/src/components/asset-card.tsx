import { Card, CardContent } from "@/components/ui/card";
import { University, Home, Bitcoin, TrendingUp } from "lucide-react";

interface Asset {
  id: string;
  assetType: string;
  title: string;
  value?: string;
  currency?: string;
}

interface AssetCardProps {
  asset: Asset;
}

const getAssetIcon = (assetType: string) => {
  switch (assetType) {
    case 'bank_account':
      return <University className="w-5 h-5 text-primary-500" />;
    case 'real_estate':
      return <Home className="w-5 h-5 text-green-500" />;
    case 'cryptocurrency':
      return <Bitcoin className="w-5 h-5 text-orange-500" />;
    case 'investment':
      return <TrendingUp className="w-5 h-5 text-purple-500" />;
    default:
      return <University className="w-5 h-5 text-primary-500" />;
  }
};

const getAssetTypeLabel = (assetType: string) => {
  switch (assetType) {
    case 'bank_account':
      return 'Bank Account';
    case 'real_estate':
      return 'Real Estate';
    case 'cryptocurrency':
      return 'Cryptocurrency';
    case 'investment':
      return 'Investment';
    default:
      return 'Asset';
  }
};

export default function AssetCard({ asset }: AssetCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
              {getAssetIcon(asset.assetType)}
            </div>
            <div>
              <p className="font-medium text-gray-900">{asset.title}</p>
              <p className="text-sm text-gray-500">{getAssetTypeLabel(asset.assetType)}</p>
            </div>
          </div>
          {asset.value && (
            <span className="text-sm font-medium text-gray-600">
              {asset.currency} {asset.value}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
