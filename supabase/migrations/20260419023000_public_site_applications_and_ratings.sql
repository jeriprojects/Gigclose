CREATE TYPE public.job_application_status AS ENUM (
  'pending',
  'shortlisted',
  'withdrawn',
  'rejected',
  'hired'
);

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS worker_average_rating NUMERIC(3,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS worker_rating_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL,
  cover_note TEXT,
  status public.job_application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, worker_id)
);

CREATE TABLE IF NOT EXISTS public.worker_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  client_id UUID NOT NULL,
  worker_id UUID NOT NULL,
  stars INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
  review TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (job_id, client_id, worker_id)
);

ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_ratings ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS update_contact_inquiries_updated_at ON public.contact_inquiries;
CREATE TRIGGER update_contact_inquiries_updated_at
BEFORE UPDATE ON public.contact_inquiries
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
BEFORE UPDATE ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_worker_ratings_updated_at ON public.worker_ratings;
CREATE TRIGGER update_worker_ratings_updated_at
BEFORE UPDATE ON public.worker_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP POLICY IF EXISTS "Anyone can submit contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Anyone can submit contact inquiries"
ON public.contact_inquiries
FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin can view contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin can view contact inquiries"
ON public.contact_inquiries
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admin can update contact inquiries" ON public.contact_inquiries;
CREATE POLICY "Admin can update contact inquiries"
ON public.contact_inquiries
FOR UPDATE
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Workers and clients can view relevant applications" ON public.job_applications;
CREATE POLICY "Workers and clients can view relevant applications"
ON public.job_applications
FOR SELECT
USING (
  auth.uid() = worker_id
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = job_applications.job_id
      AND jobs.client_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Workers can create applications" ON public.job_applications;
CREATE POLICY "Workers can create applications"
ON public.job_applications
FOR INSERT
WITH CHECK (auth.uid() = worker_id);

DROP POLICY IF EXISTS "Workers and admin update applications" ON public.job_applications;
CREATE POLICY "Workers and admin update applications"
ON public.job_applications
FOR UPDATE
USING (
  auth.uid() = worker_id
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = job_applications.job_id
      AND jobs.client_id = auth.uid()
  )
)
WITH CHECK (
  auth.uid() = worker_id
  OR public.is_admin(auth.uid())
  OR EXISTS (
    SELECT 1
    FROM public.jobs
    WHERE jobs.id = job_applications.job_id
      AND jobs.client_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Worker ratings are public" ON public.worker_ratings;
CREATE POLICY "Worker ratings are public"
ON public.worker_ratings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Clients can create worker ratings" ON public.worker_ratings;
CREATE POLICY "Clients can create worker ratings"
ON public.worker_ratings
FOR INSERT
WITH CHECK (auth.uid() = client_id OR public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Clients can update worker ratings" ON public.worker_ratings;
CREATE POLICY "Clients can update worker ratings"
ON public.worker_ratings
FOR UPDATE
USING (auth.uid() = client_id OR public.is_admin(auth.uid()))
WITH CHECK (auth.uid() = client_id OR public.is_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.refresh_worker_rating_summary(p_worker_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_avg NUMERIC(3,2);
  v_count INTEGER;
BEGIN
  SELECT COALESCE(ROUND(AVG(stars)::numeric, 2), 0), COUNT(*)
  INTO v_avg, v_count
  FROM public.worker_ratings
  WHERE worker_id = p_worker_id;

  UPDATE public.profiles
  SET worker_average_rating = v_avg,
      worker_rating_count = v_count
  WHERE user_id = p_worker_id;
END;
$$;

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

  IF v_profile.account_type <> 'worker' THEN
    RAISE EXCEPTION 'Only worker accounts can apply for jobs';
  END IF;

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

CREATE OR REPLACE FUNCTION public.rate_worker_for_job(
  p_job_id UUID,
  p_worker_id UUID,
  p_stars INTEGER,
  p_review TEXT DEFAULT NULL
)
RETURNS public.worker_ratings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_profile public.profiles%ROWTYPE;
  v_job public.jobs%ROWTYPE;
  v_rating public.worker_ratings%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_stars < 1 OR p_stars > 5 THEN
    RAISE EXCEPTION 'Stars must be between 1 and 5';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE user_id = v_user_id;

  IF v_profile.account_type <> 'client' AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Only client accounts can rate workers';
  END IF;

  SELECT * INTO v_job
  FROM public.jobs
  WHERE id = p_job_id;

  IF v_job.client_id <> v_user_id AND NOT public.is_admin(v_user_id) THEN
    RAISE EXCEPTION 'Only the job poster can rate this worker';
  END IF;

  IF v_job.worker_id IS DISTINCT FROM p_worker_id THEN
    RAISE EXCEPTION 'This worker was not assigned to the selected job';
  END IF;

  IF v_job.status <> 'completed' THEN
    RAISE EXCEPTION 'Workers can only be rated after job completion';
  END IF;

  INSERT INTO public.worker_ratings (job_id, client_id, worker_id, stars, review)
  VALUES (p_job_id, v_user_id, p_worker_id, p_stars, NULLIF(TRIM(p_review), ''))
  ON CONFLICT (job_id, client_id, worker_id)
  DO UPDATE SET
    stars = EXCLUDED.stars,
    review = EXCLUDED.review,
    updated_at = now()
  RETURNING * INTO v_rating;

  PERFORM public.refresh_worker_rating_summary(p_worker_id);

  RETURN v_rating;
END;
$$;
