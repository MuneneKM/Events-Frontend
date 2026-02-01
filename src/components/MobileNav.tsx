import { Calendar, FileText, Home, Network, User } from 'lucide-react';
import { Link, useLocation } from 'react-router';

export function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Events', path: '/dashboard/' },
    { icon: Calendar, label: 'Agenda', path: '/dashboard/agenda' },
    { icon: Network, label: 'Network', path: '/dashboard/networking' },
    { icon: FileText, label: 'Content', path: '/dashboard/content' },
    { icon: User, label: 'Profile', path: '/dashboard/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 md:hidden z-50">
      <div className="flex justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-4 flex-1 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="size-5 mb-1" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
