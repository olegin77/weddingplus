import { Button } from "@/components/ui/button";
import { Sparkles, Heart, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-wedding.jpg";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Elegant wedding couple"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/85 to-background/60" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 animate-float">
        <Heart className="w-12 h-12 text-primary/20" />
      </div>
      <div className="absolute bottom-40 right-20 animate-float" style={{ animationDelay: "1s" }}>
        <Sparkles className="w-16 h-16 text-primary/20" />
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/50 backdrop-blur-sm border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-accent-foreground">
              Первая AI-платформа в Узбекистане
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Увидьте свою{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              мечту о свадьбе
            </span>
            <br />
            ещё до её начала
          </h1>

          <p className="text-xl sm:text-2xl text-muted-foreground mb-8 leading-relaxed">
            Революционная платформа с AI-визуализацией превратит планирование вашей свадьбы в волшебное путешествие
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="text-lg h-14 px-8 shadow-elegant hover:shadow-xl transition-all"
              onClick={() => navigate('/auth')}
            >
              Начать планирование
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="text-lg h-14 px-8 border-2 hover:bg-accent"
              onClick={() => navigate('/ai-visualizer')}
            >
              Посмотреть примеры
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-border/50">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">1500+</div>
              <div className="text-sm text-muted-foreground">Поставщиков</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">10K+</div>
              <div className="text-sm text-muted-foreground">Свадеб</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">98%</div>
              <div className="text-sm text-muted-foreground">Довольны</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
