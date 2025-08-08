import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Heart } from "lucide-react";

interface WellBeingAlertProps {
  onConfirm: () => void;
  isLoading?: boolean;
}

export default function WellBeingAlert({ onConfirm, isLoading }: WellBeingAlertProps) {
  return (
    <Card className="bg-orange-50 border-l-4 border-orange-500 mb-8">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-500 mr-4" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Well-being Check Required</h3>
              <p className="text-orange-700">Please confirm your status to reset the alert counter</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              onClick={onConfirm}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white"
            >
              <Heart className="w-4 h-4 mr-2" />
              {isLoading ? "Confirming..." : "I'm Okay"}
            </Button>
            <Button variant="outline" className="text-gray-700">
              Cancel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
