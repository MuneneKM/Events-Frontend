import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { SpeakerCard } from '../components/SpeakerCard';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { speakersAPI, sessionsAPI } from '../services/api';

interface Speaker {
  name: string;
  full_name: string;
  photo: string;
  bio: string;
  role: string;
  company: string;
  sessions: string[] | null;
}

interface Session {
  name: string;
  talk: string;
  date: string;
  event: string;
}

export function Speakers() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [speakersResponse, sessionsResponse] = await Promise.all([
          speakersAPI.getAll(),
          sessionsAPI.getByEvent('event-1'), // Default to first event
        ]);
        setSpeakers(speakersResponse.data.message);
        setSessions(sessionsResponse.data.message);
      } catch (err) {
        setError('Failed to load speakers');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSpeakerClick = (speakerId: string) => {
    const speaker = speakers.find((s) => s.name === speakerId);
    if (speaker) {
      setSelectedSpeaker(speaker);
    }
  };

  const speakerSessions = selectedSpeaker
    ? sessions.filter((s) => selectedSpeaker.sessions?.includes(s.name))
    : [];

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Speakers</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Meet the experts presenting at our events
          </p>
        </div>

        {loading && <p className="text-gray-600 dark:text-gray-300">Loading speakers...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {!loading && !error && speakers.map((speaker) => (
            <SpeakerCard
              key={speaker.name}
              speaker={speaker}
              onClick={handleSpeakerClick}
            />
          ))}
        </div>
      </div>

      {/* Speaker Detail Dialog */}
      <Dialog open={!!selectedSpeaker} onOpenChange={() => setSelectedSpeaker(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSpeaker && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">Speaker Profile</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="size-32 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={selectedSpeaker.photo}
                      alt={selectedSpeaker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{selectedSpeaker.name}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                      {selectedSpeaker.role}
                    </p>
                    <Badge variant="outline">{selectedSpeaker.company}</Badge>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Biography</h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {selectedSpeaker.bio}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Sessions</h4>
                  <div className="space-y-3">
                    {speakerSessions.map((session) => (
                      <div
                        key={session.name}
                        className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                      >
                        <h5 className="font-medium mb-2">{session.talk}</h5>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <Badge variant="outline">{session.date}</Badge>
                          {/* <Badge variant="outline">
                            {session.startTime} - {session.endTime}
                          </Badge> */}
                          <Badge variant="outline">{session.event}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setSelectedSpeaker(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
