import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, memo, useMemo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import heroImage from "@/assets/hero-wedding.jpg";
import { FloatingElement } from "./AnimatedSection";
import { ParticleBackground } from "./ParticleBackground";
import { ScrollIndicator } from "./ScrollIndicator";
import { MagneticButton } from "./MagneticButton";

// Optimized variants with GPU-friendly transforms
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 150,
      damping: 20,
    },
  },
};

// Memoized stat card
const StatCard = memo(({ value, label, index }: { value: string; label: string; index: number }) => (
  <motion.div
    variants={statVariants}
    whileHover={{ scale: 1.06, y: -4 }}
    transition={{ duration: 0.2 }}
    className="glass-card p-4 text-center cursor-default gpu-accelerated"
  >
    <motion.div 
      className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1"
      initial={{ scale: 0 }}
      whileInView={{ scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4 + index * 0.08, type: "spring", stiffness: 180 }}
    >
      {value}
    </motion.div>
    <div className="text-xs sm:text-sm text-muted-foreground">
      {label}
    </div>
  </motion.div>
));

StatCard.displayName = "StatCard";

// Memoized decorative stars - rendered once
const DecorativeStars = memo(() => {
  const stars = useMemo(() => 
    Array.from({ length: 4 }, (_, i) => ({
      id: i,
      top: 25 + i * 18,
      right: 12 + i * 10,
      delay: i * 0.6,
      duration: 5 + i,
    })), 
  []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute hidden lg:block gpu-accelerated"
          style={{ top: `${star.top}%`, right: `${star.right}%` }}
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.2, 0.6, 0.2], 
            scale: [0.9, 1.1, 0.9],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: star.duration, 
            repeat: Infinity, 
            delay: star.delay,
            ease: "easeInOut"
          }}
        >
          <Star className="w-3 h-3 text-primary/30 fill-primary/15" />
        </motion.div>
      ))}
    </>
  );
});

DecorativeStars.displayName = "DecorativeStars";

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();
  
  // Parallax effects - disabled if user prefers reduced motion
  const imageY = useTransform(scrollY, [0, 500], [0, prefersReducedMotion ? 0 : 100]);
  const imageScale = useTransform(scrollY, [0, 500], [1, prefersReducedMotion ? 1 : 1.1]);
  const contentY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion ? 0 : -30]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 z-0 gpu-accelerated"
        style={{ y: imageY }}
      >
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ scale: imageScale }}
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover gpu-accelerated"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute inset-0 aurora opacity-25" />
      </motion.div>

      {/* Decorative Elements */}
      <FloatingElement className="absolute top-32 left-10 z-20" delay={0}>
        <motion.div 
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 150 }}
          className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center glow-premium sparkle gpu-accelerated"
        >
          <Heart className="w-8 h-8 text-primary fill-primary/50" />
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute bottom-40 right-20 z-20" delay={0.8}>
        <motion.div 
          initial={{ opacity: 0, scale: 0, rotate: 180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 150 }}
          className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center glow-premium gpu-accelerated"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="gpu-accelerated"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute top-1/2 right-32 hidden lg:flex z-20" delay={0.4}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 150 }}
          className="w-12 h-12 rounded-xl glass-card flex items-center justify-center gpu-accelerated"
        >
          <motion.div 
            className="w-3 h-3 rounded-full bg-gradient-hero"
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </FloatingElement>
      
      <DecorativeStars />

      {/* Content with parallax */}
      <motion.div 
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20 gpu-accelerated"
        style={{ y: contentY, opacity }}
      >
        <motion.div 
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge with shimmer effect */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-card mb-8 sparkle"
          >
            <motion.div 
              className="w-2 h-2 rounded-full bg-gradient-hero"
              animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </motion.div>

          {/* Animated Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Увидьте свою{" "}
            <span className="text-gradient-animated">
              мечту о свадьбе
            </span>
            <br />
            <motion.span 
              className="text-foreground/90"
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
            >
              ещё до её начала
            </motion.span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
          >
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <MagneticButton strength={15}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="lg"
                  className="text-lg h-14 px-8 bg-gradient-hero shadow-xl hover:shadow-2xl transition-shadow duration-300 group glow-premium"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Начать планирование
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 3, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </MagneticButton>

            <MagneticButton strength={12}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 glass-button border-2 hover:bg-accent/50 group gradient-border"
                  onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
                >
                  <motion.span
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Play className="mr-2 w-5 h-5" />
                  </motion.span>
                  Смотреть демо
                </Button>
              </motion.div>
            </MagneticButton>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-3 gap-4 mt-14 pt-8"
          >
            <StatCard value="1500+" label="Поставщиков" index={0} />
            <StatCard value="10K+" label="Свадеб" index={1} />
            <StatCard value="98%" label="Довольны" index={2} />
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <ScrollIndicator variant="mouse" />
    </section>
  );
};
