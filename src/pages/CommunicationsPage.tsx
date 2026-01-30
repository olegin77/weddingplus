import { DashboardLayout } from "@/components/DashboardLayout";
import CommunicationSettings from "@/components/communication/CommunicationSettings";
import { MessageCircle } from "lucide-react";

export default function CommunicationsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8" />
            Коммуникации
          </h1>
          <p className="text-muted-foreground">
            Голосовой RSVP и Telegram для взаимодействия с гостями
          </p>
        </div>

        <CommunicationSettings />
      </div>
    </DashboardLayout>
  );
}
