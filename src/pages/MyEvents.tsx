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
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
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

        // Fetch all events where user has tickets
        if (user?.email) {
          try {
            const ticketsResponse = await ticketAPI.getAllMyTickets(user.email);
            const ticketsData = ticketsResponse.data.message;

            // Handle tickets - could be array or single object
            let registeredEventsData: Event[] = [];
            if (Array.isArray(ticketsData)) {
              // Filter events with has_ticket true and map to Event format
              registeredEventsData = ticketsData
                .filter((t: { has_ticket: boolean }) => t.has_ticket)
                .map((t: { event_id: string }) => {
                  // Find the full event details from allEvents
                  const eventDetails = allEventsData.find((e: Event) => e.name === t.event_id);
                  return eventDetails || {
                    name: t.event_id,
                    event_name: t.event_id,
                    banner_image: '',
                    start_date: '',
                    end_date: '',
                    venue_name: '',
                    host_name: '',
                    ticket_type: 'Regular' as const,
                    status: 'Upcoming' as const,
                    qrCode: ''
                  };
                });
            }

            setRegisteredEvents(registeredEventsData);
          } catch (err) {
            console.error('Failed to fetch registered events:', err);
            setRegisteredEvents([]);
          }
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
          {registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {registeredEvents.map((event) => (
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
