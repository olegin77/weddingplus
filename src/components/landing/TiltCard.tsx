import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, memo, ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  tiltAmount?: number;
  glareEnabled?: boolean;
  scale?: number;
}

export const TiltCard = memo(({ 
  children, 
  className = "", 
  tiltAmount = 15,
  glareEnabled = true,
  scale = 1.02,
}: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const ySpring = useSpring(y, { stiffness: 300, damping: 30 });
  
  const rotateX = useTransform(ySpring, [-0.5, 0.5], [tiltAmount, -tiltAmount]);
  const rotateY = useTransform(xSpring, [-0.5, 0.5], [-tiltAmount, tiltAmount]);
  
  const glareX = useTransform(xSpring, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(ySpring, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = (e.clientX - centerX) / rect.width;
    const mouseY = (e.clientY - centerY) / rect.height;
    
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative gpu-accelerated ${className}`}
      style={{
        perspective: 1000,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full h-full"
      >
        {children}
        
        {/* Glare effect */}
        {glareEnabled && (
          <motion.div
            className="absolute inset-0 rounded-inherit pointer-events-none overflow-hidden rounded-2xl"
            style={{
              background: `radial-gradient(circle at ${glareX}px ${glareY}px, rgba(255,255,255,0.25) 0%, transparent 50%)`,
              opacity: 0.5,
            }}
          />
        )}
        
        {/* Depth shadow */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-2xl"
          style={{
            transform: "translateZ(-50px)",
            background: "hsl(var(--primary) / 0.1)",
            filter: "blur(20px)",
          }}
        />
      </motion.div>
    </motion.div>
  );
});

TiltCard.displayName = "TiltCard";
