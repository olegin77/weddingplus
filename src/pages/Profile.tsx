import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Phone, Camera } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

const Profile = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAvatarDialog, setShowAvatarDialog] = useState(false);
  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (data) {
        setProfile(data);
        setFullName(data.full_name || "");
        setPhone(data.phone || "");
      }
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone,
      })
      .eq("id", profile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить профиль",
      });
    } else {
      toast({
        title: "Успешно!",
        description: "Профиль обновлён",
      });
      fetchProfile();
    }
    
    setSaving(false);
  };

  const handleAvatarUpload = async (url: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить аватар",
      });
    } else {
      toast({
        title: "Успешно!",
        description: "Аватар обновлён",
      });
      setShowAvatarDialog(false);
      fetchProfile();
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-muted-foreground">Загрузка...</div>
        </div>
      </DashboardLayout>
    );
  }

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Профиль</h1>
          <p className="text-muted-foreground mt-1">
            Управляйте вашей личной информацией
          </p>
        </div>

        {/* Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {initials || "?"}
                  </AvatarFallback>
                </Avatar>
                <Dialog open={showAvatarDialog} onOpenChange={setShowAvatarDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 rounded-full w-8 h-8"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Изменить аватар</DialogTitle>
                    </DialogHeader>
                    <ImageUpload
                      bucket="avatars"
                      userId={profile?.id}
                      currentImage={profile?.avatar_url}
                      onUploadComplete={handleAvatarUpload}
                      maxSize={5}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{fullName || "Без имени"}</h2>
                  <Badge variant={profile?.role === "vendor" ? "default" : "secondary"}>
                    {profile?.role === "vendor" ? "Поставщик" : "Пара"}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Edit Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
            <CardDescription>
              Обновите вашу личную информацию
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullname">Полное имя</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="fullname"
                  className="pl-10"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Введите ваше имя"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  className="pl-10"
                  value={profile?.email}
                  disabled
                  placeholder="email@example.com"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Email нельзя изменить
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Телефон</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  className="pl-10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Сохранение..." : "Сохранить изменения"}
              </Button>
              <Button variant="outline" onClick={fetchProfile}>
                Отмена
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Настройки аккаунта</CardTitle>
            <CardDescription>
              Управление вашим аккаунтом
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Тип аккаунта</p>
                <p className="text-sm text-muted-foreground">
                  {profile?.role === "vendor" ? "Поставщик услуг" : "Пара (жених/невеста)"}
                </p>
              </div>
              <Badge variant={profile?.role === "vendor" ? "default" : "secondary"}>
                {profile?.role === "vendor" ? "Vendor" : "Couple"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">Изменить пароль</p>
                <p className="text-sm text-muted-foreground">
                  Обновите ваш пароль для повышения безопасности
                </p>
              </div>
              <Button variant="outline">
                Изменить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
