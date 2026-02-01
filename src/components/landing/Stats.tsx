import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { TrendingUp, Users, DollarSign, Star, Gem } from "lucide-react";
import { TiltCard } from "./TiltCard";

const stats = [
  {
    icon: Users,
    value: 305,
    suffix: "K+",
    label: "Свадеб в год",
    description: "только в Узбекистане",
  },
  {
    icon: DollarSign,
    value: 6.1,
    prefix: "$",
    suffix: "B",
    label: "Объём рынка",
    description: "потенциал роста",
  },
  {
    icon: Gem,
    value: 1500,
    suffix: "+",
    label: "Поставщиков",
    description: "верифицированных",
  },
  {
    icon: TrendingUp,
    value: 98,
    suffix: "%",
    label: "Удовлетворённость",
    description: "наших клиентов",
  },
];

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
}

const AnimatedNumber = ({ value, prefix = "", suffix = "" }: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      const duration = 2000;
      const startTime = Date.now();
      const isDecimal = value % 1 !== 0;
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 4);
        const current = eased * value;
        
        setDisplayValue(isDecimal ? Math.round(current * 10) / 10 : Math.floor(current));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};

interface StatCardProps {
  stat: typeof stats[0];
  index: number;
}

const StatCard = ({ stat, index }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ 
        duration: 0.6, 
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
    >
      <TiltCard tiltAmount={12} scale={1.05} glareEnabled>
        <motion.div
          className="text-center p-6 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 hover:bg-white/20 transition-all duration-300 relative overflow-hidden group cursor-default"
        >
          {/* Shimmer effect on hover */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-100"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)",
            }}
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-sm mb-4 shadow-lg relative"
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring" as const, stiffness: 300 }}
          >
            {/* Icon glow */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-white blur-xl opacity-30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: index * 0.5 }}
            />
            <stat.icon className="w-8 h-8 text-white relative z-10" />
          </motion.div>
          
          <motion.div 
            className="text-5xl font-bold text-white mb-2"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.3 + index * 0.1, type: "spring" as const, stiffness: 200 }}
          >
            <AnimatedNumber 
              value={stat.value} 
              prefix={stat.prefix || ""} 
              suffix={stat.suffix || ""} 
            />
          </motion.div>
          
          <div className="text-xl font-semibold text-white/95 mb-1">
            {stat.label}
          </div>
          <div className="text-sm text-white/75">{stat.description}</div>
          
          {/* Bottom glow line on hover */}
          <motion.div
            className="absolute bottom-0 left-0 h-1 bg-white/60 rounded-b-2xl"
            initial={{ width: 0 }}
            whileHover={{ width: "100%" }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      </TiltCard>
    </motion.div>
  );
};

export const Stats = () => {
  return (
    <section className="py-24 gradient-luxe relative overflow-hidden">
      {/* Animated decorative elements */}
      <motion.div 
        className="absolute top-0 left-1/4 w-96 h-96 bg-white/12 rounded-full blur-3xl blob"
        animate={{ 
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/8 rounded-full blur-3xl blob"
        animate={{ 
          x: [0, -50, 0],
          y: [0, 30, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />
      
      {/* Floating particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-white/35"
          style={{
            left: `${10 + i * 12}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut",
          }}
        />
      ))}
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2 
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            Цифры говорят сами за себя
          </motion.h2>
          <motion.p 
            className="text-xl text-white/90"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Доверьтесь платформе, которой доверяют тысячи пар
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
