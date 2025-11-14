import { 
  Home, 
  ShoppingBag, 
  Calendar, 
  User, 
  Settings,
  Heart,
  LogOut,
  Briefcase,
  Sparkles
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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

const coupleMenuItems = [
  { title: "Главная", url: "/dashboard", icon: Home },
  { title: "Маркетплейс", url: "/marketplace", icon: ShoppingBag },
  { title: "Мой план", url: "/planner", icon: Calendar },
  { title: "AI Помощник", url: "/ai-assistant", icon: Sparkles },
  { title: "Профиль", url: "/profile", icon: User },
  { title: "Настройки", url: "/settings", icon: Settings },
];

const vendorMenuItems = [
  { title: "Главная", url: "/dashboard", icon: Home },
  { title: "Мои услуги", url: "/vendor-dashboard", icon: Briefcase },
  { title: "Профиль", url: "/profile", icon: User },
  { title: "Настройки", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const collapsed = state === "collapsed";
  const [userRole, setUserRole] = useState<string>("couple");

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data) {
        setUserRole(data.role);
      }
    }
  };

  const menuItems = userRole === "vendor" ? vendorMenuItems : coupleMenuItems;

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Ошибка",
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

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Меню</SidebarGroupLabel>
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
      </SidebarContent>

      <SidebarFooter>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Выход</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
