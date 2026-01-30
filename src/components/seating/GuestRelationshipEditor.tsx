import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  X, 
  Plus, 
  Users,
  Link2,
  Unlink2,
  Loader2,
  AlertTriangle
} from "lucide-react";

interface Guest {
  id: string;
  full_name: string;
  prefer_guests: string[] | null;
  avoid_guests: string[] | null;
  guest_side: string | null;
}

interface GuestRelationshipEditorProps {
  weddingPlanId: string;
}

export function GuestRelationshipEditor({ weddingPlanId }: GuestRelationshipEditorProps) {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedGuest, setSelectedGuest] = useState("");
  const [relationGuest, setRelationGuest] = useState("");
  const [relationType, setRelationType] = useState<"prefer" | "avoid">("prefer");

  useEffect(() => {
    loadGuests();
  }, [weddingPlanId]);

  const loadGuests = async () => {
    try {
      const { data, error } = await supabase
        .from("guests")
        .select("id, full_name, prefer_guests, avoid_guests, guest_side")
        .eq("wedding_plan_id", weddingPlanId)
        .order("full_name");

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить список гостей",
      });
    } finally {
      setLoading(false);
    }
  };

  const addRelationship = async () => {
    if (!selectedGuest || !relationGuest || selectedGuest === relationGuest) return;

    setSaving(true);
    try {
      const guest = guests.find(g => g.id === selectedGuest);
      if (!guest) return;

      const fieldName = relationType === "prefer" ? "prefer_guests" : "avoid_guests";
      const currentList = guest[fieldName] || [];

      if (currentList.includes(relationGuest)) {
        toast({
          variant: "destructive",
          title: "Уже существует",
          description: "Эта связь уже добавлена",
        });
        return;
      }

      const { error } = await supabase
        .from("guests")
        .update({ [fieldName]: [...currentList, relationGuest] })
        .eq("id", selectedGuest);

      if (error) throw error;

      toast({
        title: relationType === "prefer" ? "Предпочтение добавлено" : "Конфликт добавлен",
        description: `Связь успешно сохранена`,
      });

      loadGuests();
      setRelationGuest("");
    } catch (error) {
      console.error("Error adding relationship:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить связь",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeRelationship = async (guestId: string, relationId: string, type: "prefer" | "avoid") => {
    setSaving(true);
    try {
      const guest = guests.find(g => g.id === guestId);
      if (!guest) return;

      const fieldName = type === "prefer" ? "prefer_guests" : "avoid_guests";
      const currentList = guest[fieldName] || [];
      const updatedList = currentList.filter(id => id !== relationId);

      const { error } = await supabase
        .from("guests")
        .update({ [fieldName]: updatedList })
        .eq("id", guestId);

      if (error) throw error;

      toast({
        title: "Связь удалена",
        description: "Связь успешно удалена",
      });

      loadGuests();
    } catch (error) {
      console.error("Error removing relationship:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить связь",
      });
    } finally {
      setSaving(false);
    }
  };

  const getGuestName = (id: string) => {
    return guests.find(g => g.id === id)?.full_name || "Неизвестный гость";
  };

  const getGuestsWithRelationships = () => {
    return guests.filter(g => 
      (g.prefer_guests && g.prefer_guests.length > 0) || 
      (g.avoid_guests && g.avoid_guests.length > 0)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Связи между гостями
        </CardTitle>
        <CardDescription>
          Укажите кто хочет сидеть вместе, а кого лучше рассадить отдельно
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Relationship Form */}
        <div className="grid gap-4 md:grid-cols-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Гость</label>
            <Select value={selectedGuest} onValueChange={setSelectedGuest}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите гостя" />
              </SelectTrigger>
              <SelectContent>
                {guests.map(guest => (
                  <SelectItem key={guest.id} value={guest.id}>
                    {guest.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Тип связи</label>
            <Select value={relationType} onValueChange={(v: "prefer" | "avoid") => setRelationType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prefer">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-500" />
                    Хочет сидеть рядом
                  </div>
                </SelectItem>
                <SelectItem value="avoid">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    Не хочет сидеть рядом
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">С кем</label>
            <Select value={relationGuest} onValueChange={setRelationGuest}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите гостя" />
              </SelectTrigger>
              <SelectContent>
                {guests
                  .filter(g => g.id !== selectedGuest)
                  .map(guest => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.full_name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={addRelationship}
            disabled={!selectedGuest || !relationGuest || saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Добавить
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Existing Relationships */}
        <div className="space-y-4">
          <h4 className="font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Существующие связи ({getGuestsWithRelationships().length})
          </h4>

          {getGuestsWithRelationships().length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Unlink2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Связей пока нет</p>
              <p className="text-sm mt-2">Добавьте связи между гостями для умной рассадки</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px]">
              <div className="space-y-4">
                {getGuestsWithRelationships().map(guest => (
                  <div key={guest.id} className="border rounded-lg p-4">
                    <h5 className="font-medium mb-3">{guest.full_name}</h5>
                    
                    {/* Preferences */}
                    {guest.prefer_guests && guest.prefer_guests.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <Heart className="w-4 h-4 text-pink-500" />
                          Хочет сидеть рядом:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {guest.prefer_guests.map(prefId => (
                            <Badge 
                              key={prefId} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {getGuestName(prefId)}
                              <button
                                onClick={() => removeRelationship(guest.id, prefId, "prefer")}
                                className="ml-1 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Avoidances */}
                    {guest.avoid_guests && guest.avoid_guests.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-500" />
                          Не хочет сидеть рядом:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {guest.avoid_guests.map(avoidId => (
                            <Badge 
                              key={avoidId} 
                              variant="destructive"
                              className="flex items-center gap-1"
                            >
                              {getGuestName(avoidId)}
                              <button
                                onClick={() => removeRelationship(guest.id, avoidId, "avoid")}
                                className="ml-1 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
