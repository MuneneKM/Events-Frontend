import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { EventCard } from '../components/EventCard';
import { eventsAPI, ticketAPI } from '../services/api';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';

interface Event {
  name: string;
  event_name: string;
  banner_image: string;
  start_date: string;
  end_date: string;
  venue_name: string;
  host_name: string;
  ticket_type: 'Regular' | 'VIP';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  qrCode: string;
  vipBenefits?: string[];
}

export function MyEvents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [eventsWithTickets, setEventsWithTickets] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const [allResponse, myResponse] = await Promise.all([
          eventsAPI.getAll(),
          eventsAPI.getMyEvents()
        ]);

        const allEventsData = allResponse.data.message || [];
        const myEventsData = myResponse.data.message || [];

        setAllEvents(allEventsData);
        setMyEvents(myEventsData);

        // Check which events the user has tickets for
        if (user?.email && myEventsData.length > 0) {
          const ticketChecks = myEventsData.map(async (event: Event) => {
            try {
              const response = await ticketAPI.hasTicket(user.email, event.name);
              if (response.data.message?.has_ticket) {
                return event.name;
              }
            } catch (err) {
              console.error(`Failed to check ticket for event ${event.name}:`, err);
            }
            return null;
          });

          const results = await Promise.all(ticketChecks);
          const eventsWithTicketsSet = new Set(results.filter(Boolean));
          setEventsWithTickets(eventsWithTicketsSet);
        }
      } catch (err) {
        console.error('Failed to fetch events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [user?.email]);

  const handleOpenEvent = (eventId: string) => {
    navigate(`/dashboard/event/${eventId}`);
  };

  const handleFeedback = (eventId: string) => {
    navigate(`/dashboard/event/${eventId}/feedback`);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Events</h1>
        <p className="text-gray-600 dark:text-gray-300">
          View and manage your registered events
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="my-events">My Events</TabsTrigger>
        </TabsList>
      </Tabs>

      <Tabs value={activeTab}>
        <TabsContent value="all">
          {allEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allEvents.map((event) => (
                <EventCard
                  key={event.name}
                  event={event}
                  onOpen={() => handleOpenEvent(event.name)}
                  onFeedback={handleFeedback}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No events available</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-events">
          {eventsWithTickets.size > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myEvents
                .filter((event) => eventsWithTickets.has(event.name))
                .map((event) => (
                  <EventCard
                    key={event.name}
                    event={event}
                    onOpen={() => handleOpenEvent(event.name)}
                    onFeedback={handleFeedback}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400 mb-4">You haven't registered for any events yet</p>
              <Button onClick={() => setActiveTab('all')}>Browse Events</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
