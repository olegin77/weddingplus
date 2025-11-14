import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Mail, Trash2, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Invitation {
  id: string;
  template: string;
  title: string;
  couple_names: string;
  event_date: string | null;
  venue_name: string | null;
  custom_message: string | null;
  image_url: string;
  created_at: string;
}

const TEMPLATES = [
  { value: "classic", label: "🎭 Классическое", description: "Традиционный элегантный стиль" },
  { value: "modern", label: "✨ Современное", description: "Минималистичный дизайн" },
  { value: "romantic", label: "💕 Романтическое", description: "Нежные цветы и акварель" },
  { value: "floral", label: "🌸 Цветочное", description: "Обилие цветов и растений" },
  { value: "luxury", label: "👑 Люкс", description: "Золото и премиум стиль" },
  { value: "rustic", label: "🌾 Рустик", description: "Природные текстуры" },
];

export function AIInvitationCreator({ weddingPlanId }: { weddingPlanId: string }) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [template, setTemplate] = useState("classic");
  const [title, setTitle] = useState("Приглашение на свадьбу");
  const [coupleNames, setCoupleNames] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [customMessage, setCustomMessage] = useState("");

  useEffect(() => {
    fetchInvitations();
    fetchWeddingData();
  }, [weddingPlanId]);

  const fetchWeddingData = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_plans")
        .select("wedding_date, venue_location")
        .eq("id", weddingPlanId)
        .single();

      if (error) throw error;
      
      if (data) {
        if (data.wedding_date) setEventDate(data.wedding_date);
        if (data.venue_location) setVenueName(data.venue_location);
      }
    } catch (error) {
      console.error("Error fetching wedding data:", error);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_invitations")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error("Error fetching invitations:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить приглашения",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || !coupleNames.trim()) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля",
      });
      return;
    }

    setGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-wedding-invitation", {
        body: { 
          weddingPlanId, 
          template, 
          title: title.trim(),
          coupleNames: coupleNames.trim(),
          eventDate: eventDate || null,
          venueName: venueName.trim() || null,
          customMessage: customMessage.trim() || null,
        },
      });

      if (error) throw error;

      if (data?.error) {
        if (data.error.includes("Rate limit")) {
          toast({
            variant: "destructive",
            title: "Превышен лимит",
            description: "Слишком много запросов. Попробуйте позже.",
          });
        } else if (data.error.includes("Payment required")) {
          toast({
            variant: "destructive",
            title: "Требуется оплата",
            description: "Пополните баланс в настройках.",
          });
        } else {
          throw new Error(data.error);
        }
        return;
      }

      toast({
        title: "Готово! 💌",
        description: "Приглашение создано",
      });

      fetchInvitations();
    } catch (error) {
      console.error("Error generating invitation:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать приглашение",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("wedding_invitations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Удалено",
        description: "Приглашение удалено",
      });

      fetchInvitations();
    } catch (error) {
      console.error("Error deleting invitation:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить приглашение",
      });
    }
  };

  const handleDownload = (imageUrl: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `invitation-${fileName}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            AI Генератор Приглашений
          </CardTitle>
          <CardDescription>
            Создайте уникальные цифровые приглашения на свадьбу с помощью искусственного интеллекта
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              🎨 AI создаст персонализированное приглашение в выбранном стиле
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="template">Шаблон *</Label>
              <Select value={template} onValueChange={setTemplate}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      <div>
                        <div className="font-medium">{t.label}</div>
                        <div className="text-xs text-muted-foreground">{t.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Заголовок *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Приглашение на свадьбу"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupleNames">Имена пары *</Label>
                <Input
                  id="coupleNames"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                  placeholder="Иван и Мария"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="eventDate">Дата события</Label>
                <Input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venueName">Место проведения</Label>
                <Input
                  id="venueName"
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Название места"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customMessage">Персональное сообщение</Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Будем рады видеть вас на нашем торжестве..."
                rows={3}
              />
            </div>

            <Button onClick={handleGenerate} disabled={generating} className="w-full" size="lg">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создаём приглашение...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Создать приглашение
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Мои приглашения ({invitations.length})
            </CardTitle>
            <CardDescription>Созданные приглашения</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {invitations.map((inv) => (
                <div key={inv.id} className="relative group">
                  <div className="aspect-[3/4] rounded-lg overflow-hidden bg-muted">
                    <img
                      src={inv.image_url}
                      alt={inv.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => handleDownload(inv.image_url, inv.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(inv.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm font-medium">{inv.couple_names}</p>
                    <p className="text-xs text-muted-foreground capitalize">{inv.template}</p>
                    {inv.event_date && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(inv.event_date).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
