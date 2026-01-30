import { motion } from "framer-motion";
import {
  Sparkles,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem, GlowingCard } from "./AnimatedSection";

const features = [
  {
    icon: Sparkles,
    title: "AI Визуализатор Свадьбы",
    description:
      "Увидьте реалистичную 3D визуализацию вашей свадьбы с вашими лицами в выбранном стиле",
    gradient: "from-wedding-rose to-primary-glow",
  },
  {
    icon: Mail,
    title: "AI Создатель Приглашений",
    description:
      "Автоматически создавайте видео-приглашения с анимацией и персонализацией",
    gradient: "from-wedding-gold to-wedding-champagne",
  },
  {
    icon: ShoppingBag,
    title: "Маркетплейс Поставщиков",
    description:
      "1500+ верифицированных поставщиков с реальными отзывами и рейтингами",
    gradient: "from-primary to-wedding-rose",
  },
  {
    icon: CreditCard,
    title: "Безопасные Платежи",
    description:
      "Escrow система защищает ваши деньги. Рассрочка на услуги до 12 месяцев",
    gradient: "from-wedding-champagne to-wedding-gold",
  },
  {
    icon: Calendar,
    title: "Умный Планировщик",
    description:
      "AI рекомендации по бюджету, timeline свадьбы и автоматические напоминания",
    gradient: "from-wedding-rose to-primary",
  },
  {
    icon: Users,
    title: "Управление Гостями",
    description:
      "Цифровые приглашения с QR-кодами, отслеживание ответов и списки подарков",
    gradient: "from-wedding-gold to-wedding-rose",
  },
];

export const Features = () => {
  return (
    <section className="py-24 bg-mesh relative overflow-hidden">
      {/* Background decoration */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-wedding-gold/10 rounded-full blur-3xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Все возможности</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Всё что нужно для{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              идеальной свадьбы
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Полный набор AI-инструментов для планирования вашей мечты
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" staggerDelay={0.1}>
          {features.map((feature, index) => (
            <StaggerItem key={index}>
              <GlowingCard className="glass-card p-6 h-full ios-highlight group cursor-default">
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg glow`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </motion.div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {/* Hover indicator */}
                <motion.div 
                  className="mt-4 flex items-center gap-2 text-primary"
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                >
                  <span className="text-sm font-medium">Подробнее</span>
                  <motion.span 
                    className="text-lg"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </motion.div>
              </GlowingCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};
