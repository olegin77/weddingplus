import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { SmartVendorDrawer } from "./SmartVendorDrawer";

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  planned_amount: number;
  actual_amount: number;
  paid_amount: number;
  payment_status: string;
  notes: string | null;
}

interface CategoryData {
  planned: number;
  actual: number;
  paid: number;
  items: BudgetItem[];
}

interface BudgetCategoryCardProps {
  category: string;
  label: string;
  data: CategoryData;
  weddingPlanId?: string;
  onEdit: (item: BudgetItem) => void;
  onDelete: (itemId: string) => void;
}

const paymentStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Ожидает", variant: "outline" },
  partial: { label: "Частично", variant: "secondary" },
  paid: { label: "Оплачено", variant: "default" },
};

export function BudgetCategoryCard({ category, label, data, weddingPlanId, onEdit, onDelete }: BudgetCategoryCardProps) {
  const overBudget = data.actual > data.planned;
  const paidPercent = data.actual > 0 ? (data.paid / data.actual) * 100 : 0;

  return (
    <Card>
      <CardHeader>
      <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{label}</CardTitle>
          <div className="flex items-center gap-2">
            <SmartVendorDrawer category={category} maxPrice={data.planned} weddingPlanId={weddingPlanId} />
            <div className="text-sm text-muted-foreground">
              {data.items.length} {data.items.length === 1 ? "статья" : "статей"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-muted-foreground mb-1">План</div>
            <div className="font-semibold">{(data.planned / 1000).toFixed(0)} тыс</div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Факт</div>
            <div className="font-semibold flex items-center gap-1">
              {(data.actual / 1000).toFixed(0)} тыс
              {overBudget ? (
                <TrendingUp className="h-3 w-3 text-red-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-green-500" />
              )}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Оплачено</div>
            <div className="font-semibold">{(data.paid / 1000).toFixed(0)} тыс</div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Оплата</span>
            <span>{paidPercent.toFixed(0)}%</span>
          </div>
          <Progress value={paidPercent} className="h-2" />
        </div>

        {/* Items List */}
        <div className="space-y-2">
          {data.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-accent/50 rounded-lg"
            >
              <div className="flex-1">
                <div className="font-medium">{item.item_name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">
                    {(item.actual_amount / 1000).toFixed(0)} тыс UZS
                  </span>
                  <Badge
                    variant={paymentStatusLabels[item.payment_status]?.variant || "outline"}
                    className="text-xs"
                  >
                    {paymentStatusLabels[item.payment_status]?.label || item.payment_status}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(item as any)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(item.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
