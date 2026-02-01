import { motion } from "framer-motion";
import { Home, Calendar, Sparkles, User, MoreHorizontal } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
  isAccent?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Главная", path: "/dashboard" },
  { icon: Calendar, label: "План", path: "/planner" },
  { icon: Sparkles, label: "AI", path: "/ai-assistant", isAccent: true },
  { icon: User, label: "Профиль", path: "/profile" },
  { icon: MoreHorizontal, label: "Ещё", path: "/settings" },
];

export const BottomNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Only render on mobile
  if (!isMobile) return null;

  return (
    <motion.nav
      // Avoid first-paint motion on mobile to prevent perceived "broken" layout.
      initial={false}
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-2 mb-2 glass-panel rounded-2xl shadow-lg border border-border/50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center py-2 px-4 rounded-xl touch-target transition-colors ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileTap={{ scale: 0.9 }}
              >
                {/* Accent item (AI) gets special treatment */}
                {item.isAccent ? (
                  <motion.div
                    className={`w-12 h-12 -mt-4 rounded-2xl flex items-center justify-center shadow-lg ${
                      isActive 
                        ? "gradient-luxe" 
                        : "bg-primary/10"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className={`w-6 h-6 ${isActive ? "text-white" : "text-primary"}`} />
                  </motion.div>
                ) : (
                  <>
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <Icon className={`w-5 h-5 ${isActive ? "text-primary" : ""}`} />
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                          initial={false}
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                    <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-primary" : ""}`}>
                      {item.label}
                    </span>
                  </>
                )}

                {/* Active background indicator */}
                {isActive && !item.isAccent && (
                  <motion.div
                    layoutId="activeBg"
                    className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
};
