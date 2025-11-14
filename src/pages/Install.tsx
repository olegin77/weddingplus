import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Smartphone, Download, CheckCircle2, Apple, Chrome } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Listen for the beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast({
        title: "Установка недоступна",
        description: "Используйте меню браузера для установки приложения",
      });
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      toast({
        title: "Приложение установлено!",
        description: "WeddingTech UZ добавлен на главный экран",
      });
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <Smartphone className="h-16 w-16 mx-auto text-primary" />
          <h1 className="text-4xl font-bold">Установите WeddingTech UZ</h1>
          <p className="text-xl text-muted-foreground">
            Получите лучший опыт работы с приложением
          </p>
        </div>

        {isInstalled ? (
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
                <CardTitle>Приложение уже установлено</CardTitle>
              </div>
              <CardDescription>
                WeddingTech UZ успешно установлен на вашем устройстве!
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {isIOS ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Apple className="h-6 w-6" />
                    <CardTitle>Установка на iOS</CardTitle>
                  </div>
                  <CardDescription>
                    Следуйте этим шагам для установки на iPhone или iPad
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        1
                      </div>
                      <div>
                        <p className="font-semibold">Откройте меню Safari</p>
                        <p className="text-sm text-muted-foreground">
                          Нажмите кнопку "Поделиться" внизу экрана
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        2
                      </div>
                      <div>
                        <p className="font-semibold">Добавьте на главный экран</p>
                        <p className="text-sm text-muted-foreground">
                          Прокрутите и выберите "На экран «Домой»"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        3
                      </div>
                      <div>
                        <p className="font-semibold">Подтвердите установку</p>
                        <p className="text-sm text-muted-foreground">
                          Нажмите "Добавить" в правом верхнем углу
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Chrome className="h-6 w-6" />
                    <CardTitle>Установка на Android</CardTitle>
                  </div>
                  <CardDescription>
                    Установите приложение одним нажатием
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {deferredPrompt ? (
                    <Button 
                      onClick={handleInstallClick} 
                      size="lg" 
                      className="w-full"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Установить приложение
                    </Button>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Если кнопка установки не появилась, вы можете:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        <li>Откройте меню браузера (⋮)</li>
                        <li>Выберите "Установить приложение" или "Добавить на главный экран"</li>
                        <li>Подтвердите установку</li>
                      </ol>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Преимущества установки</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Работает офлайн</p>
                  <p className="text-sm text-muted-foreground">
                    Доступ к вашим планам даже без интернета
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Быстрый запуск</p>
                  <p className="text-sm text-muted-foreground">
                    Открывается как обычное приложение с главного экрана
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Полноэкранный режим</p>
                  <p className="text-sm text-muted-foreground">
                    Работает без панелей браузера для лучшего опыта
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Push-уведомления</p>
                  <p className="text-sm text-muted-foreground">
                    Получайте напоминания о важных событиях
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Install;