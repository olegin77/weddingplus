import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AIAssistant } from "@/components/AIAssistant";
import { Calculator, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const BudgetCalculator = () => {
  const [showAI, setShowAI] = useState(false);
  const [formData, setFormData] = useState({
    totalBudget: "",
    guestCount: "",
    weddingStyle: "",
    location: "",
  });
  const [aiPrompt, setAiPrompt] = useState("");

  const handleCalculate = () => {
    const prompt = `Помогите распределить бюджет свадьбы:
- Общий бюджет: $${formData.totalBudget}
- Количество гостей: ${formData.guestCount}
- Стиль свадьбы: ${formData.weddingStyle || "классический"}
- Локация: ${formData.location || "Ташкент"}

Распределите бюджет по категориям с процентами и примерными суммами.`;

    setAiPrompt(prompt);
    setShowAI(true);
  };

  const isFormValid = formData.totalBudget && formData.guestCount;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Калькулятор бюджета
            </CardTitle>
            <CardDescription>
              AI поможет распределить бюджет по категориям
            </CardDescription>
          </div>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="budget">Общий бюджет ($)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="10000"
              value={formData.totalBudget}
              onChange={(e) => setFormData({ ...formData, totalBudget: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guests">Количество гостей</Label>
            <Input
              id="guests"
              type="number"
              placeholder="100"
              value={formData.guestCount}
              onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="style">Стиль свадьбы (опционально)</Label>
          <Input
            id="style"
            placeholder="Классический, современный, рустик..."
            value={formData.weddingStyle}
            onChange={(e) => setFormData({ ...formData, weddingStyle: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Локация (опционально)</Label>
          <Input
            id="location"
            placeholder="Ташкент"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
        </div>

        <Dialog open={showAI} onOpenChange={setShowAI}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              disabled={!isFormValid}
              onClick={handleCalculate}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Рассчитать с AI
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[600px]">
            <DialogHeader>
              <DialogTitle>AI Калькулятор бюджета</DialogTitle>
            </DialogHeader>
            <div className="h-full">
              <AIAssistant type="budget" initialMessage={aiPrompt} />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};