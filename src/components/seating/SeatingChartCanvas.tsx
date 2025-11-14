import { useEffect, useRef, useState } from "react";
import { Canvas as FabricCanvas, Circle, Rect, Group, Text } from "fabric";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Plus, Trash2, Save } from "lucide-react";
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
  venueWidth?: number;
  venueHeight?: number;
}

export function SeatingChartCanvas({ 
  tables, 
  onTablesUpdate, 
  onSave,
  venueWidth = 1000,
  venueHeight = 800
}: SeatingChartCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
  const [selectedShape, setSelectedShape] = useState<"round" | "rectangle" | "square">("round");
  const [tableCapacity, setTableCapacity] = useState(8);
  const { toast } = useToast();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: venueWidth,
      height: venueHeight,
      backgroundColor: "#f8f9fa",
      selection: true,
    });

    setFabricCanvas(canvas);

    // Handle object modification
    canvas.on("object:modified", () => {
      updateTablesFromCanvas(canvas);
    });

    return () => {
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvas) return;
    
    // Clear canvas and redraw all tables
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = "#f8f9fa";
    
    tables.forEach(table => {
      const fabricTable = createFabricTable(table);
      fabricCanvas.add(fabricTable);
    });
    
    fabricCanvas.renderAll();
  }, [tables, fabricCanvas]);

  const createFabricTable = (table: SeatingTable) => {
    let shape;
    const color = table.color || "#f43f5e";
    
    if (table.shape === "round") {
      shape = new Circle({
        radius: table.width / 2,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
      });
    } else if (table.shape === "rectangle") {
      shape = new Rect({
        width: table.width,
        height: table.height,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
      });
    } else { // square
      shape = new Rect({
        width: table.width,
        height: table.width,
        fill: color,
        opacity: 0.7,
        stroke: "#000",
        strokeWidth: 2,
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
    });

    // Store table id in the group
    group.set("tableId", table.id);

    return group;
  };

  const updateTablesFromCanvas = (canvas: FabricCanvas) => {
    const updatedTables = tables.map(table => {
      const fabricObj = canvas.getObjects().find((obj: any) => obj.tableId === table.id);
      if (fabricObj) {
        return {
          ...table,
          x: fabricObj.left || table.x,
          y: fabricObj.top || table.y,
          rotation: fabricObj.angle || table.rotation,
        };
      }
      return table;
    });
    onTablesUpdate(updatedTables);
  };

  const handleAddTable = () => {
    const newTable: SeatingTable = {
      id: `temp-${Date.now()}`,
      tableNumber: tables.length + 1,
      shape: selectedShape,
      capacity: tableCapacity,
      x: 100,
      y: 100,
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
    if (!fabricCanvas) return;

    const activeObject = fabricCanvas.getActiveObject();
    if (activeObject) {
      const tableId = (activeObject as any).tableId;
      const updatedTables = tables.filter(t => t.id !== tableId);
      onTablesUpdate(updatedTables);
      fabricCanvas.remove(activeObject);
      
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
    if (!fabricCanvas) return;

    const dataURL = fabricCanvas.toDataURL({
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

          <Button onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
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
