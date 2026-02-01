import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Calendar, MapPin, User, Plus, Trash2, Check, CreditCard, Tag } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { eventsAPI, merchandiseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Event {
    id: string;
    name: string;
    bannerImage: string;
    start_date: string;
    end_date: string;
    venue_name: string;
    venue: string;
    organizer: string;
    ticketType: 'Regular' | 'VIP';
    status: 'Upcoming' | 'Ongoing' | 'Completed';
    qrCode: string;
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

interface CartItem {
    merchandise: string;
    quantity: number;
}

interface AttendeeMerchandise {
    merchandise: string;
    quantity: number;
}

// Local attendee interface with camelCase for frontend use
interface AttendeeFormData {
    id: string;
    full_name: string;
    email: string;
    ticket_type: string;
    merchandise: AttendeeMerchandise[];
}

// Ticket type from API
interface TicketType {
    name: string;
    ticket_category_name: string;
    ticket_price: number;
    access_level: string;
    sales_start: string;
    sales_end: string;
}

export function Booking() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [merchandise, setMerchandise] = useState<Merchandise[]>([]);
    const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [bookingType, setBookingType] = useState<'self' | 'multiple'>('self');
    const [attendees, setAttendees] = useState<AttendeeFormData[]>([
        { id: '1', full_name: '', email: '', ticket_type: '', merchandise: [] },
    ]);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [discountCode, setDiscountCode] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingComplete, setBookingComplete] = useState(false);
    const [confirmationCode, setConfirmationCode] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!eventId) return;

            try {
                setIsLoading(true);
                const [eventRes, merchRes, ticketTypesRes] = await Promise.all([
                    eventsAPI.getById(eventId),
                    merchandiseAPI.getByEvent(eventId),
                    eventsAPI.getTicketTypes(eventId)
                ]);

                setEvent(eventRes.data.message || null);
                setMerchandise(merchRes.data.message || []);
                const types = ticketTypesRes.data.message || [];
                setTicketTypes(types);

                // Set default ticket type for all attendees if types exist
                if (types.length > 0) {
                    setAttendees([
                        { id: '1', full_name: '', email: '', ticket_type: types[0].name, merchandise: [] },
                    ]);
                }
            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('Failed to load event data. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [eventId]);

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    if (error || !event) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <p className="text-red-600 dark:text-red-400">{error || 'Event not found'}</p>
            </div>
        );
    }

    const addAttendee = () => {
        const defaultTicketType = ticketTypes.length > 0 ? ticketTypes[0].name : '';
        setAttendees([
            ...attendees,
            { id: Date.now().toString(), full_name: '', email: '', ticket_type: defaultTicketType, merchandise: [] },
        ]);
    };

    const removeAttendee = (id: string) => {
        if (attendees.length > 1) {
            setAttendees(attendees.filter((a) => a.id !== id));
        }
    };

    const updateAttendee = (id: string, field: keyof AttendeeFormData, value: string | AttendeeMerchandise[]) => {
        setAttendees(
            attendees.map((a) => (a.id === id ? { ...a, [field]: value } : a))
        );
    };

    const addToCart = (merchandiseName: string) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.merchandise === merchandiseName);
            if (existing) {
                return prev.map((item) =>
                    item.merchandise === merchandiseName
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { merchandise: merchandiseName, quantity: 1 }];
        });
    };

    const removeFromCart = (merchandiseName: string) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.merchandise === merchandiseName);
            if (existing && existing.quantity > 1) {
                return prev.map((item) =>
                    item.merchandise === merchandiseName
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter((item) => item.merchandise !== merchandiseName);
        });
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const merch = merchandise.find((m) => m.name === item.merchandise);
            return total + (merch ? item.quantity * merch.price : 0);
        }, 0);
    };

    const getTicketTotal = () => {
        return attendees.reduce((total, attendee) => {
            const ticketType = ticketTypes.find(t => t.name === attendee.ticket_type);
            return total + (ticketType?.ticket_price || 0);
        }, 0);
    };

    const handleBooking = async () => {
        if (!eventId) {
            alert('Event ID is missing');
            return;
        }
        setIsProcessing(true);
        try {
            const cartTotal = getCartTotal();
            const ticketTotal = getTicketTotal();
            const discountAmount = 0; // TODO: Implement discount calculation

            // Distribute cart items to attendees equally
            const attendeeMerchandiseItems = attendees.map((attendee) => {
                // Distribute cart items evenly across attendees
                const attendeeMerchItems: AttendeeMerchandise[] = [];

                cart.forEach((item) => {
                    // Each attendee gets an equal portion of the merchandise
                    // For simplicity, we'll assign the full quantity to the first attendee
                    // and distribute remaining items based on index
                    const quantityPerAttendee = Math.floor(item.quantity / attendees.length);
                    const remainder = item.quantity % attendees.length;

                    // Assign merchandise to this attendee
                    if (quantityPerAttendee > 0 || (remainder > 0 && attendees.indexOf(attendee) < remainder)) {
                        const qty = quantityPerAttendee + (remainder > 0 && attendees.indexOf(attendee) < remainder ? 1 : 0);
                        if (qty > 0) {
                            attendeeMerchItems.push({
                                merchandise: item.merchandise,
                                quantity: qty
                            });
                        }
                    }
                });

                return attendeeMerchItems;
            });

            // Build attendees payload with merchandise distributed across attendees
            const apiAttendees = attendees.map((attendee, index) => {
                const ticketType = ticketTypes.find(t => t.name === attendee.ticket_type);

                // Calculate merchandise total for this attendee
                const attendeeMerchItems = attendeeMerchandiseItems[index];
                const attendeeMerchTotal = attendeeMerchItems.reduce((total, item) => {
                    const merch = merchandise.find(m => m.name === item.merchandise);
                    return total + (merch ? item.quantity * merch.price : 0);
                }, 0);

                return {
                    full_name: attendee.full_name,
                    email: attendee.email,
                    ticket_type: attendee.ticket_type,
                    ticket_price: ticketType?.ticket_price || 0,
                    merchandise_total: attendeeMerchTotal,
                    total_amount: (ticketType?.ticket_price || 0) + attendeeMerchTotal - Math.floor(discountAmount / attendees.length),
                    discount_amount: Math.floor(discountAmount / attendees.length),
                    merchandise: attendeeMerchItems
                };
            });

            const payload = {
                event_id: eventId,
                email: user?.email || attendees[0]?.email,
                discount_code: discountCode || null,
                attendees: apiAttendees
            };

            console.log('Booking payload:', JSON.stringify(payload, null, 2));

            await eventsAPI.createBooking(payload);

            setConfirmationCode(`BK-${Date.now().toString(36).toUpperCase()}`);
            setBookingComplete(true);
        } catch (err) {
            console.error('Booking failed:', err);
            alert('Booking failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (bookingComplete) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
                <Card className="max-w-md mx-auto">
                    <CardContent className="p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="size-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Your tickets have been booked successfully.
                        </p>
                        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Confirmation Code</p>
                            <p className="text-xl font-mono font-bold">{confirmationCode}</p>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            A confirmation email has been sent with your tickets.
                        </p>
                        <Button onClick={() => navigate(`/dashboard/event/${eventId}/ticket`)} className="w-full">
                            View Tickets
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Book Your Spot</h1>
                <p className="text-gray-600 dark:text-gray-300">{event.name}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Booking Type Selection */}
                    <Card>
                        <CardContent className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Who are you booking for?</h2>
                            <div className="flex gap-4">
                                <Button
                                    variant={bookingType === 'self' ? 'default' : 'outline'}
                                    onClick={() => setBookingType('self')}
                                    className="flex-1"
                                >
                                    <User className="size-4 mr-2" />
                                    Just Me
                                </Button>
                                <Button
                                    variant={bookingType === 'multiple' ? 'default' : 'outline'}
                                    onClick={() => setBookingType('multiple')}
                                    className="flex-1"
                                >
                                    <User className="size-4 mr-2" />
                                    Group Booking
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendee Information */}
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-semibold">
                                    {bookingType === 'self' ? 'Your Information' : 'Attendee Information'}
                                </h2>
                                {bookingType === 'multiple' && (
                                    <Button variant="outline" size="sm" onClick={addAttendee}>
                                        <Plus className="size-4 mr-1" />
                                        Add Attendee
                                    </Button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {attendees.map((attendee, index) => (
                                    <div key={attendee.id} className="p-4 border rounded-lg">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-medium">
                                                {bookingType === 'self' ? 'Primary Attendee' : `Attendee ${index + 1}`}
                                            </span>
                                            {bookingType === 'multiple' && attendees.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAttendee(attendee.id)}
                                                    className="text-red-500 hover:text-red-600"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Full Name
                                                </label>
                                                <Input
                                                    placeholder="James Kamau"
                                                    value={attendee.full_name}
                                                    onChange={(e) => updateAttendee(attendee.id, 'full_name', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Email
                                                </label>
                                                <Input
                                                    type="email"
                                                    placeholder="james@example.com"
                                                    value={attendee.email}
                                                    onChange={(e) => updateAttendee(attendee.id, 'email', e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                                    Ticket Type
                                                </label>
                                                <select
                                                    className="w-full h-9 px-3 border rounded-md bg-background"
                                                    value={attendee.ticket_type}
                                                    onChange={(e) =>
                                                        updateAttendee(attendee.id, 'ticket_type', e.target.value)
                                                    }
                                                >
                                                    {ticketTypes.map((type) => (
                                                        <option key={type.name} value={type.name}>
                                                            {type.ticket_category_name} (ksh {type.ticket_price.toFixed(2)})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Merchandise */}
                    {merchandise.length > 0 && (
                        <Card>
                            <CardContent className="p-6">
                                <h2 className="text-xl font-semibold mb-4">Add Merchandise (Optional)</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {merchandise.map((item) => {
                                        const cartItem = cart.find((c) => c.merchandise === item.name);
                                        return (
                                            <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                                                <img
                                                    src={item.item_image}
                                                    alt={item.item_name}
                                                    className="w-20 h-20 rounded object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{item.item_name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">ksh {item.price.toFixed(2)}</p>
                                                    {item.isVipOnly && (
                                                        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs">
                                                            VIP Only
                                                        </Badge>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {cartItem ? (
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => removeFromCart(item.name)}
                                                                >
                                                                    -
                                                                </Button>
                                                                <span className="w-8 text-center">{cartItem.quantity}</span>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => addToCart(item.name)}
                                                                >
                                                                    +
                                                                </Button>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => addToCart(item.name)}>
                                                                Add to Cart
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar - Order Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-6">
                        <CardContent className="p-6">
                            <h3 className="font-semibold text-lg mb-4">Order Summary</h3>

                            {/* Event Info */}
                            <div className="mb-4 pb-4 border-b">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="size-4 text-gray-500" />
                                    <span className="text-sm">
                                        {new Date(event.start_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                        })}{' '}
                                        -{' '}
                                        {new Date(event.end_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4 text-gray-500" />
                                    <span className="text-sm">{event.venue_name}</span>
                                </div>
                            </div>

                            {/* Tickets */}
                            <div className="mb-4 pb-4 border-b">
                                <h4 className="font-medium mb-2">Tickets</h4>
                                {attendees.map((attendee, index) => (
                                    <div key={attendee.id} className="flex justify-between text-sm mb-1">
                                        <span>
                                            {bookingType === 'self' ? 'Primary' : `Attendee ${index + 1}`} - {ticketTypes.find(t => t.name === attendee.ticket_type)?.ticket_category_name}
                                        </span>
                                        <span>ksh {ticketTypes.find(t => t.name === attendee.ticket_type)?.ticket_price.toFixed(2) || '0.00'}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Merchandise */}
                            {cart.length > 0 && (
                                <div className="mb-4 pb-4 border-b">
                                    <h4 className="font-medium mb-2">Merchandise</h4>
                                    {cart.map((item) => {
                                        const merch = merchandise.find((m) => m.name === item.merchandise);
                                        return (
                                            <div key={item.merchandise} className="flex justify-between text-sm mb-1">
                                                <span>
                                                    {merch?.item_name} x{item.quantity}
                                                </span>
                                                <span>ksh {(merch?.price || 0) * item.quantity}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Discount Code */}
                            <div className="mb-4">
                                <Label htmlFor="discount_code" className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">
                                    Discount Code (Optional)
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="discount_code"
                                        placeholder="Enter code"
                                        value={discountCode}
                                        onChange={(e) => setDiscountCode(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Total */}
                            <div className="mb-4">
                                <div className="flex justify-between font-semibold text-lg">
                                    <span>Total</span>
                                    <span>ksh {getTicketTotal() + getCartTotal()}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleBooking}
                                disabled={isProcessing || attendees.some((a) => !a.full_name || !a.email)}
                            >
                                {isProcessing ? (
                                    'Processing...'
                                ) : (
                                    <>
                                        <CreditCard className="size-4 mr-2" />
                                        Complete Booking
                                    </>
                                )}
                            </Button>

                            <p className="text-xs text-gray-500 text-center mt-3">
                                Secure payment powered by Stripe
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
