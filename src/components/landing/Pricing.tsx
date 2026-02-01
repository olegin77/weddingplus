import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Crown, Star, ArrowRight, Gem } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatedSection } from "./AnimatedSection";
import { TiltCard } from "./TiltCard";

const plans = [
  {
    name: "Базовый",
    price: "Бесплатно",
    description: "Идеально для начала планирования",
    icon: Star,
    gradient: "from-wedding-burgundy to-primary",
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
    gradient: "from-primary to-wedding-gold",
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
    gradient: "from-wedding-gold to-wedding-burgundy",
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

interface PlanCardProps {
  plan: typeof plans[0];
  index: number;
}

const PlanCard = ({ plan, index }: PlanCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, rotateY: index === 1 ? 0 : (index === 0 ? -10 : 10) }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.15,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className={`relative ${plan.highlighted ? 'z-10 md:-my-4' : ''}`}
    >
      <TiltCard tiltAmount={plan.highlighted ? 6 : 10} scale={plan.highlighted ? 1.02 : 1.05}>
        <motion.div
          className={`relative glass-luxe p-6 h-full overflow-hidden rounded-2xl ${
            plan.highlighted
              ? "border-2 border-wedding-gold/40 shadow-2xl"
              : ""
          }`}
        >
          {/* Animated background gradient */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0`}
            whileHover={{ opacity: 0.06 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Sparkle effect for highlighted */}
          {plan.highlighted && (
            <>
              <div className="absolute inset-0 sparkle" />
              <motion.div
                className="absolute inset-0 rounded-2xl"
                animate={{
                  boxShadow: [
                    "0 0 20px hsl(15 60% 65% / 0.2)",
                    "0 0 40px hsl(45 70% 60% / 0.4)",
                    "0 0 20px hsl(15 60% 65% / 0.2)",
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
            </>
          )}

          {plan.highlighted && (
            <motion.div 
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              initial={{ y: -30, opacity: 0, scale: 0 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" as const, stiffness: 200 }}
            >
              <Badge className="gradient-luxe text-white px-4 py-1 shadow-lg glow-gold border-0">
                <Gem className="w-3 h-3 mr-1" />
                Популярный
              </Badge>
            </motion.div>
          )}

          {/* Header */}
          <div className="text-center pb-6 pt-2 relative z-10">
            <motion.div 
              className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center mb-4 relative`}
              whileHover={{ rotate: 10, scale: 1.15 }}
              transition={{ type: "spring" as const, stiffness: 300 }}
            >
              {/* Icon glow */}
              <motion.div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.gradient} blur-xl opacity-50`}
                animate={plan.highlighted ? { scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <plan.icon className="w-8 h-8 text-white relative z-10" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {plan.description}
            </p>
            <motion.div 
              className="text-4xl font-bold text-gradient-animated"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring" as const, stiffness: 200 }}
            >
              {plan.price}
            </motion.div>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-8 relative z-10">
            {plan.features.map((feature, idx) => (
              <motion.div 
                key={idx} 
                className="flex items-start gap-3 group"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 + idx * 0.05 }}
              >
                <motion.div 
                  className={`w-5 h-5 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center shrink-0 mt-0.5`}
                  whileHover={{ scale: 1.2 }}
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
                <span className="text-sm text-foreground/80 group-hover:text-foreground transition-colors">{feature}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="relative z-10"
          >
            <Button
              className={`w-full h-12 text-base group relative overflow-hidden ${
                plan.highlighted
                  ? "gradient-luxe shadow-lg hover:shadow-xl glow-gold text-white border-0"
                  : "glass-button border-2"
              }`}
              variant={plan.highlighted ? "default" : "outline"}
            >
              {/* Shimmer effect */}
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)",
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
                {plan.price === "Бесплатно" ? "Начать бесплатно" : "Выбрать план"}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-4 h-4" />
                </motion.span>
              </span>
            </Button>
          </motion.div>
          
          {/* Bottom gradient line */}
          <motion.div
            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${plan.gradient} rounded-b-2xl`}
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </TiltCard>
    </motion.div>
  );
};

export const Pricing = () => {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-24 bg-mesh relative overflow-hidden">
      {/* Animated background blobs */}
      <motion.div 
        className="absolute top-0 right-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl blob"
        animate={{ 
          y: [-20, 20, -20],
          x: [0, 30, 0],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 left-1/4 w-96 h-96 bg-wedding-burgundy/8 rounded-full blur-3xl blob"
        animate={{ 
          y: [20, -20, 20],
          x: [0, -30, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-wedding-gold/5 rounded-full blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
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
              <Gem className="w-4 h-4 text-wedding-gold" />
            </motion.div>
            <span className="text-sm font-semibold">Прозрачные цены</span>
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Выберите свой{" "}
            <span className="text-gradient-animated">
              идеальный план
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Гибкие тарифы для каждого этапа планирования вашей свадьбы
          </p>
        </AnimatedSection>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <PlanCard key={index} plan={plan} index={index} />
          ))}
        </div>

        <AnimatedSection className="text-center mt-12" delay={0.5}>
          <motion.div 
            className="inline-flex items-center gap-4 glass-luxe px-6 py-3 rounded-full text-sm text-muted-foreground"
            whileHover={{ scale: 1.05 }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              🔒
            </motion.span>
            <span>Безопасные платежи</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              💳
            </motion.span>
            <span>Возврат в течение 14 дней</span>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
};
