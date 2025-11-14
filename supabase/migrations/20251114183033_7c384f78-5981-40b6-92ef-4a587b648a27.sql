-- Create wedding_invitations table for AI-generated invitations
CREATE TABLE IF NOT EXISTS public.wedding_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL,
  template VARCHAR(50) NOT NULL,
  title TEXT NOT NULL,
  couple_names TEXT NOT NULL,
  event_date TIMESTAMP WITH TIME ZONE,
  venue_name TEXT,
  custom_message TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_wedding_plan
    FOREIGN KEY (wedding_plan_id)
    REFERENCES public.wedding_plans(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.wedding_invitations ENABLE ROW LEVEL SECURITY;

-- Couples can view their own invitations
CREATE POLICY "Couples can view their wedding invitations"
ON public.wedding_invitations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_invitations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Couples can create invitations
CREATE POLICY "Couples can create wedding invitations"
ON public.wedding_invitations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_invitations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Couples can delete their invitations
CREATE POLICY "Couples can delete their wedding invitations"
ON public.wedding_invitations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_invitations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_wedding_invitations_updated_at
BEFORE UPDATE ON public.wedding_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_wedding_invitations_wedding_plan_id 
ON public.wedding_invitations(wedding_plan_id);

CREATE INDEX idx_wedding_invitations_created_at 
ON public.wedding_invitations(created_at DESC);