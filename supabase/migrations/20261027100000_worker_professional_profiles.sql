CREATE TYPE public.professional_visibility AS ENUM (
  'public',
  'employers',
  'applied_employers',
  'private'
);

CREATE TABLE public.worker_professional_settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cv_visibility public.professional_visibility NOT NULL DEFAULT 'private',
  portfolio_visibility public.professional_visibility NOT NULL DEFAULT 'private',
  experience_visibility public.professional_visibility NOT NULL DEFAULT 'private',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.worker_cvs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  headline TEXT NOT NULL DEFAULT '',
  summary TEXT NOT NULL DEFAULT '',
  skills TEXT[] NOT NULL DEFAULT '{}',
  education TEXT NOT NULL DEFAULT '',
  certifications TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT worker_cvs_headline_length CHECK (char_length(headline) <= 120),
  CONSTRAINT worker_cvs_summary_length CHECK (char_length(summary) <= 5000),
  CONSTRAINT worker_cvs_education_length CHECK (char_length(education) <= 3000),
  CONSTRAINT worker_cvs_certifications_length CHECK (char_length(certifications) <= 3000)
);

CREATE TABLE public.worker_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  organization TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT false,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT worker_experience_dates CHECK (
    (is_current AND end_date IS NULL) OR (NOT is_current AND (end_date IS NULL OR end_date >= start_date))
  ),
  CONSTRAINT worker_experience_text_lengths CHECK (
    char_length(job_title) <= 120
    AND char_length(organization) <= 160
    AND char_length(location) <= 160
    AND char_length(description) <= 3000
  )
);

CREATE TABLE public.worker_portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  media_path TEXT NOT NULL UNIQUE,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT worker_portfolio_text_lengths CHECK (
    char_length(title) BETWEEN 1 AND 160 AND char_length(description) <= 3000
  )
);

CREATE INDEX worker_experience_worker_id_idx ON public.worker_experience (worker_id, start_date DESC);
CREATE INDEX worker_portfolio_items_worker_id_idx ON public.worker_portfolio_items (worker_id, created_at DESC);

CREATE OR REPLACE VIEW public.worker_public_profiles
WITH (security_barrier = true)
AS
SELECT
  user_id,
  display_name,
  avatar_url,
  city,
  bio,
  skills,
  behavior_score,
  completion_rate,
  jobs_completed,
  auto_earn_enabled,
  is_suspended,
  is_restricted,
  worker_average_rating,
  worker_rating_count
FROM public.profiles
WHERE account_type = 'worker';

GRANT SELECT ON public.worker_public_profiles TO anon, authenticated;

ALTER TABLE public.worker_professional_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_cvs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.can_view_worker_professional_content(
  p_worker_id UUID,
  p_section TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visibility public.professional_visibility;
BEGIN
  IF auth.uid() = p_worker_id THEN
    RETURN true;
  END IF;

  SELECT CASE p_section
    WHEN 'cv' THEN cv_visibility
    WHEN 'portfolio' THEN portfolio_visibility
    WHEN 'experience' THEN experience_visibility
    ELSE 'private'::public.professional_visibility
  END
  INTO v_visibility
  FROM public.worker_professional_settings
  WHERE user_id = p_worker_id;

  IF v_visibility IS NULL OR v_visibility = 'private' THEN
    RETURN false;
  END IF;

  IF v_visibility = 'public' THEN
    RETURN true;
  END IF;

  IF auth.uid() IS NULL OR NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = auth.uid()
      AND account_type = 'client'
  ) THEN
    RETURN false;
  END IF;

  IF v_visibility = 'employers' THEN
    RETURN true;
  END IF;

  RETURN v_visibility = 'applied_employers' AND EXISTS (
    SELECT 1
    FROM public.job_applications AS applications
    JOIN public.jobs AS jobs ON jobs.id = applications.job_id
    WHERE applications.worker_id = p_worker_id
      AND jobs.client_id = auth.uid()
  );
END;
$$;

CREATE POLICY "Users manage own professional visibility"
ON public.worker_professional_settings
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eligible viewers can read CV"
ON public.worker_cvs
FOR SELECT
USING (public.can_view_worker_professional_content(user_id, 'cv'));

CREATE POLICY "Owners manage own CV"
ON public.worker_cvs
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Eligible viewers can read experience"
ON public.worker_experience
FOR SELECT
USING (public.can_view_worker_professional_content(worker_id, 'experience'));

CREATE POLICY "Owners manage own experience"
ON public.worker_experience
FOR ALL
USING (auth.uid() = worker_id)
WITH CHECK (auth.uid() = worker_id);

CREATE POLICY "Eligible viewers can read portfolio"
ON public.worker_portfolio_items
FOR SELECT
USING (public.can_view_worker_professional_content(worker_id, 'portfolio'));

CREATE POLICY "Owners manage own portfolio"
ON public.worker_portfolio_items
FOR ALL
USING (auth.uid() = worker_id)
WITH CHECK (auth.uid() = worker_id);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'worker-professional-media',
  'worker-professional-media',
  false,
  52428800,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Eligible viewers can read professional portfolio media"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'worker-professional-media'
  AND CASE
    WHEN (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN public.can_view_worker_professional_content((storage.foldername(name))[1]::UUID, 'portfolio')
    ELSE false
  END
);

CREATE POLICY "Users upload own professional portfolio media"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'worker-professional-media'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Users update own professional portfolio media"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'worker-professional-media'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'worker-professional-media'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);

CREATE POLICY "Users delete own professional portfolio media"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'worker-professional-media'
  AND auth.uid()::TEXT = (storage.foldername(name))[1]
);
