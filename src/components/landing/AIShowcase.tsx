import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Video, Image as ImageIcon, Wand2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { AnimatedSection } from "./AnimatedSection";
import aiVisualizerImage from "@/assets/ai-visualizer.jpg";
import invitationImage from "@/assets/invitation-creator.jpg";
import marketplaceImage from "@/assets/marketplace.jpg";

const showcaseItems = [
  {
    title: "AI Wedding Visualizer",
    description:
      "Загрузите фото себя и партнёра, выбирайте стиль (traditional, modern, royal, garden) и получите реалистичную 3D визуализацию вашей свадьбы с вашими лицами!",
    image: aiVisualizerImage,
    icon: Sparkles,
    badge: "Революционная функция",
    link: "/ai-visualizer",
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
    image: invitationImage,
    icon: Video,
    badge: "Экономия времени",
    link: "/ai-invitations",
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
    image: marketplaceImage,
    icon: ImageIcon,
    badge: "1500+ поставщиков",
    link: "/marketplace",
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Wand2 className="w-4 h-4 text-primary" />
            </motion.div>
            <span className="text-sm font-medium">Powered by AI</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Технологии будущего уже{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              сегодня
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Первая платформа в СНГ с AI-визуализацией свадеб
          </p>
        </AnimatedSection>

        <div className="space-y-32">
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
              {/* Image */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: index % 2 === 0 ? -60 : 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <motion.div 
                  className="relative rounded-3xl overflow-hidden glass-card group"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover"
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.6 }}
                  />
                  {/* Glass overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                  
                  {/* Floating badge */}
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ y: -20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    <Badge className="glass-card border-0 px-4 py-2 text-sm font-medium">
                      <item.icon className="w-4 h-4 mr-2 text-primary" />
                      {item.badge}
                    </Badge>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Content */}
              <motion.div 
                className="flex-1"
                initial={{ opacity: 0, x: index % 2 === 0 ? 60 : -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div 
                  className="glass-card p-8 rounded-3xl"
                  whileHover={{ 
                    boxShadow: "0 25px 50px -12px hsl(340 20% 20% / 0.15)",
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded-2xl bg-gradient-hero flex items-center justify-center mb-6 glow"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <item.icon className="w-7 h-7 text-white" />
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
                          className="w-2 h-2 rounded-full bg-gradient-hero"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 2, repeat: Infinity, delay: idx * 0.2 }}
                        />
                        <span className="text-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button 
                      size="lg" 
                      className="bg-gradient-hero shadow-lg hover:shadow-xl transition-all duration-300 group"
                      onClick={() => handleNavigate(item.link)}
                    >
                      Попробовать сейчас
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
