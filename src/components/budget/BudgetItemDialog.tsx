import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface BudgetItem {
  id: string;
  category: string;
  item_name: string;
  planned_amount: number;
  actual_amount: number;
  paid_amount: number;
  notes: string | null;
  payment_status: string;
  due_date: string | null;
}

interface BudgetItemDialogProps {
  open: boolean;
  onClose: () => void;
  weddingPlanId: string;
  editingItem: BudgetItem | null;
}

const categories = [
  { value: "venue", label: "Площадка" },
  { value: "catering", label: "Кейтеринг" },
  { value: "photography", label: "Фотография" },
  { value: "videography", label: "Видеосъемка" },
  { value: "flowers", label: "Цветы" },
  { value: "decoration", label: "Декор" },
  { value: "music", label: "Музыка" },
  { value: "attire", label: "Наряды" },
  { value: "makeup", label: "Макияж" },
  { value: "invitations", label: "Приглашения" },
  { value: "transportation", label: "Транспорт" },
  { value: "gifts", label: "Подарки" },
  { value: "rings", label: "Кольца" },
  { value: "honeymoon", label: "Медовый месяц" },
  { value: "other", label: "Другое" },
];

const paymentStatuses = [
  { value: "pending", label: "Ожидает оплаты" },
  { value: "partial", label: "Частично оплачено" },
  { value: "paid", label: "Оплачено" },
];

export function BudgetItemDialog({ open, onClose, weddingPlanId, editingItem }: BudgetItemDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [category, setCategory] = useState("");
  const [itemName, setItemName] = useState("");
  const [plannedAmount, setPlannedAmount] = useState("");
  const [actualAmount, setActualAmount] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editingItem) {
      setCategory(editingItem.category);
      setItemName(editingItem.item_name);
      setPlannedAmount(editingItem.planned_amount.toString());
      setActualAmount(editingItem.actual_amount.toString());
      setPaidAmount(editingItem.paid_amount.toString());
      setNotes(editingItem.notes || "");
      setPaymentStatus(editingItem.payment_status);
      setDueDate(editingItem.due_date || "");
    } else {
      resetForm();
    }
  }, [editingItem, open]);

  const resetForm = () => {
    setCategory("");
    setItemName("");
    setPlannedAmount("");
    setActualAmount("");
    setPaidAmount("");
    setNotes("");
    setPaymentStatus("pending");
    setDueDate("");
  };

  const handleSave = async () => {
    if (!category || !itemName || !plannedAmount) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Заполните обязательные поля",
      });
      return;
    }

    setSaving(true);

    try {
      const itemData: any = {
        wedding_plan_id: weddingPlanId,
        category,
        item_name: itemName,
        planned_amount: parseFloat(plannedAmount) || 0,
        actual_amount: parseFloat(actualAmount) || 0,
        paid_amount: parseFloat(paidAmount) || 0,
        notes: notes || null,
        payment_status: paymentStatus,
        due_date: dueDate || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("budget_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;

        toast({
          title: "Обновлено",
          description: "Статья бюджета обновлена",
        });
      } else {
        const { error } = await supabase
          .from("budget_items")
          .insert([itemData]);

        if (error) throw error;

        toast({
          title: "Добавлено",
          description: "Новая статья бюджета добавлена",
        });
      }

      onClose();
      resetForm();

    } catch (error) {
      console.error("Error saving budget item:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить статью",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? "Редактировать статью" : "Добавить статью бюджета"}
          </DialogTitle>
          <DialogDescription>
            Добавьте детали расходов для лучшего контроля бюджета
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">Категория *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="itemName">Название *</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Например: Банкетный зал"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="plannedAmount">План (UZS) *</Label>
              <Input
                id="plannedAmount"
                type="number"
                value={plannedAmount}
                onChange={(e) => setPlannedAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="actualAmount">Факт (UZS)</Label>
              <Input
                id="actualAmount"
                type="number"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paidAmount">Оплачено (UZS)</Label>
              <Input
                id="paidAmount"
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="paymentStatus">Статус оплаты</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Срок оплаты</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Заметки</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Дополнительная информация..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Отмена
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                "Сохранить"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
