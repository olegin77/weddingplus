import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Copy, 
  Mail, 
  Eye, 
  CheckCircle2, 
  Clock,
  Loader2,
  Link as LinkIcon
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface InvitationManagerProps {
  weddingPlanId: string;
}

interface Guest {
  id: string;
  full_name: string;
  email: string | null;
  attendance_status: string | null;
}

interface Invitation {
  id: string;
  guest_id: string;
  token: string;
  sent_at: string | null;
  viewed_at: string | null;
  responded_at: string | null;
}

export function InvitationManager({ weddingPlanId }: InvitationManagerProps) {
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [selectedGuests, setSelectedGuests] = useState<string[]>([]);

  useEffect(() => {
    fetchGuestsAndInvitations();
  }, [weddingPlanId]);

  const fetchGuestsAndInvitations = async () => {
    try {
      // Fetch guests
      const { data: guestsData, error: guestsError } = await supabase
        .from("guests")
        .select("id, full_name, email, attendance_status")
        .eq("wedding_plan_id", weddingPlanId)
        .order("full_name");

      if (guestsError) throw guestsError;
      setGuests(guestsData || []);

      // Fetch invitations
      const { data: invitationsData, error: invitationsError } = await supabase
        .from("guest_invitations")
        .select("*")
        .eq("wedding_plan_id", weddingPlanId);

      if (invitationsError) throw invitationsError;
      setInvitations(invitationsData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateInvitations = async () => {
    if (selectedGuests.length === 0) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Выберите хотя бы одного гостя",
      });
      return;
    }

    setGenerating(true);

    try {
      const invitationsToCreate = selectedGuests.map(guestId => ({
        guest_id: guestId,
        wedding_plan_id: weddingPlanId,
        token: generateToken(),
        message: customMessage || null,
      }));

      const { error } = await supabase
        .from("guest_invitations")
        .insert(invitationsToCreate);

      if (error) throw error;

      toast({
        title: "Успешно!",
        description: `Создано приглашений: ${selectedGuests.length}`,
      });

      setSelectedGuests([]);
      setCustomMessage("");
      fetchGuestsAndInvitations();

    } catch (error) {
      console.error("Error generating invitations:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать приглашения",
      });
    } finally {
      setGenerating(false);
    }
  };

  const generateToken = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  };

  const copyInvitationLink = (token: string) => {
    const link = `${window.location.origin}/rsvp/${token}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Скопировано!",
      description: "Ссылка скопирована в буфер обмена",
    });
  };

  const getInvitationForGuest = (guestId: string) => {
    return invitations.find(inv => inv.guest_id === guestId);
  };

  const getStatusBadge = (guest: Guest, invitation?: Invitation) => {
    if (!invitation) {
      return <Badge variant="outline">Не отправлено</Badge>;
    }
    if (invitation.responded_at) {
      return <Badge variant="default" className="bg-green-500">Ответил</Badge>;
    }
    if (invitation.viewed_at) {
      return <Badge variant="secondary">Просмотрено</Badge>;
    }
    if (invitation.sent_at) {
      return <Badge>Отправлено</Badge>;
    }
    return <Badge variant="outline">Создано</Badge>;
  };

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuests(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const selectAllGuests = () => {
    const guestsWithoutInvitations = guests
      .filter(guest => !getInvitationForGuest(guest.id))
      .map(g => g.id);
    setSelectedGuests(guestsWithoutInvitations);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  const guestsWithoutInvitations = guests.filter(
    guest => !getInvitationForGuest(guest.id)
  );

  return (
    <div className="space-y-6">
      {/* Generate Invitations Card */}
      {guestsWithoutInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Создать приглашения</CardTitle>
            <CardDescription>
              Выберите гостей и создайте персональные ссылки для RSVP
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message">Персональное сообщение (опционально)</Label>
              <Textarea
                id="message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Добавьте персональное сообщение для гостей..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={selectAllGuests}
                variant="outline"
                size="sm"
              >
                Выбрать всех ({guestsWithoutInvitations.length})
              </Button>
              <Button
                onClick={generateInvitations}
                disabled={generating || selectedGuests.length === 0}
              >
                {generating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Создание...
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Создать приглашения ({selectedGuests.length})
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Список приглашений</CardTitle>
          <CardDescription>
            Управление отправленными приглашениями и отслеживание ответов
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Гость</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Ответ</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {guests.map(guest => {
                const invitation = getInvitationForGuest(guest.id);
                const hasInvitation = !!invitation;
                
                return (
                  <TableRow key={guest.id}>
                    <TableCell>
                      {!hasInvitation && (
                        <input
                          type="checkbox"
                          checked={selectedGuests.includes(guest.id)}
                          onChange={() => toggleGuestSelection(guest.id)}
                          className="mr-2"
                        />
                      )}
                      {guest.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {guest.email || "—"}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(guest, invitation)}
                    </TableCell>
                    <TableCell>
                      {guest.attendance_status === "confirmed" && (
                        <span className="text-green-600 flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Придет
                        </span>
                      )}
                      {guest.attendance_status === "declined" && (
                        <span className="text-red-600">Не придет</span>
                      )}
                      {guest.attendance_status === "pending" && (
                        <span className="text-yellow-600 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Думает
                        </span>
                      )}
                      {!guest.attendance_status && "—"}
                    </TableCell>
                    <TableCell>
                      {hasInvitation && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInvitationLink(invitation.token)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ссылка приглашения</DialogTitle>
                                <DialogDescription>
                                  Отправьте эту ссылку гостю для подтверждения участия
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-accent p-4 rounded-lg break-all">
                                  {`${window.location.origin}/rsvp/${invitation.token}`}
                                </div>
                                <Button
                                  onClick={() => copyInvitationLink(invitation.token)}
                                  className="w-full"
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  Скопировать ссылку
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {guests.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Сначала добавьте гостей в список</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
