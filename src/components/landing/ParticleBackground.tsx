import { memo, useMemo } from "react";

// Static CSS-only particles for better performance
const ParticleBackgroundComponent = () => {
  // Generate particles once with useMemo
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      animationDuration: 20 + Math.random() * 15,
      animationDelay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static CSS particles - much lighter than framer-motion */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-primary/15 animate-float-gentle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            animationDuration: `${particle.animationDuration}s`,
            animationDelay: `${particle.animationDelay}s`,
          }}
        />
      ))}
      
      {/* Static decorative blobs with CSS animation */}
      <div
        className="absolute w-64 h-64 rounded-full bg-primary/8 blur-3xl animate-blob-slow"
        style={{ top: "10%", left: "5%" }}
      />
      <div
        className="absolute w-80 h-80 rounded-full bg-wedding-eucalyptus/8 blur-3xl animate-blob-slow"
        style={{ bottom: "5%", right: "10%", animationDelay: "2s" }}
      />
      <div
        className="absolute w-48 h-48 rounded-full bg-wedding-cream/15 blur-2xl animate-blob-slow"
        style={{ top: "40%", right: "25%", animationDelay: "4s" }}
      />
    </div>
  );
};

// Memoize to prevent unnecessary re-renders
export const ParticleBackground = memo(ParticleBackgroundComponent);
