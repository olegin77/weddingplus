import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-wedding.jpg";
import { FloatingElement } from "./AnimatedSection";

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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/98 via-background/90 to-background/70" />
        <div className="absolute inset-0 bg-mesh opacity-60" />
      </div>

      {/* Decorative Elements */}
      <FloatingElement className="absolute top-32 left-10" delay={0}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl glass-card flex items-center justify-center glow"
        >
          <Heart className="w-8 h-8 text-primary fill-primary/50" />
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute bottom-40 right-20" delay={1}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
          className="w-20 h-20 rounded-3xl glass-card flex items-center justify-center glow-lg"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
      </FloatingElement>
      
      <FloatingElement className="absolute top-1/2 right-32 hidden lg:flex" delay={0.5}>
        <motion.div 
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
          className="w-12 h-12 rounded-xl glass-card flex items-center justify-center"
        >
          <div className="w-3 h-3 rounded-full bg-gradient-hero" />
        </motion.div>
      </FloatingElement>

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
            <motion.div 
              className="w-2 h-2 rounded-full bg-gradient-hero"
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            Увидьте свою{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              мечту о свадьбе
            </span>
            <br />
            <span className="text-foreground/90">ещё до её начала</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl sm:text-2xl text-muted-foreground mb-10 leading-relaxed max-w-2xl"
          >
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                className="text-lg h-14 px-8 bg-gradient-hero shadow-xl hover:shadow-2xl transition-all duration-300 group"
                onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
              >
                Начать планирование
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                size="lg"
                variant="outline"
                className="text-lg h-14 px-8 glass-button border-2 hover:bg-accent/50 group"
                onClick={() => navigate(isAuthenticated ? '/ai-visualizer' : '/auth')}
              >
                <Play className="mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
                Смотреть демо
              </Button>
            </motion.div>
          </motion.div>

          {/* Stats with glass cards */}
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
                  scale: 1.05,
                  boxShadow: "0 20px 40px -8px hsl(340 20% 20% / 0.15)",
                }}
                className="glass-card p-4 text-center cursor-default"
              >
                <div className="text-2xl sm:text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
