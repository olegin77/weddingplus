-- =============================================
-- Phase 4: Fintech Escrow & QR-Pay System
-- =============================================

-- Escrow transaction status enum
CREATE TYPE public.escrow_status AS ENUM (
  'pending',      -- Payment received, held in escrow
  'released',     -- Released to vendor after service completion
  'refunded',     -- Refunded to customer
  'disputed',     -- Under dispute
  'partial_release' -- Partially released (deposit)
);

-- Payout status enum
CREATE TYPE public.payout_status AS ENUM (
  'pending',
  'processing', 
  'completed',
  'failed'
);

-- Escrow transactions table - holds funds securely
CREATE TABLE public.escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  couple_user_id UUID NOT NULL,
  
  -- Financial details
  amount DECIMAL(15, 2) NOT NULL,
  platform_fee DECIMAL(15, 2) NOT NULL DEFAULT 0,
  vendor_amount DECIMAL(15, 2) NOT NULL, -- amount - platform_fee
  currency TEXT NOT NULL DEFAULT 'UZS',
  
  -- Status tracking
  status public.escrow_status NOT NULL DEFAULT 'pending',
  status_reason TEXT,
  
  -- Release conditions
  release_conditions JSONB DEFAULT '{}',
  scheduled_release_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  
  -- Dispute handling
  dispute_opened_at TIMESTAMPTZ,
  dispute_resolved_at TIMESTAMPTZ,
  dispute_notes TEXT,
  
  -- QR Code for quick payments
  qr_code_data TEXT,
  qr_expires_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Vendor payouts table - tracks money released to vendors
CREATE TABLE public.vendor_payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  escrow_transaction_id UUID REFERENCES public.escrow_transactions(id) ON DELETE SET NULL,
  
  -- Payout details
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  payout_method TEXT NOT NULL, -- 'bank_transfer', 'card', 'cash'
  
  -- Bank details (encrypted reference)
  bank_account_reference TEXT,
  
  -- Status
  status public.payout_status NOT NULL DEFAULT 'pending',
  status_message TEXT,
  
  -- Provider tracking
  provider_payout_id TEXT,
  processed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- QR payment sessions for quick payments
CREATE TABLE public.qr_payment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Payment reference
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES public.vendor_profiles(id) ON DELETE CASCADE,
  
  -- Session details
  amount DECIMAL(15, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'UZS',
  description TEXT,
  
  -- QR specific
  qr_token TEXT UNIQUE NOT NULL,
  qr_image_url TEXT,
  
  -- Status and expiry
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paid', 'expired', 'cancelled'
  expires_at TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  
  -- Payer info (filled after scan)
  payer_user_id UUID,
  payer_phone TEXT,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_escrow_booking ON public.escrow_transactions(booking_id);
CREATE INDEX idx_escrow_vendor ON public.escrow_transactions(vendor_id);
CREATE INDEX idx_escrow_status ON public.escrow_transactions(status);
CREATE INDEX idx_escrow_scheduled ON public.escrow_transactions(scheduled_release_at) WHERE status = 'pending';

CREATE INDEX idx_payouts_vendor ON public.vendor_payouts(vendor_id);
CREATE INDEX idx_payouts_status ON public.vendor_payouts(status);

CREATE INDEX idx_qr_sessions_vendor ON public.qr_payment_sessions(vendor_id);
CREATE INDEX idx_qr_sessions_token ON public.qr_payment_sessions(qr_token);
CREATE INDEX idx_qr_sessions_active ON public.qr_payment_sessions(expires_at) WHERE status = 'active';

-- Enable RLS
ALTER TABLE public.escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_payment_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for escrow_transactions
CREATE POLICY "Couples can view their escrow transactions"
ON public.escrow_transactions FOR SELECT
USING (auth.uid() = couple_user_id);

CREATE POLICY "Vendors can view escrow for their bookings"
ON public.escrow_transactions FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all escrow transactions"
ON public.escrow_transactions FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for vendor_payouts
CREATE POLICY "Vendors can view their own payouts"
ON public.vendor_payouts FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Admins can manage all payouts"
ON public.vendor_payouts FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- RLS Policies for qr_payment_sessions
CREATE POLICY "Vendors can create QR sessions"
ON public.qr_payment_sessions FOR INSERT
WITH CHECK (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Vendors can view their QR sessions"
ON public.qr_payment_sessions FOR SELECT
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

CREATE POLICY "Anyone can view active QR sessions by token"
ON public.qr_payment_sessions FOR SELECT
USING (status = 'active' AND expires_at > now());

CREATE POLICY "Vendors can update their QR sessions"
ON public.qr_payment_sessions FOR UPDATE
USING (vendor_id IN (
  SELECT id FROM public.vendor_profiles WHERE user_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_escrow_updated_at
BEFORE UPDATE ON public.escrow_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payouts_updated_at
BEFORE UPDATE ON public.vendor_payouts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_qr_sessions_updated_at
BEFORE UPDATE ON public.qr_payment_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-create escrow when payment completes
CREATE OR REPLACE FUNCTION public.create_escrow_on_payment()
RETURNS TRIGGER AS $$
DECLARE
  v_booking RECORD;
  v_platform_fee DECIMAL(15,2);
BEGIN
  -- Only trigger on completed payments
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Get booking details
    SELECT b.*, vp.id as vendor_profile_id
    INTO v_booking
    FROM public.bookings b
    JOIN public.vendor_profiles vp ON vp.id = b.vendor_id
    WHERE b.id = NEW.booking_id;
    
    IF FOUND THEN
      -- Calculate 5% platform fee
      v_platform_fee := NEW.amount * 0.05;
      
      -- Create escrow transaction
      INSERT INTO public.escrow_transactions (
        booking_id,
        payment_id,
        vendor_id,
        couple_user_id,
        amount,
        platform_fee,
        vendor_amount,
        currency,
        status,
        scheduled_release_at,
        release_conditions
      ) VALUES (
        NEW.booking_id,
        NEW.id,
        v_booking.vendor_profile_id,
        v_booking.couple_user_id,
        NEW.amount,
        v_platform_fee,
        NEW.amount - v_platform_fee,
        NEW.currency,
        'pending',
        v_booking.booking_date + INTERVAL '7 days', -- Release 7 days after event
        jsonb_build_object(
          'require_service_completion', true,
          'auto_release_days', 7
        )
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER create_escrow_after_payment
AFTER UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.create_escrow_on_payment();