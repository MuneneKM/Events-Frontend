type UserRole = 'Regular' | 'VIP';

type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed';

type ContentType = 'Video' | 'PDF' | 'Slides';

type AccessLevel = 'All' | 'VIP' | 'Paid';

interface Event {
  id: string;
  name: string;
  bannerImage: string;
  startDate: string;
  endDate: string;
  venue: string;
  organizer: string;
  ticketType: UserRole;
  status: EventStatus;
  qrCode: string;
  vipBenefits?: string[];
}

interface Session {
  id: string;
  eventId: string;
  title: string;
  speaker: string;
  speakerId: string;
  startTime: string;
  endTime: string;
  day: string;
  track: string;
  type: string;
  capacity: number;
  booked: number;
  isBooked?: boolean;
  isOverlapping?: boolean;
}

interface Speaker {
  id: string;
  name: string;
  role: string;
  photo: string;
  bio: string;
  company: string;
  sessions: string[];
}

interface Content {
  id: string;
  title: string;
  sessionName: string;
  type: ContentType;
  accessLevel: AccessLevel;
  url: string;
  thumbnail: string;
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

interface Merchandise {
  id: string;
  name: string;
  description: string;
  image: string;
  isVipOnly: boolean;
  downloadUrl?: string;
  pickupStatus?: 'Available' | 'Collected';
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  interests: string[];
  networkingOptIn: boolean;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
  };
}

export const currentUser: UserProfile = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@example.com',
  role: 'VIP',
  interests: ['AI/ML', 'Cloud Computing', 'DevOps', 'Security'],
  networkingOptIn: true,
  socialLinks: {
    linkedin: 'https://linkedin.com/in/sarahjohnson',
    twitter: 'https://twitter.com/sarahjohnson',
  },
};

export const mockEvents: Event[] = [
  {
    id: 'event-1',
    name: 'TechConnect 2026 Global Summit',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    startDate: '2026-03-15',
    endDate: '2026-03-17',
    venue: 'San Francisco Convention Center',
    organizer: 'TechConnect International',
    ticketType: 'VIP',
    status: 'Upcoming',
    qrCode: 'QR-EVENT-001',
    vipBenefits: [
      'Priority Seating',
      'VIP Lounge Access',
      'Exclusive Networking Sessions',
      'Premium Merchandise Pack',
      'All Session Recordings',
    ],
  },
  {
    id: 'event-2',
    name: 'Cloud Innovation Conference',
    bannerImage: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800',
    startDate: '2026-04-10',
    endDate: '2026-04-11',
    venue: 'Seattle Tech Hub',
    organizer: 'Cloud Native Foundation',
    ticketType: 'Regular',
    status: 'Upcoming',
    qrCode: 'QR-EVENT-002',
  },
  {
    id: 'event-3',
    name: 'AI & Data Science Summit 2025',
    bannerImage: 'https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800',
    startDate: '2025-12-05',
    endDate: '2025-12-07',
    venue: 'New York Expo Center',
    organizer: 'Data Science Institute',
    ticketType: 'VIP',
    status: 'Completed',
    qrCode: 'QR-EVENT-003',
  },
];

export const myEvents: Event[] = [
  {
    id: 'event-1',
    name: 'TechConnect 2026 Global Summit',
    bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    startDate: '2026-03-15',
    endDate: '2026-03-17',
    venue: 'San Francisco Convention Center',
    organizer: 'TechConnect International',
    ticketType: 'VIP',
    status: 'Upcoming',
    qrCode: 'QR-EVENT-001',
    vipBenefits: [
      'Priority Seating',
      'VIP Lounge Access',
      'Exclusive Networking Sessions',
      'Premium Merchandise Pack',
      'All Session Recordings',
    ],
  }
];

export const mockSessions: Session[] = [
  {
    id: 'session-1',
    eventId: 'event-1',
    title: 'Future of AI in Enterprise Applications',
    speaker: 'Dr. Emily Chen',
    speakerId: 'speaker-1',
    startTime: '09:00',
    endTime: '10:30',
    day: 'Day 1',
    track: 'AI/ML',
    type: 'Keynote',
    capacity: 500,
    booked: 245,
    isBooked: true,
  },
  {
    id: 'session-2',
    eventId: 'event-1',
    title: 'Microservices Architecture Best Practices',
    speaker: 'Michael Rodriguez',
    speakerId: 'speaker-2',
    startTime: '11:00',
    endTime: '12:00',
    day: 'Day 1',
    track: 'Cloud',
    type: 'Workshop',
    capacity: 100,
    booked: 95,
  },
  {
    id: 'session-3',
    eventId: 'event-1',
    title: 'Zero Trust Security Framework',
    speaker: 'Jennifer Williams',
    speakerId: 'speaker-3',
    startTime: '11:00',
    endTime: '12:00',
    day: 'Day 1',
    track: 'Security',
    type: 'Talk',
    capacity: 200,
    booked: 200,
  },
  {
    id: 'session-4',
    eventId: 'event-1',
    title: 'Kubernetes at Scale',
    speaker: 'David Park',
    speakerId: 'speaker-4',
    startTime: '14:00',
    endTime: '15:30',
    day: 'Day 1',
    track: 'DevOps',
    type: 'Workshop',
    capacity: 150,
    booked: 78,
  },
  {
    id: 'session-5',
    eventId: 'event-1',
    title: 'Machine Learning Operations (MLOps)',
    speaker: 'Dr. Emily Chen',
    speakerId: 'speaker-1',
    startTime: '14:00',
    endTime: '15:00',
    day: 'Day 1',
    track: 'AI/ML',
    type: 'Talk',
    capacity: 300,
    booked: 156,
  },
];

export const mockSpeakers: Speaker[] = [
  {
    id: 'speaker-1',
    name: 'Dr. Emily Chen',
    role: 'Chief AI Officer',
    company: 'TechVision AI',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    bio: 'Dr. Emily Chen is a leading expert in artificial intelligence and machine learning with over 15 years of experience. She has published over 50 research papers and holds multiple patents in AI technology.',
    sessions: ['session-1', 'session-5'],
  },
  {
    id: 'speaker-2',
    name: 'Michael Rodriguez',
    role: 'Principal Cloud Architect',
    company: 'CloudNative Systems',
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    bio: 'Michael specializes in cloud-native architecture and has helped hundreds of enterprises migrate to modern cloud platforms. He is a certified AWS Solutions Architect and CNCF ambassador.',
    sessions: ['session-2'],
  },
  {
    id: 'speaker-3',
    name: 'Jennifer Williams',
    role: 'VP of Security',
    company: 'SecureNet Global',
    photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400',
    bio: 'Jennifer is a cybersecurity veteran with expertise in zero trust architecture and enterprise security. She has led security transformations for Fortune 500 companies.',
    sessions: ['session-3'],
  },
  {
    id: 'speaker-4',
    name: 'David Park',
    role: 'DevOps Lead',
    company: 'Kubernetes Foundation',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    bio: 'David is a core contributor to Kubernetes and specializes in container orchestration at scale. He has implemented Kubernetes solutions for companies managing thousands of microservices.',
    sessions: ['session-4'],
  },
];

export const mockContent: Content[] = [
  {
    id: 'content-1',
    title: 'AI Enterprise Applications - Full Recording',
    sessionName: 'Future of AI in Enterprise Applications',
    type: 'Video',
    accessLevel: 'VIP',
    url: '/content/ai-enterprise.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400',
  },
  {
    id: 'content-2',
    title: 'Microservices Best Practices Slides',
    sessionName: 'Microservices Architecture Best Practices',
    type: 'Slides',
    accessLevel: 'All',
    url: '/content/microservices.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
  },
  {
    id: 'content-3',
    title: 'Zero Trust Framework Whitepaper',
    sessionName: 'Zero Trust Security Framework',
    type: 'PDF',
    accessLevel: 'Paid',
    url: '/content/zero-trust.pdf',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400',
  },
  {
    id: 'content-4',
    title: 'Kubernetes Workshop Recording',
    sessionName: 'Kubernetes at Scale',
    type: 'Video',
    accessLevel: 'VIP',
    url: '/content/kubernetes.mp4',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=400',
  },
];

export const mockNetworkingMatches: NetworkingMatch[] = [
  {
    id: 'match-1',
    name: 'Alex Thompson',
    role: 'Senior Software Engineer',
    type: 'Attendee',
    interests: ['AI/ML', 'Cloud Computing', 'Python'],
    matchScore: 95,
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
    connected: false,
  },
  {
    id: 'match-2',
    name: 'Dr. Emily Chen',
    role: 'Chief AI Officer',
    type: 'Speaker',
    interests: ['AI/ML', 'Deep Learning', 'Research'],
    matchScore: 88,
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400',
    connected: true,
  },
  {
    id: 'match-3',
    name: 'TechVision AI',
    role: 'Platinum Sponsor',
    type: 'Sponsor',
    interests: ['AI/ML', 'Enterprise Solutions'],
    matchScore: 82,
    photo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400',
    connected: false,
  },
  {
    id: 'match-4',
    name: 'Rebecca Martinez',
    role: 'Cloud Solutions Architect',
    type: 'Attendee',
    interests: ['Cloud Computing', 'DevOps', 'Security'],
    matchScore: 78,
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    connected: false,
  },
];

export const mockMerchandise: Merchandise[] = [
  {
    id: 'merch-1',
    name: 'VIP Conference Bag',
    description: 'Premium leather laptop bag with conference branding',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    isVipOnly: true,
    pickupStatus: 'Available',
  },
  {
    id: 'merch-2',
    name: 'Exclusive Session Notes',
    description: 'Digital compilation of all session notes and whitepapers',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    isVipOnly: true,
    downloadUrl: '/downloads/session-notes.pdf',
  },
  {
    id: 'merch-3',
    name: 'VIP Networking Directory',
    description: 'Complete directory of VIP attendees and speakers',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400',
    isVipOnly: true,
    downloadUrl: '/downloads/networking-directory.pdf',
  },
];
