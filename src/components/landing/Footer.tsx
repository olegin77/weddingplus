import { Heart } from "lucide-react";

const footerLinks = {
  product: {
    title: "Продукт",
    links: [
      { label: "AI Визуализатор", href: "#" },
      { label: "Создатель Приглашений", href: "#" },
      { label: "Маркетплейс", href: "#" },
      { label: "Планировщик", href: "#" },
    ],
  },
  company: {
    title: "Компания",
    links: [
      { label: "О нас", href: "#" },
      { label: "Блог", href: "#" },
      { label: "Карьера", href: "#" },
      { label: "Контакты", href: "#" },
    ],
  },
  resources: {
    title: "Ресурсы",
    links: [
      { label: "Помощь", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Политика", href: "#" },
      { label: "Условия", href: "#" },
    ],
  },
};

export const Footer = () => {
  return (
    <footer className="bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="text-xl font-bold">WeddingTech UZ</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Первая AI-powered платформа для планирования свадеб в Узбекистане и СНГ
            </p>
            <div className="flex gap-4">
              {/* Social links would go here */}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, idx) => (
                  <li key={idx}>
                    <a
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 WeddingTech UZ. Все права защищены.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with{" "}
            <Heart className="inline w-4 h-4 text-primary fill-primary" /> in
            Uzbekistan
          </p>
        </div>
      </div>
    </footer>
  );
};
