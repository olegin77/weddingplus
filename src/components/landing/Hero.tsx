import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play, Star, Crown, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, memo, useMemo } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { FloatingElement } from "./AnimatedSection";
import { ScrollIndicator } from "./ScrollIndicator";
import { TextReveal } from "./TextReveal";
import { TiltCard } from "./TiltCard";
import { FloatingBadge } from "./FloatingBadge";
import { GradientButton } from "./GradientButton";
import { useIsMobile } from "@/hooks/use-mobile";

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

// Memoized stat card with 3D tilt
const StatCard = memo(({ value, label, index, icon: Icon }: { value: string; label: string; index: number; icon: React.ElementType }) => (
  <TiltCard tiltAmount={10} scale={1.05}>
    <motion.div
      variants={statVariants}
      className="glass-luxe p-4 sm:p-5 text-center cursor-default rounded-2xl h-full"
    >
      <motion.div 
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl gradient-luxe flex items-center justify-center mx-auto mb-2 sm:mb-3"
        initial={{ scale: 0, rotate: -180 }}
        whileInView={{ scale: 1, rotate: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3 + index * 0.1, type: "spring" as const, stiffness: 200 }}
      >
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </motion.div>
      <motion.div 
        className="text-2xl sm:text-3xl md:text-4xl font-bold text-gradient-animated mb-1"
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + index * 0.08, type: "spring" as const, stiffness: 180 }}
      >
        {value}
      </motion.div>
      <div className="text-xs sm:text-sm text-muted-foreground font-medium">
        {label}
      </div>
    </motion.div>
  </TiltCard>
));

StatCard.displayName = "StatCard";

// Memoized decorative stars - only on desktop
const DecorativeStars = memo(() => {
  const stars = useMemo(() => 
    Array.from({ length: 5 }, (_, i) => ({
      id: i,
      top: 20 + i * 15,
      right: 8 + i * 8,
      delay: i * 0.5,
    })), 
  []);

  return (
    <>
      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute hidden lg:block gpu-accelerated"
          style={{ top: `${star.top}%`, right: `${star.right}%` }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 0.45, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: star.delay }}
        >
          <Star className="w-3 h-3 text-wedding-gold/40 fill-wedding-gold/20" />
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
  const isMobile = useIsMobile();
  const { scrollY } = useScroll();
  
  // Parallax effects - disabled on mobile for performance
  const contentY = useTransform(scrollY, [0, 300], [0, prefersReducedMotion || isMobile ? 0 : -30]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.4]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Premium Mesh Gradient Background (no photo) */}
      <div className="absolute inset-0 z-0">
        {/* Base gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, 
                hsl(40 30% 98%) 0%,
                hsl(40 45% 95%) 25%,
                hsl(40 35% 96%) 50%,
                hsl(40 40% 94%) 75%,
                hsl(40 30% 97%) 100%
              )
            `,
          }}
        />
        
        {/* Mesh gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 20% 40%, hsl(15 60% 65% / 0.08) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 80% 20%, hsl(45 70% 60% / 0.1) 0%, transparent 50%),
              radial-gradient(ellipse 70% 60% at 40% 80%, hsl(40 45% 88% / 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 50% 30% at 90% 70%, hsl(345 45% 35% / 0.05) 0%, transparent 50%)
            `,
          }}
        />
        
        {/* Floating blobs - very slow animation */}
        <motion.div 
          className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-3xl"
          style={{ 
            background: 'hsl(15 60% 65% / 0.06)',
          }}
          animate={!isMobile ? { 
            x: [0, 30, 0],
            y: [0, 20, 0],
          } : undefined}
          transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-3xl"
          style={{ 
            background: 'hsl(45 70% 60% / 0.05)',
          }}
          animate={!isMobile ? { 
            x: [0, -25, 0],
            y: [0, -15, 0],
          } : undefined}
          transition={{ duration: 50, repeat: Infinity, ease: "easeInOut", delay: 15 }}
        />
        
        {/* Subtle noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Soft vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, hsl(40 30% 98% / 0.3) 100%)',
          }}
        />
        
        {/* Aurora effect */}
        <div className="absolute inset-0 aurora opacity-30" />
      </div>

      {/* Floating Badge - Top Left - hidden on mobile */}
      <FloatingBadge className="absolute top-32 left-8 z-20 hidden md:block" delay={0.5}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-luxe flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">2025</div>
            <div className="text-sm font-semibold">#1 в Центральной Азии</div>
          </div>
        </div>
      </FloatingBadge>

      {/* Floating Decorative Elements - only on desktop */}
      {!isMobile && (
        <>
          <FloatingElement className="absolute top-40 right-16 z-20 hidden lg:block" delay={0}>
            <motion.div 
              initial={{ opacity: 0, scale: 0, rotate: -180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.8, type: "spring" as const, stiffness: 150 }}
              className="w-16 h-16 rounded-2xl glass-luxe flex items-center justify-center glow-gold gpu-accelerated"
            >
              <Heart className="w-8 h-8 text-primary fill-primary/50" />
            </motion.div>
          </FloatingElement>
          
          <FloatingElement className="absolute bottom-40 right-24 z-20 hidden lg:block" delay={0.8}>
            <motion.div 
              initial={{ opacity: 0, scale: 0, rotate: 180 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 1, type: "spring" as const, stiffness: 150 }}
              className="w-20 h-20 rounded-3xl glass-luxe flex items-center justify-center glow-premium gpu-accelerated"
            >
              <motion.div
                className="gpu-accelerated"
                whileHover={{ rotate: 8, scale: 1.02 }}
                transition={{ type: "spring" as const, stiffness: 220, damping: 18 }}
              >
                <Sparkles className="w-10 h-10 text-wedding-gold" />
              </motion.div>
            </motion.div>
          </FloatingElement>
          
          <FloatingElement className="absolute top-1/2 right-40 hidden xl:flex z-20" delay={0.4}>
            <motion.div 
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, type: "spring" as const, stiffness: 150 }}
              className="w-12 h-12 rounded-xl glass-luxe flex items-center justify-center gpu-accelerated"
            >
              <div className="w-3 h-3 rounded-full gradient-luxe" />
            </motion.div>
          </FloatingElement>
          
          <DecorativeStars />
        </>
      )}

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
          {/* Premium Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl glass-luxe mb-6 sm:mb-8"
          >
            <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full gradient-luxe" />
            <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-wedding-gold" />
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </motion.div>

          {/* Animated Title with Split Reveal */}
          <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight">
              <TextReveal text="Увидьте свою" className="block" delay={0.3} />
              <TextReveal 
                text="мечту о свадьбе" 
                className="block" 
                delay={0.5} 
                gradient 
              />
              <motion.span 
                className="block text-foreground/85 mt-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2, duration: 0.6 }}
              >
                ещё до её начала
              </motion.span>
            </h1>
          </motion.div>

          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl md:text-2xl text-foreground/80 mb-8 sm:mb-10 leading-relaxed max-w-2xl"
          >
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <GradientButton
              size={isMobile ? "default" : "lg"}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              Начать планирование
              <motion.span
                whileHover={{ x: 4 }}
                transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
            </GradientButton>

            <GradientButton
              size={isMobile ? "default" : "lg"}
              variant="outline"
              onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
            >
              <motion.span
                whileHover={{ scale: 1.06 }}
                transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
              Смотреть демо
            </GradientButton>
          </motion.div>

          {/* Stats with 3D Tilt Cards */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-3 gap-2 sm:gap-4 mt-10 sm:mt-14 pt-6 sm:pt-8"
          >
            <StatCard value="1500+" label="Поставщиков" index={0} icon={Sparkles} />
            <StatCard value="10K+" label="Свадеб" index={1} icon={Heart} />
            <StatCard value="98%" label="Довольны" index={2} icon={Star} />
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <ScrollIndicator variant="mouse" />
    </section>
  );
};
