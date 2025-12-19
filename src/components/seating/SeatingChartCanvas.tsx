import { useEffect, useRef, useState, useCallback } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Group, Text, FabricObject } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface SeatingChartCanvasProps {
  tables: SeatingTable[];
  onTablesUpdate: (tables: SeatingTable[]) => void;
  onSave: () => void;
  saving?: boolean;
  venueWidth?: number;
  venueHeight?: number;
}

export function SeatingChartCanvas({ 
  tables, 
  onTablesUpdate, 
  onSave,
  saving = false,
  venueWidth = 1000,
  venueHeight = 800
}: SeatingChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [selectedShape, setSelectedShape] = useState<"round" | "rectangle" | "square">("round");
  const [tableCapacity, setTableCapacity] = useState(8);
  const isUpdatingRef = useRef(false);
  const tablesRef = useRef<SeatingTable[]>(tables);
  const [syncNonce, setSyncNonce] = useState(0);
  const { toast } = useToast();

  // Keep tablesRef in sync
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  const createFabricTable = useCallback((table: SeatingTable): Group => {
    let shape: FabricObject;
    const color = table.color || "#f43f5e";
    
    if (table.shape === "round") {
      shape = new Circle({
        radius: table.width / 2,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
        originX: "center",
        originY: "center",
      });
    } else if (table.shape === "rectangle") {
      shape = new Rect({
        width: table.width,
        height: table.height,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
        originX: "center",
        originY: "center",
      });
    } else {
      shape = new Rect({
        width: table.width,
        height: table.width,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
        originX: "center",
        originY: "center",
      });
    }

    const text = new Text(`Стол ${table.tableNumber}\n${table.assignedGuests || 0}/${table.capacity}`, {
      fontSize: 14,
      fill: "#fff",
      originX: "center",
      originY: "center",
      textAlign: "center",
    });

    const group = new Group([shape, text], {
      left: table.x,
      top: table.y,
      angle: table.rotation,
      selectable: true,
      hasControls: true,
      hasBorders: true,
      originX: "center",
      originY: "center",
    });

    (group as any).tableId = table.id;
    return group;
  }, []);

  // Initialize canvas once
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: venueWidth,
      height: venueHeight,
      backgroundColor: "#f8f9fa",
      selection: true,
    });

    fabricCanvasRef.current = canvas;

    // Handle object modification - update state after drag/resize ends
    canvas.on("object:modified", (e) => {
      if (isUpdatingRef.current) return;

      const obj = e.target;
      if (!obj) return;

      const tableId = (obj as any).tableId;
      if (!tableId) return;

      isUpdatingRef.current = true;

      const updatedTables = tablesRef.current.map((table) => {
        if (table.id === tableId) {
          return {
            ...table,
            x: obj.left ?? table.x,
            y: obj.top ?? table.y,
            rotation: obj.angle ?? table.rotation,
          };
        }
        return table;
      });

      // Keep ref in sync immediately to avoid any stale reads
      tablesRef.current = updatedTables;
      onTablesUpdate(updatedTables);

      // Force a follow-up sync after React state settles
      setTimeout(() => {
        isUpdatingRef.current = false;
        setSyncNonce((n) => n + 1);
        canvas.requestRenderAll();
      }, 0);
    });

    return () => {
      canvas.dispose();
      fabricCanvasRef.current = null;
    };
  }, [venueWidth, venueHeight, onTablesUpdate]);

  // Sync tables to canvas when tables change (and after drag settles)
  useEffect(() => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    // IMPORTANT: don't early-return here; we still need to ensure objects exist.
    const canvasObjects = canvas.getObjects();
    const propsTableIds = new Set(tables.map((t) => t.id));

    // Remove tables that no longer exist in props (skip while actively updating)
    if (!isUpdatingRef.current) {
      canvasObjects.forEach((obj: any) => {
        if (obj.tableId && !propsTableIds.has(obj.tableId)) {
          canvas.remove(obj);
        }
      });
    }

    // Add or update tables
    tables.forEach((table) => {
      const existingObj = canvas.getObjects().find((obj: any) => obj.tableId === table.id);

      if (existingObj) {
        if (!isUpdatingRef.current) {
          const xDiff = Math.abs((existingObj.left ?? 0) - table.x);
          const yDiff = Math.abs((existingObj.top ?? 0) - table.y);

          if (xDiff > 1 || yDiff > 1) {
            existingObj.set({
              left: table.x,
              top: table.y,
              angle: table.rotation,
            });
            existingObj.setCoords();
          }
        }
      } else {
        const fabricTable = createFabricTable(table);
        canvas.add(fabricTable);
      }
    });

    canvas.requestRenderAll();
  }, [tables, createFabricTable, syncNonce]);

  const handleAddTable = () => {
    const newTable: SeatingTable = {
      id: `temp-${Date.now()}`,
      tableNumber: tables.length + 1,
      shape: selectedShape,
      capacity: tableCapacity,
      x: 150 + Math.random() * 200,
      y: 150 + Math.random() * 200,
      width: selectedShape === "round" ? 100 : 120,
      height: selectedShape === "rectangle" ? 60 : 100,
      rotation: 0,
      color: "#f43f5e",
      assignedGuests: 0,
    };

    onTablesUpdate([...tables, newTable]);
    
    toast({
      title: "Стол добавлен",
      description: `Стол ${newTable.tableNumber} добавлен на план`,
    });
  };

  const handleDeleteSelected = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      const tableId = (activeObject as any).tableId;
      const updatedTables = tables.filter(t => t.id !== tableId);
      canvas.remove(activeObject);
      onTablesUpdate(updatedTables);
      
      toast({
        title: "Стол удалён",
        description: "Выбранный стол удалён с плана",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите стол для удаления",
      });
    }
  };

  const handleExport = () => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    const link = document.createElement("a");
    link.download = `seating-chart-${Date.now()}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Экспортировано!",
      description: "План рассадки сохранён как изображение",
    });
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2">
            <label className="text-sm font-medium">Форма стола</label>
            <Select value={selectedShape} onValueChange={(v: any) => setSelectedShape(v)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round">Круглый</SelectItem>
                <SelectItem value="rectangle">Прямоугольный</SelectItem>
                <SelectItem value="square">Квадратный</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Вместимость</label>
            <Input
              type="number"
              value={tableCapacity}
              onChange={(e) => setTableCapacity(Number(e.target.value))}
              min={2}
              max={20}
              className="w-24"
            />
          </div>

          <Button onClick={handleAddTable}>
            <Plus className="w-4 h-4 mr-2" />
            Добавить стол
          </Button>

          <Button variant="destructive" onClick={handleDeleteSelected}>
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить выбранный
          </Button>

          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Экспорт PNG
          </Button>

          <div className="flex items-center gap-2">
            {saving && (
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </span>
            )}
            <Button onClick={onSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              Сохранить
            </Button>
          </div>
        </div>
      </Card>

      <div className="border rounded-lg overflow-hidden bg-white shadow-lg">
        <canvas ref={canvasRef} />
      </div>

      <div className="text-sm text-muted-foreground">
        💡 Совет: Перетаскивайте столы для размещения. Используйте углы для изменения размера и поворота.
      </div>
    </div>
  );
}
