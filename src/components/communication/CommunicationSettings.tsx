import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";
import { 
  Mic, 
  MessageCircle, 
  Settings, 
  Send, 
  Copy, 
  ExternalLink,
  Loader2,
  CheckCircle,
  AlertCircle,
  Phone,
  Users
} from "lucide-react";

export function CommunicationSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { weddingPlanId, isLoading: planLoading } = useWeddingPlanId();

  // Fetch communication settings
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: ["communication-settings", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return null;

      const { data, error } = await supabase
        .from("communication_settings")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!weddingPlanId,
  });

  // Fetch Telegram connection
  const { data: telegramConnection } = useQuery({
    queryKey: ["telegram-connection", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return null;

      const { data, error } = await supabase
        .from("telegram_connections")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!weddingPlanId,
  });

  // Fetch voice RSVP sessions stats
  const { data: voiceSessions } = useQuery({
    queryKey: ["voice-sessions-stats", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return { total: 0, completed: 0 };

      const { data, error } = await supabase
        .from("voice_rsvp_sessions")
        .select("status")
        .eq("wedding_plan_id", weddingPlanId);

      if (error) throw error;
      return {
        total: data?.length || 0,
        completed: data?.filter(s => s.status === "completed").length || 0,
      };
    },
    enabled: !!weddingPlanId,
  });

  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: async (newSettings: any) => {
      if (!weddingPlanId) throw new Error("No wedding plan");

      const { data, error } = await supabase
        .from("communication_settings")
        .upsert({
          wedding_plan_id: weddingPlanId,
          ...newSettings,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communication-settings"] });
      toast({ title: "Настройки сохранены" });
    },
    onError: (error: Error) => {
      toast({ title: "Ошибка", description: error.message, variant: "destructive" });
    },
  });

  // Create Telegram connection
  const createTelegramConnection = useMutation({
    mutationFn: async () => {
      if (!weddingPlanId) throw new Error("No wedding plan");

      const webhookSecret = crypto.randomUUID();

      const { data, error } = await supabase
        .from("telegram_connections")
        .insert({
          wedding_plan_id: weddingPlanId,
          webhook_secret: webhookSecret,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["telegram-connection"] });
      toast({ title: "Telegram подключение создано" });
    },
  });

  const webhookUrl = telegramConnection
    ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/telegram-webhook?secret=${telegramConnection.webhook_secret}`
    : "";

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    toast({ title: "Скопировано" });
  };

  if (planLoading || settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Голосовые RSVP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {voiceSessions?.completed || 0} / {voiceSessions?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">завершённых сессий</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              Telegram ответы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {telegramConnection?.total_responses_received || 0}
            </div>
            <p className="text-xs text-muted-foreground">полученных ответов</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              Каналы
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              {settings?.voice_rsvp_enabled && <Badge>Голос</Badge>}
              {settings?.telegram_enabled && <Badge>Telegram</Badge>}
              {!settings?.voice_rsvp_enabled && !settings?.telegram_enabled && (
                <span className="text-muted-foreground text-sm">Не настроены</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="voice">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            <span className="hidden sm:inline">Голосовой RSVP</span>
          </TabsTrigger>
          <TabsTrigger value="telegram" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Telegram</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Настройки</span>
          </TabsTrigger>
        </TabsList>

        {/* Voice RSVP Tab */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Голосовой RSVP с AI
              </CardTitle>
              <CardDescription>
                Гости могут подтвердить присутствие голосом через AI-ассистента
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Включить голосовой RSVP</Label>
                  <p className="text-sm text-muted-foreground">
                    Добавляет кнопку голосового ответа в приглашения
                  </p>
                </div>
                <Switch
                  checked={settings?.voice_rsvp_enabled || false}
                  onCheckedChange={(checked) => 
                    saveSettings.mutate({ voice_rsvp_enabled: checked })
                  }
                />
              </div>

              {settings?.voice_rsvp_enabled && (
                <>
                  <div className="p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-2">Как это работает:</h4>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Гость открывает приглашение и нажимает "Ответить голосом"</li>
                      <li>AI-ассистент спрашивает о присутствии и предпочтениях</li>
                      <li>Ответ автоматически сохраняется в список гостей</li>
                    </ol>
                  </div>

                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-amber-800">Требуется настройка</p>
                        <p className="text-sm text-amber-700">
                          Для работы голосового RSVP необходимо добавить ELEVENLABS_API_KEY 
                          и создать агента в ElevenLabs с ID ELEVENLABS_VOICE_RSVP_AGENT_ID
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Telegram Tab */}
        <TabsContent value="telegram" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Telegram Bot
              </CardTitle>
              <CardDescription>
                Гости могут отвечать на приглашения через Telegram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Включить Telegram RSVP</Label>
                  <p className="text-sm text-muted-foreground">
                    Добавляет ссылку на Telegram-бота в приглашения
                  </p>
                </div>
                <Switch
                  checked={settings?.telegram_enabled || false}
                  onCheckedChange={(checked) => 
                    saveSettings.mutate({ telegram_enabled: checked })
                  }
                />
              </div>

              {settings?.telegram_enabled && (
                <>
                  {!telegramConnection ? (
                    <Button onClick={() => createTelegramConnection.mutate()}>
                      Создать подключение
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg space-y-2">
                        <Label>Webhook URL для бота</Label>
                        <div className="flex gap-2">
                          <Input value={webhookUrl} readOnly className="font-mono text-xs" />
                          <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Установите этот URL как webhook в настройках вашего Telegram бота
                        </p>
                      </div>

                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Настройка бота:</h4>
                        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                          <li>Создайте бота через @BotFather в Telegram</li>
                          <li>Добавьте TELEGRAM_BOT_TOKEN в секреты</li>
                          <li>Установите webhook: 
                            <code className="ml-1 text-xs bg-muted px-1 rounded">
                              https://api.telegram.org/bot{'<TOKEN>'}/setWebhook?url={'<WEBHOOK_URL>'}
                            </code>
                          </li>
                          <li>Отправьте гостям ссылку: t.me/{'<bot_username>'}?start={'<invitation_token>'}
                          </li>
                        </ol>
                      </div>

                      {telegramConnection.bot_username && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Бот подключён: @{telegramConnection.bot_username}</span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* General Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Общие настройки</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Язык голосового ассистента</Label>
                <select
                  className="w-full border rounded-md p-2"
                  value={settings?.voice_language || "ru"}
                  onChange={(e) => saveSettings.mutate({ voice_language: e.target.value })}
                >
                  <option value="ru">Русский</option>
                  <option value="uz">Узбекский</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Автоматические напоминания</Label>
                  <p className="text-sm text-muted-foreground">
                    Отправлять напоминания гостям, не ответившим на приглашение
                  </p>
                </div>
                <Switch
                  checked={settings?.auto_reminders_enabled ?? true}
                  onCheckedChange={(checked) => 
                    saveSettings.mutate({ auto_reminders_enabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Шаблон подтверждения</Label>
                <Textarea
                  placeholder="Спасибо за ответ! Мы ждём вас на нашей свадьбе."
                  value={settings?.confirmation_message_template || ""}
                  onChange={(e) => 
                    saveSettings.mutate({ confirmation_message_template: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CommunicationSettings;
