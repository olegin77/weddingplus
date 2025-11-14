import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Download } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  const navigation = [
    { name: t('nav.home'), href: "#features" },
    { name: t('marketplace.title'), href: "#marketplace" },
    { name: "Цены", href: "#pricing" },
    { name: "О нас", href: "#about" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary fill-primary" />
            <span className="text-xl font-bold">WeddingTech UZ</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="outline" onClick={() => window.location.href = '/install'}>
              <Download className="w-4 h-4 mr-2" />
              {t('nav.install')}
            </Button>
            <Button variant="ghost" onClick={() => window.location.href = '/auth'}>
              {t('nav.signIn')}
            </Button>
            <Button onClick={() => window.location.href = '/auth'}>
              {t('hero.cta')}
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border/50">
                <LanguageSwitcher />
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = '/install'}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('nav.install')}
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => window.location.href = '/auth'}
                >
                  {t('nav.signIn')}
                </Button>
                <Button 
                  className="w-full"
                  onClick={() => window.location.href = '/auth'}
                >
                  {t('hero.cta')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
