import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

interface CategoryData {
  category: string;
  planned: number;
  actual: number;
  paid: number;
}

interface BudgetChartProps {
  data: CategoryData[];
  type: "pie" | "bar";
  title: string;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "#f43f5e", // primary
  "#ec4899", // pink
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // yellow
  "#ef4444", // red
  "#06b6d4", // cyan
  "#84cc16", // lime
  "#f97316", // orange
];

const categoryLabels: Record<string, string> = {
  venue: "Площадка",
  catering: "Кейтеринг",
  photography: "Фото",
  videography: "Видео",
  flowers: "Цветы",
  decoration: "Декор",
  music: "Музыка",
  attire: "Наряды",
  makeup: "Макияж",
  invitations: "Пригл.",
  transportation: "Транспорт",
  gifts: "Подарки",
  rings: "Кольца",
  honeymoon: "Медовый месяц",
  other: "Другое",
};

export function BudgetChart({ data, type, title }: BudgetChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  if (type === "pie") {
    const pieData = data.map((item) => ({
      name: categoryLabels[item.category] || item.category,
      value: item.actual,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => `${(value / 1000).toFixed(0)} тыс UZS`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  if (type === "bar") {
    const barData = data.map((item) => ({
      name: categoryLabels[item.category] || item.category,
      Планировано: item.planned / 1000,
      Фактически: item.actual / 1000,
    }));

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                fontSize={12}
              />
              <YAxis 
                label={{ value: 'тыс UZS', angle: -90, position: 'insideLeft' }}
                fontSize={12}
              />
              <Tooltip 
                formatter={(value: number) => `${value.toFixed(0)} тыс`}
              />
              <Legend />
              <Bar dataKey="Планировано" fill="hsl(var(--chart-1))" />
              <Bar dataKey="Фактически" fill="hsl(var(--chart-2))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    );
  }

  return null;
}
