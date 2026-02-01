import { Award } from 'lucide-react';
import { MerchandiseCard } from '../components/MerchandiseCard';
import { Badge } from '../components/ui/badge';
import { mockMerchandise, currentUser } from '../services/mockData';

export function Merchandise() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">VIP Merchandise</h1>
          {currentUser.role === 'VIP' && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              <Award className="size-3 mr-1" />
              VIP Access
            </Badge>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Exclusive merchandise for VIP attendees
        </p>
      </div>

      {currentUser.role === 'VIP' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMerchandise.map((item) => (
            <MerchandiseCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-lg border-2 border-amber-200 dark:border-amber-800">
          <Award className="size-16 text-amber-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">VIP Access Required</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Upgrade to VIP to access exclusive merchandise and benefits
          </p>
        </div>
      )}
    </div>
  );
}
