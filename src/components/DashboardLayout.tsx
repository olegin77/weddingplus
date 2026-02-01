import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-mesh aurora">
        {/* Hide sidebar on mobile when bottom nav is shown */}
        {!isMobile && <AppSidebar />}
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Glass header with animation */}
          <motion.header 
            className="h-14 md:h-16 glass-panel border-b-0 flex items-center justify-between px-3 md:px-4 sticky top-0 z-10 safe-top"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3">
              {/* Show sidebar trigger only on desktop */}
              {!isMobile && (
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <SidebarTrigger className="touch-target rounded-xl hover:bg-accent/50 transition-colors" />
                </motion.div>
              )}
              <motion.div 
                className="flex items-center gap-2.5"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div 
                  className="w-8 h-8 rounded-lg gradient-luxe flex items-center justify-center shadow-md"
                >
                  <Heart className="w-4 h-4 text-white fill-white" />
                </div>
                <span className="font-semibold text-sm bg-gradient-hero bg-clip-text text-transparent">
                  WeddingTech
                </span>
              </motion.div>
            </div>
          </motion.header>

          <motion.main 
            className={`flex-1 p-4 md:p-6 overflow-x-hidden ${isMobile ? 'pb-24' : ''} safe-bottom`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.main>
        </div>
        
        {/* Bottom navigation for mobile */}
        <BottomNavigation />
      </div>
    </SidebarProvider>
  );
};
