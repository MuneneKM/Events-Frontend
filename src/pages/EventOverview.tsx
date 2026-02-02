import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, MapPin, User, QrCode, Award, Clock, Users, Tag, UserPlus, Link2, Ticket, ArrowRight } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { eventsAPI, sessionsAPI, merchandiseAPI, networkingAPI, contentAPI, ticketAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';

interface Event {
  id: string;
  name: string;
  banner_image: string;
  start_date: string;
  end_date: string;
  venue: string;
  event_name: string;
  venue_name: string;
  description: string;
  host_name: string;
  organizer: string;
  ticketType: 'Regular' | 'VIP';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  qr_code: string;
  vipBenefits?: string[];
}

interface Session {
  name: string;
  event: string;
  session_title: string;
  talk_name: string;
  start_time: string;
  end_time: string;
  track: string;
  session_type: string;
  capacity: number;
  allow_booking: boolean;
  isBooked?: boolean;
  booked_spots: number;
}

interface Merchandise {
  name: string;
  item_name: string;
  description: string;
  item_image: string;
  price: number;
  stock_quantity: number;
  currency: string;
}

interface NetworkingMatch {
  id: string;
  name: string;
  role: string;
  type: 'Attendee' | 'Speaker' | 'Sponsor';
  interests: string[];
  matchScore: number;
  photo: string;
  connected: boolean;
}

interface Content {
  id: string;
  title: string;
  sessionName: string;
  type: 'Video' | 'PDF' | 'Slides';
  access_level: 'All' | 'VIP' | 'Paid';
  url: string;
  thumbnail: string;
}

// Ticket payload format from API
interface TicketPayload {
  has_ticket: boolean;
  ticket_id: string;
  event_id: string;
  event_name: string;
  start_date: string;
  end_date: string;
  venue: string;
  venue_name: string;
  ticket_type: string;
  ticket_category: string;
  ticket_category_name: string;
  access_level: string;
  ticket_price: number;
  qr_code: string;
  issue_date: string;
  status: string;
  checked_in: number;
  discount_code: string | null;
  discount_amount: number;
  total_amount: number;
  full_name: string;
  email: string;
  merchandise_total: number;
  merchandise: {
    merchandise: string;
    quantity: number;
    price: number;
  }[];
}

type Props = {
  html: string;
};

export function HtmlRenderer({ html }: Props) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}


export function EventOverview() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [event, setEvent] = useState<Event | null>(null);
  const [eventSessions, setEventSessions] = useState<Session[]>([]);
  const [eventMerchandise, setEventMerchandise] = useState<Merchandise[]>([]);
  const [networkingMatches, setNetworkingMatches] = useState<NetworkingMatch[]>([]);
  const [eventContent, setEventContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketData, setTicketData] = useState<TicketPayload | null>(null);

  useEffect(() => {
    const fetchEventData = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const [eventRes, sessionsRes, merchandiseRes, networkingRes, contentRes] = await Promise.all([
          eventsAPI.getById(eventId),
          sessionsAPI.getByEvent(eventId),
          merchandiseAPI.getByEvent(eventId),
          isAuthenticated ? networkingAPI.getMatches() : Promise.resolve({ data: { message: [] } }),
          contentAPI.getByEvent(eventId)
        ]);

        const eventData = eventRes.data.message || null;
        setEvent(eventData);
        setEventSessions(sessionsRes.data.message || []);
        setEventMerchandise(merchandiseRes.data.message || []);
        if (isAuthenticated) {
          setNetworkingMatches(networkingRes.data.message || []);
        }
        setEventContent(contentRes.data.message || []);

        // Check if user has ticket for this event
        if (isAuthenticated && user?.email) {
          try {
            const ticketResponse = await ticketAPI.getMyTickets(user.email, eventId);
            const ticketMsg = ticketResponse.data.message;

            // Handle ticket - could be array or single object
            if (Array.isArray(ticketMsg)) {
              const foundTicket = ticketMsg.find((t: TicketPayload) => t.has_ticket);
              if (foundTicket) {
                setHasTicket(true);
                setTicketData(foundTicket);
              } else {
                setHasTicket(false);
                setTicketData(null);
              }
            } else if (ticketMsg && ticketMsg.has_ticket) {
              setHasTicket(true);
              setTicketData(ticketMsg);
            } else {
              setHasTicket(false);
              setTicketData(null);
            }
          } catch (ticketErr) {
            console.error('Failed to check ticket status:', ticketErr);
            setHasTicket(false);
            setTicketData(null);
          }
        }
      } catch (err) {
        console.error('Failed to fetch event data:', err);
        setError('Failed to load event data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, isAuthenticated]);

  // User is registered if they are authenticated
  const isRegistered = isAuthenticated;

  // Group sessions by day
  const sessionsByDay = eventSessions.reduce((acc, session) => {
    if (!acc[session.start_time]) {
      acc[session.start_time] = [];
    }
    acc[session.start_time].push(session);
    return acc;
  }, {} as Record<string, typeof eventSessions>);

  // Get unique days
  const eventDays = Object.keys(sessionsByDay);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/dashboard/event/${eventId}/book` } });
    } else {
      navigate(`/dashboard/event/${eventId}/book`);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-red-600 dark:text-red-400">{error || 'Event not found'}</p>
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-8">
      {/* Banner */}
      <div className="h-64 md:h-80 overflow-hidden relative">
        <img
          src={event.banner_image}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.event_name}
            </h1>
            <div className="flex gap-2">
              <Badge className="bg-white/90 text-gray-900">
                {event.status}
              </Badge>
              {event.ticketType === 'VIP' && (
                <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                  VIP Access
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome message for registered users with ticket */}
        {isRegistered && hasTicket && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200">
              You have valid ticket for this event, Enjoy you time!
            </p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <TabsList className={`w-full grid ${isRegistered ? 'grid-cols-5' : 'grid-cols-4'}`}>
                <TabsTrigger value="details" onClick={() => setActiveTab('details')}>
                  Event Details
                </TabsTrigger>
                <TabsTrigger value="agenda" onClick={() => setActiveTab('agenda')}>
                  Agenda
                </TabsTrigger>
                <TabsTrigger value="merchandise" onClick={() => setActiveTab('merchandise')}>
                  Merchandise
                </TabsTrigger>
                {isRegistered && (
                  <TabsTrigger value="networking" onClick={() => setActiveTab('networking')}>
                    Networking
                  </TabsTrigger>
                )}
                <TabsTrigger value="content" onClick={() => setActiveTab('content')}>
                  Content Library
                </TabsTrigger>
              </TabsList>

              {/* Event Details Tab Content */}
              <TabsContent value="details">
                <div className="space-y-6">
                  {/* Event Details */}
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-semibold mb-4">Event Details</h2>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="size-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Date</p>
                            <p className="font-medium">
                              {new Date(event.start_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                              })}
                              {' - '}
                              {new Date(event.end_date).toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="size-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Venue</p>
                            <p className="font-medium">{event.venue_name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <User className="size-5 text-gray-500" />
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Organizer</p>
                            <p className="font-medium">{event.host_name}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Description */}
                    <Card className="border-2 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <h2 className="text-xl font-semibold">Description</h2>
                        </div>
                            <HtmlRenderer html={event.description} />
                      </CardContent>
                    </Card>
                </div>
              </TabsContent>

              {/* Agenda Tab Content */}
              <TabsContent value="agenda">
                {eventSessions.length > 0 ? (
                  <div className="space-y-6">
                    {eventDays.map((day) => (
                      <div key={day}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          <Calendar className="size-5 text-blue-600" />
                          {day.split(" ")[0]}
                        </h3>
                        <div className="space-y-3">
                          {sessionsByDay[day].map((session) => (
                            <Card key={session.name} className="overflow-hidden">
                              <div className="flex">
                                <div className="bg-blue-600 text-white p-4 flex flex-col items-center justify-center min-w-[80px]">
                                  <Clock className="size-4 mb-1" />
                                  <span className="text-sm font-medium">{session.start_time.split(" ")[1]}</span>
                                  <span className="text-xs opacity-75">{session.end_time.split(" ")[1]}</span>
                                </div>
                                <CardContent className="p-4 flex-1">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <h4 className="font-semibold">{session.session_title}</h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                        {session.talk_name}
                                      </p>
                                    </div>
                                    <Badge variant="outline">{session.session_type}</Badge>
                                  </div>
                                  <div className="flex items-center gap-4 mt-3">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Tag className="size-3" />
                                      {session.track}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                      <Users className="size-3" />
                                      {session.booked_spots}/{session.capacity}
                                    </span>
                                    {session.isBooked && (
                                      <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                                        Booked
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        No sessions available for this event.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Merchandise Tab Content */}
              <TabsContent value="merchandise">
                {eventMerchandise.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 md:grid-cols-3 gap-4">
                    {eventMerchandise.map((item) => (
                      <Card key={item.name} className="overflow-hidden">
                        <div className="h-48 overflow-hidden">
                          <img
                            src={item.item_image}
                            alt={item.item_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{item.item_name}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.description}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between">
                            <span className="font-semibold">{item.currency} {item.price.toFixed(2)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        No merchandise available for this event.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Networking Tab Content - Only visible if registered */}
              {isRegistered && (
                <TabsContent value="networking">
                  {networkingMatches.length > 0 ? (
                    <div className="space-y-4">
                      {networkingMatches.map((match) => (
                        <Card key={match.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <img
                                src={match.photo}
                                alt={match.name}
                                className="w-16 h-16 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-semibold">{match.name}</h4>
                                  <Badge variant="outline" className="text-xs">
                                    {match.type}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {match.role}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-gray-500">
                                    Match Score: {match.matchScore}%
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {match.interests.slice(0, 3).map((interest, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2">
                                {match.connected ? (
                                  <Button size="sm" variant="outline" disabled>
                                    Connected
                                  </Button>
                                ) : (
                                  <Button size="sm">
                                    <UserPlus className="size-4 mr-1" />
                                    Connect
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="p-8 text-center">
                      <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">
                          No networking matches found.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              )}

              {/* Content Library Tab Content */}
              <TabsContent value="content">
                {eventContent.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {eventContent.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="h-40 overflow-hidden">
                          <img
                            src={item.thumbnail}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-semibold">{item.title}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {item.sessionName}
                              </p>
                            </div>
                            <Badge
                              className={
                                item.access_level === 'VIP'
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                  : item.access_level === 'Paid'
                                    ? 'bg-purple-500/10 text-purple-700'
                                    : 'bg-green-500/10 text-green-700'
                              }
                            >
                              {item.access_level}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline">{item.type}</Badge>
                          </div>
                          <div className="mt-4">
                            <Button variant="outline" size="sm" className="w-full">
                              <Link2 className="size-4 mr-1" />
                              Access Content
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400">
                        No content available for this event.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Show Book Now card if no ticket */}
              {!hasTicket && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Ticket className="size-5" />
                      <h3 className="font-semibold">Get Your Ticket</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Book your spot at this event to access all features including networking and content.
                    </p>
                    <Button className="w-full" onClick={handleBookNow}>
                      <Ticket className="size-4 mr-2" />
                      Book Now
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Sponsorship & Exhibition Link */}
              <Card className="cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate(`/dashboard/event/${eventId}/sponsorship`)}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="size-5 text-blue-600" />
                    <h3 className="font-semibold">Sponsorship & Exhibition</h3>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Become a sponsor or request a booth to showcase your brand.
                  </p>
                  <Button className="w-full" variant="outline">
                    View Sponsorship Options
                    <ArrowRight className="size-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* QR Code - Only show if has ticket */}
              {hasTicket && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="size-5" />
                      <h3 className="font-semibold">Check-in QR Code</h3>
                    </div>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                        <QRCodeSVG value={ticketData?.qr_code || event.qr_code} size={200} />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-4">
                      Show this code at the venue for check-in
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Ticket Summary - Only show if has ticket */}
              {hasTicket && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Ticket Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Type</span>
                        <Badge className={
                          ticketData?.ticket_category_name === 'VIP'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        }>
                          {ticketData?.ticket_category_name || event.ticketType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                          Confirmed
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(`/dashboard/event/${eventId}/ticket`)}
                    >
                      View Complete Ticket
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
