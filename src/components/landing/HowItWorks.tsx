import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search, Calendar, PartyPopper } from "lucide-react";

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
    title: "Наслаждайтесь свадьбой",
    description:
      "Всё организовано, оплачено и подтверждено. Просто наслаждайтесь вашим днём!",
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Как это{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              работает?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Четыре простых шага к свадьбе вашей мечты
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-16 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary to-primary/20 z-0" />
                )}

                <Card className="relative z-10 h-full hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-hero flex items-center justify-center mb-4 shadow-lg">
                        <step.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
