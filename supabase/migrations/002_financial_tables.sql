-- Financial Tables Migration
-- Professional financial management system for TikTok Visibility Platform

-- Financial Transactions table
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  transaction_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type user_type_enum NOT NULL,
  transaction_type transaction_type_enum NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents >= 0),
  reference character varying NOT NULL UNIQUE,
  payment_method payment_method_enum NOT NULL,
  status transaction_status_enum DEFAULT 'pending',
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT financial_transactions_pkey PRIMARY KEY (transaction_id),
  CONSTRAINT financial_transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE
);

-- Indexes for financial_transactions
CREATE INDEX idx_financial_transactions_user_id ON public.financial_transactions(user_id);
CREATE INDEX idx_financial_transactions_type ON public.financial_transactions(transaction_type);
CREATE INDEX idx_financial_transactions_status ON public.financial_transactions(status);
CREATE INDEX idx_financial_transactions_created_at ON public.financial_transactions(created_at DESC);
CREATE INDEX idx_financial_transactions_reference ON public.financial_transactions(reference);

-- Financial Reconciliations table
CREATE TABLE IF NOT EXISTS public.financial_reconciliations (
  reconciliation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  provider character varying NOT NULL,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  internal_amount_cents integer NOT NULL DEFAULT 0,
  external_amount_cents integer NOT NULL DEFAULT 0,
  transaction_count_internal integer DEFAULT 0,
  transaction_count_external integer DEFAULT 0,
  status character varying NOT NULL DEFAULT 'pending',
  notes text,
  reconciled_by uuid,
  reconciled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT financial_reconciliations_pkey PRIMARY KEY (reconciliation_id),
  CONSTRAINT financial_reconciliations_reconciled_by_fkey FOREIGN KEY (reconciled_by) REFERENCES public.user_profiles(id) ON DELETE SET NULL
);

-- Indexes for financial_reconciliations
CREATE INDEX idx_financial_reconciliations_provider ON public.financial_reconciliations(provider);
CREATE INDEX idx_financial_reconciliations_status ON public.financial_reconciliations(status);
CREATE INDEX idx_financial_reconciliations_period ON public.financial_reconciliations(period_start, period_end);

-- RLS Policies for financial_transactions
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Admins can see all transactions
CREATE POLICY "Admins can view all transactions"
  ON public.financial_transactions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Users can see their own transactions
CREATE POLICY "Users can view their own transactions"
  ON public.financial_transactions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins can insert transactions
CREATE POLICY "Admins can create transactions"
  ON public.financial_transactions FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Admins can update transactions
CREATE POLICY "Admins can update transactions"
  ON public.financial_transactions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- RLS Policies for financial_reconciliations
ALTER TABLE public.financial_reconciliations ENABLE ROW LEVEL SECURITY;

-- Admins can see all reconciliations
CREATE POLICY "Admins can view all reconciliations"
  ON public.financial_reconciliations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Admins can create reconciliations
CREATE POLICY "Admins can create reconciliations"
  ON public.financial_reconciliations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Admins can update reconciliations
CREATE POLICY "Admins can update reconciliations"
  ON public.financial_reconciliations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.user_type = 'admin'
    )
  );

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_financial_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_financial_transactions_updated_at();

-- Comments for documentation
COMMENT ON TABLE public.financial_transactions IS 'All financial transactions (deposits, withdrawals, payments, refunds, commissions)';
COMMENT ON COLUMN public.financial_transactions.transaction_id IS 'Unique identifier for the transaction';
COMMENT ON COLUMN public.financial_transactions.user_id IS 'Reference to the user involved in the transaction';
COMMENT ON COLUMN public.financial_transactions.user_type IS 'Type of user: client or executant';
COMMENT ON COLUMN public.financial_transactions.transaction_type IS 'Type of transaction: deposit, withdrawal, payment, refund, commission';
COMMENT ON COLUMN public.financial_transactions.amount_cents IS 'Amount in cents (FCFA)';
COMMENT ON COLUMN public.financial_transactions.reference IS 'Unique transaction reference number';
COMMENT ON COLUMN public.financial_transactions.payment_method IS 'Payment method used';
COMMENT ON COLUMN public.financial_transactions.status IS 'Transaction status: pending, completed, failed, cancelled';

COMMENT ON TABLE public.financial_reconciliations IS 'Financial reconciliation records for payment providers';
COMMENT ON COLUMN public.financial_reconciliations.reconciliation_id IS 'Unique identifier for the reconciliation';
COMMENT ON COLUMN public.financial_reconciliations.provider IS 'Payment provider name (mtn_momo, moov_money, fedapay, pawapay, etc.)';
COMMENT ON COLUMN public.financial_reconciliations.internal_amount_cents IS 'Total amount from internal system in cents';
COMMENT ON COLUMN public.financial_reconciliations.external_amount_cents IS 'Total amount from provider in cents';
COMMENT ON COLUMN public.financial_reconciliations.status IS 'Reconciliation status: matched, mismatch, pending';
