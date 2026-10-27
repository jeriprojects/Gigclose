CREATE TYPE public.transaction_type AS ENUM (
  'wallet_topup',
  'job_post_fee',
  'job_escrow_deposit',
  'worker_payout',
  'platform_fee',
  'withdrawal_request',
  'withdrawal_approved',
  'withdrawal_rejected',
  'refund'
);

CREATE TYPE public.transaction_direction AS ENUM ('credit', 'debit');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'rejected');
CREATE TYPE public.withdrawal_status AS ENUM ('pending', 'approved', 'rejected');

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS wallet_balance_ngn INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_suspended BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_restricted BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS posting_fee_ngn INTEGER NOT NULL DEFAULT 5000,
ADD COLUMN IF NOT EXISTS escrow_amount_ngn INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_ngn INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS hired_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancelled_reason TEXT,
ADD COLUMN IF NOT EXISTS disputed BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL,
  type public.transaction_type NOT NULL,
  direction public.transaction_direction NOT NULL,
  status public.transaction_status NOT NULL DEFAULT 'completed',
  amount_ngn INTEGER NOT NULL CHECK (amount_ngn >= 0),
  description TEXT,
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  amount_ngn INTEGER NOT NULL CHECK (amount_ngn > 0),
  status public.withdrawal_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_withdrawals_updated_at
BEFORE UPDATE ON public.withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = check_user_id
      AND is_admin = true
  );
$$;

DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
CREATE POLICY "Users or admin can view profiles"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()) OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;
CREATE POLICY "Authenticated users can view jobs"
ON public.jobs FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Clients update own jobs" ON public.jobs;
CREATE POLICY "Clients or admin update jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = client_id OR auth.uid() = worker_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users or admin can view transactions"
ON public.transactions FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own transactions"
ON public.transactions FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Admin can update transactions"
ON public.transactions FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users or admin can view withdrawal requests"
ON public.withdrawal_requests FOR SELECT
USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users can create own withdrawal requests"
ON public.withdrawal_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can update withdrawal requests"
ON public.withdrawal_requests FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.create_job_with_fee(
  p_title TEXT,
  p_description TEXT,
  p_category public.job_category,
  p_budget_ngn INTEGER,
  p_location_label TEXT,
  p_latitude NUMERIC,
  p_longitude NUMERIC,
  p_urgent BOOLEAN
)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_job public.jobs%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF v_profile.is_suspended THEN
    RAISE EXCEPTION 'Your account is suspended';
  END IF;

  IF v_profile.wallet_balance_ngn < 5000 THEN
    RAISE EXCEPTION 'Insufficient wallet balance for the ₦5000 job posting fee';
  END IF;

  UPDATE public.profiles
  SET wallet_balance_ngn = wallet_balance_ngn - 5000
  WHERE user_id = v_user_id;

  INSERT INTO public.jobs (
    client_id,
    title,
    description,
    category,
    budget_ngn,
    location_label,
    latitude,
    longitude,
    urgent,
    posting_fee_ngn
  )
  VALUES (
    v_user_id,
    p_title,
    p_description,
    p_category,
    p_budget_ngn,
    p_location_label,
    p_latitude,
    p_longitude,
    p_urgent,
    5000
  )
  RETURNING * INTO v_job;

  INSERT INTO public.transactions (user_id, job_id, type, direction, status, amount_ngn, description, reference)
  VALUES (
    v_user_id,
    v_job.id,
    'job_post_fee',
    'debit',
    'completed',
    5000,
    'Job posting fee charged before publishing job',
    'POST-FEE-' || v_job.id
  );

  RETURN v_job;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_worker_to_job(
  p_job_id UUID,
  p_worker_id UUID
)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_job public.jobs%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_job.client_id <> v_user_id AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Only the job owner or admin can assign a worker';
  END IF;

  IF v_job.worker_id IS NOT NULL THEN
    RAISE EXCEPTION 'This job already has an assigned worker';
  END IF;

  UPDATE public.profiles
  SET wallet_balance_ngn = wallet_balance_ngn - v_job.budget_ngn
  WHERE user_id = v_user_id
    AND wallet_balance_ngn >= v_job.budget_ngn;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient wallet balance to fund job escrow';
  END IF;

  UPDATE public.jobs
  SET worker_id = p_worker_id,
      status = 'assigned',
      escrow_amount_ngn = budget_ngn,
      hired_at = now()
  WHERE id = p_job_id
  RETURNING * INTO v_job;

  INSERT INTO public.transactions (user_id, job_id, type, direction, status, amount_ngn, description, reference)
  VALUES (
    v_user_id,
    p_job_id,
    'job_escrow_deposit',
    'debit',
    'completed',
    v_job.budget_ngn,
    'Client funded job escrow on worker assignment',
    'ESCROW-' || p_job_id
  );

  RETURN v_job;
END;
$$;

CREATE OR REPLACE FUNCTION public.complete_job_and_release_payment(
  p_job_id UUID
)
RETURNS public.jobs
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_job public.jobs%ROWTYPE;
  v_platform_fee INTEGER;
  v_worker_payout INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_job.status NOT IN ('assigned', 'in_progress') THEN
    RAISE EXCEPTION 'Only assigned or in-progress jobs can be completed';
  END IF;

  IF v_user_id <> v_job.client_id
    AND v_user_id <> v_job.worker_id
    AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Only job participants or admin can complete this job';
  END IF;

  v_platform_fee := CEIL(v_job.budget_ngn * 0.015);
  v_worker_payout := v_job.budget_ngn - v_platform_fee;

  UPDATE public.profiles
  SET wallet_balance_ngn = wallet_balance_ngn + v_worker_payout,
      jobs_completed = jobs_completed + 1,
      behavior_score = LEAST(5.00, behavior_score + 0.02)
  WHERE user_id = v_job.worker_id;

  UPDATE public.jobs
  SET status = 'completed',
      completed_at = now(),
      platform_fee_ngn = v_platform_fee
  WHERE id = p_job_id
  RETURNING * INTO v_job;

  INSERT INTO public.transactions (user_id, job_id, type, direction, status, amount_ngn, description, reference)
  VALUES
    (
      v_job.worker_id,
      p_job_id,
      'worker_payout',
      'credit',
      'completed',
      v_worker_payout,
      'Worker payout after 1.5% platform fee',
      'WORKER-PAYOUT-' || p_job_id
    ),
    (
      v_job.client_id,
      p_job_id,
      'platform_fee',
      'debit',
      'completed',
      v_platform_fee,
      'Platform commission fee deducted from escrow',
      'PLATFORM-FEE-' || p_job_id
    );

  RETURN v_job;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_withdrawal_request(
  p_amount_ngn INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_request public.withdrawal_requests%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF p_amount_ngn <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;

  IF v_profile.wallet_balance_ngn < p_amount_ngn THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  INSERT INTO public.withdrawal_requests (user_id, amount_ngn, notes)
  VALUES (v_user_id, p_amount_ngn, p_notes)
  RETURNING * INTO v_request;

  INSERT INTO public.transactions (user_id, type, direction, status, amount_ngn, description, reference)
  VALUES (
    v_user_id,
    'withdrawal_request',
    'debit',
    'pending',
    p_amount_ngn,
    'Withdrawal request submitted and awaiting admin review',
    'WITHDRAW-REQUEST-' || v_request.id
  );

  RETURN v_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_withdrawal_request(
  p_request_id UUID,
  p_approve BOOLEAN,
  p_notes TEXT DEFAULT NULL
)
RETURNS public.withdrawal_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_request public.withdrawal_requests%ROWTYPE;
BEGIN
  IF NOT public.is_admin(v_admin_id) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT * INTO v_request
  FROM public.withdrawal_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF v_request.status <> 'pending' THEN
    RAISE EXCEPTION 'Withdrawal request has already been reviewed';
  END IF;

  IF p_approve THEN
    UPDATE public.profiles
    SET wallet_balance_ngn = wallet_balance_ngn - v_request.amount_ngn
    WHERE user_id = v_request.user_id
      AND wallet_balance_ngn >= v_request.amount_ngn;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'User wallet no longer has sufficient balance';
    END IF;
  END IF;

  UPDATE public.withdrawal_requests
  SET status = CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      notes = p_notes,
      reviewed_by = v_admin_id,
      reviewed_at = now()
  WHERE id = p_request_id
  RETURNING * INTO v_request;

  UPDATE public.transactions
  SET status = CASE WHEN p_approve THEN 'completed' ELSE 'rejected' END
  WHERE reference = 'WITHDRAW-REQUEST-' || p_request_id;

  INSERT INTO public.transactions (user_id, type, direction, status, amount_ngn, description, reference)
  VALUES (
    v_request.user_id,
    CASE WHEN p_approve THEN 'withdrawal_approved' ELSE 'withdrawal_rejected' END,
    'debit',
    CASE WHEN p_approve THEN 'completed' ELSE 'rejected' END,
    v_request.amount_ngn,
    CASE WHEN p_approve THEN 'Withdrawal approved by admin' ELSE 'Withdrawal rejected by admin' END,
    CASE WHEN p_approve THEN 'WITHDRAW-APPROVED-' ELSE 'WITHDRAW-REJECTED-' END || p_request_id
  );

  RETURN v_request;
END;
$$;
