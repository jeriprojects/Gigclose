ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, account_type, city, latitude, longitude, location_updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data ->> 'account_type')::public.account_type, 'worker'),
    COALESCE(NEW.raw_user_meta_data ->> 'city', 'Lekki Phase 1'),
    NULLIF(NEW.raw_user_meta_data ->> 'latitude', '')::NUMERIC,
    NULLIF(NEW.raw_user_meta_data ->> 'longitude', '')::NUMERIC,
    now()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'tunde.worker@gigclose.dev',
    crypt('Worker@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Tunde A.","account_type":"worker","city":"Lekki Phase 1","latitude":"6.447400","longitude":"3.473200"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'chioma.worker@gigclose.dev',
    crypt('Worker@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Chioma O.","account_type":"worker","city":"Victoria Island","latitude":"6.428100","longitude":"3.421600"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'yusuf.worker@gigclose.dev',
    crypt('Worker@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Yusuf K.","account_type":"both","city":"Abuja","latitude":"9.076500","longitude":"7.398600"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '10000000-0000-0000-0000-000000000004',
    'authenticated',
    'authenticated',
    'adaeze.worker@gigclose.dev',
    crypt('Worker@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Adaeze N.","account_type":"worker","city":"Enugu","latitude":"6.440200","longitude":"7.494300"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'amaka.client@gigclose.dev',
    crypt('Client@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Amaka C.","account_type":"client","city":"Lagos Island","latitude":"6.524400","longitude":"3.379200"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'femi.client@gigclose.dev',
    crypt('Client@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Femi C.","account_type":"client","city":"Port Harcourt","latitude":"4.815600","longitude":"7.049800"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '20000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'zainab.client@gigclose.dev',
    crypt('Client@123', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Zainab C.","account_type":"client","city":"Kano","latitude":"12.002200","longitude":"8.592000"}',
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  provider,
  provider_id,
  identity_data,
  created_at,
  updated_at,
  last_sign_in_at
)
VALUES
  ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'email', 'tunde.worker@gigclose.dev', '{"sub":"10000000-0000-0000-0000-000000000001","email":"tunde.worker@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'email', 'chioma.worker@gigclose.dev', '{"sub":"10000000-0000-0000-0000-000000000002","email":"chioma.worker@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'email', 'yusuf.worker@gigclose.dev', '{"sub":"10000000-0000-0000-0000-000000000003","email":"yusuf.worker@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('10000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'email', 'adaeze.worker@gigclose.dev', '{"sub":"10000000-0000-0000-0000-000000000004","email":"adaeze.worker@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'email', 'amaka.client@gigclose.dev', '{"sub":"20000000-0000-0000-0000-000000000001","email":"amaka.client@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 'email', 'femi.client@gigclose.dev', '{"sub":"20000000-0000-0000-0000-000000000002","email":"femi.client@gigclose.dev","email_verified":true}', now(), now(), now()),
  ('20000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000003', 'email', 'zainab.client@gigclose.dev', '{"sub":"20000000-0000-0000-0000-000000000003","email":"zainab.client@gigclose.dev","email_verified":true}', now(), now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (
  user_id,
  display_name,
  account_type,
  city,
  latitude,
  longitude,
  skills,
  behavior_score,
  response_time_seconds,
  completion_rate,
  show_up_rate,
  jobs_completed,
  auto_earn_enabled
)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Tunde A.', 'worker', 'Lekki Phase 1', 6.447400, 3.473200, ARRAY['cleaning', 'moving', 'handyman'], 4.90, 14, 98.00, 97.00, 41, true),
  ('10000000-0000-0000-0000-000000000002', 'Chioma O.', 'worker', 'Victoria Island', 6.428100, 3.421600, ARRAY['delivery', 'creative'], 4.80, 11, 97.00, 96.00, 32, true),
  ('10000000-0000-0000-0000-000000000003', 'Yusuf K.', 'both', 'Abuja', 9.076500, 7.398600, ARRAY['electrical', 'plumbing', 'handyman'], 4.70, 16, 95.00, 95.00, 54, true),
  ('10000000-0000-0000-0000-000000000004', 'Adaeze N.', 'worker', 'Enugu', 6.440200, 7.494300, ARRAY['cleaning', 'delivery'], 4.85, 12, 99.00, 98.00, 27, true),
  ('20000000-0000-0000-0000-000000000001', 'Amaka C.', 'client', 'Lagos Island', 6.524400, 3.379200, ARRAY['hiring', 'ops'], 4.95, 8, 100.00, 100.00, 13, false),
  ('20000000-0000-0000-0000-000000000002', 'Femi C.', 'client', 'Port Harcourt', 4.815600, 7.049800, ARRAY['logistics', 'field'], 4.88, 9, 100.00, 100.00, 19, false),
  ('20000000-0000-0000-0000-000000000003', 'Zainab C.', 'client', 'Kano', 12.002200, 8.592000, ARRAY['retail', 'ops'], 4.92, 10, 100.00, 100.00, 16, false)
ON CONFLICT (user_id) DO UPDATE
SET
  display_name = EXCLUDED.display_name,
  account_type = EXCLUDED.account_type,
  city = EXCLUDED.city,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  skills = EXCLUDED.skills,
  behavior_score = EXCLUDED.behavior_score,
  response_time_seconds = EXCLUDED.response_time_seconds,
  completion_rate = EXCLUDED.completion_rate,
  show_up_rate = EXCLUDED.show_up_rate,
  jobs_completed = EXCLUDED.jobs_completed,
  auto_earn_enabled = EXCLUDED.auto_earn_enabled,
  location_updated_at = now();
