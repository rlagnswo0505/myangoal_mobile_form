import { Outlet } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import DateCalculationBtn from '@/components/DateCalculationBtn';
import PostpaidCalculatorBtn from '@/components/PostpaidCalculatorBtn';

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <PostpaidCalculatorBtn />
        <DateCalculationBtn />
      </div>
      <Toaster richColors position="bottom-center" />
    </SidebarProvider>
  );
}
