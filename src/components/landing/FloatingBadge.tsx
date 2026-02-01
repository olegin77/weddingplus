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
      <motion.div
        className="relative glass-luxe rounded-2xl p-4 shadow-lg"
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
          delay: delay * 2,
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 20px hsl(45 70% 60% / 0.2)",
              "0 0 40px hsl(45 70% 60% / 0.4)",
              "0 0 20px hsl(45 70% 60% / 0.2)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay,
          }}
        />
        
        {/* Sparkle overlay */}
        <div className="absolute inset-0 rounded-2xl sparkle" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
});

FloatingBadge.displayName = "FloatingBadge";
