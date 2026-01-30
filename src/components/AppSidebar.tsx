import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  User, 
  Settings,
  Heart,
  LogOut,
  Briefcase,
  Sparkles,
  Mail,
  Building2,
  LayoutGrid,
  Star,
  Globe,
  Shield,
  PartyPopper,
  CreditCard,
  QrCode,
  Phone,
  Gift,
  Trophy
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const collapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string>("couple");
  const [isAdmin, setIsAdmin] = useState(false);

  const coupleMenuItems = [
    { title: t('nav.dashboard'), url: "/dashboard", icon: Home },
    { title: "Рекомендации", url: "/recommendations", icon: Star },
    { title: t('nav.marketplace'), url: "/marketplace", icon: ShoppingBag },
    { title: t('nav.planner'), url: "/planner", icon: Calendar },
    { title: "Мероприятия", url: "/wedding-events", icon: PartyPopper },
    { title: "Платежи", url: "/payments", icon: CreditCard },
    { title: "Коммуникации", url: "/communications", icon: Phone },
    { title: "Подарки", url: "/gifts", icon: Gift },
    { title: t('nav.aiAssistant'), url: "/ai-assistant", icon: Sparkles },
    { title: "AI Визуализатор", url: "/ai-visualizer", icon: Sparkles },
    { title: "AI Дизайнер залов", url: "/ai-venue-designer", icon: Building2 },
    { title: "AI Приглашения", url: "/ai-invitations", icon: Mail },
    { title: "Схема рассадки", url: "/seating-chart", icon: LayoutGrid },
    { title: t('nav.profile'), url: "/profile", icon: User },
    { title: t('nav.settings'), url: "/settings", icon: Settings },
  ];

  const vendorMenuItems = [
    { title: t('nav.dashboard'), url: "/dashboard", icon: Home },
    { title: t('vendor.dashboard'), url: "/vendor-dashboard", icon: Briefcase },
    { title: "Платежи и QR", url: "/payments", icon: QrCode },
    { title: t('nav.profile'), url: "/profile", icon: User },
    { title: t('nav.settings'), url: "/settings", icon: Settings },
  ];

  const menuItems = userRole === "vendor" ? vendorMenuItems : coupleMenuItems;

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // Fetch profile role
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profileData) {
        setUserRole(profileData.role);
      }
      
      // Check if user is admin via user_roles table
      const { data: adminCheck } = await supabase
        .rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(adminCheck || false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: t('common.error'),
        description: "Не удалось выйти из системы",
      });
    } else {
      toast({
        title: "До встречи!",
        description: "Вы успешно вышли из системы",
      });
      navigate("/auth");
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4">
          <Heart className="w-6 h-6 text-primary fill-primary" />
          {!collapsed && (
            <span className="font-bold text-lg">WeddingTech</span>
          )}
        </div>
      </SidebarHeader>

        {/* Home Link */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to="/"
                    className="hover:bg-accent"
                    activeClassName="bg-accent text-primary font-medium"
                  >
                    <Globe className="h-4 w-4" />
                    {!collapsed && <span>На главную</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.home')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Администрирование</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/admin"
                      className="hover:bg-accent"
                      activeClassName="bg-accent text-primary font-medium"
                    >
                      <Shield className="h-4 w-4" />
                      {!collapsed && <span>Админ-панель</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

      <SidebarFooter>
        <div className="flex flex-col gap-2">
          {!collapsed && (
            <div className="px-2 pb-2">
              <LanguageSwitcher />
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">{t('nav.signOut')}</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
