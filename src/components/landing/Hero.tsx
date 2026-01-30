import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-wedding.jpg";
import { FloatingElement } from "./AnimatedSection";
import { ParticleBackground } from "./ParticleBackground";
import { ScrollIndicator } from "./ScrollIndicator";
import { MagneticButton } from "./MagneticButton";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const statVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 20,
    },
  },
};

export const Hero = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const imageY = useTransform(scrollY, [0, 500], [0, 150]);
  const imageScale = useTransform(scrollY, [0, 500], [1, 1.15]);
  const contentY = useTransform(scrollY, [0, 300], [0, -50]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

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
        className="absolute inset-0 z-0"
        style={{ y: imageY }}
      >
        <motion.img
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ scale: imageScale }}
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/60" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
        
        {/* Aurora effect overlay */}
        <div className="absolute inset-0 aurora opacity-30" />
      </motion.div>

      {/* Decorative Elements */}
      <FloatingElement className="absolute top-32 left-10 z-20" delay={0}>
        <motion.div 
          initial={{ opacity: 0, scale: 0, rotate: -180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center glow-premium sparkle"
        >
          <Heart className="w-8 h-8 text-primary fill-primary/50" />
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute bottom-40 right-20 z-20" delay={1}>
        <motion.div 
          initial={{ opacity: 0, scale: 0, rotate: 180 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center glow-premium"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute top-1/2 right-32 hidden lg:flex z-20" delay={0.5}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          className="w-12 h-12 rounded-xl glass-card flex items-center justify-center"
        >
          <motion.div 
            className="w-3 h-3 rounded-full bg-gradient-hero"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </FloatingElement>
      
      {/* Additional decorative stars */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute hidden lg:block"
          style={{
            top: `${20 + i * 15}%`,
            right: `${10 + i * 8}%`,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: [0.3, 0.8, 0.3], 
            scale: [0.8, 1.2, 0.8],
            rotate: 360,
          }}
          transition={{ 
            duration: 4 + i, 
            repeat: Infinity, 
            delay: i * 0.5,
            ease: "easeInOut"
          }}
        >
          <Star className="w-4 h-4 text-primary/40 fill-primary/20" />
        </motion.div>
      ))}

      {/* Content with parallax */}
      <motion.div 
        className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 pt-20"
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
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
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
            <MagneticButton strength={20}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="text-lg h-14 px-8 bg-gradient-hero shadow-xl hover:shadow-2xl transition-all duration-300 group glow-premium"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Начать планирование
                  <motion.span
                    className="ml-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="w-5 h-5" />
                  </motion.span>
                </Button>
              </motion.div>
            </MagneticButton>

            <MagneticButton strength={15}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg h-14 px-8 glass-button border-2 hover:bg-accent/50 group gradient-border"
                  onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
                >
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Play className="mr-2 w-5 h-5" />
                  </motion.span>
                  Смотреть демо
                </Button>
              </motion.div>
            </MagneticButton>
          </motion.div>

          {/* Stats with glass cards and counter animation */}
          <motion.div 
            variants={containerVariants}
            className="grid grid-cols-3 gap-4 mt-14 pt-8"
          >
            {[
              { value: "1500+", label: "Поставщиков" },
              { value: "10K+", label: "Свадеб" },
              { value: "98%", label: "Довольны" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={statVariants}
                whileHover={{ 
                  scale: 1.08,
                  y: -5,
                }}
                className="glass-card p-4 text-center cursor-default card-3d group"
              >
                <motion.div 
                  className="card-3d-inner"
                  whileHover={{ rotateY: 5, rotateX: 2 }}
                >
                  <motion.div 
                    className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-xs sm:text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                    {stat.label}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <ScrollIndicator variant="mouse" />
    </section>
  );
};
