import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface GuestData {
  full_name: string;
  email: string | null;
  phone: string | null;
  plus_one_allowed: boolean | null;
  plus_one_name: string | null;
  attendance_status: string | null;
  dietary_restrictions: string | null;
}

interface WeddingPlanData {
  wedding_date: string | null;
  venue_location: string | null;
  theme: string | null;
  couple_user_id: string;
}

interface InvitationData {
  id: string;
  message: string | null;
  guest_id: string;
  wedding_plan_id: string;
}

export default function RSVP() {
  const { token } = useParams();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [weddingPlan, setWeddingPlan] = useState<WeddingPlanData | null>(null);
  const [invitation, setInvitation] = useState<InvitationData | null>(null);
  const [coupleName, setCoupleName] = useState<string>("");
  
  // Form state
  const [attendance, setAttendance] = useState<string>("");
  const [plusOneName, setPlusOneName] = useState<string>("");
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>("");
  const [bringPlusOne, setBringPlusOne] = useState(false);

  useEffect(() => {
    if (token) {
      fetchInvitationData();
    }
  }, [token]);

  const fetchInvitationData = async () => {
    try {
      // Fetch invitation with guest and wedding plan data
      const { data: invitationData, error: invError } = await supabase
        .from("guest_invitations")
        .select("*")
        .eq("token", token)
        .single();

      if (invError) throw invError;
      if (!invitationData) {
        toast({
          variant: "destructive",
          title: "Приглашение не найдено",
          description: "Проверьте правильность ссылки",
        });
        setLoading(false);
        return;
      }

      setInvitation(invitationData);

      // Update viewed_at if not already viewed
      if (!invitationData.viewed_at) {
        await supabase
          .from("guest_invitations")
          .update({ viewed_at: new Date().toISOString() })
          .eq("id", invitationData.id);
      }

      // Fetch guest data
      const { data: guestData, error: guestError } = await supabase
        .from("guests")
        .select("*")
        .eq("id", invitationData.guest_id)
        .single();

      if (guestError) throw guestError;
      setGuest(guestData);
      
      // Set form initial values
      if (guestData.attendance_status) {
        setAttendance(guestData.attendance_status);
      }
      if (guestData.plus_one_name) {
        setPlusOneName(guestData.plus_one_name);
        setBringPlusOne(true);
      }
      if (guestData.dietary_restrictions) {
        setDietaryRestrictions(guestData.dietary_restrictions);
      }

      // Fetch wedding plan
      const { data: planData, error: planError } = await supabase
        .from("wedding_plans")
        .select("*")
        .eq("id", invitationData.wedding_plan_id)
        .single();

      if (planError) throw planError;
      setWeddingPlan(planData);

      // Fetch couple name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", planData.couple_user_id)
        .single();

      if (profileData?.full_name) {
        setCoupleName(profileData.full_name);
      }

    } catch (error) {
      console.error("Error fetching invitation:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось загрузить данные приглашения",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attendance) {
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Пожалуйста, выберите ответ",
      });
      return;
    }

    setSubmitting(true);

    try {
      // Update guest data
      const updateData: any = {
        attendance_status: attendance,
        dietary_restrictions: dietaryRestrictions || null,
      };

      if (guest?.plus_one_allowed && bringPlusOne && plusOneName) {
        updateData.plus_one_name = plusOneName;
      } else {
        updateData.plus_one_name = null;
      }

      const { error: guestError } = await supabase
        .from("guests")
        .update(updateData)
        .eq("id", invitation!.guest_id);

      if (guestError) throw guestError;

      // Update invitation responded_at
      const { error: invError } = await supabase
        .from("guest_invitations")
        .update({ responded_at: new Date().toISOString() })
        .eq("id", invitation!.id);

      if (invError) throw invError;

      setSubmitted(true);
      toast({
        title: "Спасибо!",
        description: "Ваш ответ сохранен",
      });

    } catch (error) {
      console.error("Error submitting RSVP:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось сохранить ответ",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!guest || !weddingPlan || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Приглашение не найдено</CardTitle>
            <CardDescription>
              Проверьте правильность ссылки или обратитесь к организаторам
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/10 p-4">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Спасибо за ответ!</CardTitle>
            <CardDescription className="text-lg">
              {attendance === "confirmed" 
                ? "Мы рады, что вы сможете присутствовать на нашем празднике!"
                : "Спасибо за то, что сообщили нам. Надеемся увидеться в другой раз!"}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Heart className="w-8 h-8 mx-auto mb-4 text-primary fill-primary" />
            <p className="text-muted-foreground">
              До встречи {weddingPlan.wedding_date && new Date(weddingPlan.wedding_date).toLocaleDateString('ru-RU', { 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}!
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/10 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Heart className="w-12 h-12 mx-auto mb-4 text-primary fill-primary" />
          <h1 className="text-4xl font-bold mb-2">Приглашение на свадьбу</h1>
          {coupleName && (
            <p className="text-xl text-muted-foreground">от {coupleName}</p>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Дорогой(-ая) {guest.full_name}!</CardTitle>
            <CardDescription className="text-base mt-4">
              {invitation.message || "Мы будем рады видеть вас на праздновании нашей свадьбы!"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Wedding Details */}
            <div className="bg-accent/20 p-4 rounded-lg space-y-2">
              {weddingPlan.wedding_date && (
                <div>
                  <span className="font-semibold">Дата: </span>
                  {new Date(weddingPlan.wedding_date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              )}
              {weddingPlan.venue_location && (
                <div>
                  <span className="font-semibold">Место: </span>
                  {weddingPlan.venue_location}
                </div>
              )}
              {weddingPlan.theme && (
                <div>
                  <span className="font-semibold">Тема: </span>
                  {weddingPlan.theme}
                </div>
              )}
            </div>

            {/* RSVP Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Attendance */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  Сможете ли вы присутствовать? *
                </Label>
                <RadioGroup value={attendance} onValueChange={setAttendance}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="confirmed" id="confirmed" />
                    <Label htmlFor="confirmed" className="cursor-pointer">
                      Да, с радостью приду!
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="declined" id="declined" />
                    <Label htmlFor="declined" className="cursor-pointer">
                      К сожалению, не смогу
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="cursor-pointer">
                      Пока не уверен(-а)
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Plus One */}
              {guest.plus_one_allowed && attendance === "confirmed" && (
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="plusOne"
                      checked={bringPlusOne}
                      onCheckedChange={(checked) => setBringPlusOne(checked as boolean)}
                    />
                    <Label htmlFor="plusOne" className="cursor-pointer">
                      Я приду с сопровождающим
                    </Label>
                  </div>
                  
                  {bringPlusOne && (
                    <div className="ml-6">
                      <Label htmlFor="plusOneName">Имя сопровождающего</Label>
                      <Input
                        id="plusOneName"
                        value={plusOneName}
                        onChange={(e) => setPlusOneName(e.target.value)}
                        placeholder="Введите полное имя"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Dietary Restrictions */}
              {attendance === "confirmed" && (
                <div className="space-y-2">
                  <Label htmlFor="dietary">
                    Диетические ограничения или предпочтения
                  </Label>
                  <Textarea
                    id="dietary"
                    value={dietaryRestrictions}
                    onChange={(e) => setDietaryRestrictions(e.target.value)}
                    placeholder="Укажите ваши пищевые ограничения или аллергии..."
                    rows={3}
                  />
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Отправка...
                  </>
                ) : (
                  "Отправить ответ"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Если у вас есть вопросы, свяжитесь с организаторами</p>
          {guest.email && (
            <p className="mt-1">
              Подтверждение будет отправлено на: {guest.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
