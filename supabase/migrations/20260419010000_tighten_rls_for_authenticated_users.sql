DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Jobs viewable by everyone" ON public.jobs;
CREATE POLICY "Authenticated users can view jobs"
ON public.jobs FOR SELECT
USING (auth.role() = 'authenticated');
