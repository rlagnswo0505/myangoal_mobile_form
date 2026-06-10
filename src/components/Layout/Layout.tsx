import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DateCalculationBtn from '@/components/DateCalculationBtn';

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      <div className="fixed bottom-6 right-6 z-50">
        <DateCalculationBtn />
      </div>
      <Toaster richColors position="bottom-center" />
    </SidebarProvider>
  );
}
