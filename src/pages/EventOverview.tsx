import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, MapPin, User, QrCode, Award, Clock, Users, Tag, UserPlus, Link2, Ticket } from 'lucide-react';
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
  bannerImage: string;
  start_date: string;
  end_date: string;
  venue: string;
  venue_name: string;
  host_name: string;
  organizer: string;
  ticketType: 'Regular' | 'VIP';
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  qrCode: string;
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
  accessLevel: 'All' | 'VIP' | 'Paid';
  url: string;
  thumbnail: string;
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

        setEvent(eventRes.data.message || null);
        setEventSessions(sessionsRes.data.message || []);
        setEventMerchandise(merchandiseRes.data.message || []);
        if (isAuthenticated) {
          setNetworkingMatches(networkingRes.data.message || []);
        }
        setEventContent(contentRes.data.message || []);

        // Check if user has ticket for this event
        if (isAuthenticated && user?.email) {
          try {
            const ticketResponse = await ticketAPI.hasTicket(user.email, eventId);
            setHasTicket(ticketResponse.data.message?.has_ticket || false);
          } catch (ticketErr) {
            console.error('Failed to check ticket status:', ticketErr);
            setHasTicket(false);
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
          src={event.bannerImage}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="max-w-7xl mx-auto px-4 pb-8 w-full">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {event.name}
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
        {/* Book Now Button - Show if not registered or registered but no ticket */}
        {/* {(!isRegistered || (isRegistered && !hasTicket)) && event.status !== 'Completed' && (
          <div className="mb-6">
            <Button size="lg" onClick={handleBookNow}>
              <Ticket className="size-5 mr-2" />
              {isRegistered ? 'Book Event' : 'Book Now'}
            </Button>
          </div>
        )} */}

        {/* Welcome message for registered users with ticket */}
        {isRegistered && hasTicket && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-800 dark:text-green-200">
              Welcome back, <span className="font-semibold">{user?.name}</span>! You are registered for this event.
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

                  {/* VIP Benefits */}
                  {event.vipBenefits && event.vipBenefits.length > 0 && (
                    <Card className="border-2 border-amber-200 dark:border-amber-800">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Award className="size-5 text-amber-600" />
                          <h2 className="text-xl font-semibold">VIP Benefits</h2>
                        </div>
                        <ul className="space-y-2">
                          {event.vipBenefits.map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="size-1.5 rounded-full bg-amber-600" />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
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
                            {/* {item.isVipOnly && (
                              <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">
                                VIP Only
                              </Badge>
                            )} */}
                          </div>
                          {/* <div className="mt-4 flex items-center justify-between">
                            {item.pickupStatus && (
                              <Badge className={item.pickupStatus === 'Available' ? 'bg-green-500/10 text-green-700' : 'bg-gray-500/10 text-gray-700'}>
                                {item.pickupStatus}
                              </Badge>
                            )}
                            {item.downloadUrl && (
                              <Button variant="outline" size="sm">
                                Download
                              </Button>
                            )}
                          </div> */}
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
                                item.accessLevel === 'VIP'
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                  : item.accessLevel === 'Paid'
                                    ? 'bg-purple-500/10 text-purple-700'
                                    : 'bg-green-500/10 text-green-700'
                              }
                            >
                              {item.accessLevel}
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

              {/* QR Code - Only show if has ticket */}
              {hasTicket && (
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="size-5" />
                      <h3 className="font-semibold">Check-in QR Code</h3>
                    </div>
                    <div className="flex justify-center p-4 bg-white rounded-lg">
                      <QRCodeSVG value={event.qrCode} size={200} />
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
                          event.ticketType === 'VIP'
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                            : 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                        }>
                          {event.ticketType}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                        <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                          Confirmed
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Code</span>
                        <span className="font-mono text-sm">{event.qrCode}</span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => navigate(`/dashboard/ticket/${event.id}`)}
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
