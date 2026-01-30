import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface VoiceRSVPAgentProps {
  sessionToken: string;
  guestName?: string;
  onComplete?: (response: { rsvpResponse: string; plusOnes: number; dietaryNotes?: string }) => void;
}

export function VoiceRSVPAgent({ sessionToken, guestName, onComplete }: VoiceRSVPAgentProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<Array<{ role: string; text: string }>>([]);
  const [rsvpResult, setRsvpResult] = useState<{
    rsvpResponse?: string;
    plusOnes?: number;
    dietaryNotes?: string;
  } | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log("Voice RSVP connected");
      toast({
        title: "Подключено",
        description: "Голосовой ассистент готов. Говорите!",
      });
    },
    onDisconnect: () => {
      console.log("Voice RSVP disconnected");
      if (rsvpResult) {
        saveResult();
      }
    },
    onMessage: (message: any) => {
      console.log("Message:", message);
      
      // Handle different message types
      if (message.type === "user_transcript") {
        const userText = message.user_transcription_event?.user_transcript;
        if (userText) {
          setTranscript(prev => [...prev, { role: "user", text: userText }]);
        }
      }
      
      if (message.type === "agent_response") {
        const agentText = message.agent_response_event?.agent_response;
        if (agentText) {
          setTranscript(prev => [...prev, { role: "agent", text: agentText }]);
          
          // Try to parse RSVP response from agent
          parseRSVPFromResponse(agentText);
        }
      }
    },
    onError: (error) => {
      console.error("Voice RSVP error:", error);
      toast({
        title: "Ошибка соединения",
        description: "Не удалось подключиться к голосовому ассистенту",
        variant: "destructive",
      });
    },
    clientTools: {
      saveRsvpResponse: (params: { response: string; plusOnes?: number; dietaryNotes?: string }) => {
        console.log("RSVP response received:", params);
        setRsvpResult({
          rsvpResponse: params.response,
          plusOnes: params.plusOnes || 0,
          dietaryNotes: params.dietaryNotes,
        });
        return "RSVP saved successfully";
      },
    },
  });

  const parseRSVPFromResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes("записал") || lowerText.includes("подтвердил")) {
      if (lowerText.includes("придёте") || lowerText.includes("приходите") || lowerText.includes("будете")) {
        setRsvpResult(prev => ({ ...prev, rsvpResponse: "attending" }));
      } else if (lowerText.includes("не сможете") || lowerText.includes("не придёте")) {
        setRsvpResult(prev => ({ ...prev, rsvpResponse: "not_attending" }));
      }
    }
  };

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get token from edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-rsvp?action=get-token`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({ sessionToken }),
        }
      );

      const data = await response.json();

      if (!data.success || !data.token) {
        throw new Error(data.error || "No token received");
      }

      // Start the conversation with WebRTC
      await conversation.startSession({
        conversationToken: data.token,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось начать разговор",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  }, [conversation, sessionToken, toast]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const saveResult = async () => {
    if (!rsvpResult?.rsvpResponse) return;

    try {
      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-rsvp?action=save-result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: JSON.stringify({
            sessionToken,
            rsvpResponse: rsvpResult.rsvpResponse,
            plusOnes: rsvpResult.plusOnes || 0,
            dietaryNotes: rsvpResult.dietaryNotes,
            transcript,
          }),
        }
      );

      onComplete?.(rsvpResult as any);
    } catch (error) {
      console.error("Failed to save RSVP result:", error);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Phone className="h-6 w-6" />
          Голосовой RSVP
        </CardTitle>
        <CardDescription>
          {guestName ? `Здравствуйте, ${guestName}!` : "Добро пожаловать!"}
          <br />
          Нажмите кнопку и расскажите, сможете ли вы прийти на свадьбу.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status indicator */}
        <div className="flex items-center justify-center gap-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${
            conversation.status === "connected" 
              ? "bg-green-500 animate-pulse" 
              : "bg-gray-300"
          }`} />
          <span className="text-muted-foreground">
            {conversation.status === "connected" 
              ? conversation.isSpeaking ? "Ассистент говорит..." : "Слушаю..."
              : "Не подключено"}
          </span>
        </div>

        {/* Main control button */}
        <div className="flex justify-center">
          {conversation.status === "disconnected" ? (
            <Button
              size="lg"
              onClick={startConversation}
              disabled={isConnecting}
              className="h-20 w-20 rounded-full"
            >
              {isConnecting ? (
                <Loader2 className="h-8 w-8 animate-spin" />
              ) : (
                <Mic className="h-8 w-8" />
              )}
            </Button>
          ) : (
            <Button
              size="lg"
              variant="destructive"
              onClick={stopConversation}
              className="h-20 w-20 rounded-full"
            >
              <PhoneOff className="h-8 w-8" />
            </Button>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          {conversation.status === "disconnected" 
            ? "Нажмите для начала разговора"
            : "Нажмите для завершения"}
        </p>

        {/* Transcript */}
        {transcript.length > 0 && (
          <div className="border rounded-lg p-4 max-h-48 overflow-y-auto space-y-2">
            {transcript.map((item, idx) => (
              <div key={idx} className={`text-sm ${
                item.role === "user" ? "text-right" : "text-left"
              }`}>
                <span className={`inline-block px-3 py-1 rounded-lg ${
                  item.role === "user" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted"
                }`}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Result */}
        {rsvpResult?.rsvpResponse && (
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="font-medium">Ваш ответ записан:</p>
            <p className="text-lg">
              {rsvpResult.rsvpResponse === "attending" && "✅ Вы придёте!"}
              {rsvpResult.rsvpResponse === "not_attending" && "❌ Вы не сможете прийти"}
              {rsvpResult.rsvpResponse === "maybe" && "❓ Возможно придёте"}
            </p>
            {rsvpResult.plusOnes ? (
              <p className="text-sm text-muted-foreground">
                +{rsvpResult.plusOnes} гостей с вами
              </p>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default VoiceRSVPAgent;
