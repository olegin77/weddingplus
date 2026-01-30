import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { FloatingElement } from "./AnimatedSection";

export const CTA = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-30" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.div 
            className="relative rounded-3xl bg-gradient-hero p-12 shadow-2xl overflow-hidden"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Decorative glass elements */}
            <motion.div 
              className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, 30, 0],
                y: [0, -30, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div 
              className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-3xl"
              animate={{ 
                x: [0, -30, 0],
                y: [0, 30, 0],
              }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            
            {/* Floating hearts */}
            <FloatingElement className="absolute top-8 right-8" delay={0}>
              <motion.div 
                className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                initial={{ scale: 0, rotate: -180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <Heart className="w-6 h-6 text-white fill-white/50" />
              </motion.div>
            </FloatingElement>
            
            <FloatingElement className="absolute bottom-8 left-8" delay={1}>
              <motion.div 
                className="w-10 h-10 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center"
                initial={{ scale: 0, rotate: 180 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            </FloatingElement>

            <div className="relative z-10 text-center text-white">
              <motion.div 
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-8"
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  className="w-2 h-2 rounded-full bg-white"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
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
                Готовы увидеть свою свадьбу мечты?
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
                <Input
                  type="email"
                  placeholder="Ваш email"
                  className="h-14 bg-white/15 backdrop-blur-md border-white/30 text-white placeholder:text-white/60 focus-visible:ring-white/50 rounded-xl"
                />
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-14 px-8 whitespace-nowrap shadow-lg rounded-xl font-semibold group"
                    onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                  >
                    Начать
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </motion.div>

              <motion.p 
                className="text-sm text-white/70 mt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 }}
              >
                Бесплатно навсегда. Кредитная карта не требуется.
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
