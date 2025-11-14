import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export const CTA = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });
  }, []);

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl bg-gradient-hero p-12 shadow-elegant overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />

            <div className="relative z-10 text-center text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Начните планирование бесплатно
                </span>
              </div>

              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Готовы увидеть свою свадьбу мечты?
              </h2>

              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Присоединяйтесь к тысячам пар, которые уже планируют свою идеальную свадьбу с WeddingTech UZ
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Ваш email"
                  className="h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/50"
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="h-14 px-8 whitespace-nowrap hover:scale-105 transition-transform"
                  onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
                >
                  Начать
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>

              <p className="text-sm text-white/70 mt-4">
                Бесплатно навсегда. Кредитная карта не требуется.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
