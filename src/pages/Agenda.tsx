import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { SessionCard } from '../components/SessionCard';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { sessionsAPI } from '../services/api';
import { toast } from 'sonner';

interface Session {
  name: string;
  event: string;
  session_title: string;
  start_time: string;
  end_time: string;
  track: string;
  session_type: string;
  capacity: number;
  booked_spots: number;
  is_booked: boolean;
}

export function Agenda() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [bookedSessions, setBookedSessions] = useState<Set<string>>(
    new Set(['session-1'])
  );

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await sessionsAPI.getByEvent('event-1');
        setSessions(response.data.message);
      } catch (err) {
        setError('Failed to load sessions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const days = ['all', ...Array.from(new Set(sessions.map((s) => s.start_time.split(" ")[0])))];
  const tracks = ['all', ...Array.from(new Set(sessions.map((s) => s.track)))];

  const filteredSessions = sessions.filter((session) => {
    if (selectedDay !== 'all' && session.start_time.split(" ")[0] !== selectedDay) return false;
    if (selectedTrack !== 'all' && session.track !== selectedTrack) return false;
    return true;
  });

  const handleBookSession = (sessionId: string) => {
    const session = sessions.find((s) => s.name === sessionId);
    if (!session) return;

    // Check for overlapping sessions
    const isOverlapping = Array.from(bookedSessions).some((bookedId) => {
      const bookedSession = sessions.find((s) => s.name === bookedId);
      if (!bookedSession || bookedSession.start_time.split(" ")[0] !== session.start_time.split(" ")[0]) return false;

      const bookedStart = bookedSession.start_time;
      const bookedEnd = bookedSession.end_time;
      const newStart = session.start_time;
      const newEnd = session.end_time;

      return (
        (newStart >= bookedStart && newStart < bookedEnd) ||
        (newEnd > bookedStart && newEnd <= bookedEnd) ||
        (newStart <= bookedStart && newEnd >= bookedEnd)
      );
    });

    if (isOverlapping) {
      toast.error('This session conflicts with another booked session');
      return;
    }

    setBookedSessions((prev) => new Set([...prev, sessionId]));
    toast.success('Session booked successfully!');
  };

  const sessionsWithStatus = filteredSessions.map((session) => ({
    ...session,
    isBooked: bookedSessions.has(session.name),
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Event Agenda</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Browse and book sessions for your events
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="size-5 text-gray-500" />
          <span className="text-sm font-medium">Filters:</span>
        </div>
        <Select value={selectedDay} onValueChange={setSelectedDay}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {days.map((day) => (
              <SelectItem key={day} value={day}>
                {day === 'all' ? 'All Days' : day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedTrack} onValueChange={setSelectedTrack}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select track" />
          </SelectTrigger>
          <SelectContent>
            {tracks.map((track) => (
              <SelectItem key={track} value={track}>
                {track === 'all' ? 'All Tracks' : track}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {(selectedDay !== 'all' || selectedTrack !== 'all') && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedDay('all');
              setSelectedTrack('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {loading && <p className="text-gray-600 dark:text-gray-300">Loading sessions...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sessionsWithStatus.map((session) => (
          <SessionCard
            key={session.name}
            session={session}
            onBook={handleBookSession}
          />
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No sessions found matching your filters
          </p>
        </div>
      )}
    </div>
  );
}
