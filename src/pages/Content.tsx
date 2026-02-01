import { useState } from 'react';
import { ContentCard } from '../components/ContentCard';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { mockContent, currentUser } from '../services/mockData';


export function Content() {
  const [activeTab, setActiveTab] = useState('all');

  const filterByTab = (tab: string) => {
    switch (tab) {
      case 'videos':
        return mockContent.filter((c) => c.type === 'Video');
      case 'resources':
        return mockContent.filter((c) => c.type === 'PDF' || c.type === 'Slides');
      case 'vip':
        return mockContent.filter((c) => c.accessLevel === 'VIP');
      default:
        return mockContent;
    }
  };

  const filteredContent = filterByTab(activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Digital Content Library</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Access session recordings, slides, and resources
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Content</TabsTrigger>
          <TabsTrigger value="videos">Recordings</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="vip">
            <span className="flex items-center gap-1">
              VIP Content
              {currentUser.role === 'VIP' && (
                <span className="size-2 rounded-full bg-amber-500" />
              )}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContent.map((content) => (
          <ContentCard
            key={content.id}
            content={content}
            userRole={currentUser.role}
          />
        ))}
      </div>

      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No content available in this category
          </p>
        </div>
      )}
    </div>
  );
}
