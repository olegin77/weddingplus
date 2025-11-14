import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Sparkles,
  Mail,
  ShoppingBag,
  CreditCard,
  Calendar,
  Users,
} from "lucide-react";

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
    <section className="py-24 bg-gradient-elegant">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Всё что нужно для{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              идеальной свадьбы
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Полный набор AI-инструментов для планирования вашей мечты
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border/50 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader>
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
