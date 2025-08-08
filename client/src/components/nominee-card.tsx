import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Nominee {
  id: string;
  fullName: string;
  relationship: string;
  isVerified: boolean;
}

interface NomineeCardProps {
  nominee: Nominee;
}

export default function NomineeCard({ nominee }: NomineeCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>{nominee.fullName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">{nominee.fullName}</p>
              <p className="text-sm text-gray-500">{nominee.relationship}</p>
            </div>
          </div>
          <Badge 
            variant={nominee.isVerified ? "default" : "secondary"}
            className={nominee.isVerified ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
          >
            <div className={`w-2 h-2 rounded-full mr-2 ${nominee.isVerified ? 'bg-green-500' : 'bg-orange-500'}`}></div>
            {nominee.isVerified ? 'Verified' : 'Pending'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
