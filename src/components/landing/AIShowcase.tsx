import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Video, Image as ImageIcon, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import aiVisualizerImage from "@/assets/ai-visualizer.jpg";
import invitationImage from "@/assets/invitation-creator.jpg";
import marketplaceImage from "@/assets/marketplace.jpg";

const showcaseItems = [
  {
    title: "AI Wedding Visualizer",
    description:
      "Загрузите фото себя и партнёра, выбирайте стиль (traditional, modern, royal, garden) и получите реалистичную 3D визуализацию вашей свадьбы с вашими лицами!",
    image: aiVisualizerImage,
    icon: Sparkles,
    badge: "Революционная функция",
    link: "/ai-visualizer",
    features: [
      "20+ стилей свадеб",
      "Реалистичная вставка лиц",
      "360° видео preview",
      "4K качество",
    ],
  },
  {
    title: "AI Invitation Creator",
    description:
      "Создавайте профессиональные видео-приглашения с анимациями за минуты. 20+ шаблонов с персонализацией и экспортом в MP4, GIF, PDF.",
    image: invitationImage,
    icon: Video,
    badge: "Экономия времени",
    link: "/ai-invitations",
    features: [
      "Видео-приглашения",
      "20+ шаблонов",
      "Автоматическая анимация",
      "Быстрый экспорт",
    ],
  },
  {
    title: "Vendor Marketplace",
    description:
      "Найдите идеальных поставщиков из 1500+ верифицированных профессионалов. Реальные отзывы, портфолио и прямое общение.",
    image: marketplaceImage,
    icon: ImageIcon,
    badge: "1500+ поставщиков",
    link: "/marketplace",
    features: [
      "Верифицированные вендоры",
      "Реальные отзывы",
      "Умный поиск",
      "Онлайн бронирование",
    ],
  },
];

export const AIShowcase = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  const handleNavigate = (link: string) => {
    if (isAuthenticated) {
      navigate(link);
    } else {
      navigate('/auth');
    }
  };

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4" variant="secondary">
            <Wand2 className="w-4 h-4 mr-2" />
            Powered by AI
          </Badge>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Технологии будущего уже{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              сегодня
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Первая платформа в СНГ с AI-визуализацией свадеб
          </p>
        </div>

        <div className="space-y-32">
          {showcaseItems.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } gap-12 items-center`}
            >
              {/* Image */}
              <div className="flex-1 animate-fade-in">
                <div className="relative rounded-2xl overflow-hidden shadow-elegant group">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Badge className="mb-4" variant="outline">
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.badge}
                </Badge>
                <h3 className="text-3xl font-bold mb-4">{item.title}</h3>
                <p className="text-lg text-muted-foreground mb-6">
                  {item.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {item.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-gradient-hero" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  size="lg" 
                  className="shadow-elegant"
                  onClick={() => handleNavigate(item.link)}
                >
                  Попробовать сейчас
                  <item.icon className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
