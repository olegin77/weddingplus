-- Create favorite_vendors table for saving favorite vendors
CREATE TABLE IF NOT EXISTS public.favorite_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, vendor_id)
);

-- Enable RLS
ALTER TABLE public.favorite_vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorite_vendors
CREATE POLICY "Users can view their own favorites"
  ON public.favorite_vendors
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.favorite_vendors
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON public.favorite_vendors
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_favorite_vendors_user_id ON public.favorite_vendors(user_id);
CREATE INDEX idx_favorite_vendors_vendor_id ON public.favorite_vendors(vendor_id);