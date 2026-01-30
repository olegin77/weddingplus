import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-mesh aurora">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Glass header with animation */}
          <motion.header 
            className="h-14 md:h-16 glass-panel border-b-0 flex items-center justify-between px-3 md:px-4 sticky top-0 z-10 safe-top"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <SidebarTrigger className="touch-target rounded-xl hover:bg-accent/50 transition-colors" />
              </motion.div>
              <motion.div 
                className="flex items-center gap-2.5 md:hidden"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <motion.div 
                  className="w-8 h-8 rounded-lg bg-gradient-hero flex items-center justify-center shadow-md"
                  animate={{ 
                    boxShadow: [
                      "0 0 10px rgba(156, 175, 136, 0.3)",
                      "0 0 20px rgba(156, 175, 136, 0.5)",
                      "0 0 10px rgba(156, 175, 136, 0.3)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </motion.div>
                </motion.div>
                <span className="font-semibold text-sm bg-gradient-hero bg-clip-text text-transparent">
                  WeddingTech
                </span>
              </motion.div>
            </div>
          </motion.header>

          <motion.main 
            className="flex-1 p-4 md:p-6 overflow-x-hidden safe-bottom"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {children}
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};
