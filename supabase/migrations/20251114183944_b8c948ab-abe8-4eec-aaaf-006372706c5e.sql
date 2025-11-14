-- Create seating charts table
CREATE TABLE public.seating_charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'План рассадки',
  venue_width NUMERIC NOT NULL DEFAULT 1000,
  venue_height NUMERIC NOT NULL DEFAULT 800,
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create seating tables table
CREATE TABLE public.seating_tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_chart_id UUID NOT NULL REFERENCES public.seating_charts(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  shape TEXT NOT NULL DEFAULT 'round', -- round, rectangle, square
  capacity INTEGER NOT NULL DEFAULT 8,
  position_x NUMERIC NOT NULL DEFAULT 100,
  position_y NUMERIC NOT NULL DEFAULT 100,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 100,
  rotation NUMERIC NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#f43f5e',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table assignments (linking guests to tables)
CREATE TABLE public.table_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seating_table_id UUID NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  seat_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(seating_table_id, guest_id)
);

-- Enable RLS
ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for seating_charts
CREATE POLICY "Couples can view their seating charts"
  ON public.seating_charts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = seating_charts.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can create seating charts"
  ON public.seating_charts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = seating_charts.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can update their seating charts"
  ON public.seating_charts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = seating_charts.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can delete their seating charts"
  ON public.seating_charts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = seating_charts.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- RLS Policies for seating_tables
CREATE POLICY "Couples can view their seating tables"
  ON public.seating_tables FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seating_charts
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_charts.id = seating_tables.seating_chart_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can create seating tables"
  ON public.seating_tables FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seating_charts
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_charts.id = seating_tables.seating_chart_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can update their seating tables"
  ON public.seating_tables FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.seating_charts
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_charts.id = seating_tables.seating_chart_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can delete their seating tables"
  ON public.seating_tables FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.seating_charts
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_charts.id = seating_tables.seating_chart_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- RLS Policies for table_assignments
CREATE POLICY "Couples can view table assignments"
  ON public.table_assignments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.seating_tables
      JOIN public.seating_charts ON seating_charts.id = seating_tables.seating_chart_id
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_tables.id = table_assignments.seating_table_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can create table assignments"
  ON public.table_assignments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.seating_tables
      JOIN public.seating_charts ON seating_charts.id = seating_tables.seating_chart_id
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_tables.id = table_assignments.seating_table_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

CREATE POLICY "Couples can delete table assignments"
  ON public.table_assignments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.seating_tables
      JOIN public.seating_charts ON seating_charts.id = seating_tables.seating_chart_id
      JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id
      WHERE seating_tables.id = table_assignments.seating_table_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Triggers for updated_at
CREATE TRIGGER update_seating_charts_updated_at
  BEFORE UPDATE ON public.seating_charts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seating_tables_updated_at
  BEFORE UPDATE ON public.seating_tables
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();