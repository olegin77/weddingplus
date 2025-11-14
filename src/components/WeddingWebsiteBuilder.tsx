import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  ExternalLink, 
  Save, 
  Eye, 
  Plus,
  Trash2,
  Globe
} from "lucide-react";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

interface WeddingWebsiteBuilderProps {
  weddingPlanId: string;
}

export function WeddingWebsiteBuilder({ weddingPlanId }: WeddingWebsiteBuilderProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  
  // Form state
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState("");
  const [heroDate, setHeroDate] = useState("");
  
  const [storyEnabled, setStoryEnabled] = useState(true);
  const [storyTitle, setStoryTitle] = useState("Наша история");
  const [storyContent, setStoryContent] = useState("");
  
  const [galleryEnabled, setGalleryEnabled] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  
  const [timelineEnabled, setTimelineEnabled] = useState(true);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationMapUrl, setLocationMapUrl] = useState("");
  
  const [rsvpEnabled, setRsvpEnabled] = useState(true);
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  
  const [themeColor, setThemeColor] = useState("#f43f5e");

  useEffect(() => {
    fetchWebsite();
  }, [weddingPlanId]);

  const fetchWebsite = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_websites")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setWebsiteId(data.id);
        setSlug(data.slug || "");
        setPublished(data.published || false);
        setHeroTitle(data.hero_title || "");
        setHeroSubtitle(data.hero_subtitle || "");
        setHeroImageUrl(data.hero_image_url || "");
        setHeroDate(data.hero_date ? new Date(data.hero_date).toISOString().slice(0, 16) : "");
        setStoryEnabled(data.story_enabled ?? true);
        setStoryTitle(data.story_title || "Наша история");
        setStoryContent(data.story_content || "");
        setGalleryEnabled(data.gallery_enabled ?? true);
        setGalleryImages(data.gallery_images || []);
        setTimelineEnabled(data.timeline_enabled ?? true);
        setTimelineEvents((data.timeline_events as any as TimelineEvent[]) || []);
        setLocationEnabled(data.location_enabled ?? true);
        setLocationName(data.location_name || "");
        setLocationAddress(data.location_address || "");
        setLocationMapUrl(data.location_map_url || "");
        setRsvpEnabled(data.rsvp_enabled ?? true);
        setRsvpDeadline(data.rsvp_deadline ? new Date(data.rsvp_deadline).toISOString().slice(0, 16) : "");
        setThemeColor(data.theme_color || "#f43f5e");
      }
    } catch (error) {
      console.error("Error fetching website:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные сайта",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!slug) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Укажите URL адрес сайта",
      });
      return;
    }

    setSaving(true);

    try {
      const websiteData: any = {
        wedding_plan_id: weddingPlanId,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        published,
        hero_title: heroTitle || null,
        hero_subtitle: heroSubtitle || null,
        hero_image_url: heroImageUrl || null,
        hero_date: heroDate ? new Date(heroDate).toISOString() : null,
        story_enabled: storyEnabled,
        story_title: storyTitle || null,
        story_content: storyContent || null,
        gallery_enabled: galleryEnabled,
        gallery_images: galleryImages.length > 0 ? galleryImages : null,
        timeline_enabled: timelineEnabled,
        timeline_events: timelineEvents.length > 0 ? timelineEvents : null,
        location_enabled: locationEnabled,
        location_name: locationName || null,
        location_address: locationAddress || null,
        location_map_url: locationMapUrl || null,
        rsvp_enabled: rsvpEnabled,
        rsvp_deadline: rsvpDeadline ? new Date(rsvpDeadline).toISOString() : null,
        theme_color: themeColor,
      };

      if (websiteId) {
        const { error } = await supabase
          .from("wedding_websites")
          .update(websiteData)
          .eq("id", websiteId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("wedding_websites")
          .insert([websiteData])
          .select()
          .single();
        if (error) throw error;
        setWebsiteId(data.id);
      }

      toast({
        title: "Сохранено!",
        description: "Свадебный сайт успешно обновлен",
      });

    } catch (error: any) {
      console.error("Error saving website:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: error.message || "Не удалось сохранить изменения",
      });
    } finally {
      setSaving(false);
    }
  };

  const addTimelineEvent = () => {
    setTimelineEvents([...timelineEvents, { time: "", title: "", description: "" }]);
  };

  const updateTimelineEvent = (index: number, field: keyof TimelineEvent, value: string) => {
    const updated = [...timelineEvents];
    updated[index][field] = value;
    setTimelineEvents(updated);
  };

  const removeTimelineEvent = (index: number) => {
    setTimelineEvents(timelineEvents.filter((_, i) => i !== index));
  };

  const addGalleryImage = (url: string) => {
    setGalleryImages([...galleryImages, url]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const websiteUrl = slug ? `${window.location.origin}/wedding/${slug}` : "";

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Свадебный сайт</CardTitle>
              <CardDescription>
                Создайте красивую персональную страницу для вашей свадьбы
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {websiteUrl && published && (
                <Button
                  variant="outline"
                  onClick={() => window.open(websiteUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Открыть
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="slug">URL адрес *</Label>
              <div className="flex gap-2">
                <Globe className="w-5 h-5 text-muted-foreground mt-2" />
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="vashe-imya-svadba"
                />
              </div>
              {slug && (
                <p className="text-xs text-muted-foreground">
                  {websiteUrl}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between space-x-2 pt-8">
              <Label htmlFor="published">Опубликовать сайт</Label>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="story">История</TabsTrigger>
          <TabsTrigger value="gallery">Галерея</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="location">Место</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero секция</CardTitle>
              <CardDescription>Главный экран вашего сайта</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="heroTitle">Заголовок</Label>
                <Input
                  id="heroTitle"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="Анна & Иван"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroSubtitle">Подзаголовок</Label>
                <Input
                  id="heroSubtitle"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Мы женимся!"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroDate">Дата свадьбы</Label>
                <Input
                  id="heroDate"
                  type="datetime-local"
                  value={heroDate}
                  onChange={(e) => setHeroDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="heroImage">Фоновое изображение</Label>
                <Input
                  id="heroImage"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="URL изображения"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="themeColor">Цвет темы</Label>
                <Input
                  id="themeColor"
                  type="color"
                  value={themeColor}
                  onChange={(e) => setThemeColor(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="story">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Наша история</CardTitle>
                  <CardDescription>Расскажите вашу love story</CardDescription>
                </div>
                <Switch
                  checked={storyEnabled}
                  onCheckedChange={setStoryEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="storyTitle">Заголовок</Label>
                <Input
                  id="storyTitle"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  disabled={!storyEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="storyContent">Текст истории</Label>
                <Textarea
                  id="storyContent"
                  value={storyContent}
                  onChange={(e) => setStoryContent(e.target.value)}
                  rows={10}
                  placeholder="Расскажите, как вы познакомились..."
                  disabled={!storyEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Фотогалерея</CardTitle>
                  <CardDescription>Добавьте ваши фотографии</CardDescription>
                </div>
                <Switch
                  checked={galleryEnabled}
                  onCheckedChange={setGalleryEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {galleryImages.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeGalleryImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Label>Добавить фото</Label>
                <Input
                  placeholder="URL изображения"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value) {
                      addGalleryImage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  disabled={!galleryEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Нажмите Enter чтобы добавить
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Программа дня</CardTitle>
                  <CardDescription>Timeline событий свадьбы</CardDescription>
                </div>
                <Switch
                  checked={timelineEnabled}
                  onCheckedChange={setTimelineEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {timelineEvents.map((event, index) => (
                <Card key={index}>
                  <CardContent className="pt-6 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="15:00"
                        value={event.time}
                        onChange={(e) => updateTimelineEvent(index, 'time', e.target.value)}
                        className="w-24"
                      />
                      <Input
                        placeholder="Название события"
                        value={event.title}
                        onChange={(e) => updateTimelineEvent(index, 'title', e.target.value)}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => removeTimelineEvent(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <Textarea
                      placeholder="Описание"
                      value={event.description}
                      onChange={(e) => updateTimelineEvent(index, 'description', e.target.value)}
                      rows={2}
                    />
                  </CardContent>
                </Card>
              ))}
              <Button
                variant="outline"
                className="w-full"
                onClick={addTimelineEvent}
                disabled={!timelineEnabled}
              >
                <Plus className="w-4 h-4 mr-2" />
                Добавить событие
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Место проведения</CardTitle>
                  <CardDescription>Информация о локации</CardDescription>
                </div>
                <Switch
                  checked={locationEnabled}
                  onCheckedChange={setLocationEnabled}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="locationName">Название места</Label>
                <Input
                  id="locationName"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="Grand Palace Hall"
                  disabled={!locationEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationAddress">Адрес</Label>
                <Input
                  id="locationAddress"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="г. Ташкент, ул. Примерная, 123"
                  disabled={!locationEnabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="locationMapUrl">Google Maps Embed URL</Label>
                <Textarea
                  id="locationMapUrl"
                  value={locationMapUrl}
                  onChange={(e) => setLocationMapUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  rows={3}
                  disabled={!locationEnabled}
                />
                <p className="text-xs text-muted-foreground">
                  Google Maps → Share → Embed a map
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
