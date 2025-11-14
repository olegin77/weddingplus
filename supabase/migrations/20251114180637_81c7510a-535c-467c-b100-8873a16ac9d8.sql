-- Create guest_invitations table for managing RSVP links
CREATE TABLE IF NOT EXISTS public.guest_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.guest_invitations ENABLE ROW LEVEL SECURITY;

-- Couples can view invitations for their wedding plans
CREATE POLICY "Couples can view their guest invitations"
  ON public.guest_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = guest_invitations.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can create invitations for their guests
CREATE POLICY "Couples can create guest invitations"
  ON public.guest_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = guest_invitations.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can update their guest invitations
CREATE POLICY "Couples can update guest invitations"
  ON public.guest_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = guest_invitations.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Public can view invitations by token (for RSVP page)
CREATE POLICY "Public can view invitations by token"
  ON public.guest_invitations
  FOR SELECT
  USING (token IS NOT NULL);

-- Public can update invitation response (for RSVP submission)
CREATE POLICY "Public can update invitation response"
  ON public.guest_invitations
  FOR UPDATE
  USING (token IS NOT NULL);

-- Create index for token lookups
CREATE INDEX idx_guest_invitations_token ON public.guest_invitations(token);

-- Create index for guest_id
CREATE INDEX idx_guest_invitations_guest_id ON public.guest_invitations(guest_id);

-- Create index for wedding_plan_id
CREATE INDEX idx_guest_invitations_wedding_plan_id ON public.guest_invitations(wedding_plan_id);

-- Trigger to update updated_at
CREATE TRIGGER update_guest_invitations_updated_at
  BEFORE UPDATE ON public.guest_invitations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();