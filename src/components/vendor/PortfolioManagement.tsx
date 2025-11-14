import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, X } from "lucide-react";
import ImageUpload from "@/components/ImageUpload";

export const PortfolioManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    location: "",
    price_range_min: "",
    price_range_max: "",
    category: "",
  });

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("vendor_profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          setVendorProfile(null);
        } else {
          throw error;
        }
      } else {
        setVendorProfile(data);
        setPortfolioImages(data.portfolio_images || []);
        setFormData({
          business_name: data.business_name || "",
          description: data.description || "",
          location: data.location || "",
          price_range_min: data.price_range_min?.toString() || "",
          price_range_max: data.price_range_max?.toString() || "",
          category: data.category || "",
        });
      }
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить профиль",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const profileData = {
        user_id: user.id,
        business_name: formData.business_name,
        description: formData.description,
        location: formData.location,
        price_range_min: parseFloat(formData.price_range_min) || null,
        price_range_max: parseFloat(formData.price_range_max) || null,
        category: formData.category as any,
      };

      if (vendorProfile) {
        const { error } = await supabase
          .from("vendor_profiles")
          .update(profileData)
          .eq("id", vendorProfile.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vendor_profiles")
          .insert([profileData]);

        if (error) throw error;
      }

      toast({
        title: "Успешно",
        description: "Профиль обновлен",
      });

      fetchVendorProfile();
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить профиль",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePortfolioImageUpload = async (url: string) => {
    const updatedImages = [...portfolioImages, url];
    setPortfolioImages(updatedImages);

    const { error } = await supabase
      .from("vendor_profiles")
      .update({ portfolio_images: updatedImages })
      .eq("id", vendorProfile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось добавить изображение",
      });
      setPortfolioImages(portfolioImages);
    }
  };

  const handleRemovePortfolioImage = async (url: string) => {
    const updatedImages = portfolioImages.filter(img => img !== url);
    setPortfolioImages(updatedImages);

    const { error } = await supabase
      .from("vendor_profiles")
      .update({ portfolio_images: updatedImages })
      .eq("id", vendorProfile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить изображение",
      });
      setPortfolioImages(portfolioImages);
    } else {
      toast({
        title: "Удалено",
        description: "Изображение удалено из портфолио",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Загрузка...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name">Название бизнеса *</Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                placeholder="Elegant Events Photography"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="photographer"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Расскажите о своих услугах..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Локация</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ташкент, Узбекистан"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price_min">Минимальная цена ($)</Label>
              <Input
                id="price_min"
                type="number"
                value={formData.price_range_min}
                onChange={(e) => setFormData({ ...formData, price_range_min: e.target.value })}
                placeholder="500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_max">Максимальная цена ($)</Label>
              <Input
                id="price_max"
                type="number"
                value={formData.price_range_max}
                onChange={(e) => setFormData({ ...formData, price_range_max: e.target.value })}
                placeholder="2000"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Портфолио ({portfolioImages.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Portfolio Images */}
          {portfolioImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {portfolioImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Portfolio ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemovePortfolioImage(url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Upload New Image */}
          {vendorProfile && (
            <ImageUpload
              bucket="portfolio"
              userId={vendorProfile.user_id}
              onUploadComplete={handlePortfolioImageUpload}
              maxSize={10}
            />
          )}

          {!vendorProfile && (
            <p className="text-sm text-muted-foreground">
              Сначала сохраните основную информацию профиля
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};