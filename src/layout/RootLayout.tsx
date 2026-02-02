import { Outlet, useLocation } from 'react-router';
import { useEffect } from 'react';
import { DesktopNav } from '../components/DesktopNav';
import { MobileNav } from '../components/MobileNav';
import { Toaster } from 'sonner';

export function RootLayout() {
  const location = useLocation();

  // Set currentEventId in localStorage when navigating to an event
  useEffect(() => {
    const parts = location.pathname.split('/');
    const eventIndex = parts.indexOf('event');
    if (eventIndex !== -1 && parts[eventIndex + 1]) {
      localStorage.setItem('currentEventId', parts[eventIndex + 1]);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DesktopNav />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <MobileNav />
      <Toaster />
    </div>
  );
}
