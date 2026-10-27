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
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '30000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'admin@gigclose.dev',
  crypt('Admin@123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"display_name":"GigClose Admin","account_type":"client","city":"Abuja","latitude":"9.076500","longitude":"7.398600"}',
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
VALUES (
  '30000000-0000-0000-0000-000000000001',
  '30000000-0000-0000-0000-000000000001',
  'email',
  'admin@gigclose.dev',
  '{"sub":"30000000-0000-0000-0000-000000000001","email":"admin@gigclose.dev","email_verified":true}',
  now(),
  now(),
  now()
)
ON CONFLICT DO NOTHING;

INSERT INTO public.profiles (
  user_id,
  display_name,
  account_type,
  city,
  latitude,
  longitude,
  wallet_balance_ngn,
  is_admin,
  is_verified,
  skills,
  behavior_score,
  response_time_seconds,
  completion_rate,
  show_up_rate,
  jobs_completed
)
VALUES (
  '30000000-0000-0000-0000-000000000001',
  'GigClose Admin',
  'client',
  'Abuja',
  9.076500,
  7.398600,
  0,
  true,
  true,
  ARRAY['ops', 'admin'],
  5.00,
  0,
  100.00,
  100.00,
  0
)
ON CONFLICT (user_id) DO UPDATE
SET
  is_admin = true,
  is_verified = true,
  city = EXCLUDED.city,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

UPDATE public.profiles
SET wallet_balance_ngn = CASE
  WHEN user_id IN (
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003'
  ) THEN 350000
  WHEN user_id IN (
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004'
  ) THEN 85000
  ELSE wallet_balance_ngn
END,
is_verified = true;

INSERT INTO public.transactions (user_id, type, direction, status, amount_ngn, description, reference)
VALUES
  ('20000000-0000-0000-0000-000000000001', 'wallet_topup', 'credit', 'completed', 350000, 'Seed client wallet funding', 'SEED-TOPUP-AMAKA'),
  ('20000000-0000-0000-0000-000000000002', 'wallet_topup', 'credit', 'completed', 350000, 'Seed client wallet funding', 'SEED-TOPUP-FEMI'),
  ('20000000-0000-0000-0000-000000000003', 'wallet_topup', 'credit', 'completed', 350000, 'Seed client wallet funding', 'SEED-TOPUP-ZAINAB'),
  ('10000000-0000-0000-0000-000000000001', 'wallet_topup', 'credit', 'completed', 85000, 'Seed worker wallet funding', 'SEED-TOPUP-TUNDE'),
  ('10000000-0000-0000-0000-000000000002', 'wallet_topup', 'credit', 'completed', 85000, 'Seed worker wallet funding', 'SEED-TOPUP-CHIOMA'),
  ('10000000-0000-0000-0000-000000000003', 'wallet_topup', 'credit', 'completed', 85000, 'Seed worker wallet funding', 'SEED-TOPUP-YUSUF'),
  ('10000000-0000-0000-0000-000000000004', 'wallet_topup', 'credit', 'completed', 85000, 'Seed worker wallet funding', 'SEED-TOPUP-ADAEZE')
ON CONFLICT DO NOTHING;
