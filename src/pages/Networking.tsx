import { useState } from 'react';
import { NetworkingMatchCard } from '../components/NetworkingMatchCard';
import { MessageDialog } from '../components/MessageDialog';
import { mockNetworkingMatches } from '../services/mockData';
import { toast } from 'sonner';

export function Networking() {
  const [matches, setMatches] = useState(mockNetworkingMatches);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleConnect = (matchId: string) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.id === matchId ? { ...m, connected: true } : m
      )
    );
    toast.success('Connection request sent!');
  };

  const handleIgnore = (matchId: string) => {
    setMatches((prev) => prev.filter((m) => m.id !== matchId));
    toast.success('Match removed');
  };

  const handleMessage = (matchId: string, matchName: string) => {
    setSelectedRecipient({ id: matchId, name: matchName });
    setMessageDialogOpen(true);
  };

  const connectedMatches = matches.filter((m) => m.connected);
  const suggestedMatches = matches.filter((m) => !m.connected);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Networking & Matchmaking</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Connect with other attendees, speakers, and sponsors
        </p>
      </div>

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

      {/* Suggested Matches */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Suggested Matches ({suggestedMatches.length})
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Based on your interests and profile
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suggestedMatches.map((match) => (
            <NetworkingMatchCard
              key={match.id}
              match={match}
              onConnect={handleConnect}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      </div>

      {matches.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No networking matches available at the moment
          </p>
        </div>
      )}

      {/* Message Dialog */}
      {selectedRecipient && (
        <MessageDialog
          open={messageDialogOpen}
          onOpenChange={setMessageDialogOpen}
          recipientId={selectedRecipient.id}
          recipientName={selectedRecipient.name}
        />
      )}
    </div>
  );
}
