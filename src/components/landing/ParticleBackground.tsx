import { motion, useReducedMotion } from "framer-motion";
import { memo, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

const ParticleBackgroundComponent = () => {
  const prefersReducedMotion = useReducedMotion();

  // Generate particles once with useMemo - reduced count for performance
  const particles = useMemo(() => {
    const newParticles: Particle[] = [];
    const count = prefersReducedMotion ? 8 : 18; // Fewer particles
    for (let i = 0; i < count; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 2,
        duration: Math.random() * 15 + 18, // Slower = less CPU
        delay: Math.random() * 4,
      });
    }
    return newParticles;
  }, [prefersReducedMotion]);

  if (prefersReducedMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static blobs for reduced motion */}
        <div className="absolute w-64 h-64 rounded-full bg-primary/8 blur-3xl" style={{ top: "10%", left: "5%" }} />
        <div className="absolute w-80 h-80 rounded-full bg-wedding-eucalyptus/8 blur-3xl" style={{ bottom: "5%", right: "10%" }} />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Optimized particles with GPU acceleration */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-primary/15 gpu-accelerated"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
          }}
          animate={{
            y: [0, -80, 0],
            x: [0, Math.sin(particle.id) * 30, 0],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
      
      {/* Floating orbs - optimized with slower animations */}
      <motion.div
        className="absolute w-64 h-64 rounded-full bg-primary/8 blur-3xl gpu-accelerated"
        style={{ top: "10%", left: "5%" }}
        animate={{
          x: [0, 25, 0],
          y: [0, 15, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute w-80 h-80 rounded-full bg-wedding-eucalyptus/8 blur-3xl gpu-accelerated"
        style={{ bottom: "5%", right: "10%" }}
        animate={{
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />
      <motion.div
        className="absolute w-48 h-48 rounded-full bg-wedding-cream/15 blur-2xl gpu-accelerated"
        style={{ top: "40%", right: "25%" }}
        animate={{
          x: [0, 15, 0],
          y: [0, -18, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ParticleBackground = memo(ParticleBackgroundComponent);
