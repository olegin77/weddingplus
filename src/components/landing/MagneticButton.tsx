import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
}

export const MagneticButton = ({
  children,
  className = "",
  strength = 40,
}: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { stiffness: 200, damping: 20 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  
  const rotateX = useTransform(springY, [-strength, strength], [5, -5]);
  const rotateY = useTransform(springX, [-strength, strength], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) / (rect.width / 2);
    const deltaY = (e.clientY - centerY) / (rect.height / 2);
    
    x.set(deltaX * strength);
    y.set(deltaY * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        x: springX,
        y: springY,
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
    >
      {children}
    </motion.div>
  );
};

interface GlowButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlowButton = ({
  children,
  className = "",
  onClick,
}: GlowButtonProps) => {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Glow effect */}
      <motion.div
        className="absolute inset-0 opacity-0 bg-gradient-to-r from-primary/50 via-primary-glow/50 to-primary/50 blur-xl"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
        }}
        whileHover={{
          opacity: 1,
          x: ["-100%", "100%"],
        }}
        transition={{
          x: { duration: 0.8, ease: "easeInOut" },
          opacity: { duration: 0.1 },
        }}
      />
      
      {/* Content */}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

interface RippleButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const RippleButton = ({
  children,
  className = "",
  onClick,
}: RippleButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = document.createElement("span");
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.className = "absolute rounded-full bg-white/30 animate-ping pointer-events-none";
    ripple.style.width = "100px";
    ripple.style.height = "100px";
    ripple.style.transform = "translate(-50%, -50%)";
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    onClick?.();
  };

  return (
    <button
      className={`relative overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};
