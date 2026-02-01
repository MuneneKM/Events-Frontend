import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Calendar, MapPin, User, Download, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { eventsAPI, ticketAPI, merchandiseAPI, sessionsAPI } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

interface Event {
    id: string;
    name: string;
    banner_image: string;
    start_date: string;
    event_name: string;
    end_date: string;
    venue_name: string;
    venue: string;
    organizer: string;
    status: 'Upcoming' | 'Ongoing' | 'Completed';
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

interface Merchandise {
    name: string;
    id: string;
    item_name: string;
    description: string;
    item_image: string;
    price: number;
    isVipOnly: boolean;
    stock_quantity: number;
}

interface Session {
    id: string;
    event: string;
    session_title: string;
    talk_name: string;
    start_time: string;
    end_time: string;
    track: string;
    session_type: string;
    capacity: number;
    booked_spots: number;
}

export function Ticket() {
    const { eventId } = useParams();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [ticket, setTicket] = useState<TicketPayload | null>(null);
    const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
    const [eventSessions, setEventSessions] = useState<Session[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId || !user?.email) return;

            try {
                setIsLoading(true);
                const [eventRes, ticketRes, merchRes, sessionsRes] = await Promise.all([
                    eventsAPI.getById(eventId),
                    ticketAPI.getMyTickets(user.email, eventId),
                    merchandiseAPI.getByEvent(eventId),
                    sessionsAPI.getByEvent(eventId)
                ]);

                setEvent(eventRes.data.message || null);

                // Handle ticket - could be array or single object
                const ticketData = ticketRes.data.message;
                if (Array.isArray(ticketData)) {
                    // Find ticket with has_ticket true
                    const foundTicket = ticketData.find((t: TicketPayload) => t.has_ticket);
                    setTicket(foundTicket || null);
                } else if (ticketData && ticketData.has_ticket) {
                    setTicket(ticketData);
                } else {
                    setTicket(null);
                }

                setMerchandise(merchRes.data.message || []);
                setEventSessions(sessionsRes.data.message || []);
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load ticket data.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId, user?.email]);

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

    if (!ticket) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <Card className="p-8 text-center">
                    <CardContent>
                        <p className="text-gray-600 dark:text-gray-400">No ticket found for this event.</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleDownloadTicket = async () => {
        try {
            // Generate QR code data from ticket info
            const qrData = JSON.stringify({
                event_id: ticket.event_id,
                ticket_type: ticket.ticket_type,
                qr_code: ticket.qr_code
            });

            // Create a simple download (in real app, this would download PDF)
            const blob = new Blob([qrData], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ticket-${ticket.ticket_id}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Failed to download ticket:', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Your Ticket</h1>
                <p className="text-gray-600 dark:text-gray-300">{event.event_name}</p>
            </div>

            {/* Event Summary Card */}
            <Card className="mb-8">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <img
                                src={event.banner_image}
                                alt={event.event_name}
                                className="w-24 h-24 rounded object-cover"
                            />
                            <div>
                                <h2 className="font-semibold text-lg">{event.event_name}</h2>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <Calendar className="size-4" />
                                    {new Date(event.start_date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                    })} - {new Date(event.end_date).toLocaleDateString('en-US', {
                                        month: 'long',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="size-4" />
                                    {event.venue_name}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-center">
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(event.venue_name)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-blue-600 hover:underline"
                            >
                                <MapPin className="size-5" />
                                View on Map
                            </a>
                        </div>

                        <div className="flex items-center justify-end">
                            <Button variant="outline" onClick={handleDownloadTicket}>
                                <Download className="size-4 mr-2" />
                                Download Ticket
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Individual Ticket */}
            <div className="space-y-6 mb-8">
                <h2 className="text-xl font-semibold">Attendee Ticket</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <TicketCard
                        ticket={ticket}
                        event={event}
                        merchandise={merchandise}
                    />
                </div>
            </div>

            {/* Booked Merchandise */}
            {ticket.merchandise && ticket.merchandise.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Booked Merchandise</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {ticket.merchandise.map((item) => {
                            const merch = merchandise.find(m => m.name === item.merchandise);
                            if (!merch) return null;
                            return (
                                <Card key={item.merchandise} className="overflow-hidden">
                                    <div className="flex">
                                        <img
                                            src={merch.item_image}
                                            alt={merch.item_name}
                                            className="w-24 h-24 object-cover"
                                        />
                                        <CardContent className="p-4 flex-1">
                                            <h4 className="font-medium">{merch.item_name}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Quantity: {item.quantity}
                                            </p>
                                            <p className="text-sm font-medium">ksh {(item.price * item.quantity).toFixed(2)}</p>
                                        </CardContent>
                                    </div>
                                </Card>
                            );
                        }).filter(Boolean)}
                    </div>
                </div>
            )}

            {/* Quick Access to Other Pages */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">

                <Card className="p-4">
                    <CardContent className="p-0 flex items-center gap-4">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <ShoppingBag className="size-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-medium">Merchandise</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Pick up your merchandise at the venue
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
    merchandise,
}: {
    ticket: TicketPayload;
    event: Event;
    merchandise: Merchandise[];
}) {
    // Generate QR code data
    const qrData = JSON.stringify({
        event_id: ticket.event_id,
        ticket_type: ticket.ticket_type,
        qr_code: ticket.qr_code
    });

    return (
        <Card className="overflow-hidden">
            {/* Header with event banner */}
            <div className="h-32 overflow-hidden relative">
                <img
                    src={event.banner_image}
                    alt={event.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-4 right-4">
                    <Badge
                        className={
                            ticket.ticket_category_name === 'VIP'
                                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                                : 'bg-blue-500 text-white'
                        }
                    >
                        {ticket.ticket_category_name} Ticket
                    </Badge>
                </div>
            </div>

            {/* Ticket details */}
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ticket.full_name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{ticket.email}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                        <Calendar className="size-4" />
                        {new Date(event.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                        })}
                    </div>
                    <div className="flex items-center gap-1">
                        <MapPin className="size-4" />
                        {event.venue_name}
                    </div>
                </div>

                {/* Ticket summary */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                        <span>Ticket Type</span>
                        <span className="font-medium">{ticket.ticket_category_name}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-1">
                        <span>Ticket Price</span>
                        <span className="font-medium">ksh {ticket.ticket_price.toFixed(2)}</span>
                    </div>
                    {ticket.merchandise_total > 0 && (
                        <div className="flex justify-between text-sm mb-1">
                            <span>Merchandise</span>
                            <span className="font-medium">ksh {ticket.merchandise_total.toFixed(2)}</span>
                        </div>
                    )}
                    {ticket.discount_amount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                            <span>Discount</span>
                            <span className="font-medium">-ksh {ticket.discount_amount.toFixed(2)}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold mt-2 pt-2 border-t">
                        <span>Total Paid</span>
                        <span>ksh {ticket.total_amount.toFixed(2)}</span>
                    </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center p-4 bg-white rounded-lg border">
                    <QRCodeSVG value={qrData} size={180} />
                </div>

                <p className="text-xs text-gray-500 text-center mt-3">
                    Show this code at the venue for check-in
                </p>
            </CardContent>
        </Card>
    );
}
