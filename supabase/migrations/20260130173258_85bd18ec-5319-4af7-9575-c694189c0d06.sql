-- =============================================
-- Phase 5: AI Communications System
-- =============================================

-- Communication channel enum
CREATE TYPE public.communication_channel AS ENUM (
  'email',
  'sms',
  'telegram',
  'voice',
  'whatsapp'
);

-- Voice RSVP sessions table
CREATE TABLE public.voice_rsvp_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_invitation_id UUID NOT NULL REFERENCES public.guest_invitations(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  
  -- Session data
  session_token TEXT UNIQUE NOT NULL,
  elevenlabs_conversation_id TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Transcript
  transcript JSONB DEFAULT '[]',
  
  -- RSVP result extracted from conversation
  rsvp_response TEXT, -- 'attending', 'not_attending', 'maybe'
  plus_ones INTEGER DEFAULT 0,
  dietary_notes TEXT,
  special_requests TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Telegram bot connections
CREATE TABLE public.telegram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  
  -- Bot settings (encrypted reference)
  bot_token_reference TEXT,
  bot_username TEXT,
  
  -- Webhook URL
  webhook_secret TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  -- Stats
  total_messages_sent INTEGER DEFAULT 0,
  total_responses_received INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(wedding_plan_id)
);

-- Telegram RSVP responses
CREATE TABLE public.telegram_rsvp_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_connection_id UUID NOT NULL REFERENCES public.telegram_connections(id) ON DELETE CASCADE,
  guest_invitation_id UUID REFERENCES public.guest_invitations(id) ON DELETE SET NULL,
  guest_id UUID REFERENCES public.guests(id) ON DELETE SET NULL,
  
  -- Telegram user data
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  
  -- Message data
  message_id BIGINT,
  chat_id BIGINT,
  message_text TEXT,
  
  -- Parsed RSVP
  rsvp_response TEXT,
  plus_ones INTEGER DEFAULT 0,
  dietary_notes TEXT,
  
  -- Matching status
  matched_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Communication preferences per wedding
CREATE TABLE public.communication_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  
  -- Enabled channels
  voice_rsvp_enabled BOOLEAN DEFAULT false,
  telegram_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  
  -- Voice settings
  voice_language TEXT DEFAULT 'ru',
  voice_id TEXT DEFAULT 'onwK4e9ZLuTAKqWW03F9', -- Daniel voice
  
  -- Auto-response messages
  confirmation_message_template TEXT,
  reminder_message_template TEXT,
  
  -- Reminder settings
  auto_reminders_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER[] DEFAULT ARRAY[7, 3, 1],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(wedding_plan_id)
);

-- Indexes
CREATE INDEX idx_voice_sessions_invitation ON public.voice_rsvp_sessions(guest_invitation_id);
CREATE INDEX idx_voice_sessions_token ON public.voice_rsvp_sessions(session_token);
CREATE INDEX idx_telegram_responses_user ON public.telegram_rsvp_responses(telegram_user_id);
CREATE INDEX idx_telegram_responses_guest ON public.telegram_rsvp_responses(guest_id);

-- Enable RLS
ALTER TABLE public.voice_rsvp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for voice_rsvp_sessions
CREATE POLICY "Couples can view their voice sessions"
ON public.voice_rsvp_sessions FOR SELECT
USING (wedding_plan_id IN (
  SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid()
));

CREATE POLICY "Public can create voice sessions with valid token"
ON public.voice_rsvp_sessions FOR INSERT
WITH CHECK (true); -- Validated in edge function

CREATE POLICY "Public can update voice sessions with valid token"
ON public.voice_rsvp_sessions FOR UPDATE
USING (true); -- Validated in edge function

-- RLS Policies for telegram_connections
CREATE POLICY "Couples can manage their telegram connections"
ON public.telegram_connections FOR ALL
USING (wedding_plan_id IN (
  SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid()
));

-- RLS Policies for telegram_rsvp_responses
CREATE POLICY "Couples can view telegram responses"
ON public.telegram_rsvp_responses FOR SELECT
USING (telegram_connection_id IN (
  SELECT id FROM public.telegram_connections WHERE wedding_plan_id IN (
    SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid()
  )
));

-- RLS Policies for communication_settings
CREATE POLICY "Couples can manage their communication settings"
ON public.communication_settings FOR ALL
USING (wedding_plan_id IN (
  SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid()
));

-- Triggers
CREATE TRIGGER update_voice_sessions_updated_at
BEFORE UPDATE ON public.voice_rsvp_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_telegram_connections_updated_at
BEFORE UPDATE ON public.telegram_connections
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_communication_settings_updated_at
BEFORE UPDATE ON public.communication_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();