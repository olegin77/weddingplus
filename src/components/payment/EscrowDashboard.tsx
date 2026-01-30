import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  ArrowRightLeft,
  Loader2
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface EscrowTransaction {
  id: string;
  booking_id: string;
  vendor_id: string;
  amount: number;
  platform_fee: number;
  vendor_amount: number;
  currency: string;
  status: string;
  status_reason: string | null;
  scheduled_release_at: string | null;
  released_at: string | null;
  created_at: string;
  booking?: {
    booking_date: string;
    notes: string | null;
  };
  vendor?: {
    business_name: string;
    location: string | null;
  };
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Shield }> = {
  pending: { label: "В эскроу", color: "bg-blue-500", icon: Shield },
  released: { label: "Выплачено", color: "bg-green-500", icon: CheckCircle },
  refunded: { label: "Возвращено", color: "bg-orange-500", icon: ArrowRightLeft },
  disputed: { label: "Спор", color: "bg-red-500", icon: AlertTriangle },
  partial_release: { label: "Частично", color: "bg-yellow-500", icon: Clock },
};

export function EscrowDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEscrow, setSelectedEscrow] = useState<EscrowTransaction | null>(null);
  const [actionType, setActionType] = useState<"release" | "dispute" | null>(null);
  const [reason, setReason] = useState("");

  const { data: escrowTransactions, isLoading } = useQuery({
    queryKey: ["escrow-transactions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("escrow_transactions")
        .select(`
          *,
          booking:bookings(booking_date, notes),
          vendor:vendor_profiles(business_name, location)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EscrowTransaction[];
    },
  });

  const escrowAction = useMutation({
    mutationFn: async ({ action, escrowId, reason }: { action: string; escrowId: string; reason?: string }) => {
      const { data, error } = await supabase.functions.invoke("escrow-management", {
        body: { action, escrowId, reason },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Успешно",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ["escrow-transactions"] });
      setSelectedEscrow(null);
      setActionType(null);
      setReason("");
    },
    onError: (error: Error) => {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAction = () => {
    if (!selectedEscrow || !actionType) return;
    escrowAction.mutate({
      action: actionType,
      escrowId: selectedEscrow.id,
      reason,
    });
  };

  const pendingTransactions = escrowTransactions?.filter(t => t.status === "pending") || [];
  const completedTransactions = escrowTransactions?.filter(t => ["released", "refunded"].includes(t.status)) || [];
  const disputedTransactions = escrowTransactions?.filter(t => t.status === "disputed") || [];

  const totalInEscrow = pendingTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalReleased = completedTransactions
    .filter(t => t.status === "released")
    .reduce((sum, t) => sum + Number(t.vendor_amount), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">В эскроу</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {totalInEscrow.toLocaleString()} UZS
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingTransactions.length} транзакций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Выплачено</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalReleased.toLocaleString()} UZS
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedTransactions.filter(t => t.status === "released").length} транзакций
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Споры</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {disputedTransactions.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              активных споров
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Эскроу транзакции
          </CardTitle>
          <CardDescription>
            Безопасные платежи с защитой для обеих сторон
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="pending">
                Активные ({pendingTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Завершённые ({completedTransactions.length})
              </TabsTrigger>
              <TabsTrigger value="disputed">
                Споры ({disputedTransactions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-4">
              {pendingTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет активных эскроу транзакций
                </p>
              ) : (
                pendingTransactions.map((tx) => (
                  <EscrowCard
                    key={tx.id}
                    transaction={tx}
                    onRelease={() => {
                      setSelectedEscrow(tx);
                      setActionType("release");
                    }}
                    onDispute={() => {
                      setSelectedEscrow(tx);
                      setActionType("dispute");
                    }}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4 mt-4">
              {completedTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет завершённых транзакций
                </p>
              ) : (
                completedTransactions.map((tx) => (
                  <EscrowCard key={tx.id} transaction={tx} />
                ))
              )}
            </TabsContent>

            <TabsContent value="disputed" className="space-y-4 mt-4">
              {disputedTransactions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Нет активных споров
                </p>
              ) : (
                disputedTransactions.map((tx) => (
                  <EscrowCard key={tx.id} transaction={tx} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "release" ? "Подтвердить выплату" : "Открыть спор"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "release"
                ? "После подтверждения средства будут выплачены поставщику."
                : "Опишите причину спора. Наша команда рассмотрит его в течение 24 часов."}
            </DialogDescription>
          </DialogHeader>

          {selectedEscrow && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <p className="font-medium">{selectedEscrow.vendor?.business_name}</p>
                <p className="text-2xl font-bold mt-2">
                  {Number(selectedEscrow.vendor_amount).toLocaleString()} {selectedEscrow.currency}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Комиссия платформы: {Number(selectedEscrow.platform_fee).toLocaleString()} {selectedEscrow.currency}
                </p>
              </div>

              <Textarea
                placeholder={actionType === "release" ? "Комментарий (опционально)" : "Опишите причину спора..."}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionType(null)}>
              Отмена
            </Button>
            <Button
              onClick={handleAction}
              disabled={escrowAction.isPending || (actionType === "dispute" && !reason)}
              variant={actionType === "dispute" ? "destructive" : "default"}
            >
              {escrowAction.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {actionType === "release" ? "Подтвердить выплату" : "Открыть спор"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function EscrowCard({
  transaction,
  onRelease,
  onDispute,
}: {
  transaction: EscrowTransaction;
  onRelease?: () => void;
  onDispute?: () => void;
}) {
  const config = statusConfig[transaction.status] || statusConfig.pending;
  const StatusIcon = config.icon;

  return (
    <div className="border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-full ${config.color} text-white`}>
          <StatusIcon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium">{transaction.vendor?.business_name}</p>
          <p className="text-sm text-muted-foreground">
            {transaction.booking?.booking_date
              ? new Date(transaction.booking.booking_date).toLocaleDateString("ru-RU")
              : "Дата не указана"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold">
            {Number(transaction.amount).toLocaleString()} {transaction.currency}
          </p>
          <Badge variant="secondary" className="mt-1">
            {config.label}
          </Badge>
        </div>

        {transaction.status === "pending" && (onRelease || onDispute) && (
          <div className="flex gap-2">
            {onRelease && (
              <Button size="sm" onClick={onRelease}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Выплатить
              </Button>
            )}
            {onDispute && (
              <Button size="sm" variant="outline" onClick={onDispute}>
                <AlertTriangle className="h-4 w-4 mr-1" />
                Спор
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default EscrowDashboard;
