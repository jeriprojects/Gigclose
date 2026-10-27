-- Import anonymized jobs from "List of KRA Clients 2.docx"
-- Company names are intentionally omitted.
-- For salary ranges, budget_ngn stores the lower bound and the original range is preserved in description.
-- Rows that were clearly marked as closed or that lacked enough usable job/location/amount data were excluded.

INSERT INTO public.jobs (
  client_id,
  title,
  description,
  category,
  budget_ngn,
  location_label,
  latitude,
  longitude,
  urgent
)
VALUES
  ('00000000-0000-0000-0000-000000000000', 'Bar Man', 'Imported from anonymized KRA list. Salary: 45000. Accommodation available.', 'other', 45000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Bar Lady', 'Imported from anonymized KRA list. Salary range: 50000-60000. Accommodation available.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary range: 100000-250000. No accommodation.', 'other', 100000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Waitress', 'Imported from anonymized KRA list. Salary range: 50000-60000. Accommodation available.', 'other', 50000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Receptionist', 'Imported from anonymized KRA list. Salary range: 60000-100000. No accommodation.', 'other', 60000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Supervisor', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Abijo', 6.467400, 3.615400, false),

  ('00000000-0000-0000-0000-000000000000', 'Sales or Marketer with Driving Experience', 'Imported from anonymized KRA list. Salary: 50000. Staff bus noted in source.', 'other', 50000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Manager', 'Imported from anonymized KRA list. Salary: 70000. Accommodation available.', 'other', 70000, 'Lakowe', 6.465500, 3.698000, false),

  ('00000000-0000-0000-0000-000000000000', 'Production Supervisor', 'Imported from anonymized KRA list. Salary: 80000.', 'other', 80000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Industrial Electrician', 'Imported from anonymized KRA list. Salary: 50000.', 'electrical', 50000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Storekeeper', 'Imported from anonymized KRA list. Salary range: 80000-100000.', 'other', 80000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Security Guard', 'Imported from anonymized KRA list. Salary range: 70000-80000. Accommodation available.', 'other', 70000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Painter', 'Imported from anonymized KRA list. Salary: 60000. Accommodation available.', 'handyman', 60000, 'Abijo', 6.467400, 3.615400, false),

  ('00000000-0000-0000-0000-000000000000', 'Accountant', 'Imported from anonymized KRA list. Salary range: 100000-120000. No accommodation.', 'other', 100000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary range: 90000-100000. No accommodation.', 'other', 90000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Secretary', 'Imported from anonymized KRA list. Salary: 80000. No accommodation.', 'other', 80000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary: 60000. No accommodation.', 'other', 60000, 'Abijo', 6.467400, 3.615400, false),

  ('00000000-0000-0000-0000-000000000000', 'Sales Representative', 'Imported from anonymized KRA list. Salary: 60000.', 'other', 60000, 'Lekki Phase 1', 6.447400, 3.473200, false),
  ('00000000-0000-0000-0000-000000000000', 'Farm Assistant', 'Imported from anonymized KRA list. Salary: 40000.', 'other', 40000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary: 60000.', 'delivery', 60000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Auxiliary Nurse', 'Imported from anonymized KRA list. Salary: 50000.', 'other', 50000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Community Health Worker', 'Imported from anonymized KRA list. Salary: 60000.', 'other', 60000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),

  ('00000000-0000-0000-0000-000000000000', 'Receptionist and Housekeeper', 'Imported from anonymized KRA list. Salary range: 50000-60000. Housekeeper accommodation noted in source.', 'cleaning', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Community Health Extension Worker', 'Imported from anonymized KRA list. Salary range: 50000-60000. No accommodation.', 'other', 50000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),

  ('00000000-0000-0000-0000-000000000000', 'Waitress', 'Imported from anonymized KRA list. Salary range: 50000-60000. No accommodation.', 'other', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Waiter', 'Imported from anonymized KRA list. Salary range: 50000-60000. No accommodation.', 'other', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Mixologist', 'Imported from anonymized KRA list. Salary range: 70000-80000. No accommodation.', 'other', 70000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Store Keeper', 'Imported from anonymized KRA list. Salary range: 70000-80000. No accommodation.', 'other', 70000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Customer Care Representative', 'Imported from anonymized KRA list. Salary range: 80000-100000. No accommodation.', 'other', 80000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Logistics Dispatch Officer', 'Imported from anonymized KRA list. Salary range: 80000-100000. No accommodation.', 'delivery', 80000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'Store Keeper', 'Imported from anonymized KRA list. Salary range: 50000-55000. No accommodation.', 'other', 50000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Office Assistant', 'Imported from anonymized KRA list. Salary range: 50000-60000. No accommodation.', 'other', 50000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary range: 70000-80000. No accommodation.', 'delivery', 70000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'Accounting Officer', 'Imported from anonymized KRA list. Salary range: 200000-250000. No accommodation.', 'other', 200000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Equipment Inspection Coordinator', 'Imported from anonymized KRA list. Salary range: 200000-250000. No accommodation.', 'other', 200000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'General Manager', 'Imported from anonymized KRA list. Salary range: 50000-60000.', 'other', 50000, 'Epe', 6.584000, 3.983000, false),
  ('00000000-0000-0000-0000-000000000000', 'Petrol Attendant', 'Imported from anonymized KRA list. Salary range: 50000-60000.', 'other', 50000, 'Epe', 6.584000, 3.983000, false),
  ('00000000-0000-0000-0000-000000000000', 'Customer Care Representative', 'Imported from anonymized KRA list. Salary range: 70000-80000. No accommodation.', 'other', 70000, 'Lakowe', 6.465500, 3.698000, false),

  ('00000000-0000-0000-0000-000000000000', 'Personal Assistant', 'Imported from anonymized KRA list. Salary range: 60000-70000. No accommodation.', 'other', 60000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Social Media Staff', 'Imported from anonymized KRA list. Salary range: 60000-70000. No accommodation.', 'creative', 60000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'Front Desk Executive', 'Imported from anonymized KRA list. Salary range: 100000-120000. No accommodation.', 'other', 100000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary: 70000. No accommodation.', 'other', 70000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Chef', 'Imported from anonymized KRA list. Salary: 100000. Accommodation noted in source.', 'other', 100000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Waitress', 'Imported from anonymized KRA list. Salary: 80000. Accommodation noted in source.', 'other', 80000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'POS Operator', 'Imported from anonymized KRA list. Salary: 80000. Accommodation noted in source.', 'other', 80000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Bookkeeping Staff', 'Imported from anonymized KRA list. Salary: 200000. Accommodation noted in source.', 'other', 200000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Dish Washer', 'Imported from anonymized KRA list. Salary: 60000. Accommodation noted in source.', 'cleaning', 60000, 'Abijo', 6.467400, 3.615400, false),

  ('00000000-0000-0000-0000-000000000000', 'Househelp', 'Imported from anonymized KRA list. Salary: 50000. No accommodation, coming and going.', 'cleaning', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Bar Man', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'other', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Admin or Sales Officer', 'Imported from anonymized KRA list. Salary range: 70000-90000. No accommodation.', 'other', 70000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Secretary', 'Imported from anonymized KRA list. Salary range: 50000-70000 depending on experience. No accommodation.', 'other', 50000, 'Badore', 6.437000, 3.552000, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary: 130000. No accommodation.', 'delivery', 130000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'House Help', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'cleaning', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Lash Technician', 'Imported from anonymized KRA list. Salary: 150000. Accommodation available.', 'creative', 150000, 'Orchid Road', 6.449900, 3.542700, false),

  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary: 150000. Accommodation available.', 'delivery', 150000, 'Surulere', 6.496900, 3.359000, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary: 150000. Accommodation available.', 'other', 150000, 'Surulere', 6.496900, 3.359000, false),
  ('00000000-0000-0000-0000-000000000000', 'Security Guard', 'Imported from anonymized KRA list. Salary: 90000. Station accommodation may be available.', 'other', 90000, 'Surulere', 6.496900, 3.359000, false),

  ('00000000-0000-0000-0000-000000000000', 'Restaurant Supervisor', 'Imported from anonymized KRA list. Salary: 150000. Accommodation available.', 'other', 150000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Kitchen Supervisor', 'Imported from anonymized KRA list. Salary: 120000. Accommodation available.', 'other', 120000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Kitchen Assistant', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'other', 50000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Baker', 'Imported from anonymized KRA list. Salary: 70000. Accommodation available.', 'other', 70000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Cook', 'Imported from anonymized KRA list. Salary: 80000. Accommodation available.', 'other', 80000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Waitstaff', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'other', 50000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Cashier', 'Imported from anonymized KRA list. Salary: 70000. Accommodation available.', 'other', 70000, 'Ikoyi', 6.450000, 3.435000, false),

  ('00000000-0000-0000-0000-000000000000', 'Spa Therapist', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'Hairstylist', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'House Help', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'cleaning', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer or Salesperson', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Cook', 'Imported from anonymized KRA list. Salary: 70000. Accommodation available.', 'other', 70000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Kitchen Assistant', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Front Desk or Online Sales Officer', 'Imported from anonymized KRA list. Salary: 120000. No accommodation.', 'other', 120000, 'Abijo', 6.467400, 3.615400, false),
  ('00000000-0000-0000-0000-000000000000', 'Admin Support Staff', 'Imported from anonymized KRA list. Salary: 70000. No accommodation.', 'other', 70000, 'Badore', 6.437000, 3.552000, false),

  ('00000000-0000-0000-0000-000000000000', 'Sales Representative', 'Imported from anonymized KRA list. Salary range: 80000-150000. No accommodation. Male only per source.', 'other', 80000, 'Gbagada', 6.555000, 3.385000, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary range: 120000-150000. No accommodation.', 'delivery', 120000, 'Gbagada', 6.555000, 3.385000, false),

  ('00000000-0000-0000-0000-000000000000', 'Sales or Marketing Manager', 'Imported from anonymized KRA list. Salary range: 100000-150000. No accommodation.', 'other', 100000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Logistics Manager', 'Imported from anonymized KRA list. Salary: 100000. No accommodation.', 'delivery', 100000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Personal Assistant', 'Imported from anonymized KRA list. Salary: 100000. No accommodation.', 'other', 100000, 'Lakowe', 6.465500, 3.698000, false),

  ('00000000-0000-0000-0000-000000000000', 'Petrol Attendant', 'Imported from anonymized KRA list. Salary range: 50000-60000. No accommodation.', 'other', 50000, 'Epe', 6.584000, 3.983000, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary: 50000 and above. Awoyaya location.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Front Desk Officer', 'Imported from anonymized KRA list. Salary: 50000 and above. Awoyaya location.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Security Guard', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Waitress', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available for females.', 'other', 50000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Kitchen Assistant', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available for females.', 'other', 50000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Griller or Shawarma Cook', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available for females.', 'other', 50000, 'Lakowe', 6.465500, 3.698000, false),

  ('00000000-0000-0000-0000-000000000000', 'Receptionist', 'Imported from anonymized KRA list. Salary: 50000. Accommodation not available for receptionist.', 'other', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Stylist', 'Imported from anonymized KRA list. Salary: 90000. Accommodation available.', 'other', 90000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Braids Stylist', 'Imported from anonymized KRA list. Salary: 80000. Accommodation available.', 'other', 80000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Massage Therapist', 'Imported from anonymized KRA list. Salary: 100000. Accommodation available.', 'other', 100000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Manager', 'Imported from anonymized KRA list. Salary: 70000. Accommodation available.', 'other', 70000, 'Thomas Estate', 6.475500, 3.552200, false),
  ('00000000-0000-0000-0000-000000000000', 'Cook', 'Imported from anonymized KRA list. Salary: 60000. Accommodation available.', 'other', 60000, 'Thomas Estate', 6.475500, 3.552200, false),

  ('00000000-0000-0000-0000-000000000000', 'Cashier', 'Imported from anonymized KRA list. Salary: 55000. Accommodation available.', 'other', 55000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Loader', 'Imported from anonymized KRA list. Salary: 55000. Accommodation available.', 'moving', 55000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary: 65000. Accommodation available.', 'delivery', 65000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'Spa Therapist', 'Imported from anonymized KRA list. Salary range: 100000-170000. Accommodation available.', 'other', 100000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Nail Technician', 'Imported from anonymized KRA list. Salary range: 100000-120000. Accommodation available.', 'other', 100000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Braider', 'Imported from anonymized KRA list. Salary range: 60000-80000. Accommodation available.', 'other', 60000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Lash Technician or Microblading Specialist', 'Imported from anonymized KRA list. Salary range: 120000-150000. Accommodation available.', 'creative', 120000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Pedicure Staff', 'Imported from anonymized KRA list. Salary range: 50000-70000. Accommodation available.', 'other', 50000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'POS Attendant', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'House Help', 'Imported from anonymized KRA list. Salary: 50000. Accommodation is available and compulsory.', 'cleaning', 50000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Cleaner', 'Imported from anonymized KRA list. Salary: 50000. Accommodation if necessary.', 'cleaning', 50000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary range: 60000-70000. Accommodation if necessary.', 'other', 60000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary range: 60000-70000. Accommodation if necessary.', 'delivery', 60000, 'Awoyaya', 6.469800, 3.585200, false),
  ('00000000-0000-0000-0000-000000000000', 'Househelp', 'Imported from anonymized KRA list. Salary: 50000. Detailed schedule notes were present in source.', 'cleaning', 50000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Washer', 'Imported from anonymized KRA list. Salary range: 60000-90000. Accommodation for washer.', 'cleaning', 60000, 'Lekki', 6.447400, 3.473200, false),
  ('00000000-0000-0000-0000-000000000000', 'Receptionist', 'Imported from anonymized KRA list. Salary range: 60000-90000.', 'other', 60000, 'Lekki', 6.447400, 3.473200, false),
  ('00000000-0000-0000-0000-000000000000', 'Live Out Housekeeper', 'Imported from anonymized KRA list. Salary range: 70000-100000.', 'cleaning', 70000, 'Lekki', 6.447400, 3.473200, false),
  ('00000000-0000-0000-0000-000000000000', 'Private Chef', 'Imported from anonymized KRA list. Salary range: 150000-200000. Accommodation for chef only.', 'other', 150000, 'Lekki', 6.447400, 3.473200, false),
  ('00000000-0000-0000-0000-000000000000', 'House Help', 'Imported from anonymized KRA list. Salary: 50000. Female only. Accommodation available.', 'cleaning', 50000, 'Badore', 6.437000, 3.552000, false),

  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary range: 80000-90000. No accommodation.', 'delivery', 80000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Cook', 'Imported from anonymized KRA list. Salary: 70000. No accommodation.', 'other', 70000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'House Help', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'cleaning', 50000, 'Sangotedo', 6.469800, 3.535900, false),
  ('00000000-0000-0000-0000-000000000000', 'Sales Representative', 'Imported from anonymized KRA list. Salary: 60000. No accommodation.', 'other', 60000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Waitress', 'Imported from anonymized KRA list. Salary: 55000. Accommodation available.', 'other', 55000, 'Festac', 6.469000, 3.282000, false),
  ('00000000-0000-0000-0000-000000000000', 'Bar Man', 'Imported from anonymized KRA list. Salary: 60000. Accommodation available.', 'other', 60000, 'Festac', 6.469000, 3.282000, false),
  ('00000000-0000-0000-0000-000000000000', 'Waiter', 'Imported from anonymized KRA list. Salary: 50000. Accommodation available.', 'other', 50000, 'Festac', 6.469000, 3.282000, false),
  ('00000000-0000-0000-0000-000000000000', 'Supervisor', 'Imported from anonymized KRA list. Salary range: 70000-80000. Accommodation available.', 'other', 70000, 'Festac', 6.469000, 3.282000, false),

  ('00000000-0000-0000-0000-000000000000', 'Driver', 'Imported from anonymized KRA list. Salary: 100000. No accommodation.', 'delivery', 100000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Front Desk Staff', 'Imported from anonymized KRA list. Salary: 50000. No accommodation.', 'other', 50000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Sales Girl and House Maid', 'Imported from anonymized KRA list. Salary range: 50000-60000. Accommodation available for sales girl.', 'other', 50000, 'Awoyaya', 6.469800, 3.585200, false),

  ('00000000-0000-0000-0000-000000000000', 'Logistics or Delivery Representative', 'Imported from anonymized KRA list. Salary range: 90000-100000.', 'delivery', 90000, 'Ikota', 6.451000, 3.535000, false),
  ('00000000-0000-0000-0000-000000000000', 'Packaging and Sales Representative', 'Imported from anonymized KRA list. Salary: 80000.', 'other', 80000, 'Ikota', 6.451000, 3.535000, false),
  ('00000000-0000-0000-0000-000000000000', 'Professional Griller', 'Imported from anonymized KRA list. Salary range: 90000-110000.', 'other', 90000, 'Ikota', 6.451000, 3.535000, false),

  ('00000000-0000-0000-0000-000000000000', 'General Manager', 'Imported from anonymized KRA list. Salary range: 400000-1200000. No accommodation.', 'other', 400000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'Operations Manager', 'Imported from anonymized KRA list. Salary range: 200000-500000. No accommodation.', 'other', 200000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'Housekeeping Manager', 'Imported from anonymized KRA list. Salary range: 200000-300000. No accommodation.', 'other', 200000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'Auditor or Accountant', 'Imported from anonymized KRA list. Salary range: 150000-300000. No accommodation.', 'other', 150000, 'Ikeja', 6.601800, 3.351500, false),
  ('00000000-0000-0000-0000-000000000000', 'Marketer', 'Imported from anonymized KRA list. Salary range: 150000-500000. No accommodation.', 'other', 150000, 'Ikeja', 6.601800, 3.351500, false),

  ('00000000-0000-0000-0000-000000000000', 'Juice Production Staff', 'Imported from anonymized KRA list. Salary range: 50000-70000. No accommodation.', 'other', 50000, 'Ikota', 6.451000, 3.535000, false),
  ('00000000-0000-0000-0000-000000000000', 'Secretary', 'Imported from anonymized KRA list. Salary: 80000. No accommodation.', 'other', 80000, 'Ikota', 6.451000, 3.535000, false),
  ('00000000-0000-0000-0000-000000000000', 'Front Desk Staff', 'Imported from anonymized KRA list. Salary: 80000. No accommodation.', 'other', 80000, 'Ikota', 6.451000, 3.535000, false),

  ('00000000-0000-0000-0000-000000000000', 'Account or Financial Secretary', 'Imported from anonymized KRA list. Salary range: 100000-200000. No accommodation.', 'other', 100000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Site Supervisor', 'Imported from anonymized KRA list. Salary range: 100000-200000. No accommodation.', 'handyman', 100000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),
  ('00000000-0000-0000-0000-000000000000', 'Graphics Designer or Social Media Manager', 'Imported from anonymized KRA list. Salary range: 100000-200000. No accommodation.', 'creative', 100000, 'Abraham Adesanya Estate', 6.469000, 3.542000, false),

  ('00000000-0000-0000-0000-000000000000', 'Pastry Chef', 'Imported from anonymized KRA list. Salary range: 60000-100000. No accommodation.', 'other', 60000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Dispatch Rider', 'Imported from anonymized KRA list. Salary range: 80000-100000. Must have bike license according to source.', 'delivery', 80000, 'Sangotedo', 6.469800, 3.535900, false),

  ('00000000-0000-0000-0000-000000000000', 'Customer Care Service Staff', 'Imported from anonymized KRA list. Salary range: 80000-100000. No accommodation.', 'other', 80000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Computer Operator', 'Imported from anonymized KRA list. Salary: 100000. No accommodation.', 'other', 100000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Accountant', 'Imported from anonymized KRA list. Salary range: 80000-100000. No accommodation.', 'other', 80000, 'Ajah', 6.465000, 3.525000, false),
  ('00000000-0000-0000-0000-000000000000', 'Sales Personnel', 'Imported from anonymized KRA list. Salary range: 80000-100000. No accommodation.', 'other', 80000, 'Ajah', 6.465000, 3.525000, false),

  ('00000000-0000-0000-0000-000000000000', 'Client Relations Officer', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'other', 100000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Videographer', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'creative', 100000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Admin Manager', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'other', 100000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Human Resources Officer', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'other', 100000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Social Media Manager', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'creative', 100000, 'Ikoyi', 6.450000, 3.435000, false),
  ('00000000-0000-0000-0000-000000000000', 'Customer Care Representative', 'Imported from anonymized KRA list. Salary range: 100000-200000.', 'other', 100000, 'Ikoyi', 6.450000, 3.435000, false),

  ('00000000-0000-0000-0000-000000000000', 'Hairstylist', 'Imported from anonymized KRA list. Salary range: 80000-100000.', 'other', 80000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Barber', 'Imported from anonymized KRA list. Salary range: 60000-70000.', 'other', 60000, 'Lakowe', 6.465500, 3.698000, false),
  ('00000000-0000-0000-0000-000000000000', 'Nail Technician', 'Imported from anonymized KRA list. Salary range: 80000-100000.', 'other', 80000, 'Lakowe', 6.465500, 3.698000, false)
;
