
-- Account type enum
CREATE TYPE public.account_type AS ENUM ('worker', 'client', 'both');

-- Job category enum
CREATE TYPE public.job_category AS ENUM ('cleaning','delivery','electrical','plumbing','moving','creative','handyman','other');

-- Job status
CREATE TYPE public.job_status AS ENUM ('open','assigned','in_progress','completed','cancelled');

-- Profiles table (separate from auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  account_type public.account_type NOT NULL DEFAULT 'worker',
  bio TEXT,
  city TEXT,
  skills TEXT[] DEFAULT '{}',
  behavior_score NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  response_time_seconds INTEGER NOT NULL DEFAULT 0,
  completion_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  show_up_rate NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  jobs_completed INTEGER NOT NULL DEFAULT 0,
  auto_earn_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

CREATE POLICY "Users insert own profile"
ON public.profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Jobs
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL,
  worker_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  category public.job_category NOT NULL DEFAULT 'other',
  budget_ngn INTEGER NOT NULL,
  location_label TEXT NOT NULL,
  latitude NUMERIC(9,6) NOT NULL,
  longitude NUMERIC(9,6) NOT NULL,
  urgent BOOLEAN NOT NULL DEFAULT false,
  status public.job_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Jobs viewable by everyone"
ON public.jobs FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can post jobs"
ON public.jobs FOR INSERT
WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Clients update own jobs"
ON public.jobs FOR UPDATE
USING (auth.uid() = client_id OR auth.uid() = worker_id);

CREATE POLICY "Clients delete own jobs"
ON public.jobs FOR DELETE
USING (auth.uid() = client_id);

-- Saved gigs
CREATE TABLE public.saved_gigs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, job_id)
);

ALTER TABLE public.saved_gigs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own saved gigs"
ON public.saved_gigs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users save gigs"
ON public.saved_gigs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users unsave gigs"
ON public.saved_gigs FOR DELETE
USING (auth.uid() = user_id);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at
BEFORE UPDATE ON public.jobs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, account_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'worker')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed open jobs (Lagos area) so the map/feed has data on first load
INSERT INTO public.jobs (client_id, title, description, category, budget_ngn, location_label, latitude, longitude, urgent) VALUES
  ('00000000-0000-0000-0000-000000000000', 'House cleaner needed', '2-bed apartment, deep clean', 'cleaning', 8000, 'Lekki Phase 1', 6.4474, 3.4732, true),
  ('00000000-0000-0000-0000-000000000000', 'Same-day bike delivery', 'Pickup + drop within VI', 'delivery', 4500, 'Victoria Island', 6.4281, 3.4216, false),
  ('00000000-0000-0000-0000-000000000000', 'Fix bedroom socket', 'Outlet not working', 'electrical', 12000, 'Ikoyi', 6.4500, 3.4350, false),
  ('00000000-0000-0000-0000-000000000000', 'Help moving 3 boxes', 'Need 1 strong helper', 'moving', 6500, 'Yaba', 6.5095, 3.3711, false),
  ('00000000-0000-0000-0000-000000000000', 'Photographer for event', '2 hr shoot, edited photos', 'creative', 35000, 'Ikeja GRA', 6.5833, 3.3500, true),
  ('00000000-0000-0000-0000-000000000000', 'Plumber — leaking tap', 'Kitchen sink leak', 'plumbing', 9000, 'Surulere', 6.4969, 3.3590, false),
  ('00000000-0000-0000-0000-000000000000', 'Mount TV on wall', '55-inch TV, brackets ready', 'handyman', 7000, 'Magodo', 6.6203, 3.3776, false),
  ('00000000-0000-0000-0000-000000000000', 'Office cleaning weekly', 'Small office, 4 desks', 'cleaning', 15000, 'Marina', 6.4506, 3.3941, false);
