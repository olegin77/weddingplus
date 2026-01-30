import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gift, Plus, ExternalLink, Trash2, Edit, Heart } from "lucide-react";
import { toast } from "sonner";

interface GiftRegistryProps {
  weddingPlanId: string;
}

interface GiftItem {
  id: string;
  item_name: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  image_url: string | null;
  category: string;
  priority: number;
  is_purchased: boolean;
  external_link: string | null;
}

const GIFT_CATEGORIES = [
  { value: "home", label: "Для дома", icon: "🏠" },
  { value: "kitchen", label: "Кухня", icon: "🍳" },
  { value: "travel", label: "Путешествия", icon: "✈️" },
  { value: "experience", label: "Впечатления", icon: "🎭" },
  { value: "cash", label: "Денежный вклад", icon: "💵" },
  { value: "other", label: "Другое", icon: "🎁" },
];

export function GiftRegistry({ weddingPlanId }: GiftRegistryProps) {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GiftItem | null>(null);
  const [formData, setFormData] = useState({
    item_name: "",
    description: "",
    target_amount: "",
    category: "other",
    image_url: "",
    external_link: "",
  });

  const { data: gifts, isLoading } = useQuery({
    queryKey: ["gift-registry", weddingPlanId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gift_registry_items")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("priority", { ascending: false });

      if (error) throw error;
      return data as GiftItem[];
    },
  });

  const addGiftMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("gift_registry_items").insert({
        wedding_plan_id: weddingPlanId,
        item_name: data.item_name,
        description: data.description || null,
        target_amount: parseFloat(data.target_amount) || 0,
        category: data.category,
        image_url: data.image_url || null,
        external_link: data.external_link || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-registry"] });
      setIsAddOpen(false);
      resetForm();
      toast.success("Подарок добавлен в реестр");
    },
    onError: () => toast.error("Ошибка при добавлении подарка"),
  });

  const updateGiftMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("gift_registry_items")
        .update({
          item_name: data.item_name,
          description: data.description || null,
          target_amount: parseFloat(data.target_amount) || 0,
          category: data.category,
          image_url: data.image_url || null,
          external_link: data.external_link || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-registry"] });
      setEditingItem(null);
      resetForm();
      toast.success("Подарок обновлён");
    },
    onError: () => toast.error("Ошибка при обновлении"),
  });

  const deleteGiftMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gift_registry_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gift-registry"] });
      toast.success("Подарок удалён");
    },
    onError: () => toast.error("Ошибка при удалении"),
  });

  const resetForm = () => {
    setFormData({
      item_name: "",
      description: "",
      target_amount: "",
      category: "other",
      image_url: "",
      external_link: "",
    });
  };

  const handleEdit = (item: GiftItem) => {
    setEditingItem(item);
    setFormData({
      item_name: item.item_name,
      description: item.description || "",
      target_amount: item.target_amount.toString(),
      category: item.category,
      image_url: item.image_url || "",
      external_link: item.external_link || "",
    });
  };

  const handleSubmit = () => {
    if (!formData.item_name) {
      toast.error("Введите название подарка");
      return;
    }

    if (editingItem) {
      updateGiftMutation.mutate({ id: editingItem.id, data: formData });
    } else {
      addGiftMutation.mutate(formData);
    }
  };

  const getCategoryInfo = (category: string) => {
    return GIFT_CATEGORIES.find((c) => c.value === category) || GIFT_CATEGORIES[5];
  };

  const totalTarget = gifts?.reduce((sum, g) => sum + Number(g.target_amount), 0) || 0;
  const totalCollected = gifts?.reduce((sum, g) => sum + Number(g.current_amount), 0) || 0;

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20 border-pink-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-pink-500 rounded-full">
                <Gift className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Реестр подарков</h3>
                <p className="text-sm text-muted-foreground">
                  {gifts?.length || 0} желаний в списке
                </p>
              </div>
            </div>
            <Dialog open={isAddOpen || !!editingItem} onOpenChange={(open) => {
              if (!open) {
                setIsAddOpen(false);
                setEditingItem(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsAddOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingItem ? "Редактировать подарок" : "Добавить подарок"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Название *</Label>
                    <Input
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      placeholder="Например: Кофемашина"
                    />
                  </div>
                  <div>
                    <Label>Описание</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Подробности о желаемом подарке..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Целевая сумма (UZS)</Label>
                      <Input
                        type="number"
                        value={formData.target_amount}
                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                        placeholder="5000000"
                      />
                    </div>
                    <div>
                      <Label>Категория</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {GIFT_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.icon} {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Ссылка на товар (опционально)</Label>
                    <Input
                      value={formData.external_link}
                      onChange={(e) => setFormData({ ...formData, external_link: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label>URL изображения (опционально)</Label>
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                  <Button onClick={handleSubmit} className="w-full">
                    {editingItem ? "Сохранить" : "Добавить"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {totalTarget > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Собрано</span>
                <span className="font-medium">
                  {totalCollected.toLocaleString()} / {totalTarget.toLocaleString()} UZS
                </span>
              </div>
              <Progress value={(totalCollected / totalTarget) * 100} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gift Items Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {gifts?.map((gift) => {
          const categoryInfo = getCategoryInfo(gift.category);
          const progress = gift.target_amount > 0 
            ? (Number(gift.current_amount) / Number(gift.target_amount)) * 100 
            : 0;

          return (
            <Card key={gift.id} className={gift.is_purchased ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{categoryInfo.icon}</span>
                    <div>
                      <CardTitle className="text-base">{gift.item_name}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {categoryInfo.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(gift)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => deleteGiftMutation.mutate(gift.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {gift.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {gift.description}
                  </p>
                )}
                
                {gift.target_amount > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{Number(gift.current_amount).toLocaleString()} UZS</span>
                      <span>{Number(gift.target_amount).toLocaleString()} UZS</span>
                    </div>
                    <Progress value={progress} className="h-1.5" />
                  </div>
                )}

                <div className="flex gap-2">
                  {gift.external_link && (
                    <Button variant="outline" size="sm" className="flex-1" asChild>
                      <a href={gift.external_link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Ссылка
                      </a>
                    </Button>
                  )}
                  {gift.is_purchased && (
                    <Badge className="bg-green-500">
                      <Heart className="h-3 w-3 mr-1" />
                      Подарено
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {(!gifts || gifts.length === 0) && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Gift className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Список желаний пуст</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Добавьте подарки, которые вы хотели бы получить
              </p>
              <Button onClick={() => setIsAddOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить первый подарок
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
