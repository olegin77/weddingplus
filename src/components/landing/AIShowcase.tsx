import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Video, Image as ImageIcon, Wand2, ArrowRight, Play, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import { TiltCard } from "./TiltCard";

const showcaseItems = [
  {
    title: "AI Wedding Visualizer",
    description:
      "Загрузите фото себя и партнёра, выбирайте стиль (traditional, modern, royal, garden) и получите реалистичную 3D визуализацию вашей свадьбы с вашими лицами!",
    icon: Sparkles,
    badge: "Революционная функция",
    badgeIcon: Star,
    link: "/ai-visualizer",
    gradient: "from-primary to-wedding-gold",
    features: [
      "20+ стилей свадеб",
      "Реалистичная вставка лиц",
      "360° видео preview",
      "4K качество",
    ],
  },
  {
    title: "AI Invitation Creator",
    description:
      "Создавайте профессиональные видео-приглашения с анимациями за минуты. 20+ шаблонов с персонализацией и экспортом в MP4, GIF, PDF.",
    icon: Video,
    badge: "Экономия времени",
    badgeIcon: Wand2,
    link: "/ai-invitations",
    gradient: "from-wedding-burgundy to-primary",
    features: [
      "Видео-приглашения",
      "20+ шаблонов",
      "Автоматическая анимация",
      "Быстрый экспорт",
    ],
  },
  {
    title: "Vendor Marketplace",
    description:
      "Найдите идеальных поставщиков из 1500+ верифицированных профессионалов. Реальные отзывы, портфолио и прямое общение.",
    icon: ImageIcon,
    badge: "1500+ поставщиков",
    badgeIcon: Star,
    link: "/marketplace",
    gradient: "from-wedding-gold to-wedding-burgundy",
    features: [
      "Верифицированные вендоры",
      "Реальные отзывы",
      "Умный поиск",
      "Онлайн бронирование",
    ],
  },
];

export const AIShowcase = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleNavigate = (link: string) => {
    if (link.startsWith('/marketplace')) {
      navigate(link);
      return;
    }
    if (isAuthenticated) {
      navigate(link);
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-20">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-luxe mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
            >
              <Wand2 className="w-4 h-4 text-wedding-gold" />
            </motion.div>
            <span className="text-sm font-semibold">Powered by AI</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Технологии будущего уже{" "}
            <span className="text-gradient-animated">
              сегодня
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Первая платформа в СНГ с AI-визуализацией свадеб
          </p>
        </AnimatedSection>

        <div className="space-y-24">
          {showcaseItems.map((item, index) => (
            <motion.div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {/* Interactive Preview Card */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <TiltCard tiltAmount={10} scale={1.02}>
                  <motion.div 
                    className={`relative rounded-3xl overflow-hidden glass-luxe group h-80 bg-gradient-to-br ${item.gradient}`}
                  >
                    {/* Animated gradient background */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        backgroundSize: "200% 200%",
                      }}
                    />
                    
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center"
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        transition={{ type: "spring" as const, stiffness: 300 }}
                      >
                        <item.icon className="w-12 h-12 text-white" />
                      </motion.div>
                    </div>
                    
                    {/* Play button overlay */}
                    <motion.div 
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    >
                      <motion.div
                        className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Play className="w-8 h-8 text-white fill-white" />
                      </motion.div>
                    </motion.div>
                    
                    {/* Floating badge */}
                    <motion.div 
                      className="absolute top-4 left-4"
                      initial={{ y: -20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4, type: "spring" as const }}
                    >
                      <Badge className="glass-luxe border-0 px-4 py-2 text-sm font-semibold bg-white/20 text-white">
                        <item.badgeIcon className="w-4 h-4 mr-2" />
                        {item.badge}
                      </Badge>
                    </motion.div>
                  </motion.div>
                </TiltCard>
              </motion.div>

              {/* Content */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: index % 2 === 0 ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <TiltCard tiltAmount={5} scale={1.01} glareEnabled={false}>
                  <motion.div 
                    className="glass-luxe p-8 rounded-3xl"
                  >
                    <motion.div 
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 shadow-lg relative`}
                      whileHover={{ rotate: 10, scale: 1.1 }}
                      transition={{ type: "spring" as const, stiffness: 300 }}
                    >
                      <motion.div
                        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${item.gradient} blur-xl opacity-50`}
                        whileHover={{ scale: 1.08, opacity: 0.55 }}
                        transition={{ duration: 0.25 }}
                      />
                      <item.icon className="w-7 h-7 text-white relative z-10" />
                    </motion.div>
                    
                    <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                    <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                      {item.description}
                    </p>

                    <ul className="space-y-3 mb-8">
                      {item.features.map((feature, idx) => (
                        <motion.li 
                          key={idx} 
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.4 + idx * 0.1 }}
                        >
                          <motion.div 
                            className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.gradient}`}
                            whileHover={{ scale: 1.25 }}
                            transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
                          />
                          <span className="text-foreground font-medium">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        size="lg" 
                        className={`gradient-luxe shadow-lg hover:shadow-xl transition-all duration-300 group text-white border-0`}
                        onClick={() => handleNavigate(item.link)}
                      >
                        Попробовать сейчас
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </motion.div>
                </TiltCard>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
