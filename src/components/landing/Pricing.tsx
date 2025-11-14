import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Базовый",
    price: "Бесплатно",
    description: "Идеально для начала планирования",
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
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4" variant="secondary">
            Прозрачные цены
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Выберите свой{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              идеальный план
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Гибкие тарифы для каждого этапа планирования вашей свадьбы
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${
                plan.highlighted
                  ? "border-primary shadow-elegant scale-105 z-10"
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-hero text-white px-4 py-1">
                    Популярный
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="mb-4">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  {plan.price === "Бесплатно"
                    ? "Начать бесплатно"
                    : "Выбрать план"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12 text-sm text-muted-foreground">
          <p>
            🔒 Безопасные платежи через Payme, Click и Stripe • 💳 Возврат
            средств в течение 14 дней
          </p>
        </div>
      </div>
    </section>
  );
};
