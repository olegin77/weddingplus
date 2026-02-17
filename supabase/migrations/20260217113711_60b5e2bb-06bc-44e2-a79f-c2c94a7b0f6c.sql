-- Fix voice_rsvp_sessions: restrict public UPDATE to non-completed sessions only
DROP POLICY IF EXISTS "Public can update voice sessions with valid token" ON public.voice_rsvp_sessions;

CREATE POLICY "Public can update pending voice sessions"
ON public.voice_rsvp_sessions FOR UPDATE
USING (status IN ('pending', 'in_progress'));
