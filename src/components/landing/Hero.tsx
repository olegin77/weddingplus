import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-wedding.jpg";
import { ParticleBackground } from "./ParticleBackground";

// Simplified animation variants - reduce complexity
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

// Memoized stat card to prevent re-renders
const StatCard = memo(({ value, label, index }: { value: string; label: string; index: number }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: 0.3 + index * 0.1, duration: 0.3 }}
    className="glass-card p-4 text-center hover:scale-105 transition-transform duration-200"
  >
    <div className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1">
      {value}
    </div>
    <div className="text-xs sm:text-sm text-muted-foreground">
      {label}
    </div>
  </motion.div>
));

StatCard.displayName = "StatCard";

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Lightweight Particle Background */}
      <ParticleBackground />
      
      {/* Background Image - static, no parallax for performance */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.05, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-mesh opacity-50" />
      </div>

      {/* Decorative Elements - CSS only, no framer-motion */}
      <div className="absolute top-32 left-10 z-20 animate-float-gentle">
        <div className="w-14 h-14 rounded-2xl glass-card flex items-center justify-center">
          <Heart className="w-7 h-7 text-primary fill-primary/50" />
        </div>
      </div>
      
      <div className="absolute bottom-40 right-20 z-20 animate-float-gentle" style={{ animationDelay: "1s" }}>
        <div className="w-16 h-16 rounded-3xl glass-card flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-primary animate-spin-slow" />
        </div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20">
        <motion.div 
          className="max-w-3xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl glass-card mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-gradient-hero animate-pulse" />
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </motion.div>

          {/* Title */}
          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Увидьте свою{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              мечту о свадьбе
            </span>
            <br />
            <span className="text-foreground/90">
              ещё до её начала
            </span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
          >
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="text-lg h-14 px-8 bg-gradient-hero shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            >
              Начать планирование
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 glass-button border-2 hover:bg-accent/50 hover:scale-105 transition-all duration-200"
              onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
            >
              <Play className="mr-2 w-5 h-5" />
              Смотреть демо
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-3 gap-4 mt-14 pt-8"
          >
            <StatCard value="1500+" label="Поставщиков" index={0} />
            <StatCard value="10K+" label="Свадеб" index={1} />
            <StatCard value="98%" label="Довольны" index={2} />
          </motion.div>
        </motion.div>
      </div>
      
      {/* Scroll Indicator - CSS only */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce-gentle">
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex justify-center pt-2">
          <div className="w-1.5 h-3 rounded-full bg-primary/50 animate-scroll-indicator" />
        </div>
      </div>
    </section>
  );
};
