import { DashboardLayout } from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AIAssistant } from "@/components/AIAssistant";
import { BudgetCalculator } from "@/components/BudgetCalculator";
import { VendorRecommendations } from "@/components/VendorRecommendations";
import { Sparkles } from "lucide-react";

const AIAssistantPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            AI Помощник
          </h1>
          <p className="text-muted-foreground mt-1">
            Ваш персональный AI консультант по планированию свадьбы
          </p>
        </div>

        <Tabs defaultValue="chat" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat">Чат</TabsTrigger>
            <TabsTrigger value="budget">Бюджет</TabsTrigger>
            <TabsTrigger value="vendors">Поставщики</TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-[600px]">
            <AIAssistant type="general" />
          </TabsContent>

          <TabsContent value="budget">
            <div className="grid md:grid-cols-2 gap-6">
              <BudgetCalculator />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Как это работает?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong>1. Введите данные:</strong> Укажите общий бюджет, количество гостей и стиль свадьбы
                  </p>
                  <p>
                    <strong>2. AI анализ:</strong> Искусственный интеллект проанализирует ваши данные и учтет местные цены
                  </p>
                  <p>
                    <strong>3. Получите план:</strong> Вы получите детальное распределение бюджета по категориям с рекомендациями
                  </p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">💡 Совет</h4>
                  <p className="text-sm text-muted-foreground">
                    Стандартное распределение: Площадка (30%), Кейтеринг (25%), Фотограф (10%), Декор (10%), Остальное (25%)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="vendors">
            <div className="grid md:grid-cols-2 gap-6">
              <VendorRecommendations />
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Приоритеты при выборе</h3>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-1">🎯 Первый приоритет (за год)</h4>
                    <p className="text-sm text-muted-foreground">
                      Площадка, фотограф, видеограф - самые популярные поставщики бронируются заранее
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-1">📋 Второй приоритет (за 6-8 месяцев)</h4>
                    <p className="text-sm text-muted-foreground">
                      Кейтеринг, декоратор, музыканты - важные элементы атмосферы
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold mb-1">✨ Третий приоритет (за 3-4 месяца)</h4>
                    <p className="text-sm text-muted-foreground">
                      Флорист, визажист, транспорт - завершающие штрихи
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AIAssistantPage;