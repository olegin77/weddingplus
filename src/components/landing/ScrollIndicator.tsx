import { motion } from "framer-motion";
import { ChevronDown, Mouse } from "lucide-react";

interface ScrollIndicatorProps {
  className?: string;
  variant?: "mouse" | "chevron" | "arrow";
}

export const ScrollIndicator = ({
  className = "",
  variant = "mouse",
}: ScrollIndicatorProps) => {
  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: "smooth",
    });
  };

  if (variant === "mouse") {
    return (
      <motion.button
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground transition-colors ${className}`}
        onClick={scrollToNext}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="w-6 h-10 rounded-full border-2 border-current p-1 flex justify-center"
          whileHover={{ y: 3 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
        >
          <motion.div
            className="w-1.5 h-2.5 rounded-full bg-current"
            whileHover={{ y: 6, opacity: 0.7 }}
            transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
          />
        </motion.div>
        <span className="text-xs font-medium">Scroll</span>
      </motion.button>
    );
  }

  if (variant === "chevron") {
    return (
      <motion.button
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors ${className}`}
        onClick={scrollToNext}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
      >
        <motion.div
          whileHover={{ y: 6 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
        >
          <ChevronDown className="w-6 h-6" />
        </motion.div>
        <motion.div
          whileHover={{ y: 6 }}
          transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
        >
          <ChevronDown className="w-6 h-6 -mt-3 opacity-50" />
        </motion.div>
      </motion.button>
    );
  }

  return (
    <motion.button
      className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-full glass-card text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all ${className}`}
      onClick={scrollToNext}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 2, duration: 0.6 }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div whileHover={{ y: 3 }} transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}>
        <ChevronDown className="w-6 h-6" />
      </motion.div>
    </motion.button>
  );
};

export const ProgressIndicator = () => {
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-50"
      initial={{ scaleX: 0 }}
      style={{ transformOrigin: "left" }}
    >
      <motion.div
        className="h-full bg-gradient-hero"
        style={{ scaleX: 0, transformOrigin: "left" }}
        whileInView={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};
