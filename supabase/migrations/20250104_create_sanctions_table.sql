-- Create sanctions table for user sanctions management
CREATE TABLE IF NOT EXISTS public.sanctions (
  sanction_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text CHECK (user_type IN ('client', 'executant')),
  sanction_type text NOT NULL CHECK (sanction_type IN ('warning', 'temporary_suspension', 'permanent_ban', 'account_restriction')),
  reason text NOT NULL,
  description text,
  applied_by uuid,
  applied_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone,
  revoked_at timestamp with time zone,
  revoked_by uuid,
  revoke_reason text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  related_dispute_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT sanctions_pkey PRIMARY KEY (sanction_id),
  CONSTRAINT sanctions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  CONSTRAINT sanctions_applied_by_fkey FOREIGN KEY (applied_by) REFERENCES public.user_profiles(id),
  CONSTRAINT sanctions_revoked_by_fkey FOREIGN KEY (revoked_by) REFERENCES public.user_profiles(id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sanctions_user_id ON public.sanctions(user_id);
CREATE INDEX IF NOT EXISTS idx_sanctions_status ON public.sanctions(status);
CREATE INDEX IF NOT EXISTS idx_sanctions_sanction_type ON public.sanctions(sanction_type);
CREATE INDEX IF NOT EXISTS idx_sanctions_applied_at ON public.sanctions(applied_at DESC);
CREATE INDEX IF NOT EXISTS idx_sanctions_expires_at ON public.sanctions(expires_at);

-- Enable Row Level Security
ALTER TABLE public.sanctions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sanctions table
-- Admin can view all sanctions
CREATE POLICY "Admins can view all sanctions"
  ON public.sanctions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admin can insert sanctions
CREATE POLICY "Admins can insert sanctions"
  ON public.sanctions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Admin can update sanctions (revoke)
CREATE POLICY "Admins can update sanctions"
  ON public.sanctions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Users can view their own sanctions
CREATE POLICY "Users can view their own sanctions"
  ON public.sanctions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_sanctions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on sanctions
DROP TRIGGER IF EXISTS update_sanctions_updated_at ON public.sanctions;
CREATE TRIGGER update_sanctions_updated_at
  BEFORE UPDATE ON public.sanctions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sanctions_updated_at();

-- Function to automatically expire sanctions
CREATE OR REPLACE FUNCTION public.auto_expire_sanctions()
RETURNS void AS $$
BEGIN
  UPDATE public.sanctions
  SET status = 'expired'
  WHERE status = 'active'
    AND expires_at IS NOT NULL
    AND expires_at <= now();
END;
$$ LANGUAGE plpgsql;

-- Comment on table
COMMENT ON TABLE public.sanctions IS 'User sanctions including warnings, suspensions, and bans';
