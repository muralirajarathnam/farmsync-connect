import { Outlet } from 'react-router-dom';
import { BottomNavigation } from './BottomNavigation';
import { ConnectivityBanner } from './ConnectivityBanner';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ConnectivityBanner />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNavigation />
    </div>
  );
}
