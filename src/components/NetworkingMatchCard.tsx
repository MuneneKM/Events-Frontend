import { Check, MessageSquare, UserPlus, X } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';


interface NetworkingMatchCardProps {
  match: NetworkingMatch;
  onConnect?: (matchId: string) => void;
  onIgnore?: (matchId: string) => void;
  onMessage?: (matchId: string, matchName: string) => void;
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

export function NetworkingMatchCard({ match, onConnect, onIgnore, onMessage }: NetworkingMatchCardProps) {
  const typeColors = {
    Attendee: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    Speaker: 'bg-purple-500/10 text-purple-700 dark:text-purple-300',
    Sponsor: 'bg-green-500/10 text-green-700 dark:text-green-300',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex gap-4">
          <div className="size-16 rounded-full overflow-hidden flex-shrink-0">
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold">{match.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {match.role}
                </p>
              </div>
              <Badge className={typeColors[match.type]}>
                {match.type}
              </Badge>
            </div>

            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Match Score:</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-300 h-full rounded-full"
                    style={{ width: `${match.matchScore}%` }}
                  />
                </div>
                <span className="text-sm font-semibold">{match.matchScore}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-1 mb-4">
              {match.interests.map((interest) => (
                <Badge key={interest} variant="outline" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>

            {match.connected ? (
              <div className="flex gap-2">
                <Badge className="bg-green-500/10 text-green-700 dark:text-green-300">
                  <Check className="size-3 mr-1" />
                  Connected
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMessage?.(match.id, match.name)}
                >
                  <MessageSquare className="size-4 mr-1" />
                  Message
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onConnect?.(match.id)}
                  className="flex-1"
                >
                  <UserPlus className="size-4 mr-1" />
                  Connect
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onIgnore?.(match.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
