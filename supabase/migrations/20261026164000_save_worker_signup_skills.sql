CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_skills JSONB := NEW.raw_user_meta_data -> 'skills';
BEGIN
  INSERT INTO public.profiles (
    user_id,
    display_name,
    account_type,
    city,
    latitude,
    longitude,
    location_updated_at,
    skills
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'worker'),
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'Lekki Phase 1'),
    NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC,
    NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC,
    now(),
    CASE
      WHEN jsonb_typeof(v_skills) = 'array' THEN ARRAY(
        SELECT jsonb_array_elements_text(v_skills)
      )
      ELSE '{}'::TEXT[]
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
