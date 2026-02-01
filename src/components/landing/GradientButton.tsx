import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, memo, ReactNode } from "react";

interface GradientButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  size?: "default" | "lg" | "xl";
  variant?: "primary" | "secondary" | "outline";
}

export const GradientButton = memo(({ 
  children, 
  className = "", 
  onClick,
  size = "lg",
  variant = "primary",
}: GradientButtonProps) => {
  const ref = useRef<HTMLButtonElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });
  
  const translateX = useTransform(springX, [-100, 100], [-8, 8]);
  const translateY = useTransform(springY, [-100, 100], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const sizeClasses = {
    default: "h-10 px-5 py-2 text-sm",
    lg: "h-14 px-8 py-3 text-lg",
    xl: "h-16 px-10 py-4 text-xl",
  };

  const variantClasses = {
    primary: "gradient-luxe text-white",
    secondary: "bg-secondary text-foreground",
    outline: "glass-button border-2 border-primary/30",
  };

  return (
    <motion.button
      ref={ref}
      className={`
        relative overflow-hidden rounded-2xl font-semibold
        transition-all duration-300 gpu-accelerated
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      style={{
        x: translateX,
        y: translateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Animated mesh gradient background */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, hsl(45 70% 60% / 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, hsl(345 45% 35% / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(15 60% 65%) 0%, hsl(45 70% 60%) 100%)
            `,
            backgroundSize: "200% 200%",
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
        }}
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "easeInOut",
          repeatDelay: 1,
        }}
      />
      
      {/* Glow effect */}
      {variant === "primary" && (
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl"
          animate={{
            boxShadow: [
              "0 0 20px hsl(15 60% 65% / 0.4)",
              "0 0 40px hsl(45 70% 60% / 0.5)",
              "0 0 20px hsl(15 60% 65% / 0.4)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
      
      {/* Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
});

GradientButton.displayName = "GradientButton";
