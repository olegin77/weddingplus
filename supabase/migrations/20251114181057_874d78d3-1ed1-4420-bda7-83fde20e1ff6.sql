-- Create wedding_websites table
CREATE TABLE IF NOT EXISTS public.wedding_websites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT false,
  
  -- Hero Section
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image_url TEXT,
  hero_date TIMESTAMP WITH TIME ZONE,
  
  -- Story Section
  story_enabled BOOLEAN DEFAULT true,
  story_title TEXT DEFAULT 'Наша история',
  story_content TEXT,
  
  -- Gallery Section
  gallery_enabled BOOLEAN DEFAULT true,
  gallery_images TEXT[], -- Array of image URLs
  
  -- Timeline Section
  timeline_enabled BOOLEAN DEFAULT true,
  timeline_events JSONB, -- Array of {time, title, description}
  
  -- Location Section
  location_enabled BOOLEAN DEFAULT true,
  location_name TEXT,
  location_address TEXT,
  location_coordinates TEXT, -- lat,lng format
  location_map_url TEXT,
  
  -- RSVP Section
  rsvp_enabled BOOLEAN DEFAULT true,
  rsvp_deadline TIMESTAMP WITH TIME ZONE,
  
  -- Design Settings
  theme_color TEXT DEFAULT '#f43f5e',
  font_family TEXT DEFAULT 'sans-serif',
  custom_css TEXT,
  
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_image_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;

-- Couples can view their own wedding websites
CREATE POLICY "Couples can view their wedding websites"
  ON public.wedding_websites
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = wedding_websites.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can create wedding websites
CREATE POLICY "Couples can create wedding websites"
  ON public.wedding_websites
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = wedding_websites.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can update their wedding websites
CREATE POLICY "Couples can update wedding websites"
  ON public.wedding_websites
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = wedding_websites.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Couples can delete their wedding websites
CREATE POLICY "Couples can delete wedding websites"
  ON public.wedding_websites
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.wedding_plans
      WHERE wedding_plans.id = wedding_websites.wedding_plan_id
      AND wedding_plans.couple_user_id = auth.uid()
    )
  );

-- Public can view published wedding websites by slug
CREATE POLICY "Public can view published websites"
  ON public.wedding_websites
  FOR SELECT
  USING (published = true);

-- Create indexes
CREATE INDEX idx_wedding_websites_slug ON public.wedding_websites(slug);
CREATE INDEX idx_wedding_websites_wedding_plan_id ON public.wedding_websites(wedding_plan_id);
CREATE INDEX idx_wedding_websites_published ON public.wedding_websites(published);

-- Trigger to update updated_at
CREATE TRIGGER update_wedding_websites_updated_at
  BEFORE UPDATE ON public.wedding_websites
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();