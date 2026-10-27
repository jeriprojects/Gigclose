-- Remove legacy seeded jobs and allow any authenticated non-suspended profile
-- to discover and apply for open jobs they did not create.

DELETE FROM public.job_applications
WHERE job_id IN (
  SELECT id
  FROM public.jobs
  WHERE client_id IN (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003'
  )
);

DELETE FROM public.saved_gigs
WHERE job_id IN (
  SELECT id
  FROM public.jobs
  WHERE client_id IN (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003'
  )
);

DELETE FROM public.jobs
WHERE client_id IN (
  '00000000-0000-0000-0000-000000000000',
  '20000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000002',
  '20000000-0000-0000-0000-000000000003'
);

CREATE OR REPLACE FUNCTION public.apply_to_job(
  p_job_id UUID,
  p_cover_note TEXT DEFAULT NULL
)
RETURNS public.job_applications
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_job public.jobs%ROWTYPE;
  v_application public.job_applications%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF v_profile.is_suspended OR v_profile.is_restricted THEN
    RAISE EXCEPTION 'Your account cannot apply for jobs right now';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_job.status <> 'open' THEN
    RAISE EXCEPTION 'Only open jobs can accept applications';
  END IF;

  IF v_job.client_id = v_user_id THEN
    RAISE EXCEPTION 'You cannot apply to your own job';
  END IF;

  INSERT INTO public.job_applications (job_id, worker_id, cover_note)
  VALUES (p_job_id, v_user_id, NULLIF(TRIM(p_cover_note), ''))
  ON CONFLICT (job_id, worker_id)
  DO UPDATE SET
    cover_note = EXCLUDED.cover_note,
    status = 'pending',
    updated_at = now()
  RETURNING * INTO v_application;

  RETURN v_application;
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

  IF v_worker_profile.is_suspended OR v_worker_profile.is_restricted THEN
    RAISE EXCEPTION 'Selected applicant is not eligible for assignments right now';
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
  