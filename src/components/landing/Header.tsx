import { Button } from "@/components/ui/button";
import { Heart, Menu, X, Download, Gem } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";

export const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { scrollY } = useScroll();
  
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]
  );
  
  const headerBlur = useTransform(
    scrollY,
    [0, 100],
    ["blur(0px)", "blur(24px)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: t('nav.home'), href: "top" },
    { name: t('marketplace.title'), href: "/marketplace" },
    { name: "Цены", href: "pricing" },
    { name: "О нас", href: "about" },
  ];

  const scrollToSection = (sectionId: string) => {
    if (sectionId.startsWith('/')) {
      navigate(sectionId);
      return;
    }
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <motion.header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass-panel shadow-lg' : ''
      }`}
      style={{ 
        backgroundColor: headerBackground,
        backdropFilter: headerBlur,
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with animation */}
          <motion.div 
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate('/')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-9 h-9 rounded-xl gradient-luxe flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
            >
              <motion.div
                whileHover={{ rotate: -8 }}
                transition={{ type: "spring" as const, stiffness: 260, damping: 20 }}
              >
                <Heart className="w-5 h-5 text-white fill-white" />
              </motion.div>
            </motion.div>
            <span className="text-xl font-bold text-gradient-animated">
              WeddingTech
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg transition-all duration-200 relative underline-animated"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                {item.name}
              </motion.button>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="ghost" 
                size="sm"
                className="glass-button border-0 bg-transparent hover:bg-accent/50"
                onClick={() => navigate('/install')}
              >
                <Download className="w-4 h-4 mr-2" />
                {t('nav.install')}
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-accent/50"
                onClick={() => navigate('/auth')}
              >
                {t('nav.signIn')}
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="sm"
                className="gradient-luxe shadow-lg hover:shadow-xl transition-all duration-300 text-white border-0"
                onClick={() => navigate('/auth')}
              >
                <Gem className="w-4 h-4 mr-1" />
                {t('hero.cta')}
              </Button>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <motion.button
            className="md:hidden p-2 rounded-xl hover:bg-accent/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <X className="w-6 h-6" />
                </motion.div>
              ) : (
                <motion.div
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Menu className="w-6 h-6" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden py-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <motion.div 
                className="flex flex-col gap-1 glass-luxe p-3 rounded-2xl"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.1 }}
              >
                {navigation.map((item, index) => (
                  <motion.button
                    key={item.name}
                    onClick={() => {
                      scrollToSection(item.href);
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-xl transition-all text-left"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {item.name}
                  </motion.button>
                ))}
                <motion.div 
                  className="flex flex-col gap-2 pt-3 mt-2 border-t border-border/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <LanguageSwitcher />
                  <Button 
                    variant="outline" 
                    className="w-full justify-start glass-button"
                    onClick={() => navigate('/install')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {t('nav.install')}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate('/auth')}
                  >
                    {t('nav.signIn')}
                  </Button>
                  <Button 
                    className="w-full gradient-luxe shadow-lg text-white border-0"
                    onClick={() => navigate('/auth')}
                  >
                    <Gem className="w-4 h-4 mr-1" />
                    {t('hero.cta')}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
};
