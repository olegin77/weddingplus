import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

const directionVariants = {
  up: { hidden: { opacity: 0, y: 60 }, visible: { opacity: 1, y: 0 } },
  down: { hidden: { opacity: 0, y: -60 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: -60 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 60 }, visible: { opacity: 1, x: 0 } },
};

export const AnimatedSection = ({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: AnimatedSectionProps) => {
  const variants = directionVariants[direction];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: variants.hidden,
        visible: {
          ...variants.visible,
          transition: {
            duration: 0.7,
            delay,
            ease: "easeOut",
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const StaggerContainer = ({
  children,
  className = "",
  staggerDelay = 0.1,
}: StaggerContainerProps) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export const StaggerItem = ({ children, className = "" }: StaggerItemProps) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            duration: 0.5,
            ease: "easeOut",
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  amplitude?: number;
}

export const FloatingElement = ({
  children,
  className = "",
  delay = 0,
  amplitude = 10,
}: FloatingElementProps) => {
  return (
    <motion.div
      initial={{ y: 0 }}
      whileHover={{ y: -amplitude }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

interface GlowingCardProps {
  children: ReactNode;
  className?: string;
}

export const GlowingCard = ({ children, className = "" }: GlowingCardProps) => {
  return (
    <motion.div
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 20px 40px -8px hsl(340 20% 20% / 0.15)",
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
