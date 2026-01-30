-- Create enum for wedding event types
CREATE TYPE public.wedding_event_type AS ENUM (
  'nahorgi_osh',
  'fotiha', 
  'nikoh',
  'kelin_salom',
  'toy'
);

-- Create enum for which side hosts the event
CREATE TYPE public.wedding_side AS ENUM (
  'groom',
  'bride',
  'both'
);

-- Create wedding_events table for multi-event lifecycle
CREATE TABLE public.wedding_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  event_type public.wedding_event_type NOT NULL,
  event_name TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  venue_address TEXT,
  hosted_by public.wedding_side NOT NULL DEFAULT 'both',
  expected_guests INTEGER DEFAULT 0,
  budget_allocated NUMERIC DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create guest_event_invitations for per-event RSVP
CREATE TABLE public.guest_event_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
  plus_ones INTEGER DEFAULT 0,
  dietary_notes TEXT,
  transport_needed BOOLEAN DEFAULT FALSE,
  notes TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(guest_id, event_id)
);

-- Add traditional Uzbek budget fields to wedding_plans
ALTER TABLE public.wedding_plans
ADD COLUMN IF NOT EXISTS kalym_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS sarpo_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS peshona_amount NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS groom_side_budget NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS bride_side_budget NUMERIC DEFAULT 0;

-- Add guest extended attributes for smart seating
ALTER TABLE public.guests
ADD COLUMN IF NOT EXISTS guest_side public.wedding_side DEFAULT 'both',
ADD COLUMN IF NOT EXISTS age_group TEXT CHECK (age_group IN ('youth', 'middle', 'senior')),
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('vip', 'relative', 'friend', 'colleague', 'other')),
ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['russian'],
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN IF NOT EXISTS avoid_guests UUID[] DEFAULT ARRAY[]::UUID[],
ADD COLUMN IF NOT EXISTS prefer_guests UUID[] DEFAULT ARRAY[]::UUID[];

-- Enable RLS
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_event_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for wedding_events
CREATE POLICY "Couples can view their wedding events"
ON public.wedding_events FOR SELECT
USING (EXISTS (
  SELECT 1 FROM wedding_plans
  WHERE wedding_plans.id = wedding_events.wedding_plan_id
  AND wedding_plans.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can create wedding events"
ON public.wedding_events FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM wedding_plans
  WHERE wedding_plans.id = wedding_events.wedding_plan_id
  AND wedding_plans.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can update their wedding events"
ON public.wedding_events FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM wedding_plans
  WHERE wedding_plans.id = wedding_events.wedding_plan_id
  AND wedding_plans.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can delete their wedding events"
ON public.wedding_events FOR DELETE
USING (EXISTS (
  SELECT 1 FROM wedding_plans
  WHERE wedding_plans.id = wedding_events.wedding_plan_id
  AND wedding_plans.couple_user_id = auth.uid()
));

-- RLS policies for guest_event_invitations
CREATE POLICY "Couples can view guest event invitations"
ON public.guest_event_invitations FOR SELECT
USING (EXISTS (
  SELECT 1 FROM wedding_events we
  JOIN wedding_plans wp ON wp.id = we.wedding_plan_id
  WHERE we.id = guest_event_invitations.event_id
  AND wp.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can create guest event invitations"
ON public.guest_event_invitations FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM wedding_events we
  JOIN wedding_plans wp ON wp.id = we.wedding_plan_id
  WHERE we.id = guest_event_invitations.event_id
  AND wp.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can update guest event invitations"
ON public.guest_event_invitations FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM wedding_events we
  JOIN wedding_plans wp ON wp.id = we.wedding_plan_id
  WHERE we.id = guest_event_invitations.event_id
  AND wp.couple_user_id = auth.uid()
));

CREATE POLICY "Couples can delete guest event invitations"
ON public.guest_event_invitations FOR DELETE
USING (EXISTS (
  SELECT 1 FROM wedding_events we
  JOIN wedding_plans wp ON wp.id = we.wedding_plan_id
  WHERE we.id = guest_event_invitations.event_id
  AND wp.couple_user_id = auth.uid()
));

-- Create indexes for performance
CREATE INDEX idx_wedding_events_plan ON public.wedding_events(wedding_plan_id);
CREATE INDEX idx_wedding_events_type ON public.wedding_events(event_type);
CREATE INDEX idx_guest_event_invitations_event ON public.guest_event_invitations(event_id);
CREATE INDEX idx_guest_event_invitations_guest ON public.guest_event_invitations(guest_id);
CREATE INDEX idx_guests_side ON public.guests(guest_side);

-- Create trigger for updated_at
CREATE TRIGGER update_wedding_events_updated_at
BEFORE UPDATE ON public.wedding_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_guest_event_invitations_updated_at
BEFORE UPDATE ON public.guest_event_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();