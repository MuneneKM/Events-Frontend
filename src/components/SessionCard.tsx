import { Clock, User, Users } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Progress } from './ui/progress';

interface SessionCardProps {
  session: Session;
  onBook?: (sessionId: string) => void;
}

interface Session {
  name: string;
  event: string;
  session_title: string;
  start_time: string;
  end_time: string;
  track: string;
  session_type: string;
  capacity: number;
  booked_spots: number;
  is_booked: boolean;
}

export function SessionCard({ session, onBook }: SessionCardProps) {
  const capacityPercentage = (session.booked_spots / session.capacity) * 100;
  const isFull = session.booked_spots >= session.capacity;
  const isBooked = session.is_booked;
  const isOverlapping = false; // This would be determined by the parent component

  const getStatusBadge = () => {
    if (isBooked) {
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">Booked</Badge>;
    }
    if (isFull) {
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-300">Full</Badge>;
    }
    if (isOverlapping) {
      return <Badge className="bg-orange-500/10 text-orange-700 dark:text-orange-300">Overlapping</Badge>;
    }
    return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-300">Available</Badge>;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h4 className="font-semibold mb-2">{session.session_title}</h4>
            {/* <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <User className="size-4" />
              <span>{session.speaker}</span>
            </div> */}
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
          <div className="flex items-center gap-2">
            <Clock className="size-4" />
            <span>{session.start_time} - {session.end_time}</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {session.track}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {session.session_type}
            </Badge>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-2">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              Capacity
            </span>
            <span>{session.booked_spots} / {session.capacity}</span>
          </div>
          <Progress value={capacityPercentage} className="h-2" />
        </div>

        {onBook && !isBooked && (
          <Button
            onClick={() => onBook(session.name)}
            disabled={isFull || isOverlapping}
            className="w-full"
            variant={isFull || isOverlapping ? 'outline' : 'default'}
          >
            {isFull ? 'Session Full' : isOverlapping ? 'Time Conflict' : 'Book Session'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
