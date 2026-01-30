import { motion } from "framer-motion";
import { UserPlus, Search, Calendar, PartyPopper } from "lucide-react";
import { AnimatedSection, StaggerContainer, StaggerItem } from "./AnimatedSection";

const steps = [
  {
    icon: UserPlus,
    title: "Создайте профиль",
    description:
      "Зарегистрируйтесь и расскажите о вашей свадьбе - дата, бюджет, количество гостей",
  },
  {
    icon: Search,
    title: "Найдите поставщиков",
    description:
      "Используйте AI-рекомендации для поиска идеальных поставщиков из 1500+ профессионалов",
  },
  {
    icon: Calendar,
    title: "Планируйте с AI",
    description:
      "Умный планировщик создаст timeline, напоминания и поможет с бюджетом",
  },
  {
    icon: PartyPopper,
    title: "Наслаждайтесь",
    description:
      "Всё организовано, оплачено и подтверждено. Просто наслаждайтесь вашим днём!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-mesh relative overflow-hidden">
      {/* Background decorations */}
      <motion.div 
        className="absolute top-1/2 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2"
        animate={{ x: [-20, 20, -20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-1/2 right-0 w-64 h-64 bg-wedding-gold/10 rounded-full blur-3xl -translate-y-1/2"
        animate={{ x: [20, -20, 20] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Calendar className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">4 простых шага</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Как это{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              работает?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Четыре простых шага к свадьбе вашей мечты
          </p>
        </AnimatedSection>

        <div className="max-w-5xl mx-auto">
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={0.15}>
            {steps.map((step, index) => (
              <StaggerItem key={index}>
                <div className="relative">
                  {/* Connection Line */}
                  {index < steps.length - 1 && (
                    <motion.div 
                      className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 z-0"
                      initial={{ scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + index * 0.2, duration: 0.8 }}
                      style={{ transformOrigin: "left" }}
                    >
                      <div className="h-full bg-gradient-to-r from-primary/50 to-primary/10" />
                    </motion.div>
                  )}

                  <motion.div 
                    className="relative z-10 glass-card p-6 h-full"
                    whileHover={{ 
                      scale: 1.03, 
                      y: -5,
                      boxShadow: "0 20px 40px -8px hsl(340 20% 20% / 0.12)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Icon with glow */}
                      <motion.div 
                        className="w-16 h-16 rounded-2xl bg-gradient-hero flex items-center justify-center mb-4 shadow-lg glow"
                        whileHover={{ rotate: 10, scale: 1.1 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <step.icon className="w-8 h-8 text-white" />
                      </motion.div>
                      
                      {/* Step number */}
                      <motion.div 
                        className="w-8 h-8 rounded-full glass-card flex items-center justify-center mb-4 text-sm font-bold text-primary border border-primary/20"
                        whileHover={{ scale: 1.2 }}
                      >
                        {index + 1}
                      </motion.div>
                      
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};
