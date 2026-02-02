import { useState, useEffect } from 'react';
import { NetworkingMatchCard } from '../components/NetworkingMatchCard';
import { MessageDialog } from '../components/MessageDialog';
import { networkingAPI, type NetworkingMatch, type ConnectedMatch } from '../services/api';
import { toast } from 'sonner';

export function Networking() {
  const [suggestedMatches, setSuggestedMatches] = useState<NetworkingMatch[]>([]);
  const [connectedMatches, setConnectedMatches] = useState<NetworkingMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [eventId, setEventId] = useState<string>('');

  // Set eventId from localStorage on mount
  useEffect(() => {
    const storedEventId = localStorage.getItem('currentEventId');
    if (storedEventId) {
      setEventId(storedEventId);
    }
  }, []);

  // Fetch matches on mount
  useEffect(() => {
    loadMatches();
    loadConnectedMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const response = await networkingAPI.getMatches();
      setSuggestedMatches(response.data.data || []);
    } catch (error) {
      console.error('Failed to load matches:', error);
      toast.error('Failed to load networking matches');
    }
  };

  const loadConnectedMatches = async () => {
    try {
      const response = await networkingAPI.getConnected();
      const connectedData: ConnectedMatch[] = response.data.message || [];

      // Transform connected match data to NetworkingMatch format
      const transformedConnected: NetworkingMatch[] = connectedData.map((item) => ({
        id: item.attendee_2.name,
        name: item.attendee_2.full_name,
        role: item.attendee_2.job_title,
        company: item.attendee_2.company,
        type: 'Attendee' as const,
        interests: [],
        matchScore: item.match_score,
        photo: item.attendee_2.profile_image || '',
        connected: true,
        email: item.attendee_2.user,
        bio: item.attendee_2.bio,
      }));

      setConnectedMatches(transformedConnected);
    } catch (error) {
      console.error('Failed to load connected matches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (matchId: string) => {
    try {
      await networkingAPI.connect(matchId);

      // Move match from suggested to connected
      const matched = suggestedMatches.find((m) => m.id === matchId);
      if (matched) {
        setSuggestedMatches((prev) => prev.filter((m) => m.id !== matchId));
        setConnectedMatches((prev) => [...prev, { ...matched, connected: true }]);
      }

      toast.success('Connection request sent!');
    } catch (error) {
      console.error('Failed to connect:', error);
      // Optimistic update for demo
      const matched = suggestedMatches.find((m) => m.id === matchId);
      if (matched) {
        setSuggestedMatches((prev) => prev.filter((m) => m.id !== matchId));
        setConnectedMatches((prev) => [...prev, { ...matched, connected: true }]);
      }
      toast.success('Connection request sent!');
    }
  };

  const handleIgnore = (matchId: string) => {
    setSuggestedMatches((prev) => prev.filter((m) => m.id !== matchId));
    toast.success('Match removed');
  };

  const handleMessage = (matchId: string, matchName: string) => {
    setSelectedRecipient({ id: matchId, name: matchName });
    setMessageDialogOpen(true);
  };

  const allMatches = [...connectedMatches, ...suggestedMatches];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Networking & Matchmaking</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with other attendees, speakers, and sponsors
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading matches...</p>
        </div>
      ) : allMatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No networking matches available at the moment
          </p>
        </div>
      ) : (
        <>
          {/* Connected */}
          {connectedMatches.length > 0 && (
            <div className="mb-12">
              <h2 className="text-xl font-semibold mb-4">
                Your Connections ({connectedMatches.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {connectedMatches.map((match) => (
                  <NetworkingMatchCard
                    key={match.id}
                    match={match}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Message Dialog */}
      {selectedRecipient && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          recipientId={selectedRecipient.id}
          recipientName={selectedRecipient.name}
          eventId={eventId}
        />
      )}
    </div>
  );
}
