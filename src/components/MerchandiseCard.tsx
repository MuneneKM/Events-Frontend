import { Download, Package } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';


interface MerchandiseCardProps {
  item: Merchandise;
}

interface Merchandise {
  id: string;
  name: string;
  description: string;
  image: string;
  isVipOnly: boolean;
  downloadUrl?: string;
  pickupStatus?: 'Available' | 'Collected';
}

export function MerchandiseCard({ item }: MerchandiseCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="h-48 overflow-hidden">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">{item.name}</h4>
            {item.isVipOnly && (
              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                VIP
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            {item.description}
          </p>
          {item.downloadUrl ? (
            <Button size="sm" className="w-full">
              <Download className="size-4 mr-2" />
              Download
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <Badge
                className={
                  item.pickupStatus === 'Available'
                    ? 'bg-green-500/10 text-green-700 dark:text-green-300'
                    : 'bg-gray-500/10 text-gray-700 dark:text-gray-300'
                }
              >
                <Package className="size-3 mr-1" />
                {item.pickupStatus}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
