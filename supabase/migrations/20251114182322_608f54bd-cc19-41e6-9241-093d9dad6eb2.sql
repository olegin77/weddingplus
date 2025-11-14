-- Create wedding_visualizations table for storing AI-generated wedding images
CREATE TABLE IF NOT EXISTS public.wedding_visualizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL,
  style VARCHAR(50) NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  couple_photo_url TEXT,
  partner_photo_url TEXT,
  quality VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_wedding_plan
    FOREIGN KEY (wedding_plan_id)
    REFERENCES public.wedding_plans(id)
    ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE public.wedding_visualizations ENABLE ROW LEVEL SECURITY;

-- Couples can view their own visualizations
CREATE POLICY "Couples can view their wedding visualizations"
ON public.wedding_visualizations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_visualizations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Couples can create visualizations
CREATE POLICY "Couples can create wedding visualizations"
ON public.wedding_visualizations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_visualizations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Couples can delete their visualizations
CREATE POLICY "Couples can delete their wedding visualizations"
ON public.wedding_visualizations
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.wedding_plans
    WHERE wedding_plans.id = wedding_visualizations.wedding_plan_id
    AND wedding_plans.couple_user_id = auth.uid()
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_wedding_visualizations_updated_at
BEFORE UPDATE ON public.wedding_visualizations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_wedding_visualizations_wedding_plan_id 
ON public.wedding_visualizations(wedding_plan_id);

CREATE INDEX idx_wedding_visualizations_created_at 
ON public.wedding_visualizations(created_at DESC);