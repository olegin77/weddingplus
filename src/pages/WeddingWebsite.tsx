import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Calendar, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimelineEvent {
  time: string;
  title: string;
  description: string;
}

interface WebsiteData {
  id: string;
  slug: string;
  published: boolean;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  hero_date: string | null;
  story_enabled: boolean;
  story_title: string | null;
  story_content: string | null;
  gallery_enabled: boolean;
  gallery_images: string[] | null;
  timeline_enabled: boolean;
  timeline_events: any | null;
  location_enabled: boolean;
  location_name: string | null;
  location_address: string | null;
  location_coordinates: string | null;
  location_map_url: string | null;
  rsvp_enabled: boolean;
  rsvp_deadline: string | null;
  theme_color: string;
  font_family: string;
  meta_title: string | null;
  meta_description: string | null;
}

export default function WeddingWebsite() {
  const { slug } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [website, setWebsite] = useState<WebsiteData | null>(null);

  useEffect(() => {
    if (slug) {
      fetchWebsite();
    }
  }, [slug]);

  const fetchWebsite = async () => {
    try {
      const { data, error } = await supabase
        .from("wedding_websites")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) throw error;
      
      if (!data) {
        toast({
          variant: "destructive",
          title: "Сайт не найден",
          description: "Проверьте правильность ссылки",
        });
        return;
      }

      setWebsite(data);

      // Set page title
      if (data.meta_title) {
        document.title = data.meta_title;
      }

    } catch (error) {
      console.error("Error fetching website:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить сайт",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: website?.theme_color || '#f43f5e' }} />
      </div>
    );
  }

  if (!website) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Сайт не найден</h1>
            <p className="text-muted-foreground">
              Этот свадебный сайт не существует или еще не опубликован
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const themeColor = website.theme_color || '#f43f5e';

  return (
    <div className="min-h-screen" style={{ fontFamily: website.font_family }}>
      {/* Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center text-white"
        style={{
          backgroundImage: website.hero_image_url 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${website.hero_image_url})`
            : `linear-gradient(135deg, ${themeColor}, ${themeColor}dd)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="text-center z-10 p-8">
          <Heart className="w-16 h-16 mx-auto mb-6 fill-current" style={{ color: themeColor }} />
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            {website.hero_title || "Наша свадьба"}
          </h1>
          {website.hero_subtitle && (
            <p className="text-xl md:text-2xl mb-6 opacity-90">
              {website.hero_subtitle}
            </p>
          )}
          {website.hero_date && (
            <div className="flex items-center justify-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              {new Date(website.hero_date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </div>
          )}
        </div>
      </section>

      {/* Story Section */}
      {website.story_enabled && website.story_content && (
        <section className="py-20 px-4 bg-background">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8" style={{ color: themeColor }}>
              {website.story_title || "Наша история"}
            </h2>
            <div className="prose prose-lg mx-auto text-foreground whitespace-pre-wrap">
              {website.story_content}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {website.gallery_enabled && website.gallery_images && website.gallery_images.length > 0 && (
        <section className="py-20 px-4 bg-accent/10">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: themeColor }}>
              Галерея
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {website.gallery_images.map((image, index) => (
                <div 
                  key={index}
                  className="aspect-square rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <img 
                    src={image} 
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Timeline Section */}
      {website.timeline_enabled && website.timeline_events && (website.timeline_events as any as TimelineEvent[]).length > 0 && (
        <section className="py-20 px-4 bg-background">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: themeColor }}>
              Программа дня
            </h2>
            <div className="space-y-6">
              {(website.timeline_events as any as TimelineEvent[]).map((event, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div 
                        className="flex-shrink-0 w-20 h-20 rounded-full flex items-center justify-center text-white font-bold"
                        style={{ backgroundColor: themeColor }}
                      >
                        <div className="text-center">
                          <Clock className="w-6 h-6 mx-auto mb-1" />
                          <div className="text-xs">{event.time}</div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                        <p className="text-muted-foreground">{event.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Location Section */}
      {website.location_enabled && website.location_name && (
        <section className="py-20 px-4 bg-accent/10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: themeColor }}>
              Место проведения
            </h2>
            <Card>
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-6">
                  <MapPin className="w-6 h-6 flex-shrink-0" style={{ color: themeColor }} />
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{website.location_name}</h3>
                    {website.location_address && (
                      <p className="text-muted-foreground">{website.location_address}</p>
                    )}
                  </div>
                </div>
                
                {website.location_map_url && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={website.location_map_url}
                      className="w-full h-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                )}
                
                {website.location_coordinates && (
                  <div className="mt-4">
                    <Button 
                      asChild
                      style={{ backgroundColor: themeColor }}
                      className="w-full"
                    >
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${website.location_coordinates}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Открыть в картах
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* RSVP Section */}
      {website.rsvp_enabled && (
        <section className="py-20 px-4 bg-background">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6" style={{ color: themeColor }}>
              Подтверждение участия
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Пожалуйста, подтвердите ваше участие, чтобы мы могли лучше подготовиться к празднику
            </p>
            {website.rsvp_deadline && (
              <p className="text-sm text-muted-foreground mb-6">
                Просим ответить до {new Date(website.rsvp_deadline).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            )}
            <p className="text-muted-foreground">
              Если вы получили персональное приглашение, используйте ссылку из него для RSVP
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 bg-accent/20 text-center">
        <Heart className="w-8 h-8 mx-auto mb-4 fill-current" style={{ color: themeColor }} />
        <p className="text-muted-foreground">
          Создано с любовью на Weddinguz
        </p>
      </footer>
    </div>
  );
}
