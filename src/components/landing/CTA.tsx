import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Heart, Star, Zap, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FloatingElement } from "./AnimatedSection";
import { GradientButton } from "./GradientButton";

export const CTA = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="py-24 relative overflow-hidden aurora">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-40" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="relative rounded-3xl gradient-luxe p-8 sm:p-12 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            {/* Animated decorative glass elements */}
            <motion.div 
              className="absolute top-0 right-0 w-80 h-80 bg-white/15 rounded-full blur-3xl blob"
              animate={{ 
                x: [0, 40, 0],
                y: [0, -40, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-80 h-80 bg-white/15 rounded-full blur-3xl blob"
              animate={{ 
                x: [0, -40, 0],
                y: [0, 40, 0],
                scale: [1.2, 1, 1.2],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/8 rounded-full blur-3xl"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            />
            
            {/* Floating decorative elements */}
            <FloatingElement className="absolute top-8 right-8" delay={0}>
              <motion.div 
                className="w-12 h-12 rounded-xl bg-white/25 backdrop-blur-sm flex items-center justify-center sparkle"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" as const, stiffness: 200 }}
                whileHover={{ rotate: 15, scale: 1.1 }}
              >
                <Heart className="w-6 h-6 text-white fill-white/50" />
              </motion.div>
            </FloatingElement>
            
            <FloatingElement className="absolute bottom-8 left-8" delay={1}>
              <motion.div 
                className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center"
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, type: "spring" as const, stiffness: 200 }}
                whileHover={{ rotate: -15, scale: 1.1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              </motion.div>
            </FloatingElement>
            
            <FloatingElement className="absolute top-20 left-10 hidden sm:flex" delay={0.5}>
              <motion.div 
                className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.9, type: "spring" as const, stiffness: 200 }}
              >
                <Star className="w-4 h-4 text-white fill-white/30" />
              </motion.div>
            </FloatingElement>
            
            <FloatingElement className="absolute bottom-20 right-10 hidden sm:flex" delay={1.5}>
              <motion.div 
                className="w-8 h-8 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1.1, type: "spring" as const, stiffness: 200 }}
              >
                <Zap className="w-4 h-4 text-white" />
              </motion.div>
            </FloatingElement>

            <div className="relative z-10 text-center text-white">
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/25 backdrop-blur-md border border-white/35 mb-8"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Gem className="w-4 h-4" />
                </motion.div>
                <span className="text-sm font-semibold">
                  Начните планирование бесплатно
                </span>
              </motion.div>

              <motion.h2 
                className="text-4xl sm:text-5xl font-bold mb-6"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                Готовы увидеть свою{" "}
                <span className="relative inline-block">
                  свадьбу мечты
                  <motion.span 
                    className="absolute -bottom-2 left-0 right-0 h-1 bg-white/60 rounded-full"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
                ?
              </motion.h2>

              <motion.p 
                className="text-xl text-white/90 mb-10 max-w-2xl mx-auto leading-relaxed"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                Присоединяйтесь к тысячам пар, которые уже планируют свою идеальную свадьбу с WeddingTech UZ
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
                initial={{ y: 30, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <motion.div 
                  className="flex-1"
                  whileFocus={{ scale: 1.02 }}
                >
                  <Input
                    type="email"
                    placeholder="Ваш email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 bg-white/20 backdrop-blur-md border-white/35 text-white placeholder:text-white/65 focus-visible:ring-white/50 rounded-xl"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-8 whitespace-nowrap shadow-lg rounded-xl font-semibold group relative overflow-hidden bg-white text-foreground hover:bg-white/90"
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                  >
                    {/* Shimmer effect */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100"
                      style={{
                        background: "linear-gradient(90deg, transparent, hsl(15 60% 65% / 0.3), transparent)",
                      }}
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative z-10 flex items-center gap-2">
                      Начать
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </span>
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p 
                className="text-sm text-white/75 mt-6 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  ✨
                </motion.span>
                Бесплатно навсегда. Кредитная карта не требуется.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
