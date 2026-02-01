import { Calendar, MapPin, User, MessageSquare } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';


interface EventCardProps {
  event: Event;
  onOpen: (eventId: string) => void;
  onFeedback?: (eventId: string) => void;
}

type UserRole = 'Regular' | 'VIP';
type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed';

interface Event {
  name: string;
  event_name: string;
  banner_image: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  host_name: string;
  ticket_type: UserRole;
  status: EventStatus;
  qrCode: string;
  vipBenefits?: string[];
}

export function EventCard({ event, onOpen, onFeedback }: EventCardProps) {
  const statusColors = {
    Upcoming: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    Ongoing: 'bg-green-500/10 text-green-700 dark:text-green-300',
    Completed: 'bg-gray-500/10 text-gray-700 dark:text-gray-300',
  };

  const isPastOrOngoing = event.status === 'Completed' || event.status === 'Ongoing';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 overflow-hidden">
        <img
          src={event.banner_image}
          alt={event.event_name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-6">
        <div className="flex gap-2 mb-3">
          <Badge className={statusColors[event.status]}>
            {event.status}
          </Badge>
          {event.ticket_type === 'VIP' && (
            <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
              VIP
            </Badge>
          )}
        </div>
        <h3 className="text-xl font-semibold mb-4">{event.event_name}</h3>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2">
            <Calendar className="size-4" />
            <span>
              {new Date(event.start_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
              {' - '}
              {new Date(event.end_date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{event.venue_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="size-4" />
            <span>{event.host_name}</span>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <Button
            onClick={() => onOpen(event.name)}
            className="flex-1"
          >
            Open Event
          </Button>
          {isPastOrOngoing && onFeedback && (
            <Button
              variant="outline"
              onClick={() => onFeedback(event.name)}
              className="flex-1"
            >
              <MessageSquare className="size-4 mr-1" />
              Feedback
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
