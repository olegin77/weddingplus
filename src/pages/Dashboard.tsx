import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, ShoppingBag, Sparkles, Star, TrendingUp, ArrowRight } from "lucide-react";
import { CreateWeddingPlanDialog } from "@/components/CreateWeddingPlanDialog";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  gradient: string;
  index: number;
}

const StatCard = ({ title, value, subtitle, icon: Icon, gradient, index }: StatCardProps) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ 
      scale: 1.03, 
      y: -5,
      transition: { type: "spring", stiffness: 300 }
    }}
    className="relative"
  >
    <Card className="glass-card overflow-hidden group cursor-default">
      {/* Gradient overlay on hover */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
      />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.2 }}
          transition={{ type: "spring", stiffness: 300 }}
          className={`p-2 rounded-xl bg-gradient-to-br ${gradient}`}
        >
          <Icon className="h-4 w-4 text-white" />
        </motion.div>
      </CardHeader>
      <CardContent>
        <motion.div 
          className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 + index * 0.1, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-success" />
          {subtitle}
        </p>
      </CardContent>
      
      {/* Animated border on hover */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${gradient}`}
        initial={{ width: 0 }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.3 }}
      />
    </Card>
  </motion.div>
);

interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  gradient?: string;
  isPrimary?: boolean;
}

const ActionButton = ({ icon: Icon, label, onClick, gradient = "from-primary to-primary-glow", isPrimary = false }: ActionButtonProps) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <Button 
      className={`w-full h-auto py-4 flex flex-col gap-2 items-center justify-center group relative overflow-hidden ${
        isPrimary ? 'bg-gradient-hero text-white shadow-lg' : 'glass-card border-0'
      }`}
      variant={isPrimary ? "default" : "outline"}
      onClick={onClick}
    >
      {/* Static shimmer on hover only */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)",
        }}
      />
      
      <motion.div
        className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20' : `bg-gradient-to-br ${gradient}`}`}
        whileHover={{ rotate: 10, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className={`h-5 w-5 ${isPrimary ? 'text-white' : 'text-white'}`} />
      </motion.div>
      <span className="font-medium">{label}</span>
      <motion.span
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ x: -5 }}
        whileHover={{ x: 0 }}
      >
        <ArrowRight className="w-4 h-4" />
      </motion.span>
    </Button>
  </motion.div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    daysUntilWedding: 0,
    budget: 0,
    guests: 0,
    vendors: 0,
  });
  const [hasWeddingPlan, setHasWeddingPlan] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      setProfile(profileData);

      const { data: weddingPlan } = await supabase
        .from("wedding_plans")
        .select("*")
        .eq("couple_user_id", user.id)
        .maybeSingle();

      if (weddingPlan) {
        setHasWeddingPlan(true);
        const daysUntil = Math.ceil(
          (new Date(weddingPlan.wedding_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );

        const { data: guestsData } = await supabase
          .from("guests")
          .select("*")
          .eq("wedding_plan_id", weddingPlan.id);

        const { data: bookingsData } = await supabase
          .from("bookings")
          .select("*")
          .eq("wedding_plan_id", weddingPlan.id);

        setStats({
          daysUntilWedding: daysUntil > 0 ? daysUntil : 0,
          budget: weddingPlan.budget_total || 0,
          guests: guestsData?.length || 0,
          vendors: bookingsData?.length || 0,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <motion.div 
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div
              className="w-12 h-12 rounded-2xl gradient-luxe flex items-center justify-center animate-spin-slow"
            >
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="text-muted-foreground mt-4">Загрузка...</div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  const statCards = [
    { title: "Дней до свадьбы", value: stats.daysUntilWedding, subtitle: hasWeddingPlan ? "Осталось дней" : "Создайте план", icon: Calendar, gradient: "from-primary to-primary-glow" },
    { title: "Бюджет", value: `$${stats.budget.toLocaleString()}`, subtitle: "Общий бюджет", icon: DollarSign, gradient: "from-wedding-eucalyptus to-wedding-olive" },
    { title: "Гостей", value: stats.guests, subtitle: "В списке гостей", icon: Users, gradient: "from-wedding-terracotta to-primary" },
    { title: "Поставщиков", value: stats.vendors, subtitle: "Забронировано", icon: ShoppingBag, gradient: "from-wedding-olive to-wedding-eucalyptus" },
  ];

  return (
    <DashboardLayout>
      <motion.div 
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div 
          className="flex items-center justify-between"
          variants={itemVariants}
        >
          <div>
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              Добро пожаловать,{" "}
              <span className="text-gradient-animated">
                {profile?.full_name || "Гость"}
              </span>
              !
            </motion.h1>
            <motion.p 
              className="text-muted-foreground mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {profile?.role === "vendor" 
                ? "Управляйте вашими услугами" 
                : "Начните планирование вашей мечты"}
            </motion.p>
          </div>
        </motion.div>

        {/* Stats Grid */}
        {profile?.role === "couple" && (
          <motion.div 
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            variants={containerVariants}
          >
            {statCards.map((stat, index) => (
              <StatCard key={stat.title} {...stat} index={index} />
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card overflow-hidden">
            <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
                Быстрые действия
              </CardTitle>
              <CardDescription>Начните планирование прямо сейчас</CardDescription>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
                variants={containerVariants}
              >
                {!hasWeddingPlan ? (
                  <motion.div variants={itemVariants} className="col-span-full">
                    <CreateWeddingPlanDialog onSuccess={fetchDashboardData} />
                  </motion.div>
                ) : (
                  <>
                    <motion.div variants={itemVariants}>
                      <ActionButton 
                        icon={Star} 
                        label="Рекомендации" 
                        onClick={() => navigate("/recommendations")}
                        gradient="from-primary to-primary-glow"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <ActionButton 
                        icon={Calendar} 
                        label="Мой план" 
                        onClick={() => navigate("/planner")}
                        gradient="from-wedding-eucalyptus to-wedding-olive"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <ActionButton 
                        icon={ShoppingBag} 
                        label="Маркетплейс" 
                        onClick={() => navigate("/marketplace")}
                        gradient="from-wedding-terracotta to-primary"
                      />
                    </motion.div>
                    <motion.div variants={itemVariants}>
                      <ActionButton 
                        icon={Sparkles} 
                        label="AI Помощник" 
                        onClick={() => navigate("/ai-assistant")}
                        gradient="from-primary to-wedding-eucalyptus"
                        isPrimary
                      />
                    </motion.div>
                  </>
                )}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;