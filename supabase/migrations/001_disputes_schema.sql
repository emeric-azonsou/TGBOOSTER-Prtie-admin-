-- Disputes Management Schema
-- Professional dispute resolution system for TikTok Visibility Platform

-- Enums for dispute management
CREATE TYPE dispute_status_enum AS ENUM ('pending', 'investigating', 'resolved', 'escalated', 'cancelled');
CREATE TYPE dispute_priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE dispute_resolution_enum AS ENUM ('refund_full', 'refund_partial', 'no_refund', 'task_revalidation', 'executant_warning', 'client_warning');
CREATE TYPE submitted_by_enum AS ENUM ('client', 'executant', 'system');

-- Main disputes table
CREATE TABLE public.disputes (
  dispute_id uuid NOT NULL DEFAULT gen_random_uuid(),
  task_execution_id uuid NOT NULL,
  submitted_by submitted_by_enum NOT NULL,
  reason text NOT NULL,
  description text NOT NULL,
  evidence_urls text[],
  status dispute_status_enum DEFAULT 'pending',
  priority dispute_priority_enum DEFAULT 'medium',
  assigned_to uuid,
  resolution dispute_resolution_enum,
  resolution_notes text,
  refund_amount_cents integer,
  submitted_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT disputes_pkey PRIMARY KEY (dispute_id),
  CONSTRAINT disputes_task_execution_id_fkey FOREIGN KEY (task_execution_id) REFERENCES public.task_executions(execution_id) ON DELETE CASCADE,
  CONSTRAINT disputes_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX idx_disputes_status ON public.disputes(status);
CREATE INDEX idx_disputes_priority ON public.disputes(priority);
CREATE INDEX idx_disputes_submitted_by ON public.disputes(submitted_by);
CREATE INDEX idx_disputes_assigned_to ON public.disputes(assigned_to);
CREATE INDEX idx_disputes_task_execution_id ON public.disputes(task_execution_id);
CREATE INDEX idx_disputes_submitted_at ON public.disputes(submitted_at DESC);

-- RLS Policies
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- Admins can see all disputes
CREATE POLICY "Admins can view all disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Admins can update disputes
CREATE POLICY "Admins can update disputes"
  ON public.disputes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Clients can view their own disputes
CREATE POLICY "Clients can view their disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.task_executions te
      JOIN public.tasks t ON te.task_id = t.task_id
      JOIN public.client_profiles cp ON t.client_id = cp.client_id
      WHERE te.execution_id = task_execution_id
      AND cp.client_id = auth.uid()
    )
  );

-- Executants can view their own disputes
CREATE POLICY "Executants can view their disputes"
  ON public.disputes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.task_executions te
      WHERE te.execution_id = task_execution_id
      AND te.executant_id = auth.uid()
    )
  );

-- Clients can create disputes for their tasks
CREATE POLICY "Clients can create disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_executions te
      JOIN public.tasks t ON te.task_id = t.task_id
      JOIN public.client_profiles cp ON t.client_id = cp.client_id
      WHERE te.execution_id = task_execution_id
      AND cp.client_id = auth.uid()
    )
  );

-- Executants can create disputes for their tasks
CREATE POLICY "Executants can create disputes"
  ON public.disputes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.task_executions te
      WHERE te.execution_id = task_execution_id
      AND te.executant_id = auth.uid()
    )
  );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_disputes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW
  EXECUTE FUNCTION update_disputes_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.disputes IS 'Dispute resolution system for task executions';
COMMENT ON COLUMN public.disputes.dispute_id IS 'Unique identifier for the dispute';
COMMENT ON COLUMN public.disputes.task_execution_id IS 'Reference to the disputed task execution';
COMMENT ON COLUMN public.disputes.submitted_by IS 'Who submitted the dispute: client, executant, or system';
COMMENT ON COLUMN public.disputes.reason IS 'Main reason for the dispute';
COMMENT ON COLUMN public.disputes.description IS 'Detailed description of the dispute';
COMMENT ON COLUMN public.disputes.evidence_urls IS 'URLs to supporting evidence (screenshots, videos, etc.)';
COMMENT ON COLUMN public.disputes.status IS 'Current status of the dispute';
COMMENT ON COLUMN public.disputes.priority IS 'Priority level for resolution';
COMMENT ON COLUMN public.disputes.assigned_to IS 'Moderator assigned to handle the dispute';
COMMENT ON COLUMN public.disputes.resolution IS 'Type of resolution applied';
COMMENT ON COLUMN public.disputes.resolution_notes IS 'Notes from the moderator about the resolution';
COMMENT ON COLUMN public.disputes.refund_amount_cents IS 'Amount refunded in cents (FCFA)';
