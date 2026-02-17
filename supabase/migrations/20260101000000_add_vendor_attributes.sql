-- Add search_tags column to vendor_profiles
ALTER TABLE vendor_profiles 
ADD COLUMN IF NOT EXISTS search_tags text[] DEFAULT '{}';

-- Ensure attributes is JSONB (it might be JSON)
ALTER TABLE vendor_profiles 
ALTER COLUMN attributes TYPE JSONB USING attributes::JSONB;

-- Add GIN index for faster searching on attributes and search_tags
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_attributes ON vendor_profiles USING GIN (attributes);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_search_tags ON vendor_profiles USING GIN (search_tags);
