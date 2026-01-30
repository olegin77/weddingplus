import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Heart } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border flex items-center justify-between px-3 md:px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-10 safe-top">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="touch-target" />
              <div className="flex items-center gap-2 md:hidden">
                <Heart className="w-5 h-5 text-primary fill-primary" />
                <span className="font-semibold text-sm">WeddingTech</span>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 bg-gradient-elegant overflow-x-hidden safe-bottom">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};
