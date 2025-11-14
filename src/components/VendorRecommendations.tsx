import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AIAssistant } from "@/components/AIAssistant";
import { Lightbulb, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export const VendorRecommendations = () => {
  const [showAI, setShowAI] = useState(false);
  const [formData, setFormData] = useState({
    weddingStyle: "",
    budget: "",
    priorities: "",
  });
  const [aiPrompt, setAiPrompt] = useState("");

  const handleGetRecommendations = () => {
    const prompt = `Порекомендуйте поставщиков для свадьбы:
- Стиль свадьбы: ${formData.weddingStyle || "не указан"}
- Бюджет: ${formData.budget ? "$" + formData.budget : "не указан"}
- Приоритеты: ${formData.priorities || "все важно"}

Подскажите, каких поставщиков нужно бронировать в первую очередь, на что обратить внимание при выборе, и дайте практические советы.`;

    setAiPrompt(prompt);
    setShowAI(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Рекомендации поставщиков
            </CardTitle>
            <CardDescription>
              AI поможет выбрать правильных поставщиков
            </CardDescription>
          </div>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="wedding-style">Стиль свадьбы</Label>
          <Input
            id="wedding-style"
            placeholder="Классический, современный, бохо..."
            value={formData.weddingStyle}
            onChange={(e) => setFormData({ ...formData, weddingStyle: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="vendor-budget">Бюджет ($)</Label>
          <Input
            id="vendor-budget"
            type="number"
            placeholder="10000"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="priorities">Что для вас самое важное?</Label>
          <Textarea
            id="priorities"
            placeholder="Например: красивые фото, вкусная еда, живая музыка..."
            value={formData.priorities}
            onChange={(e) => setFormData({ ...formData, priorities: e.target.value })}
            rows={3}
          />
        </div>

        <Dialog open={showAI} onOpenChange={setShowAI}>
          <DialogTrigger asChild>
            <Button className="w-full" onClick={handleGetRecommendations}>
              <Sparkles className="w-4 h-4 mr-2" />
              Получить рекомендации
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl h-[600px]">
            <DialogHeader>
              <DialogTitle>AI Рекомендации поставщиков</DialogTitle>
            </DialogHeader>
            <div className="h-full">
              <AIAssistant type="vendor" initialMessage={aiPrompt} />
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};