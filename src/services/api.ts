import axios from 'axios';

// Base URL for the Frappe backend
const FRAPPE_BASE_URL = '/api';

// Create axios instance with default config
const frappeClient = axios.create({
    baseURL: FRAPPE_BASE_URL,
    withCredentials: true, // This enables cookies to be sent with requests
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add any dynamic headers
frappeClient.interceptors.request.use(
    (config) => {
        // cookies are automatically sent
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
frappeClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle session expiry or auth errors
        if (error.response?.status === 401) {
            // Clear any local storage and redirect to login
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// API Methods for Frappe endpoints

// Auth APIs
export const authAPI = {
    login: (email: string, password: string) =>
        frappeClient.post('/eventive.api.auth.api_login', { email, password }),

    logout: () =>
        frappeClient.post('/eventive.api.logout'),

    getCurrentUser: () =>
        frappeClient.get('/eventive.api.auth.get_current_user'),

    getCurrentAttendee: () =>
        frappeClient.get('/eventive.api.auth.get_current_attendee'),

    register: (userData: {
        first_name: string;
        last_name: string;
        email: string;
        company: string;
        job_title: string;
        password: string;
        interests: string[];
    }) =>
        frappeClient.post('/eventive.api.auth.register', userData),

    updateProfile: (data: {
        profile_id: string;
        interests: string[];
        open_to_networking: boolean;
        social_link?: string;
    }) =>
        frappeClient.post('/eventive.api.auth.update_profile', data),
};

// Event APIs
export const eventsAPI = {
    getAll: () =>
        frappeClient.get('/eventive.api.events.get_all'),

    getById: (eventId: string) =>
        frappeClient.get(`/eventive.api.events.get_by_id?event_id=${eventId}`),

    getMyEvents: () =>
        frappeClient.get('/eventive.api.events.get_my_events'),

    getTicketTypes: (eventId: string) =>
        frappeClient.get(`/eventive.api.ticket.get_ticket_types?event_id=${eventId}`),

    getSponsorTiers: (eventId: string) =>
        frappeClient.get(`/eventive.api.events.get_sponsor_tiers?event_id=${eventId}`),

    getBoothPackages: (eventId: string) =>
        frappeClient.get(`/eventive.api.events.get_booth_packages?event_id=${eventId}`),

    createSponsor: (data: {
        event: string;
        sponsor_name: string;
        company: string;
        tier: string;
        tier_name: string;
        amount: number;
        company_logo?: File;
    }) =>
        frappeClient.post('/eventive.api.events.create_sponsor', data),

    createExhibitor: (data: {
        event: string;
        exhibitor_name: string;
        email: string;
        phone: string;
        website: string;
        booth_package: string;
        package_name: string;
        price: number;
        notes: string;
        logo?: File;
    }) =>
        frappeClient.post('/eventive.api.events.create_exhibitor', data),

    createBooking: (data: {
        event_id: string;
        email: string;
        discount_code: string | null;
        attendees: {
            full_name: string;
            email: string;
            ticket_type: string;
            ticket_price: number;
            merchandise_total: number;
            total_amount: number;
            discount_amount: number;
            merchandise: { merchandise: string; quantity: number }[];
        }[];
    }) =>
        frappeClient.post('/eventive.api.booking.create_booking', data),

    registerForEvent: (eventId: string, attendees: Attendee[]) =>
        frappeClient.post('/eventive.api.events.register_for_event', {
            event_id: eventId,
            attendees,
        }),

    getEventFeedback: (eventId: string) =>
        frappeClient.get(`/eventive.api.events.get_event_feedback?event_id=${eventId}`),

    submitFeedback: (eventId: string, feedback: FeedbackData) =>
        frappeClient.post('/eventive.api.events.submit_feedback', {
            event_id: eventId,
            ...feedback,
        }),
};

// Session APIs
export const sessionsAPI = {
    getByEvent: (eventId: string) =>
        frappeClient.get(`/eventive.api.sessions.get_by_event?event_id=${eventId}`),

    getById: (sessionId: string) =>
        frappeClient.get(`/eventive.api.get_session?session_id=${sessionId}`),

    bookSession: (sessionId: string) =>
        frappeClient.post('/eventive.api.book_session', { session_id: sessionId }),

    cancelSessionBooking: (sessionId: string) =>
        frappeClient.post('/eventive.api.cancel_session_booking', { session_id: sessionId }),
};

// Speaker APIs
export const speakersAPI = {
    getAll: () =>
        frappeClient.get('/eventive.api.speaker.get_all_speakers'),

    getByEvent: (eventId: string) =>
        frappeClient.get(`/eventive.api.get_speakers?event_id=${eventId}`),

    getById: (speakerId: string) =>
        frappeClient.get(`/eventive.api.get_speaker?speaker_id=${speakerId}`),
};

// Content APIs
export const contentAPI = {
    getByEvent: (eventId: string) =>
        frappeClient.get(`/eventive.api.content.get_by_event?event_id=${eventId}`),

    getById: (contentId: string) =>
        frappeClient.get(`/eventive.api.get_content_item?content_id=${contentId}`),

    accessContent: (contentId: string) =>
        frappeClient.post('/eventive.api.access_content', { content_id: contentId }),
};

// Merchandise APIs
export const merchandiseAPI = {
    getAll: () =>
        frappeClient.get('/eventive.api.get_all_merchandise'),

    getByEvent: (eventId: string) =>
        frappeClient.get(`/eventive.api.merchandise.get_by_event?event_id=${eventId}`),

    addToCart: (merchandiseId: string, quantity: number) =>
        frappeClient.post('/eventive.api.add_to_cart', {
            merchandise_id: merchandiseId,
            quantity,
        }),

    removeFromCart: (merchandiseId: string) =>
        frappeClient.post('/eventive.api.remove_from_cart', {
            merchandise_id: merchandiseId,
        }),

    getCart: () =>
        frappeClient.get('/eventive.api.get_cart'),

    checkout: (bookingId: string) =>
        frappeClient.post('/eventive.api.checkout', { booking_id: bookingId }),
};

// Ticket APIs
export const ticketAPI = {
    getMyTickets: (email: string, eventId: string) =>
        frappeClient.get(`/eventive.api.ticket.get_ticket?email=${email}&event_id=${eventId}`),

    getAllMyTickets: (email: string) =>
        frappeClient.get(`/eventive.api.ticket.get_my_tickets`),

    getByBooking: (bookingId: string) =>
        frappeClient.get(`/eventive.api.get_tickets?booking_id=${bookingId}`),

    downloadTicket: (ticketId: string) =>
        frappeClient.get(`/eventive.api.download_ticket?ticket_id=${ticketId}`, {
            responseType: 'blob',
        }),

    hasTicket: (email: string, eventId: string) =>
        frappeClient.get(`/eventive.api.ticket.has_ticket?email=${email}&event_id=${eventId}`),
};

// Networking APIs
export const networkingAPI = {
    getMatches: () =>
        frappeClient.get('/eventive.api.networking.get_matches'),

    connect: (matchId: string) =>
        frappeClient.post('/eventive.api.connect', { match_id: matchId }),

    getConnected: () =>
        frappeClient.get('/eventive.api.networking.get_connected_matches'),
};

// Message APIs
export const messageAPI = {
    sendMessage: (data: {
        receiver_id: string;
        message: string;
    }) =>
        frappeClient.post('/eventive.api.networking.send_message', data),

    getMessages: (otherUserId: string, eventId: string) =>
        frappeClient.get(`/eventive.api.networking.get_messages?other_user_id=${otherUserId}&event_id=${eventId}`),

    getConversation: (otherUserId: string, eventId: string) =>
        frappeClient.get(`/eventive.api.networking.get_messages?other_user_id=${otherUserId}&event_id=${eventId}`),

    markAsRead: (messageId: string) =>
        frappeClient.post('/eventive.api.mark_message_read', { message_id: messageId }),
};

// Types for the API
export interface Attendee {
    id?: string;
    name: string;
    email: string;
    ticket_type: string;
}

export interface FeedbackData {
    rating: number;
    overall_experience: number;
    content_quality: number;
    organization: number;
    venue: number;
    comments: string;
}

export interface BookingData {
    event_id: string;
    attendees: Attendee[];
    merchandise_items?: {
        merchandise_id: string;
        quantity: number;
    }[];
}

export interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    sender_name: string;
    receiver_name: string;
    event_id: string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface NetworkingMatch {
    id: string;
    name: string;
    role: string;
    company?: string;
    type: 'Attendee' | 'Speaker' | 'Sponsor';
    interests: string[];
    matchScore: number;
    photo: string;
    connected: boolean;
    email?: string;
    linkedin?: string;
    bio?: string;
}

export interface ConnectedMatch {
    match_id: string;
    attendee_2: {
        name: string;
        user: string;
        full_name: string;
        company: string;
        job_title: string;
        bio: string;
        profile_image: string | null;
        social_link: string | null;
        open_to_networking: number;
    };
    match_score: number;
    event: string;
    status: string;
    connected_on: string | null;
}

// Export the configured client for custom requests
export default frappeClient;
