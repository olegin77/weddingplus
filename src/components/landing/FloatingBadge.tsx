import { motion, useScroll, useTransform } from "framer-motion";
import { memo, ReactNode, useRef } from "react";

interface FloatingBadgeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  parallaxSpeed?: number;
}

export const FloatingBadge = memo(({ 
  children, 
  className = "",
  delay = 0,
  parallaxSpeed = 0.3,
}: FloatingBadgeProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [50 * parallaxSpeed, -50 * parallaxSpeed]);

  return (
    <motion.div
      ref={ref}
      className={`gpu-accelerated ${className}`}
      style={{ y }}
      initial={{ opacity: 0, scale: 0, rotate: -15 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{
        delay,
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
    >
      <div
        className="relative glass-luxe rounded-2xl p-4 shadow-lg"
      >
        {/* Static glow effect */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{ boxShadow: "0 0 20px hsl(45 70% 60% / 0.2)" }}
        />
        
        {/* Sparkle overlay */}
        <div className="absolute inset-0 rounded-2xl sparkle" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </motion.div>
  );
});

FloatingBadge.displayName = "FloatingBadge";
