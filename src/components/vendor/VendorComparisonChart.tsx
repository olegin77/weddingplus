import { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { VendorMatchResult } from "@/types/vendor-attributes";

interface VendorComparisonChartProps {
  vendors: VendorMatchResult[];
  vendorNames: Record<string, string>;
}

const CATEGORY_LABELS: Record<string, string> = {
  style: "Стиль",
  rating: "Рейтинг",
  budget: "Бюджет",
  experience: "Опыт",
  categorySpecific: "Категория",
  verification: "Верификация",
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
];

export function VendorComparisonChart({
  vendors,
  vendorNames,
}: VendorComparisonChartProps) {
  const chartData = useMemo(() => {
    const categories = Object.keys(CATEGORY_LABELS) as Array<
      keyof typeof CATEGORY_LABELS
    >;

    return categories.map((category) => {
      const dataPoint: Record<string, string | number> = {
        category: CATEGORY_LABELS[category],
      };

      vendors.forEach((vendor) => {
        const name = vendorNames[vendor.vendorId] || vendor.vendorId.slice(0, 8);
        dataPoint[name] = vendor.categoryScores?.[category as keyof typeof vendor.categoryScores] || 0;
      });

      return dataPoint;
    });
  }, [vendors, vendorNames]);

  const vendorKeys = useMemo(() => {
    return vendors.map((v) => vendorNames[v.vendorId] || v.vendorId.slice(0, 8));
  }, [vendors, vendorNames]);

  if (vendors.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          Выберите вендоров для сравнения
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Сравнение по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            />
            {vendorKeys.map((key, index) => (
              <Radar
                key={key}
                name={key}
                dataKey={key}
                stroke={CHART_COLORS[index % CHART_COLORS.length]}
                fill={CHART_COLORS[index % CHART_COLORS.length]}
                fillOpacity={0.2}
                strokeWidth={2}
              />
            ))}
            <Legend />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
