-- Create budget categories enum
CREATE TYPE public.budget_category_type AS ENUM (
  'venue',
  'catering',
  'photography',
  'videography',
  'flowers',
  'decoration',
  'music',
  'attire',
  'makeup',
  'invitations',
  'transportation',
  'gifts',
  'rings',
  'honeymoon',
  'other'
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS public.budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  category budget_category_type NOT NULL,
  item_name TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL DEFAULT 0,
  actual_amount NUMERIC DEFAULT 0,
  paid_amount NUMERIC DEFAULT 0,
  vendor_id UUID REFERENCES public.vendor_profiles(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  notes TEXT,
  payment_status TEXT DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT positive_amounts CHECK (
    planned_amount >= 0 AND 
    actual_amount >= 0 AND 
    paid_amount >= 0
  )
);

-- Enable RLS
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;

-- Couples can view their budget items
CREATE POLICY "Couples can view their budget items"
  ON public.budget_items
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = budget_items.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can create budget items
CREATE POLICY "Couples can create budget items"
  ON public.budget_items
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = budget_items.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can update their budget items
CREATE POLICY "Couples can update budget items"
  ON public.budget_items
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = budget_items.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can delete their budget items
CREATE POLICY "Couples can delete budget items"
  ON public.budget_items
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = budget_items.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_budget_items_wedding_plan_id ON public.budget_items(wedding_plan_id);
CREATE INDEX idx_budget_items_category ON public.budget_items(category);
CREATE INDEX idx_budget_items_vendor_id ON public.budget_items(vendor_id);
CREATE INDEX idx_budget_items_booking_id ON public.budget_items(booking_id);

-- Trigger to update updated_at
CREATE TRIGGER update_budget_items_updated_at
  BEFORE UPDATE ON public.budget_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate total budget for a wedding plan
CREATE OR REPLACE FUNCTION public.calculate_wedding_budget_totals(plan_id UUID)
RETURNS TABLE(
  total_planned NUMERIC,
  total_actual NUMERIC,
  total_paid NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(planned_amount), 0) as total_planned,
    COALESCE(SUM(actual_amount), 0) as total_actual,
    COALESCE(SUM(paid_amount), 0) as total_paid
  FROM public.budget_items
  WHERE wedding_plan_id = plan_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;