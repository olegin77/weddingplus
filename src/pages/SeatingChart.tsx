import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SeatingChartCanvas } from "@/components/seating/SeatingChartCanvas";
import { GuestAssignment } from "@/components/seating/GuestAssignment";
import { CreateWeddingPlanDialog } from "@/components/CreateWeddingPlanDialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LayoutGrid } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SeatingTable {
  id: string;
  tableNumber: number;
  shape: string;
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  color: string;
  assignedGuests?: number;
}

interface Guest {
  id: string;
  full_name: string;
  email?: string;
  attendance_status?: string;
}

interface Assignment {
  guestId: string;
  tableId: string;
  guestName: string;
  tableNumber: number;
}

export default function SeatingChart() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weddingPlanId, setWeddingPlanId] = useState<string | null>(null);
  const [seatingChartId, setSeatingChartId] = useState<string | null>(null);
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoadRef = useRef(true);
  const saveRef = useRef<() => Promise<void>>();

  useEffect(() => {
    checkWeddingPlan();
  }, []);

  useEffect(() => {
    if (weddingPlanId) {
      loadSeatingChart();
      loadGuests();
    }
  }, [weddingPlanId]);

  const checkWeddingPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: plans, error } = await supabase
        .from("wedding_plans")
        .select("id")
        .eq("couple_user_id", user.id)
        .limit(1);

      if (error) throw error;

      if (plans && plans.length > 0) {
        setWeddingPlanId(plans[0].id);
      }
    } catch (error) {
      console.error("Error checking wedding plan:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить план свадьбы",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSeatingChart = async () => {
    if (!weddingPlanId) return;

    try {
      // Check if seating chart exists
      const { data: charts, error: chartError } = await supabase
        .from("seating_charts")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId)
        .limit(1);

      if (chartError) throw chartError;

      if (charts && charts.length > 0) {
        setSeatingChartId(charts[0].id);
        
        // Load tables
        const { data: tablesData, error: tablesError } = await supabase
          .from("seating_tables")
          .select("*")
          .eq("seating_chart_id", charts[0].id);

        if (tablesError) throw tablesError;

        if (tablesData) {
          const mappedTables: SeatingTable[] = tablesData.map(t => ({
            id: t.id,
            tableNumber: t.table_number,
            shape: t.shape,
            capacity: t.capacity,
            x: Number(t.position_x),
            y: Number(t.position_y),
            width: Number(t.width),
            height: Number(t.height),
            rotation: Number(t.rotation),
            color: t.color,
          }));
          setTables(mappedTables);

          // Load assignments
          loadAssignments(charts[0].id, mappedTables);
        }
      } else {
        // Create new seating chart
        const { data: newChart, error: createError } = await supabase
          .from("seating_charts")
          .insert({
            wedding_plan_id: weddingPlanId,
            name: "План рассадки",
          })
          .select()
          .single();

        if (createError) throw createError;
        setSeatingChartId(newChart.id);
      }
    } catch (error) {
      console.error("Error loading seating chart:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить план рассадки",
      });
    }
  };

  const loadGuests = async () => {
    if (!weddingPlanId) return;

    try {
      const { data, error } = await supabase
        .from("guests")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId);

      if (error) throw error;
      setGuests(data || []);
    } catch (error) {
      console.error("Error loading guests:", error);
    }
  };

  const loadAssignments = async (chartId: string, tablesData: SeatingTable[]) => {
    try {
      const tableIds = tablesData.map(t => t.id);
      
      const { data, error } = await supabase
        .from("table_assignments")
        .select(`
          *,
          guests:guest_id (full_name),
          seating_tables:seating_table_id (table_number)
        `)
        .in("seating_table_id", tableIds);

      if (error) throw error;

      if (data) {
        const mappedAssignments: Assignment[] = data.map((a: any) => ({
          guestId: a.guest_id,
          tableId: a.seating_table_id,
          guestName: a.guests?.full_name || "Unknown",
          tableNumber: a.seating_tables?.table_number || 0,
        }));
        setAssignments(mappedAssignments);

        // Update assigned guests count
        const updatedTables = tablesData.map(table => ({
          ...table,
          assignedGuests: mappedAssignments.filter(a => a.tableId === table.id).length,
        }));
        setTables(updatedTables);
      }
    } catch (error) {
      console.error("Error loading assignments:", error);
    }
  };

  // Auto-save with debounce when tables change
  const handleTablesUpdate = useCallback((newTables: SeatingTable[]) => {
    setTables(newTables);
    
    // Skip auto-save on initial load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    // Clear previous timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new debounced auto-save timer (1.5 seconds)
    autoSaveTimerRef.current = setTimeout(() => {
      saveRef.current?.();
    }, 1500);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const handleSave = async () => {
    if (!seatingChartId) return;

    setSaving(true);
    try {
      // Separate new tables (temp) from existing tables
      const existingTables = tables.filter(t => !t.id.startsWith("temp-"));
      const newTables = tables.filter(t => t.id.startsWith("temp-"));

      // Get current table IDs from database to find deleted ones
      const { data: dbTables } = await supabase
        .from("seating_tables")
        .select("id")
        .eq("seating_chart_id", seatingChartId);

      const currentDbIds = new Set(dbTables?.map(t => t.id) || []);
      const localIds = new Set(existingTables.map(t => t.id));

      // Delete tables that were removed locally
      const tablesToDelete = [...currentDbIds].filter(id => !localIds.has(id));
      if (tablesToDelete.length > 0) {
        await supabase
          .from("seating_tables")
          .delete()
          .in("id", tablesToDelete);
      }

      // Update existing tables
      for (const table of existingTables) {
        await supabase
          .from("seating_tables")
          .update({
            table_number: table.tableNumber,
            shape: table.shape,
            capacity: table.capacity,
            position_x: table.x,
            position_y: table.y,
            width: table.width,
            height: table.height,
            rotation: table.rotation,
            color: table.color,
          })
          .eq("id", table.id);
      }

      // Insert new tables
      if (newTables.length > 0) {
        const newTablesData = newTables.map(t => ({
          seating_chart_id: seatingChartId,
          table_number: t.tableNumber,
          shape: t.shape,
          capacity: t.capacity,
          position_x: t.x,
          position_y: t.y,
          width: t.width,
          height: t.height,
          rotation: t.rotation,
          color: t.color,
        }));

        const { data: insertedTables, error: insertError } = await supabase
          .from("seating_tables")
          .insert(newTablesData)
          .select();

        if (insertError) throw insertError;

        // Update local state with real IDs
        if (insertedTables) {
          const updatedTables = tables.map(t => {
            if (t.id.startsWith("temp-")) {
              const inserted = insertedTables.find(it => it.table_number === t.tableNumber);
              if (inserted) {
                return { ...t, id: inserted.id };
              }
            }
            return t;
          });
          setTables(updatedTables);
        }
      }

      toast({
        title: "Сохранено! ✅",
        description: "План рассадки успешно сохранён",
      });
    } catch (error) {
      console.error("Error saving seating chart:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить план рассадки",
      });
    } finally {
      setSaving(false);
    }
  };

  // Keep saveRef updated for debounced auto-save
  useEffect(() => {
    saveRef.current = handleSave;
  });

  const handleAssignGuest = async (guestId: string, tableId: string) => {
    try {
      const { error } = await supabase
        .from("table_assignments")
        .insert({
          seating_table_id: tableId,
          guest_id: guestId,
        });

      if (error) throw error;

      // Reload assignments
      if (seatingChartId) {
        loadAssignments(seatingChartId, tables);
      }

      toast({
        title: "Назначено!",
        description: "Гость успешно назначен к столу",
      });
    } catch (error) {
      console.error("Error assigning guest:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось назначить гостя",
      });
    }
  };

  const handleUnassignGuest = async (guestId: string) => {
    try {
      const { error } = await supabase
        .from("table_assignments")
        .delete()
        .eq("guest_id", guestId);

      if (error) throw error;

      // Reload assignments
      if (seatingChartId) {
        loadAssignments(seatingChartId, tables);
      }

      toast({
        title: "Удалено",
        description: "Гость удалён со стола",
      });
    } catch (error) {
      console.error("Error unassigning guest:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось удалить гостя",
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-7xl py-8">
        {weddingPlanId ? (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LayoutGrid className="w-6 h-6 text-primary" />
                  Генератор Схемы Рассадки
                </CardTitle>
                <CardDescription>
                  Создайте план рассадки гостей с помощью drag & drop интерфейса
                </CardDescription>
              </CardHeader>
            </Card>

            <Tabs defaultValue="canvas" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 max-w-md">
                <TabsTrigger value="canvas">План зала</TabsTrigger>
                <TabsTrigger value="guests">Назначение гостей</TabsTrigger>
              </TabsList>

              <TabsContent value="canvas">
                <SeatingChartCanvas
                  tables={tables}
                  onTablesUpdate={handleTablesUpdate}
                  onSave={handleSave}
                  saving={saving}
                />
              </TabsContent>

              <TabsContent value="guests">
                <GuestAssignment
                  guests={guests}
                  tables={tables}
                  assignments={assignments}
                  onAssign={handleAssignGuest}
                  onUnassign={handleUnassignGuest}
                />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Сначала создайте свадебный план
            </p>
            <CreateWeddingPlanDialog onSuccess={checkWeddingPlan} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
