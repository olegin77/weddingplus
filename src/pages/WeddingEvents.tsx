import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Loader2, Plus, CalendarIcon, Users, MapPin, Wallet, 
  UtensilsCrossed, Heart, Church, Home, PartyPopper, Edit2, Trash2
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWeddingPlanId } from "@/hooks/useWeddingPlanId";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { EventGuestManager } from "@/components/events/EventGuestManager";

// Event type definitions
const EVENT_TYPES = [
  { 
    id: "nahorgi_osh", 
    name: "Nahorgi Osh", 
    description: "Утренний плов", 
    icon: UtensilsCrossed,
    defaultSide: "groom",
    typicalGuests: "300-1000"
  },
  { 
    id: "fotiha", 
    name: "Fotiha", 
    description: "Помолвка", 
    icon: Heart,
    defaultSide: "both",
    typicalGuests: "50-100"
  },
  { 
    id: "nikoh", 
    name: "Nikoh", 
    description: "Религиозная церемония", 
    icon: Church,
    defaultSide: "both",
    typicalGuests: "20-50"
  },
  { 
    id: "kelin_salom", 
    name: "Kelin Salom", 
    description: "Встреча невесты", 
    icon: Home,
    defaultSide: "groom",
    typicalGuests: "100-300"
  },
  { 
    id: "toy", 
    name: "To'y", 
    description: "Основной банкет", 
    icon: PartyPopper,
    defaultSide: "both",
    typicalGuests: "200-500"
  },
] as const;

const SIDE_LABELS = {
  groom: "Сторона жениха",
  bride: "Сторона невесты",
  both: "Обе стороны",
};

type WeddingEventType = typeof EVENT_TYPES[number]["id"];

interface WeddingEvent {
  id: string;
  wedding_plan_id: string;
  event_type: WeddingEventType;
  event_name: string;
  event_date: string | null;
  venue_name: string | null;
  venue_address: string | null;
  hosted_by: "groom" | "bride" | "both";
  expected_guests: number;
  budget_allocated: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

export default function WeddingEvents() {
  const queryClient = useQueryClient();
  const { weddingPlanId, isLoading: planLoading } = useWeddingPlanId();
  const [selectedEvent, setSelectedEvent] = useState<WeddingEvent | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  // Form state for create/edit
  const [formData, setFormData] = useState({
    event_type: "" as WeddingEventType | "",
    event_name: "",
    event_date: null as Date | null,
    venue_name: "",
    venue_address: "",
    hosted_by: "both" as "groom" | "bride" | "both",
    expected_guests: 0,
    budget_allocated: 0,
    notes: "",
  });

  // Fetch wedding events
  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ["wedding-events", weddingPlanId],
    queryFn: async () => {
      if (!weddingPlanId) return [];
      const { data, error } = await supabase
        .from("wedding_events")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .order("event_date", { ascending: true });
      
      if (error) throw error;
      return data as WeddingEvent[];
    },
    enabled: !!weddingPlanId,
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!weddingPlanId || !formData.event_type) {
        throw new Error("Выберите тип события");
      }

      const { error } = await supabase
        .from("wedding_events")
        .insert({
          wedding_plan_id: weddingPlanId,
          event_type: formData.event_type,
          event_name: formData.event_name || EVENT_TYPES.find(e => e.id === formData.event_type)?.name || "",
          event_date: formData.event_date?.toISOString() || null,
          venue_name: formData.venue_name || null,
          venue_address: formData.venue_address || null,
          hosted_by: formData.hosted_by,
          expected_guests: formData.expected_guests,
          budget_allocated: formData.budget_allocated,
          notes: formData.notes || null,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Событие добавлено");
      queryClient.invalidateQueries({ queryKey: ["wedding-events"] });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка создания");
    },
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedEvent) return;

      const { error } = await supabase
        .from("wedding_events")
        .update({
          event_name: formData.event_name,
          event_date: formData.event_date?.toISOString() || null,
          venue_name: formData.venue_name || null,
          venue_address: formData.venue_address || null,
          hosted_by: formData.hosted_by,
          expected_guests: formData.expected_guests,
          budget_allocated: formData.budget_allocated,
          notes: formData.notes || null,
        })
        .eq("id", selectedEvent.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Событие обновлено");
      queryClient.invalidateQueries({ queryKey: ["wedding-events"] });
      setIsEditOpen(false);
      setSelectedEvent(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка обновления");
    },
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("wedding_events")
        .delete()
        .eq("id", eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Событие удалено");
      queryClient.invalidateQueries({ queryKey: ["wedding-events"] });
      setSelectedEvent(null);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Ошибка удаления");
    },
  });

  const resetForm = () => {
    setFormData({
      event_type: "",
      event_name: "",
      event_date: null,
      venue_name: "",
      venue_address: "",
      hosted_by: "both",
      expected_guests: 0,
      budget_allocated: 0,
      notes: "",
    });
  };

  const openEditDialog = (event: WeddingEvent) => {
    setSelectedEvent(event);
    setFormData({
      event_type: event.event_type,
      event_name: event.event_name,
      event_date: event.event_date ? new Date(event.event_date) : null,
      venue_name: event.venue_name || "",
      venue_address: event.venue_address || "",
      hosted_by: event.hosted_by,
      expected_guests: event.expected_guests,
      budget_allocated: event.budget_allocated,
      notes: event.notes || "",
    });
    setIsEditOpen(true);
  };

  const getEventIcon = (eventType: WeddingEventType) => {
    const eventConfig = EVENT_TYPES.find(e => e.id === eventType);
    return eventConfig?.icon || PartyPopper;
  };

  const getEventInfo = (eventType: WeddingEventType) => {
    return EVENT_TYPES.find(e => e.id === eventType);
  };

  // Calculate totals
  const totalBudget = events?.reduce((sum, e) => sum + (e.budget_allocated || 0), 0) || 0;
  const totalGuests = events?.reduce((sum, e) => sum + (e.expected_guests || 0), 0) || 0;

  if (planLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Мероприятия свадьбы</h1>
            <p className="text-muted-foreground">
              Управляйте всеми событиями узбекского свадебного цикла
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="btn-gradient">
                <Plus className="w-4 h-4 mr-2" />
                Добавить событие
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Новое событие</DialogTitle>
              </DialogHeader>
              <EventForm 
                formData={formData}
                setFormData={setFormData}
                onSubmit={() => createMutation.mutate()}
                isLoading={createMutation.isPending}
                isCreate
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Событий</p>
                  <p className="text-xl font-bold">{events?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Всего гостей</p>
                  <p className="text-xl font-bold">{totalGuests.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Общий бюджет</p>
                  <p className="text-xl font-bold">{totalBudget.toLocaleString()} сум</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="timeline">Таймлайн</TabsTrigger>
            {selectedEvent && (
              <TabsTrigger value="guests">Гости события</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            {eventsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : events && events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => {
                  const EventIcon = getEventIcon(event.event_type);
                  const eventInfo = getEventInfo(event.event_type);
                  
                  return (
                    <Card 
                      key={event.id} 
                      className={cn(
                        "glass-card cursor-pointer transition-all hover:border-primary/50",
                        selectedEvent?.id === event.id && "border-primary ring-2 ring-primary/20"
                      )}
                      onClick={() => setSelectedEvent(event)}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <EventIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{event.event_name}</CardTitle>
                              <CardDescription>{eventInfo?.description}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {SIDE_LABELS[event.hosted_by]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {event.event_date && (
                          <div className="flex items-center gap-2 text-sm">
                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                            <span>{format(new Date(event.event_date), "d MMMM yyyy", { locale: ru })}</span>
                          </div>
                        )}
                        {event.venue_name && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span className="truncate">{event.venue_name}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{event.expected_guests} гостей</span>
                          </div>
                          <span className="text-muted-foreground">
                            {event.budget_allocated.toLocaleString()} сум
                          </span>
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDialog(event);
                            }}
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Изменить
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm("Удалить событие?")) {
                                deleteMutation.mutate(event.id);
                              }
                            }}
                          >
                            <Trash2 className="w-3 h-3 text-destructive" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="glass-card">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <PartyPopper className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium mb-1">Нет событий</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Добавьте события узбекского свадебного цикла
                  </p>
                  <Button onClick={() => setIsCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить первое событие
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="mt-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Таймлайн событий</CardTitle>
                <CardDescription>Хронология вашего свадебного цикла</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    <div className="space-y-6">
                      {events?.filter(e => e.event_date).sort((a, b) => 
                        new Date(a.event_date!).getTime() - new Date(b.event_date!).getTime()
                      ).map((event, idx) => {
                        const EventIcon = getEventIcon(event.event_type);
                        return (
                          <div key={event.id} className="relative pl-10">
                            <div className="absolute left-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            </div>
                            <div className="glass-card p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <EventIcon className="w-4 h-4 text-primary" />
                                <span className="font-medium">{event.event_name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.event_date!), "d MMMM yyyy, HH:mm", { locale: ru })}
                              </p>
                              {event.venue_name && (
                                <p className="text-sm mt-1">{event.venue_name}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {(!events || events.filter(e => e.event_date).length === 0) && (
                        <p className="text-center text-muted-foreground py-8">
                          Добавьте даты к событиям, чтобы увидеть таймлайн
                        </p>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="guests" className="mt-4">
            {selectedEvent && (
              <EventGuestManager event={selectedEvent} />
            )}
          </TabsContent>
        </Tabs>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Редактировать событие</DialogTitle>
            </DialogHeader>
            <EventForm 
              formData={formData}
              setFormData={setFormData}
              onSubmit={() => updateMutation.mutate()}
              isLoading={updateMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

// Event Form Component
interface EventFormProps {
  formData: {
    event_type: WeddingEventType | "";
    event_name: string;
    event_date: Date | null;
    venue_name: string;
    venue_address: string;
    hosted_by: "groom" | "bride" | "both";
    expected_guests: number;
    budget_allocated: number;
    notes: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<EventFormProps["formData"]>>;
  onSubmit: () => void;
  isLoading: boolean;
  isCreate?: boolean;
}

function EventForm({ formData, setFormData, onSubmit, isLoading, isCreate }: EventFormProps) {
  return (
    <div className="space-y-4">
      {isCreate && (
        <div className="space-y-2">
          <Label>Тип события</Label>
          <Select
            value={formData.event_type}
            onValueChange={(value) => {
              const eventInfo = EVENT_TYPES.find(e => e.id === value);
              setFormData(prev => ({ 
                ...prev, 
                event_type: value as WeddingEventType,
                event_name: eventInfo?.name || "",
                hosted_by: (eventInfo?.defaultSide as "groom" | "bride" | "both") || "both",
              }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип события" />
            </SelectTrigger>
            <SelectContent>
              {EVENT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.id} value={type.id}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{type.name}</span>
                      <span className="text-muted-foreground">— {type.description}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label>Название события</Label>
        <Input
          value={formData.event_name}
          onChange={(e) => setFormData(prev => ({ ...prev, event_name: e.target.value }))}
          placeholder="Название"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Дата</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {formData.event_date 
                  ? format(formData.event_date, "d MMM yyyy", { locale: ru })
                  : "Выберите дату"
                }
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={formData.event_date || undefined}
                onSelect={(date) => setFormData(prev => ({ ...prev, event_date: date || null }))}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Сторона</Label>
          <Select
            value={formData.hosted_by}
            onValueChange={(value: "groom" | "bride" | "both") => 
              setFormData(prev => ({ ...prev, hosted_by: value }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="groom">Сторона жениха</SelectItem>
              <SelectItem value="bride">Сторона невесты</SelectItem>
              <SelectItem value="both">Обе стороны</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Место проведения</Label>
        <Input
          value={formData.venue_name}
          onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
          placeholder="Название площадки"
        />
      </div>

      <div className="space-y-2">
        <Label>Адрес</Label>
        <Input
          value={formData.venue_address}
          onChange={(e) => setFormData(prev => ({ ...prev, venue_address: e.target.value }))}
          placeholder="Адрес площадки"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Ожидаемое количество гостей</Label>
          <Input
            type="number"
            value={formData.expected_guests}
            onChange={(e) => setFormData(prev => ({ ...prev, expected_guests: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="space-y-2">
          <Label>Бюджет (сум)</Label>
          <Input
            type="number"
            value={formData.budget_allocated}
            onChange={(e) => setFormData(prev => ({ ...prev, budget_allocated: parseFloat(e.target.value) || 0 }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Заметки</Label>
        <Textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          placeholder="Дополнительная информация"
          rows={3}
        />
      </div>

      <Button 
        onClick={onSubmit} 
        disabled={isLoading || (isCreate && !formData.event_type)}
        className="w-full btn-gradient"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {isCreate ? "Создать событие" : "Сохранить изменения"}
      </Button>
    </div>
  );
}
