import { Building2 } from 'lucide-react';
import { Card, CardContent } from './ui/card';

interface Speaker {
  name: string;
  full_name: string;
  role: string;
  photo: string;
  bio: string;
  company: string;
  sessions: string[] | null;
}

interface SpeakerCardProps {
  speaker: Speaker;
  onClick?: (speakerId: string) => void;
}

export function SpeakerCard({ speaker, onClick }: SpeakerCardProps) {
  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onClick?.(speaker.name)}
    >
      <CardContent className="p-0">
        <div className="aspect-square overflow-hidden">
          <img
            src={speaker.photo}
            alt={speaker.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-4">
          <h4 className="font-semibold mb-1">{speaker.full_name}</h4>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
            {speaker.role}
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Building2 className="size-3" />
            <span>{speaker.company}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
