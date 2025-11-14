import { TrendingUp, Users, DollarSign, Star } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "305K+",
    label: "Свадеб в год",
    description: "только в Узбекистане",
  },
  {
    icon: DollarSign,
    value: "$6.1B",
    label: "Объём рынка",
    description: "потенциал роста",
  },
  {
    icon: Star,
    value: "1500+",
    label: "Поставщиков",
    description: "верифицированных",
  },
  {
    icon: TrendingUp,
    value: "98%",
    label: "Удовлетворённость",
    description: "наших клиентов",
  },
];

export const Stats = () => {
  return (
    <section className="py-24 bg-gradient-hero relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Цифры говорят сами за себя
          </h2>
          <p className="text-xl text-white/90">
            Доверьтесь платформе, которой доверяют тысячи пар
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm mb-4">
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold text-white mb-2">
                {stat.value}
              </div>
              <div className="text-xl font-semibold text-white/90 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-white/70">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
