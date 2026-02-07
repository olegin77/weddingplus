-- ============================================================
-- Weddinguz — Complete Database Schema
-- Version: 2.1.0
-- Generated: 2026-02-07
-- Database: PostgreSQL 15+ with Supabase extensions
-- ============================================================
--
-- This file contains the complete SQL schema for self-hosting
-- the Weddinguz wedding planning platform database.
--
-- Requirements:
--   - PostgreSQL 15+
--   - uuid-ossp extension
--   - pgcrypto extension (optional, for gen_random_uuid)
--
-- Usage:
--   psql -U postgres -d weddinguz -f schema.sql
--
-- ============================================================

-- ===================
-- 0. Extensions
-- ===================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================
-- 1. Custom ENUM Types
-- ===================

CREATE TYPE public.user_role AS ENUM ('couple', 'vendor', 'admin');

CREATE TYPE public.vendor_category AS ENUM (
  'venue', 'photographer', 'videographer', 'caterer', 'florist',
  'decorator', 'music', 'makeup', 'clothing', 'transport', 'other'
);

CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');

CREATE TYPE public.escrow_status AS ENUM ('pending', 'released', 'refunded', 'disputed', 'partial_release');

CREATE TYPE public.payout_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TYPE public.budget_category_type AS ENUM (
  'venue', 'catering', 'photography', 'videography', 'flowers',
  'decoration', 'music', 'attire', 'makeup', 'invitations',
  'transportation', 'gifts', 'rings', 'honeymoon', 'other'
);

CREATE TYPE public.wedding_event_type AS ENUM (
  'nahorgi_osh', 'fotiha', 'nikoh', 'kelin_salom', 'toy'
);

CREATE TYPE public.wedding_side AS ENUM ('groom', 'bride', 'both');

CREATE TYPE public.communication_channel AS ENUM ('email', 'sms', 'telegram', 'voice', 'whatsapp');


-- ===================
-- 2. Core Tables
-- ===================

-- ---- Profiles ----
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY,  -- References auth.users(id)
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role public.user_role NOT NULL DEFAULT 'couple',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- User Roles ----
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,  -- References auth.users(id)
  role public.user_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, role)
);

-- ---- Wedding Plans ----
CREATE TABLE public.wedding_plans (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  couple_user_id UUID NOT NULL,  -- References auth.users(id)
  wedding_date DATE,
  estimated_guests INTEGER,
  budget_total NUMERIC,
  budget_spent NUMERIC DEFAULT 0,
  theme TEXT,
  venue_location TEXT,
  notes TEXT,
  priorities JSONB DEFAULT '{"catering": "medium", "decoration": "medium", "photography": "medium", "entertainment": "medium"}'::jsonb,
  outdoor_preference BOOLEAN,
  parking_needed BOOLEAN,
  budget_breakdown JSONB DEFAULT '{}'::jsonb,
  category_priorities JSONB DEFAULT '{}'::jsonb,
  time_preferences JSONB DEFAULT '{}'::jsonb,
  -- Uzbek wedding specifics
  kalym_amount NUMERIC DEFAULT 0,
  sarpo_amount NUMERIC DEFAULT 0,
  peshona_amount NUMERIC DEFAULT 0,
  groom_side_budget NUMERIC DEFAULT 0,
  bride_side_budget NUMERIC DEFAULT 0,
  -- Preferences
  style_preferences TEXT[] DEFAULT ARRAY[]::text[],
  style_reference_images TEXT[] DEFAULT ARRAY[]::text[],
  cuisine_preferences TEXT[] DEFAULT ARRAY[]::text[],
  dietary_requirements TEXT[] DEFAULT ARRAY[]::text[],
  music_preferences TEXT[] DEFAULT ARRAY[]::text[],
  ceremony_type TEXT,
  venue_type_preference TEXT,
  program_preferences TEXT[] DEFAULT ARRAY[]::text[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---- Vendor Profiles ----
CREATE TABLE public.vendor_profiles (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL,  -- References auth.users(id)
  business_name TEXT NOT NULL,
  category public.vendor_category NOT NULL,
  description TEXT,
  location TEXT,
  price_range_min NUMERIC,
  price_range_max NUMERIC,
  starting_price NUMERIC,
  rating NUMERIC DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  attributes JSONB DEFAULT '{}'::jsonb,
  -- Capacity
  capacity_min INTEGER,
  capacity_max INTEGER,
  min_guests INTEGER,
  max_guests INTEGER,
  -- Features
  equipment_included BOOLEAN DEFAULT false,
  experience_years INTEGER DEFAULT 0,
  has_parking BOOLEAN DEFAULT false,
  outdoor_available BOOLEAN DEFAULT false,
  provides_staff BOOLEAN DEFAULT false,
  min_booking_hours INTEGER DEFAULT 4,
  delivery_time_days INTEGER,
  deposit_percentage NUMERIC,
  -- Content
  portfolio_images TEXT[],
  styles TEXT[],
  languages TEXT[],
  certifications TEXT[],
  service_area TEXT[],
  additional_services TEXT[],
  included_items TEXT[],
  bonuses TEXT[],
  cancellation_policy TEXT,
  venue_type TEXT,
  -- Food-specific
  cuisine_types TEXT[],
  dietary_options TEXT[],
  price_per_guest NUMERIC,
  -- Music-specific
  music_genres TEXT[],
  -- Structured data
  packages JSONB DEFAULT '[]'::jsonb,
  special_features JSONB DEFAULT '{}'::jsonb,
  technical_features JSONB,
  venue_restrictions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 3. Guest Management
-- ===================

CREATE TABLE public.guests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  guest_side public.wedding_side,
  status TEXT,
  attendance_status TEXT,
  dietary_restrictions TEXT,
  notes TEXT,
  plus_one_allowed BOOLEAN,
  plus_one_name TEXT,
  age_group TEXT,
  -- Seating preferences
  interests TEXT[],
  languages TEXT[],
  prefer_guests TEXT[],
  avoid_guests TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.guest_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  message TEXT,
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 4. Wedding Events
-- ===================

CREATE TABLE public.wedding_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  event_type public.wedding_event_type NOT NULL,
  event_date TIMESTAMPTZ,
  hosted_by public.wedding_side NOT NULL DEFAULT 'both',
  venue_name TEXT,
  venue_address TEXT,
  expected_guests INTEGER DEFAULT 0,
  budget_allocated NUMERIC DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.guest_event_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.wedding_events(id) ON DELETE CASCADE,
  rsvp_status TEXT DEFAULT 'pending',
  dietary_notes TEXT,
  notes TEXT,
  plus_ones INTEGER DEFAULT 0,
  transport_needed BOOLEAN DEFAULT false,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (guest_id, event_id)
);


-- ===================
-- 5. Bookings & Payments
-- ===================

CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  couple_user_id UUID NOT NULL,
  booking_date TIMESTAMPTZ NOT NULL,
  status public.booking_status NOT NULL DEFAULT 'pending',
  price NUMERIC NOT NULL,
  payment_status public.payment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  payment_provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id),
  couple_user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL DEFAULT 0,
  vendor_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  status public.escrow_status NOT NULL DEFAULT 'pending',
  status_reason TEXT,
  release_conditions JSONB DEFAULT '{}'::jsonb,
  scheduled_release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_notes TEXT,
  qr_code_data TEXT,
  qr_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.vendor_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id),
  escrow_transaction_id UUID REFERENCES public.escrow_transactions(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  payout_method TEXT NOT NULL,
  bank_account_reference TEXT,
  status public.payout_status NOT NULL DEFAULT 'pending',
  status_message TEXT,
  provider_payout_id TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.qr_payment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES public.bookings(id),
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id),
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  description TEXT,
  qr_token TEXT NOT NULL UNIQUE,
  qr_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ NOT NULL,
  payer_user_id UUID,
  payer_phone TEXT,
  payment_id UUID REFERENCES public.payments(id),
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 6. Budget Management
-- ===================

CREATE TABLE public.budget_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  category public.budget_category_type NOT NULL,
  item_name TEXT NOT NULL,
  planned_amount NUMERIC NOT NULL,
  actual_amount NUMERIC,
  paid_amount NUMERIC,
  payment_status TEXT,
  due_date DATE,
  notes TEXT,
  vendor_id UUID REFERENCES public.vendor_profiles(id),
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 7. Reviews
-- ===================

CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  booking_id UUID REFERENCES public.bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 8. Seating Charts
-- ===================

CREATE TABLE public.seating_charts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'План рассадки',
  venue_width NUMERIC NOT NULL DEFAULT 1000,
  venue_height NUMERIC NOT NULL DEFAULT 800,
  background_color TEXT DEFAULT '#ffffff',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.seating_tables (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seating_chart_id UUID NOT NULL REFERENCES public.seating_charts(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  shape TEXT NOT NULL DEFAULT 'round',
  capacity INTEGER NOT NULL DEFAULT 8,
  position_x NUMERIC NOT NULL DEFAULT 100,
  position_y NUMERIC NOT NULL DEFAULT 100,
  width NUMERIC NOT NULL DEFAULT 100,
  height NUMERIC NOT NULL DEFAULT 100,
  rotation NUMERIC NOT NULL DEFAULT 0,
  color TEXT DEFAULT '#f43f5e',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.table_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seating_table_id UUID NOT NULL REFERENCES public.seating_tables(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.guests(id) ON DELETE CASCADE,
  seat_number INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 9. Gift Registry
-- ===================

CREATE TABLE public.gift_registry_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT DEFAULT 'other',
  external_link TEXT,
  target_amount NUMERIC NOT NULL DEFAULT 0,
  current_amount NUMERIC NOT NULL DEFAULT 0,
  priority INTEGER DEFAULT 0,
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.gift_contributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_item_id UUID NOT NULL REFERENCES public.gift_registry_items(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES public.guests(id),
  amount NUMERIC NOT NULL,
  contributor_name TEXT,
  contributor_email TEXT,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  payment_status TEXT DEFAULT 'pending',
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 10. Invitations & Visualizations
-- ===================

CREATE TABLE public.wedding_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  template VARCHAR NOT NULL,
  title TEXT NOT NULL,
  couple_names TEXT NOT NULL,
  venue_name TEXT,
  event_date TIMESTAMPTZ,
  custom_message TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.wedding_visualizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  style VARCHAR NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  couple_photo_url TEXT,
  partner_photo_url TEXT,
  quality VARCHAR DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.venue_visualizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID,
  venue_id UUID NOT NULL REFERENCES public.vendor_profiles(id),
  decorator_id UUID REFERENCES public.vendor_profiles(id),
  base_image_url TEXT NOT NULL,
  result_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  decor_elements JSONB DEFAULT '[]'::jsonb,
  generation_params JSONB DEFAULT '{}'::jsonb,
  comparison_group_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.venue_gallery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  room_name TEXT,
  angle TEXT,
  lighting_type TEXT,
  capacity INTEGER,
  dimensions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 11. Communication & Telegram
-- ===================

CREATE TABLE public.communication_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL UNIQUE REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  telegram_enabled BOOLEAN DEFAULT false,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  voice_rsvp_enabled BOOLEAN DEFAULT false,
  auto_reminders_enabled BOOLEAN DEFAULT false,
  voice_id TEXT,
  voice_language TEXT,
  reminder_days_before INTEGER[],
  reminder_message_template TEXT,
  confirmation_message_template TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.telegram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL UNIQUE REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  webhook_secret TEXT NOT NULL,
  bot_token_reference TEXT,
  bot_username TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_messages_sent INTEGER DEFAULT 0,
  total_responses_received INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.telegram_rsvp_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  telegram_connection_id UUID NOT NULL REFERENCES public.telegram_connections(id) ON DELETE CASCADE,
  guest_invitation_id UUID REFERENCES public.guest_invitations(id),
  guest_id UUID REFERENCES public.guests(id),
  telegram_user_id BIGINT NOT NULL,
  telegram_username TEXT,
  telegram_first_name TEXT,
  message_text TEXT,
  message_id BIGINT,
  chat_id BIGINT,
  rsvp_response TEXT,
  dietary_notes TEXT,
  plus_ones INTEGER DEFAULT 0,
  matched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.voice_rsvp_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_invitation_id UUID NOT NULL REFERENCES public.guest_invitations(id),
  guest_id UUID NOT NULL REFERENCES public.guests(id),
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  elevenlabs_conversation_id TEXT,
  rsvp_response TEXT,
  dietary_notes TEXT,
  special_requests TEXT,
  plus_ones INTEGER DEFAULT 0,
  transcript JSONB DEFAULT '[]'::jsonb,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 12. Gamification
-- ===================

CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  name_ru TEXT NOT NULL,
  name_uz TEXT NOT NULL,
  description_en TEXT,
  description_ru TEXT,
  description_uz TEXT,
  icon TEXT DEFAULT '🏆',
  points INTEGER DEFAULT 10,
  category TEXT DEFAULT 'general',
  trigger_condition JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  wedding_plan_id UUID REFERENCES public.wedding_plans(id),
  metadata JSONB,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.planning_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  milestone_type TEXT NOT NULL,
  target_date DATE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 13. Vendor Features
-- ===================

CREATE TABLE public.vendor_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  booking_id UUID REFERENCES public.bookings(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.vendor_recommendations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  category public.vendor_category NOT NULL,
  match_score INTEGER NOT NULL,
  match_reasons JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '24 hours')
);

CREATE TABLE public.favorite_vendors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, vendor_id)
);


-- ===================
-- 14. Notification & Settings
-- ===================

CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  booking_updates BOOLEAN DEFAULT true,
  vendor_messages BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- ===================
-- 15. Wedding Websites
-- ===================

CREATE TABLE public.wedding_websites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wedding_plan_id UUID NOT NULL REFERENCES public.wedding_plans(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  published BOOLEAN NOT NULL DEFAULT false,
  -- Hero section
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_date TEXT,
  hero_image_url TEXT,
  -- Theme
  theme_color TEXT,
  font_family TEXT,
  custom_css TEXT,
  -- Story
  story_enabled BOOLEAN DEFAULT false,
  story_title TEXT,
  story_content TEXT,
  -- Gallery
  gallery_enabled BOOLEAN DEFAULT false,
  gallery_images TEXT[],
  -- Timeline
  timeline_enabled BOOLEAN DEFAULT false,
  timeline_events JSONB,
  -- Location
  location_enabled BOOLEAN DEFAULT false,
  location_name TEXT,
  location_address TEXT,
  location_coordinates TEXT,
  location_map_url TEXT,
  -- RSVP
  rsvp_enabled BOOLEAN DEFAULT false,
  rsvp_deadline TEXT,
  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  meta_image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- ===================
-- 16. Views
-- ===================

CREATE VIEW public.public_vendor_profiles
WITH (security_invoker = on) AS
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.created_at
  FROM public.profiles p
  WHERE p.role = 'vendor';


-- ===================
-- 17. Indexes
-- ===================

-- Bookings
CREATE INDEX idx_bookings_couple_user_id ON public.bookings (couple_user_id);
CREATE INDEX idx_bookings_vendor_id ON public.bookings (vendor_id);

-- Budget Items
CREATE INDEX idx_budget_items_wedding_plan_id ON public.budget_items (wedding_plan_id);
CREATE INDEX idx_budget_items_category ON public.budget_items (category);
CREATE INDEX idx_budget_items_vendor_id ON public.budget_items (vendor_id);
CREATE INDEX idx_budget_items_booking_id ON public.budget_items (booking_id);

-- Escrow
CREATE INDEX idx_escrow_booking ON public.escrow_transactions (booking_id);
CREATE INDEX idx_escrow_vendor ON public.escrow_transactions (vendor_id);
CREATE INDEX idx_escrow_status ON public.escrow_transactions (status);
CREATE INDEX idx_escrow_scheduled ON public.escrow_transactions (scheduled_release_at) WHERE status = 'pending';

-- Favorites
CREATE INDEX idx_favorite_vendors_user_id ON public.favorite_vendors (user_id);
CREATE INDEX idx_favorite_vendors_vendor_id ON public.favorite_vendors (vendor_id);

-- Guests
CREATE INDEX idx_guests_side ON public.guests (guest_side);

-- Guest Event Invitations
CREATE INDEX idx_guest_event_invitations_event ON public.guest_event_invitations (event_id);
CREATE INDEX idx_guest_event_invitations_guest ON public.guest_event_invitations (guest_id);

-- Guest Invitations
CREATE INDEX idx_guest_invitations_guest_id ON public.guest_invitations (guest_id);
CREATE INDEX idx_guest_invitations_wedding_plan_id ON public.guest_invitations (wedding_plan_id);
CREATE INDEX idx_guest_invitations_token ON public.guest_invitations (token);

-- Payments
CREATE INDEX idx_payments_booking_id ON public.payments (booking_id);
CREATE INDEX idx_payments_provider_transaction_id ON public.payments (provider_transaction_id);

-- QR Sessions
CREATE INDEX idx_qr_sessions_token ON public.qr_payment_sessions (qr_token);
CREATE INDEX idx_qr_sessions_active ON public.qr_payment_sessions (expires_at) WHERE status = 'active';

-- Vendor Profiles
CREATE INDEX idx_vendor_profiles_category ON public.vendor_profiles (category);
CREATE INDEX idx_vendor_profiles_location ON public.vendor_profiles (location);
CREATE INDEX idx_vendor_profiles_user_id ON public.vendor_profiles (user_id);
CREATE INDEX idx_vendor_profiles_rating ON public.vendor_profiles (rating DESC NULLS LAST);

-- Vendor Availability
CREATE INDEX idx_vendor_availability_vendor_date ON public.vendor_availability (vendor_id, date);

-- Wedding Websites
CREATE INDEX idx_wedding_websites_slug ON public.wedding_websites (slug);


-- ===================
-- 18. Functions
-- ===================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Role checker (bypasses RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Calculate budget totals
CREATE OR REPLACE FUNCTION public.calculate_wedding_budget_totals(plan_id UUID)
RETURNS TABLE(total_planned NUMERIC, total_actual NUMERIC, total_paid NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(planned_amount), 0) as total_planned,
    COALESCE(SUM(actual_amount), 0) as total_actual,
    COALESCE(SUM(paid_amount), 0) as total_paid
  FROM public.budget_items
  WHERE wedding_plan_id = plan_id;
END;
$$;

-- Update vendor rating on new review
CREATE OR REPLACE FUNCTION public.update_vendor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.vendor_profiles
  SET 
    rating = (
      SELECT AVG(rating)::DECIMAL(3,2)
      FROM public.reviews
      WHERE vendor_id = NEW.vendor_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE vendor_id = NEW.vendor_id
    )
  WHERE id = NEW.vendor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-create escrow after payment
CREATE OR REPLACE FUNCTION public.create_escrow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_booking RECORD;
  v_platform_fee DECIMAL(15,2);
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    SELECT b.*, vp.id as vendor_profile_id
    INTO v_booking
    FROM public.bookings b
    JOIN public.vendor_profiles vp ON vp.id = b.vendor_id
    WHERE b.id = NEW.booking_id;
    
    IF FOUND THEN
      v_platform_fee := NEW.amount * 0.05;
      
      INSERT INTO public.escrow_transactions (
        booking_id, payment_id, vendor_id, couple_user_id,
        amount, platform_fee, vendor_amount, currency, status,
        scheduled_release_at, release_conditions
      ) VALUES (
        NEW.booking_id, NEW.id, v_booking.vendor_profile_id,
        v_booking.couple_user_id, NEW.amount, v_platform_fee,
        NEW.amount - v_platform_fee, NEW.currency, 'pending',
        v_booking.booking_date + INTERVAL '7 days',
        jsonb_build_object('require_service_completion', true, 'auto_release_days', 7)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Auto-update gift amounts
CREATE OR REPLACE FUNCTION public.update_gift_current_amount()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.payment_status = 'completed' THEN
    UPDATE public.gift_registry_items 
    SET current_amount = current_amount + NEW.amount,
        is_purchased = (current_amount + NEW.amount >= target_amount)
    WHERE id = NEW.gift_item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Handle new user registration (Supabase Auth specific)
-- NOTE: For self-hosted setups, replace auth.users trigger with your auth system
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'couple')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- ===================
-- 19. Triggers
-- ===================

-- updated_at triggers for all tables with updated_at column
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_budget_items_updated_at BEFORE UPDATE ON public.budget_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_communication_settings_updated_at BEFORE UPDATE ON public.communication_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_escrow_updated_at BEFORE UPDATE ON public.escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_gift_registry_items_updated_at BEFORE UPDATE ON public.gift_registry_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guest_event_invitations_updated_at BEFORE UPDATE ON public.guest_event_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guest_invitations_updated_at BEFORE UPDATE ON public.guest_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON public.guests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_planning_milestones_updated_at BEFORE UPDATE ON public.planning_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_qr_sessions_updated_at BEFORE UPDATE ON public.qr_payment_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seating_charts_updated_at BEFORE UPDATE ON public.seating_charts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_seating_tables_updated_at BEFORE UPDATE ON public.seating_tables FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_telegram_connections_updated_at BEFORE UPDATE ON public.telegram_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_availability_updated_at BEFORE UPDATE ON public.vendor_availability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.vendor_payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendor_profiles_updated_at BEFORE UPDATE ON public.vendor_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venue_gallery_updated_at BEFORE UPDATE ON public.venue_gallery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_venue_visualizations_updated_at BEFORE UPDATE ON public.venue_visualizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_voice_sessions_updated_at BEFORE UPDATE ON public.voice_rsvp_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_events_updated_at BEFORE UPDATE ON public.wedding_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_invitations_updated_at BEFORE UPDATE ON public.wedding_invitations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_plans_updated_at BEFORE UPDATE ON public.wedding_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_visualizations_updated_at BEFORE UPDATE ON public.wedding_visualizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wedding_websites_updated_at BEFORE UPDATE ON public.wedding_websites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Business logic triggers
CREATE TRIGGER on_review_created AFTER INSERT ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_vendor_rating();
CREATE TRIGGER create_escrow_after_payment AFTER UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.create_escrow_on_payment();
CREATE TRIGGER update_gift_amount_on_contribution AFTER INSERT OR UPDATE ON public.gift_contributions FOR EACH ROW EXECUTE FUNCTION public.update_gift_current_amount();


-- ===================
-- 20. Row Level Security (RLS)
-- ===================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guest_event_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_charts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seating_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_registry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_visualizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venue_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_rsvp_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_rsvp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorite_vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wedding_websites ENABLE ROW LEVEL SECURITY;

-- ---- Profiles ----
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ---- User Roles ----
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can manage all roles" ON public.user_roles FOR ALL USING ((auth.jwt() ->> 'role') = 'service_role');

-- ---- Wedding Plans ----
CREATE POLICY "Couples can view their own wedding plans" ON public.wedding_plans FOR SELECT USING (auth.uid() = couple_user_id);
CREATE POLICY "Couples can create their own wedding plans" ON public.wedding_plans FOR INSERT WITH CHECK (auth.uid() = couple_user_id);
CREATE POLICY "Couples can update their own wedding plans" ON public.wedding_plans FOR UPDATE USING (auth.uid() = couple_user_id);
CREATE POLICY "Couples can delete their own wedding plans" ON public.wedding_plans FOR DELETE USING (auth.uid() = couple_user_id);

-- ---- Vendor Profiles ----
CREATE POLICY "Anyone can view vendor profiles" ON public.vendor_profiles FOR SELECT USING (true);
CREATE POLICY "Vendors can update their own profile" ON public.vendor_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can create their profile" ON public.vendor_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- Guests ----
CREATE POLICY "Couples can manage their guests" ON public.guests FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);

-- ---- Guest Invitations ----
CREATE POLICY "Couples can view their guest invitations" ON public.guest_invitations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = guest_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create guest invitations" ON public.guest_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = guest_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can update guest invitations" ON public.guest_invitations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = guest_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);
-- Public RSVP: only viewable/updatable by knowing the exact token (passed via RPC or app-level filter)
CREATE POLICY "Public can view invitation by exact token" ON public.guest_invitations FOR SELECT USING (
  token = current_setting('app.current_invitation_token', true)
);
CREATE POLICY "Public can respond to invitation by exact token" ON public.guest_invitations FOR UPDATE
  USING (token = current_setting('app.current_invitation_token', true))
  WITH CHECK (
    -- Only allow updating response fields, not structural fields
    guest_id = guest_id AND wedding_plan_id = wedding_plan_id AND token = token
  );

-- ---- Wedding Events ----
CREATE POLICY "Couples can view their wedding events" ON public.wedding_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_events.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create wedding events" ON public.wedding_events FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_events.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can update their wedding events" ON public.wedding_events FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_events.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete their wedding events" ON public.wedding_events FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_events.wedding_plan_id AND couple_user_id = auth.uid())
);

-- ---- Guest Event Invitations ----
CREATE POLICY "Couples can view guest event invitations" ON public.guest_event_invitations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_events we JOIN public.wedding_plans wp ON wp.id = we.wedding_plan_id WHERE we.id = guest_event_invitations.event_id AND wp.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create guest event invitations" ON public.guest_event_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_events we JOIN public.wedding_plans wp ON wp.id = we.wedding_plan_id WHERE we.id = guest_event_invitations.event_id AND wp.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can update guest event invitations" ON public.guest_event_invitations FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.wedding_events we JOIN public.wedding_plans wp ON wp.id = we.wedding_plan_id WHERE we.id = guest_event_invitations.event_id AND wp.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete guest event invitations" ON public.guest_event_invitations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_events we JOIN public.wedding_plans wp ON wp.id = we.wedding_plan_id WHERE we.id = guest_event_invitations.event_id AND wp.couple_user_id = auth.uid())
);

-- ---- Bookings ----
CREATE POLICY "Couples can view their own bookings" ON public.bookings FOR SELECT USING (auth.uid() = couple_user_id);
CREATE POLICY "Couples can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = couple_user_id);
CREATE POLICY "Couples can update their own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = couple_user_id);
CREATE POLICY "Vendors can view bookings for their services" ON public.bookings FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.vendor_profiles WHERE id = bookings.vendor_id)
);

-- ---- Payments ----
CREATE POLICY "Users can view their own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings WHERE id = payments.booking_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Vendors can view payments for their bookings" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.bookings JOIN public.vendor_profiles ON vendor_profiles.id = bookings.vendor_id WHERE bookings.id = payments.booking_id AND vendor_profiles.user_id = auth.uid())
);

-- ---- Escrow ----
CREATE POLICY "Couples can view their escrow transactions" ON public.escrow_transactions FOR SELECT USING (auth.uid() = couple_user_id);
CREATE POLICY "Vendors can view escrow for their bookings" ON public.escrow_transactions FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all escrow transactions" ON public.escrow_transactions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ---- Vendor Payouts ----
CREATE POLICY "Vendors can view their own payouts" ON public.vendor_payouts FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all payouts" ON public.vendor_payouts FOR ALL USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ---- QR Payment Sessions ----
CREATE POLICY "Vendors can create QR sessions" ON public.qr_payment_sessions FOR INSERT WITH CHECK (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Vendors can view their QR sessions" ON public.qr_payment_sessions FOR SELECT USING (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Vendors can update their QR sessions" ON public.qr_payment_sessions FOR UPDATE USING (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can view active QR sessions by token" ON public.qr_payment_sessions FOR SELECT USING (status = 'active' AND expires_at > now());

-- ---- Budget Items ----
CREATE POLICY "Couples can manage their budget items" ON public.budget_items FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);

-- ---- Reviews ----
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for completed bookings" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.bookings WHERE id = reviews.booking_id AND couple_user_id = auth.uid() AND status = 'completed')
);
CREATE POLICY "Users can update their own reviews" ON public.reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reviews" ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- ---- Seating Charts ----
CREATE POLICY "Couples can view their seating charts" ON public.seating_charts FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = seating_charts.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create seating charts" ON public.seating_charts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = seating_charts.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can update their seating charts" ON public.seating_charts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = seating_charts.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete their seating charts" ON public.seating_charts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = seating_charts.wedding_plan_id AND couple_user_id = auth.uid())
);

-- ---- Seating Tables ----
CREATE POLICY "Couples can view their seating tables" ON public.seating_tables FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.seating_charts JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id WHERE seating_charts.id = seating_tables.seating_chart_id AND wedding_plans.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create seating tables" ON public.seating_tables FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.seating_charts JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id WHERE seating_charts.id = seating_tables.seating_chart_id AND wedding_plans.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can update their seating tables" ON public.seating_tables FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.seating_charts JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id WHERE seating_charts.id = seating_tables.seating_chart_id AND wedding_plans.couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete their seating tables" ON public.seating_tables FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.seating_charts JOIN public.wedding_plans ON wedding_plans.id = seating_charts.wedding_plan_id WHERE seating_charts.id = seating_tables.seating_chart_id AND wedding_plans.couple_user_id = auth.uid())
);

-- ---- Table Assignments ----
CREATE POLICY "Couples can manage table assignments" ON public.table_assignments FOR ALL USING (
  seating_table_id IN (
    SELECT st.id FROM public.seating_tables st
    JOIN public.seating_charts sc ON sc.id = st.seating_chart_id
    JOIN public.wedding_plans wp ON wp.id = sc.wedding_plan_id
    WHERE wp.couple_user_id = auth.uid()
  )
);

-- ---- Gift Registry ----
CREATE POLICY "Public can view published gift registry" ON public.gift_registry_items FOR SELECT USING (true);
CREATE POLICY "Users can manage their gift registry" ON public.gift_registry_items FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);

-- ---- Gift Contributions ----
CREATE POLICY "Authenticated users can contribute to gifts" ON public.gift_contributions FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL AND payment_status = 'pending'
);
CREATE POLICY "Users can view contributions to their gifts" ON public.gift_contributions FOR SELECT USING (
  gift_item_id IN (
    SELECT id FROM public.gift_registry_items
    WHERE wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
  )
);

-- ---- Wedding Invitations ----
CREATE POLICY "Couples can view their wedding invitations" ON public.wedding_invitations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create wedding invitations" ON public.wedding_invitations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete their wedding invitations" ON public.wedding_invitations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_invitations.wedding_plan_id AND couple_user_id = auth.uid())
);

-- ---- Visualizations ----
CREATE POLICY "Couples can view their wedding visualizations" ON public.wedding_visualizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_visualizations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can create wedding visualizations" ON public.wedding_visualizations FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_visualizations.wedding_plan_id AND couple_user_id = auth.uid())
);
CREATE POLICY "Couples can delete their wedding visualizations" ON public.wedding_visualizations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = wedding_visualizations.wedding_plan_id AND couple_user_id = auth.uid())
);

-- ---- Venue Visualizations ----
CREATE POLICY "Users can view their own visualizations" ON public.venue_visualizations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans wp WHERE wp.id = venue_visualizations.wedding_plan_id AND wp.couple_user_id = auth.uid()) OR wedding_plan_id IS NULL
);
CREATE POLICY "Users can create visualizations for their wedding" ON public.venue_visualizations FOR INSERT WITH CHECK (
  wedding_plan_id IS NULL OR EXISTS (SELECT 1 FROM public.wedding_plans wp WHERE wp.id = venue_visualizations.wedding_plan_id AND wp.couple_user_id = auth.uid())
);
CREATE POLICY "Users can delete their own visualizations" ON public.venue_visualizations FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.wedding_plans wp WHERE wp.id = venue_visualizations.wedding_plan_id AND wp.couple_user_id = auth.uid())
);

-- ---- Venue Gallery ----
CREATE POLICY "Anyone can view venue gallery" ON public.venue_gallery FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their gallery" ON public.venue_gallery FOR ALL USING (
  venue_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);

-- ---- Communication Settings ----
CREATE POLICY "Couples can manage communication settings" ON public.communication_settings FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);

-- ---- Telegram ----
CREATE POLICY "Couples can manage their telegram connections" ON public.telegram_connections FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);
CREATE POLICY "Couples can view telegram responses" ON public.telegram_rsvp_responses FOR SELECT USING (
  telegram_connection_id IN (
    SELECT id FROM public.telegram_connections
    WHERE wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
  )
);

-- ---- Voice RSVP ----
CREATE POLICY "Couples can view their voice sessions" ON public.voice_rsvp_sessions FOR SELECT USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);
CREATE POLICY "Service role can create voice sessions" ON public.voice_rsvp_sessions FOR INSERT WITH CHECK (
  -- Only allow insert if the guest_invitation exists and has a valid token
  EXISTS (
    SELECT 1 FROM public.guest_invitations gi
    WHERE gi.id = voice_rsvp_sessions.guest_invitation_id
    AND gi.guest_id = voice_rsvp_sessions.guest_id
  )
);
CREATE POLICY "Sessions can be updated by session token" ON public.voice_rsvp_sessions FOR UPDATE USING (
  session_token = current_setting('app.current_session_token', true)
);

-- ---- Achievements ----
CREATE POLICY "Anyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- ---- User Achievements ----
CREATE POLICY "Users can view their achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can earn achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ---- Planning Milestones ----
CREATE POLICY "Users can manage their milestones" ON public.planning_milestones FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);

-- ---- Vendor Availability ----
CREATE POLICY "Anyone can view availability" ON public.vendor_availability FOR SELECT USING (true);
CREATE POLICY "Vendors can manage their availability" ON public.vendor_availability FOR ALL USING (
  vendor_id IN (SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid())
);

-- ---- Vendor Recommendations ----
CREATE POLICY "Couples can view their recommendations" ON public.vendor_recommendations FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.wedding_plans WHERE id = vendor_recommendations.wedding_plan_id AND couple_user_id = auth.uid())
);

-- ---- Favorite Vendors ----
CREATE POLICY "Users can view their own favorites" ON public.favorite_vendors FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.favorite_vendors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove favorites" ON public.favorite_vendors FOR DELETE USING (auth.uid() = user_id);

-- ---- Notification Preferences ----
CREATE POLICY "Users can view their own notification preferences" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notification preferences" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notification preferences" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);

-- ---- Wedding Websites ----
CREATE POLICY "Couples can manage their websites" ON public.wedding_websites FOR ALL USING (
  wedding_plan_id IN (SELECT id FROM public.wedding_plans WHERE couple_user_id = auth.uid())
);
CREATE POLICY "Public can view published websites" ON public.wedding_websites FOR SELECT USING (published = true);


-- ===================
-- 21. Storage Buckets (Supabase-specific)
-- ===================
-- NOTE: For self-hosted setups, create equivalent object storage:
--
-- Bucket: avatars (public read)
--   - User profile avatars
--   - Path: {user_id}/avatar.{ext}
--
-- Bucket: portfolio (public read)
--   - Vendor portfolio images
--   - Path: {vendor_id}/{filename}
--
-- If using Supabase:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true);


-- ===================
-- 22. Auth Trigger (Supabase-specific)
-- ===================
-- NOTE: This trigger works with Supabase Auth.
-- For self-hosted setups, call handle_new_user() from your auth system.
--
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- END OF SCHEMA
-- ============================================================
