import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Loader2, Users, UserPlus, Check, X, Search, 
  Car, UtensilsCrossed, HelpCircle
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";
import { cn } from "@/lib/utils";

interface WeddingEvent {
  id: string;
  wedding_plan_id: string;
  event_type: string;
  event_name: string;
  hosted_by: "groom" | "bride" | "both";
  expected_guests: number;
}

interface Guest {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  guest_side: "groom" | "bride" | "both" | null;
  status: string | null;
}

interface GuestEventInvitation {
  id: string;
  guest_id: string;
  event_id: string;
  rsvp_status: "pending" | "confirmed" | "declined" | "maybe";
  plus_ones: number;
  dietary_notes: string | null;
  transport_needed: boolean;
}

const RSVP_STATUS = {
  pending: { label: "Ожидает", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Подтвердил", color: "bg-green-100 text-green-800" },
  declined: { label: "Отклонил", color: "bg-red-100 text-red-800" },
  maybe: { label: "Возможно", color: "bg-blue-100 text-blue-800" },
};

interface EventGuestManagerProps {
  event: WeddingEvent;
}

export function EventGuestManager({ event }: EventGuestManagerProps) {
  const queryClient = useQueryClient();
  const { weddingPlanId } = useWeddingPlanId();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  // Fetch all guests from wedding plan
  const { data: allGuests, isLoading: guestsLoading } = useQuery({
    queryKey: ["guests", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return [];
      const { data, error } = await supabase
        .from("guests")
        .select("id, full_name, phone, email, guest_side, status")
        .eq("wedding_plan_id", weddingPlanId)
        .order("full_name");
      
      if (error) throw error;
      return data as Guest[];
    },
    enabled: !!weddingPlanId,
  });

  // Fetch event invitations
  const { data: invitations, isLoading: invitationsLoading } = useQuery({
    queryKey: ["event-invitations", event.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("guest_event_invitations")
        .select("*")
        .eq("event_id", event.id);
      
      if (error) throw error;
      return data as GuestEventInvitation[];
    },
  });

  // Add guests to event
  const addGuestsMutation = useMutation({
    mutationFn: async (guestIds: string[]) => {
      const inserts = guestIds.map(guest_id => ({
        guest_id,
        event_id: event.id,
        rsvp_status: "pending" as const,
      }));

      const { error } = await supabase
        .from("guest_event_invitations")
        .insert(inserts);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Гости добавлены к событию");
      queryClient.invalidateQueries({ queryKey: ["event-invitations", event.id] });
      setSelectedGuests([]);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка добавления");
    },
  });

  // Update RSVP status
  const updateRsvpMutation = useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: string; status: string }) => {
      const { error } = await supabase
        .from("guest_event_invitations")
        .update({ 
          rsvp_status: status,
          responded_at: status !== "pending" ? new Date().toISOString() : null,
        })
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["event-invitations", event.id] });
    },
  });

  // Remove guest from event
  const removeGuestMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const { error } = await supabase
        .from("guest_event_invitations")
        .delete()
        .eq("id", invitationId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Гость удален из события");
      queryClient.invalidateQueries({ queryKey: ["event-invitations", event.id] });
    },
  });

  // Filter guests not yet invited
  const invitedGuestIds = new Set(invitations?.map(i => i.guest_id) || []);
  const uninvitedGuests = allGuests?.filter(g => !invitedGuestIds.has(g.id)) || [];
  const filteredUninvited = uninvitedGuests.filter(g => 
    g.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get invited guests with their invitation data
  const invitedGuests = invitations?.map(inv => {
    const guest = allGuests?.find(g => g.id === inv.guest_id);
    return { ...inv, guest };
  }).filter(inv => inv.guest) || [];

  // Calculate stats
  const confirmedCount = invitations?.filter(i => i.rsvp_status === "confirmed").length || 0;
  const declinedCount = invitations?.filter(i => i.rsvp_status === "declined").length || 0;
  const pendingCount = invitations?.filter(i => i.rsvp_status === "pending").length || 0;
  const totalPlusOnes = invitations?.reduce((sum, i) => sum + (i.plus_ones || 0), 0) || 0;

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const isLoading = guestsLoading || invitationsLoading;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Left: Add Guests */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Добавить гостей
          </CardTitle>
          <CardDescription>
            Выберите гостей для приглашения на {event.event_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск гостей..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredUninvited.length > 0 ? (
              <>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {filteredUninvited.map((guest) => (
                      <div
                        key={guest.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedGuests.includes(guest.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                        onClick={() => toggleGuestSelection(guest.id)}
                      >
                        <Checkbox
                          checked={selectedGuests.includes(guest.id)}
                          onCheckedChange={() => toggleGuestSelection(guest.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{guest.full_name}</p>
                          {guest.phone && (
                            <p className="text-sm text-muted-foreground">{guest.phone}</p>
                          )}
                        </div>
                        {guest.status && (
                          <Badge variant="secondary" className="text-xs">
                            {guest.status === "vip" && "VIP"}
                            {guest.status === "relative" && "Родственник"}
                            {guest.status === "friend" && "Друг"}
                            {guest.status === "colleague" && "Коллега"}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {selectedGuests.length > 0 && (
                  <Button
                    onClick={() => addGuestsMutation.mutate(selectedGuests)}
                    disabled={addGuestsMutation.isPending}
                    className="w-full btn-gradient"
                  >
                    {addGuestsMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <UserPlus className="w-4 h-4 mr-2" />
                    )}
                    Добавить {selectedGuests.length} гостей
                  </Button>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Все гости уже приглашены</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Right: Invited Guests */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Приглашенные гости
          </CardTitle>
          <CardDescription>
            {invitedGuests.length} гостей (+{totalPlusOnes} сопровождающих)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center p-2 rounded-lg bg-green-50 dark:bg-green-950/20">
              <p className="text-lg font-bold text-green-600">{confirmedCount}</p>
              <p className="text-xs text-muted-foreground">Подтвердили</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
              <p className="text-lg font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-xs text-muted-foreground">Ожидают</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-red-50 dark:bg-red-950/20">
              <p className="text-lg font-bold text-red-600">{declinedCount}</p>
              <p className="text-xs text-muted-foreground">Отклонили</p>
            </div>
          </div>

          {invitedGuests.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {invitedGuests.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{inv.guest?.full_name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", RSVP_STATUS[inv.rsvp_status].color)}
                        >
                          {RSVP_STATUS[inv.rsvp_status].label}
                        </Badge>
                        {inv.plus_ones > 0 && (
                          <span className="text-xs text-muted-foreground">
                            +{inv.plus_ones}
                          </span>
                        )}
                        {inv.transport_needed && (
                          <Car className="w-3 h-3 text-muted-foreground" />
                        )}
                        {inv.dietary_notes && (
                          <UtensilsCrossed className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <Select
                      value={inv.rsvp_status}
                      onValueChange={(value) => 
                        updateRsvpMutation.mutate({ invitationId: inv.id, status: value })
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-3 h-3" />
                            Ожидает
                          </div>
                        </SelectItem>
                        <SelectItem value="confirmed">
                          <div className="flex items-center gap-2">
                            <Check className="w-3 h-3 text-green-600" />
                            Да
                          </div>
                        </SelectItem>
                        <SelectItem value="declined">
                          <div className="flex items-center gap-2">
                            <X className="w-3 h-3 text-red-600" />
                            Нет
                          </div>
                        </SelectItem>
                        <SelectItem value="maybe">Возможно</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeGuestMutation.mutate(inv.id)}
                    >
                      <X className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Нет приглашенных гостей</p>
              <p className="text-sm">Добавьте гостей из списка слева</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
