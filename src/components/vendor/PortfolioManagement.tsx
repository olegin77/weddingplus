import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Camera, Save, Image as ImageIcon, GripVertical, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from "@dnd-kit/sortable";

import { SortablePortfolioItem } from "./SortablePortfolioItem";
import { PortfolioLightbox } from "./PortfolioLightbox";
import { MultiImageUpload } from "./MultiImageUpload";

export const PortfolioManagement = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorProfile, setVendorProfile] = useState<any>(null);
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    business_name: "",
    description: "",
    location: "",
    price_range_min: "",
    price_range_max: "",
    category: "",
  });

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        // First image is cover by default if not set
        if (data.portfolio_images && data.portfolio_images.length > 0) {
          setCoverImage(data.portfolio_images[0]);
        }
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

  const updatePortfolioInDB = async (images: string[]) => {
    if (!vendorProfile) return false;

    const { error } = await supabase
      .from("vendor_profiles")
      .update({ portfolio_images: images })
      .eq("id", vendorProfile.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось обновить портфолио",
      });
      return false;
    }
    return true;
  };

  const handleImagesUploaded = async (urls: string[]) => {
    const updatedImages = [...portfolioImages, ...urls];
    setPortfolioImages(updatedImages);

    if (!coverImage && updatedImages.length > 0) {
      setCoverImage(updatedImages[0]);
    }

    await updatePortfolioInDB(updatedImages);
  };

  const handleRemoveImage = async (url: string) => {
    const updatedImages = portfolioImages.filter((img) => img !== url);
    setPortfolioImages(updatedImages);

    // Update cover if removed
    if (coverImage === url) {
      setCoverImage(updatedImages.length > 0 ? updatedImages[0] : null);
    }

    const success = await updatePortfolioInDB(updatedImages);
    if (success) {
      toast({
        title: "Удалено",
        description: "Изображение удалено из портфолио",
      });
    } else {
      setPortfolioImages(portfolioImages);
    }
  };

  const handleSetCover = async (url: string) => {
    // Move cover image to first position
    const updatedImages = [url, ...portfolioImages.filter((img) => img !== url)];
    setPortfolioImages(updatedImages);
    setCoverImage(url);

    const success = await updatePortfolioInDB(updatedImages);
    if (success) {
      toast({
        title: "Обложка обновлена",
        description: "Изображение установлено как обложка",
      });
    }
  };

  const handlePreviewImage = (url: string) => {
    const index = portfolioImages.indexOf(url);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = portfolioImages.indexOf(active.id as string);
      const newIndex = portfolioImages.indexOf(over.id as string);

      const newImages = arrayMove(portfolioImages, oldIndex, newIndex);
      setPortfolioImages(newImages);

      // Update cover if first position changed
      if (newIndex === 0 || oldIndex === 0) {
        setCoverImage(newImages[0]);
      }

      await updatePortfolioInDB(newImages);
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
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Портфолио ({portfolioImages.length})
          </CardTitle>
          <CardDescription>
            Перетаскивайте изображения для сортировки. Первое изображение будет обложкой.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!vendorProfile && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Сначала сохраните основную информацию профиля, чтобы загружать изображения.
              </AlertDescription>
            </Alert>
          )}

          {vendorProfile && (
            <>
              {/* Upload Zone */}
              <MultiImageUpload
                bucket="portfolio"
                userId={vendorProfile.user_id}
                onUploadComplete={handleImagesUploaded}
                maxSize={10}
                maxFiles={20}
                existingCount={portfolioImages.length}
              />

              {/* Sortable Grid */}
              {portfolioImages.length > 0 && (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={portfolioImages}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {portfolioImages.map((url, index) => (
                        <SortablePortfolioItem
                          key={url}
                          id={url}
                          url={url}
                          index={index}
                          isCover={url === coverImage}
                          onRemove={handleRemoveImage}
                          onPreview={handlePreviewImage}
                          onSetCover={handleSetCover}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              )}

              {portfolioImages.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Ваше портфолио пока пусто</p>
                  <p className="text-sm">Загрузите изображения, чтобы показать свои работы</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Lightbox */}
      <PortfolioLightbox
        images={portfolioImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
};
