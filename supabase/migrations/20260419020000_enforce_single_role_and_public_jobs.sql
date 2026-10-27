UPDATE public.profiles
SET account_type = 'worker'
WHERE account_type = 'both';

UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  COALESCE(raw_user_meta_data, '{}'::jsonb),
  '{account_type}',
  '"worker"'::jsonb,
  true
)
WHERE raw_user_meta_data ->> 'account_type' = 'both';

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_single_role_only;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_single_role_only
CHECK (account_type IN ('worker', 'client'));

DROP POLICY IF EXISTS "Authenticated users can view jobs" ON public.jobs;

CREATE POLICY "Open jobs are public and participants keep access"
ON public.jobs
FOR SELECT
USING (
  status = 'open'
  OR auth.uid() = client_id
  OR auth.uid() = worker_id
  OR public.is_admin(auth.uid())
);

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

  IF v_profile.account_type <> 'client' THEN
    RAISE EXCEPTION 'Only client accounts can post jobs';
  END IF;

  IF v_profile.is_suspended OR v_profile.is_restricted THEN
    RAISE EXCEPTION 'Your account cannot post jobs right now';
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
  v_client_profile public.profiles%ROWTYPE;
  v_worker_profile public.profiles%ROWTYPE;
  v_job public.jobs%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_client_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  SELECT * INTO v_worker_profile
  FROM public.profiles
  WHERE user_id = p_worker_id;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_client_profile.account_type <> 'client' THEN
    RAISE EXCEPTION 'Only client accounts can hire workers';
  END IF;

  IF v_worker_profile.account_type <> 'worker' THEN
    RAISE EXCEPTION 'Only worker accounts can be assigned to jobs';
  END IF;

  IF v_worker_profile.is_suspended OR v_worker_profile.is_restricted THEN
    RAISE EXCEPTION 'Selected worker is not eligible for assignments right now';
  END IF;

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
