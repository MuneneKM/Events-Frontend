import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Calendar, MapPin, User, Download, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { eventsAPI, ticketAPI, merchandiseAPI, sessionsAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';

interface Event {
    id: string;
    name: string;
    bannerImage: string;
    startDate: string;
    endDate: string;
    venue: string;
    organizer: string;
    ticketType: 'Regular' | 'VIP';
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    qrCode: string;
}

interface Ticket {
    id: string;
    name: string;
    email: string;
    ticketType: 'Regular' | 'VIP';
    qrCode: string;
    eventId: string;
}

interface Merchandise {
    id: string;
    name: string;
    description: string;
    image: string;
    price: number;
    isVipOnly: boolean;
    pickupStatus?: 'Available' | 'Collected';
}

interface Session {
    id: string;
    eventId: string;
    title: string;
    speaker: string;
    startTime: string;
    endTime: string;
    day: string;
    track: string;
    type: string;
    capacity: number;
    booked: number;
}

interface CartItem {
    merchandiseId: string;
    quantity: number;
}

export function Ticket() {
    const { eventId } = useParams();
    const [event, setEvent] = useState<Event | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [eventSessions, setEventSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;

            try {
                setIsLoading(true);
                const [eventRes, ticketsRes, merchRes, cartRes, sessionsRes] = await Promise.all([
                    eventsAPI.getById(eventId),
                    ticketAPI.getMyTickets(),
                    merchandiseAPI.getByEvent(eventId),
                    merchandiseAPI.getCart(),
                    sessionsAPI.getByEvent(eventId)
                ]);

                setEvent(eventRes.data.message || null);
                // Filter tickets for this event
                const allTickets = ticketsRes.data.message || [];
                setTickets(allTickets.filter((t: Ticket) => t.eventId === eventId));
                setMerchandise(merchRes.data.message || []);
                setCart(cartRes.data.message || []);
                setEventSessions(sessionsRes.data.message || []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load ticket data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

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

    const isMultipleAttendees = tickets.length > 1;

    const handleDownloadAll = async () => {
        for (const ticket of tickets) {
            try {
                const response = await ticketAPI.downloadTicket(ticket.id);
                const blob = response.data;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `ticket-${ticket.id}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            } catch (err) {
                console.error('Failed to download ticket:', err);
            }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Your Tickets</h1>
                <p className="text-gray-600 dark:text-gray-300">{event.name}</p>
            </div>

            {/* Event Summary Card */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <img
                                src={event.bannerImage}
                                alt={event.name}
                                className="w-24 h-24 rounded object-cover"
                            />
                            <div>
                                <h2 className="font-semibold text-lg">{event.name}</h2>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="size-4" />
                                    {new Date(event.startDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                    })} - {new Date(event.endDate).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="size-4" />
                                    {event.venue}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(event.venue)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                                <MapPin className="size-5" />
                                View on Map
                            </a>
                        </div>

                        <div className="flex items-center justify-end">
                            <Button variant="outline" onClick={handleDownloadAll}>
                                <Download className="size-4 mr-2" />
                                Download All Tickets
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Tickets */}
            <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold">Attendee Tickets ({tickets.length})</h2>

                {isMultipleAttendees ? (
                    // Multiple attendees - show all tickets
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {tickets.map((ticket) => (
                            <TicketCard key={ticket.id} ticket={ticket} event={event} />
                        ))}
                    </div>
                ) : tickets.length === 1 ? (
                    // Single attendee - show one ticket
                    <div className="max-w-md">
                        <TicketCard ticket={tickets[0]} event={event} />
                    </div>
                ) : (
                    <Card className="p-8 text-center">
                        <CardContent>
                            <p className="text-gray-600 dark:text-gray-400">No tickets found for this event.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Booked Merchandise */}
            {cart.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Booked Merchandise</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cart.map((item) => {
                            const merch = merchandise.find((m) => m.id === item.merchandiseId);
                            if (!merch) return null;
                            return (
                                <Card key={item.merchandiseId} className="overflow-hidden">
                                    <div className="flex">
                                        <img
                                            src={merch.image}
                                            alt={merch.name}
                                            className="w-24 h-24 object-cover"
                                        />
                                        <CardContent className="p-4 flex-1">
                                            <h4 className="font-medium">{merch.name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Quantity: {item.quantity}
                                            </p>
                                            {merch.pickupStatus && (
                                                <Badge
                                                    className={
                                                        merch.pickupStatus === 'Available'
                                                            ? 'bg-green-500/10 text-green-700'
                                                            : 'bg-gray-500/10 text-gray-700'
                                                    }
                                                >
                                                    {merch.pickupStatus}
                                                </Badge>
                                            )}
                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quick Access to Other Pages */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Calendar className="size-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">View Agenda</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {eventSessions.length} sessions scheduled
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <ShoppingBag className="size-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">Merchandise</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Pick up your merchandise
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="p-4">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <User className="size-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">Networking</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Connect with attendees
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function TicketCard({
    ticket,
    event,
}: {
    ticket: Ticket;
    event: Event;
}) {
    return (
        <Card className="overflow-hidden">
            {/* Header with event banner */}
            <div className="h-32 overflow-hidden relative">
                <img
                    src={event.bannerImage}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-4 right-4">
                    <Badge
                        className={
                            ticket.ticketType === 'VIP'
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                : 'bg-blue-500 text-white'
                        }
                    >
                        {ticket.ticketType} Ticket
                    </Badge>
                </div>
            </div>

            {/* Ticket details */}
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ticket.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(event.startDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {event.venue}
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <QRCodeSVG value={ticket.qrCode} size={180} />
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                    Show this code at the venue for check-in
                </p>
            </CardContent>
        </Card>
    );
}
