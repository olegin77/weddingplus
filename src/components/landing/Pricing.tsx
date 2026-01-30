import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./AnimatedSection";

const plans = [
  {
    name: "Базовый",
    price: "Бесплатно",
    description: "Идеально для начала планирования",
    icon: Star,
    features: [
      "AI Ассистент (10 запросов/месяц)",
      "Планировщик событий",
      "Список гостей до 50 человек",
      "Бюджет калькулятор",
      "1 план рассадки",
      "Базовая поддержка",
    ],
    highlighted: false,
  },
  {
    name: "Премиум",
    price: "Связаться с нами",
    description: "Для полноценного планирования",
    icon: Sparkles,
    features: [
      "Все из базового плана",
      "AI Визуализатор (неограниченно)",
      "AI Генератор приглашений",
      "Неограниченное количество гостей",
      "Неограниченные планы рассадки",
      "Приоритетная поддержка 24/7",
      "Персональный менеджер",
      "Экспорт в PDF/PNG",
    ],
    highlighted: true,
  },
  {
    name: "Свадебный",
    price: "Связаться с нами",
    description: "Полный пакет для вашей свадьбы",
    icon: Crown,
    features: [
      "Все из премиум плана",
      "Доступ навсегда (lifetime)",
      "Персональный свадебный сайт",
      "Интеграция с Gift Registry",
      "VIP поддержка",
      "Консультации с экспертами",
      "Скидки у партнеров до 15%",
      "Организация под ключ",
    ],
    highlighted: false,
  },
];

export const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-mesh relative overflow-hidden">
      {/* Background decorations */}
      <motion.div 
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"
        animate={{ 
          y: [-20, 20, -20],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-wedding-gold/10 rounded-full blur-3xl"
        animate={{ 
          y: [20, -20, 20],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Прозрачные цены</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Выберите свой{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              идеальный план
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Гибкие тарифы для каждого этапа планирования вашей свадьбы
          </p>
        </AnimatedSection>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto" staggerDelay={0.15}>
          {plans.map((plan, index) => (
            <StaggerItem key={index}>
              <motion.div
                className={`relative glass-card p-6 h-full ${
                  plan.highlighted
                    ? "z-10 border-primary/30 shadow-xl"
                    : ""
                }`}
                whileHover={{ 
                  scale: plan.highlighted ? 1.02 : 1.03,
                  y: -8,
                }}
                animate={plan.highlighted ? {
                  boxShadow: [
                    "0 0 20px rgba(236, 72, 153, 0.2)",
                    "0 0 40px rgba(236, 72, 153, 0.3)",
                    "0 0 20px rgba(236, 72, 153, 0.2)",
                  ],
                } : {}}
                transition={plan.highlighted ? {
                  boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  scale: { type: "spring", stiffness: 300 },
                  y: { type: "spring", stiffness: 300 },
                } : {
                  type: "spring", stiffness: 300, damping: 20
                }}
              >
                {plan.highlighted && (
                  <motion.div 
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <Badge className="bg-gradient-hero text-white px-4 py-1 shadow-lg">
                      Популярный
                    </Badge>
                  </motion.div>
                )}

                {/* Header */}
                <div className="text-center pb-6 pt-2">
                  <motion.div 
                    className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 ${plan.highlighted ? 'glow' : ''}`}
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <plan.icon className="w-7 h-7 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {plan.description}
                  </p>
                  <div className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                    {plan.price}
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, idx) => (
                    <motion.div 
                      key={idx} 
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? "bg-gradient-hero shadow-lg hover:shadow-xl"
                        : "glass-button border hover:bg-accent/50"
                    }`}
                    variant={plan.highlighted ? "default" : "outline"}
                    onClick={() => navigate("/auth")}
                  >
                    {plan.price === "Бесплатно"
                      ? "Начать бесплатно"
                      : "Выбрать план"}
                  </Button>
                </motion.div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <AnimatedSection className="text-center mt-12" delay={0.5}>
          <div className="inline-flex items-center gap-4 glass-card px-6 py-3 rounded-full text-sm text-muted-foreground">
            <span>🔒 Безопасные платежи</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <span>💳 Возврат в течение 14 дней</span>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};
