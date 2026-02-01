import { Outlet } from 'react-router';
import { DesktopNav } from '../components/DesktopNav';
import { MobileNav } from '../components/MobileNav';
import { Toaster } from 'sonner';

export function RootLayout() {
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
