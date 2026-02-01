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
        group relative overflow-hidden rounded-2xl font-semibold
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
      {/* Static mesh gradient background (no animation) */}
      {variant === "primary" && (
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background: `
              radial-gradient(circle at 20% 20%, hsl(45 70% 60% / 0.4) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, hsl(345 45% 35% / 0.3) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, hsl(15 60% 65%) 0%, hsl(45 70% 60%) 100%)
            `,
          }}
        />
      )}
      
      {/* Static glow effect - only on hover */}
      {variant === "primary" && (
        <div
          className="absolute inset-0 -z-10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            boxShadow: "0 0 30px hsl(15 60% 65% / 0.4)",
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
