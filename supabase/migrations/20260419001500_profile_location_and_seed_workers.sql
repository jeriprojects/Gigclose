CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, account_type, city)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'worker'),
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'Lekki Phase 1')
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

INSERT INTO public.profiles (
  user_id,
  display_name,
  account_type,
  city,
  skills,
  behavior_score,
  response_time_seconds,
  completion_rate,
  show_up_rate,
  jobs_completed,
  auto_earn_enabled
)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Tunde A.', 'worker', 'Lekki Phase 1', ARRAY['cleaning', 'moving', 'handyman'], 4.90, 14, 98.00, 97.00, 41, true),
  ('10000000-0000-0000-0000-000000000002', 'Chioma O.', 'worker', 'Victoria Island', ARRAY['delivery', 'creative'], 4.80, 11, 97.00, 96.00, 32, true),
  ('10000000-0000-0000-0000-000000000003', 'Yusuf K.', 'both', 'Ikoyi', ARRAY['electrical', 'plumbing', 'handyman'], 4.70, 16, 95.00, 95.00, 54, true),
  ('10000000-0000-0000-0000-000000000004', 'Adaeze N.', 'worker', 'Yaba', ARRAY['cleaning', 'delivery'], 4.85, 12, 99.00, 98.00, 27, true)
ON CONFLICT (user_id) DO NOTHING;
