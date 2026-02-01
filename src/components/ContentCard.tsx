import { Download, FileText, Play } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface ContentCardProps {
  content: Content;
  userRole: 'Regular' | 'VIP';
}

type ContentType = 'Video' | 'PDF' | 'Slides';
type AccessLevel = 'All' | 'VIP' | 'Paid';

interface Content {
  id: string;
  title: string;
  sessionName: string;
  type: ContentType;
  accessLevel: AccessLevel;
  url: string;
  thumbnail: string;
}

export function ContentCard({ content, userRole }: ContentCardProps) {
  const hasAccess =
    content.accessLevel === 'All' ||
    (content.accessLevel === 'VIP' && userRole === 'VIP') ||
    content.accessLevel === 'Paid';

  const getIcon = () => {
    switch (content.type) {
      case 'Video':
        return <Play className="size-4" />;
      case 'PDF':
      case 'Slides':
        return <FileText className="size-4" />;
    }
  };

  const getAccessBadge = () => {
    if (content.accessLevel === 'VIP') {
      return <Badge className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white">VIP Only</Badge>;
    }
    if (content.accessLevel === 'Paid') {
      return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-300">Paid</Badge>;
    }
    return null;
  };

  return (
    <Card className={!hasAccess ? 'opacity-60' : 'hover:shadow-md transition-shadow'}>
      <CardContent className="p-0">
        <div className="relative h-40 overflow-hidden">
          <img
            src={content.thumbnail}
            alt={content.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/60 text-white">
              {getIcon()}
              <span className="ml-1">{content.type}</span>
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-sm flex-1">{content.title}</h4>
            {getAccessBadge()}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 mb-4">
            {content.sessionName}
          </p>
          <Button
            size="sm"
            className="w-full"
            disabled={!hasAccess}
          >
            <Download className="size-3 mr-1" />
            {hasAccess ? 'Download' : 'Locked'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
