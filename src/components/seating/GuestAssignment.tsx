import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Guest {
  id: string;
  full_name: string;
  email?: string;
  attendance_status?: string;
}

interface SeatingTable {
  id: string;
  tableNumber: number;
  capacity: number;
  assignedGuests?: number;
}

interface Assignment {
  guestId: string;
  tableId: string;
  guestName: string;
  tableNumber: number;
}

interface GuestAssignmentProps {
  guests: Guest[];
  tables: SeatingTable[];
  assignments: Assignment[];
  onAssign: (guestId: string, tableId: string) => void;
  onUnassign: (guestId: string) => void;
}

export function GuestAssignment({
  guests,
  tables,
  assignments,
  onAssign,
  onUnassign,
}: GuestAssignmentProps) {
  const [selectedGuest, setSelectedGuest] = useState<string>("");
  const [selectedTable, setSelectedTable] = useState<string>("");

  const unassignedGuests = guests.filter(
    g => !assignments.some(a => a.guestId === g.id) && 
    g.attendance_status === "attending"
  );

  const handleAssign = () => {
    if (selectedGuest && selectedTable) {
      onAssign(selectedGuest, selectedTable);
      setSelectedGuest("");
      setSelectedTable("");
    }
  };

  const getTableAssignments = (tableId: string) => {
    return assignments.filter(a => a.tableId === tableId);
  };

  const getTableCapacity = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    return table?.capacity || 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Назначить гостя
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Гость</label>
              <Select value={selectedGuest} onValueChange={setSelectedGuest}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите гостя" />
                </SelectTrigger>
                <SelectContent>
                  {unassignedGuests.map(guest => (
                    <SelectItem key={guest.id} value={guest.id}>
                      {guest.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Стол</label>
              <Select value={selectedTable} onValueChange={setSelectedTable}>
                <SelectTrigger>
                  <SelectValue placeholder="Выберите стол" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map(table => {
                    const assigned = getTableAssignments(table.id).length;
                    const available = table.capacity - assigned;
                    return (
                      <SelectItem 
                        key={table.id} 
                        value={table.id}
                        disabled={available === 0}
                      >
                        Стол {table.tableNumber} ({assigned}/{table.capacity})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button 
            onClick={handleAssign} 
            disabled={!selectedGuest || !selectedTable}
            className="w-full"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Назначить
          </Button>

          <div className="text-sm text-muted-foreground">
            Неназначенных гостей: {unassignedGuests.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Рассадка по столам
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {tables.map(table => {
                const tableAssignments = getTableAssignments(table.id);
                const capacity = getTableCapacity(table.id);
                const isFull = tableAssignments.length >= capacity;

                return (
                  <div key={table.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">Стол {table.tableNumber}</h4>
                        <Badge variant={isFull ? "default" : "secondary"}>
                          {tableAssignments.length}/{capacity}
                        </Badge>
                      </div>
                    </div>

                    {tableAssignments.length > 0 ? (
                      <div className="space-y-2">
                        {tableAssignments.map(assignment => (
                          <div
                            key={assignment.guestId}
                            className="flex items-center justify-between bg-muted p-2 rounded"
                          >
                            <span className="text-sm">{assignment.guestName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onUnassign(assignment.guestId)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Нет назначенных гостей
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
