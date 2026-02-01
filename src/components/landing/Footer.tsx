import { Heart, Instagram, Send, Facebook } from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = {
  product: {
    title: "Продукт",
    links: [
      { label: "AI Визуализатор", href: "/ai-visualizer" },
      { label: "Создатель Приглашений", href: "/ai-invitations" },
      { label: "Маркетплейс", href: "/marketplace" },
      { label: "Планировщик", href: "/planner" },
    ],
  },
  company: {
    title: "Компания",
    links: [
      { label: "О нас", href: "/" },
      { label: "Блог", href: "/" },
      { label: "Карьера", href: "/" },
      { label: "Контакты", href: "/" },
    ],
  },
  resources: {
    title: "Ресурсы",
    links: [
      { label: "Помощь", href: "/dashboard" },
      { label: "FAQ", href: "/" },
      { label: "Политика", href: "/" },
      { label: "Условия", href: "/" },
    ],
  },
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Send, href: "#", label: "Telegram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export const Footer = () => {
  return (
    <footer className="relative bg-mesh overflow-hidden">
      {/* Glass overlay */}
      <div className="absolute inset-0 glass-panel opacity-80" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-hero flex items-center justify-center shadow-lg glow">
                <Heart className="w-5 h-5 text-white fill-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                Weddinguz
              </span>
            </div>
            <p className="text-muted-foreground mb-6 max-w-sm leading-relaxed">
              Первая AI-powered платформа для планирования свадеб в Узбекистане и СНГ
            </p>
            
            {/* Social links */}
            <div className="flex gap-3">
              {socialLinks.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4 text-foreground">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <Link
                      to={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2025 Weddinguz. Все права защищены.
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              Made with{" "}
              <Heart className="inline w-4 h-4 text-primary fill-primary" />{" "}
              in Uzbekistan
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
