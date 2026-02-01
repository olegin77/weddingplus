import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Sparkles,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar,
  Users,
  ArrowUpRight,
  Wand2,
} from "lucide-react";
import { AnimatedSection, GlowingCard } from "./AnimatedSection";
import { TiltCard } from "./TiltCard";

const features = [
  {
    icon: Sparkles,
    title: "AI Визуализатор Свадьбы",
    description:
      "Увидьте реалистичную 3D визуализацию вашей свадьбы с вашими лицами в выбранном стиле",
    gradient: "from-primary to-wedding-gold",
    size: "large",
  },
  {
    icon: Mail,
    title: "AI Создатель Приглашений",
    description:
      "Автоматически создавайте видео-приглашения с анимацией и персонализацией",
    gradient: "from-wedding-burgundy to-primary",
    size: "medium",
  },
  {
    icon: CreditCard,
    title: "Безопасные Платежи",
    description:
      "Escrow система защищает ваши деньги. Рассрочка до 12 месяцев",
    gradient: "from-wedding-gold to-primary",
    size: "medium",
  },
  {
    icon: ShoppingBag,
    title: "Маркетплейс Поставщиков",
    description:
      "1500+ верифицированных поставщиков с реальными отзывами",
    gradient: "from-primary to-wedding-burgundy",
    size: "medium",
  },
  {
    icon: Calendar,
    title: "Умный Планировщик",
    description:
      "AI рекомендации по бюджету и автоматические напоминания",
    gradient: "from-wedding-burgundy to-wedding-gold",
    size: "medium",
  },
  {
    icon: Users,
    title: "Управление Гостями",
    description:
      "Цифровые приглашения с QR-кодами и списки подарков",
    gradient: "from-wedding-gold to-wedding-burgundy",
    size: "medium",
  },
];

const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const isLarge = feature.size === "large";

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateX: -10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={isLarge ? "md:col-span-2 md:row-span-2" : ""}
    >
      <TiltCard tiltAmount={isLarge ? 8 : 12} scale={1.02}>
        <GlowingCard className={`glass-luxe p-6 h-full ios-highlight group cursor-default relative overflow-hidden rounded-2xl ${
          isLarge ? "min-h-[300px]" : ""
        }`}>
          {/* Gradient overlay on hover */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0`}
            whileHover={{ opacity: 0.08 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Icon with enhanced animation */}
          <motion.div
            whileHover={{ scale: 1.15, rotate: 10 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
            className={`${isLarge ? "w-16 h-16" : "w-14 h-14"} rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg relative`}
          >
            {/* Glow effect */}
            <motion.div
              className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} blur-xl opacity-50`}
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <feature.icon className={`${isLarge ? "w-8 h-8" : "w-7 h-7"} text-white relative z-10`} />
          </motion.div>
          
          {/* Content */}
          <h3 className={`${isLarge ? "text-2xl" : "text-xl"} font-semibold mb-3 group-hover:text-primary transition-colors flex items-center gap-2`}>
            {feature.title}
            <motion.span
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              initial={{ x: -5 }}
              whileHover={{ x: 0 }}
            >
              <ArrowUpRight className="w-4 h-4 text-primary" />
            </motion.span>
          </h3>
          <p className={`text-muted-foreground leading-relaxed ${isLarge ? "text-lg" : ""}`}>
            {feature.description}
          </p>
          
          {/* Large card extra content */}
          {isLarge && (
            <motion.div 
              className="mt-6 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
            >
              {["20+ стилей", "4K качество", "360° preview", "Face swap"].map((tag, i) => (
                <motion.span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-xs font-medium glass-luxe"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          )}
          
          {/* Animated underline */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 gradient-luxe rounded-b-2xl"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </GlowingCard>
      </TiltCard>
    </motion.div>
  );
};

export const Features = () => {
  return (
    <section className="py-24 bg-mesh relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl blob"
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-wedding-burgundy/8 rounded-full blur-3xl blob"
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-wedding-gold/5 rounded-full blur-3xl blob"
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-luxe mb-6 sparkle"
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Wand2 className="w-4 h-4 text-wedding-gold" />
            </motion.div>
            <span className="text-sm font-semibold">Все возможности</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Всё что нужно для{" "}
            <span className="text-gradient-animated">
              идеальной свадьбы
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Полный набор AI-инструментов для планирования вашей мечты
          </p>
        </AnimatedSection>

        {/* Bento Grid Layout */}
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
