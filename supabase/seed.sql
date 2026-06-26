insert into public.pricing_settings (hourly_rate, travel_fee, platform_commission_percent)
values (30, 5, 15);

insert into public.users (id, role, email) values
('00000000-0000-0000-0000-000000000101', 'customer', 'anna@example.com'),
('00000000-0000-0000-0000-000000000102', 'customer', 'martin@example.com'),
('00000000-0000-0000-0000-000000000103', 'customer', 'irina@example.com'),
('00000000-0000-0000-0000-000000000104', 'customer', 'karl@example.com'),
('00000000-0000-0000-0000-000000000105', 'customer', 'liis@example.com'),
('00000000-0000-0000-0000-000000000201', 'handyman', 'mihkel@handygo.test'),
('00000000-0000-0000-0000-000000000202', 'handyman', 'sergei@handygo.test'),
('00000000-0000-0000-0000-000000000203', 'handyman', 'kaur@handygo.test'),
('00000000-0000-0000-0000-000000000204', 'handyman', 'pavel@handygo.test'),
('00000000-0000-0000-0000-000000000205', 'handyman', 'toomas@handygo.test');

insert into public.customer_profiles (id, user_id, name, phone, email) values
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'Anna Saar', '+372 5550 1001', 'anna@example.com'),
('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000102', 'Martin Kask', '+372 5550 1002', 'martin@example.com'),
('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000103', 'Irina Petrova', '+372 5550 1003', 'irina@example.com'),
('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000104', 'Karl Tamm', '+372 5550 1004', 'karl@example.com'),
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000105', 'Liis Rebane', '+372 5550 1005', 'liis@example.com');

insert into public.handyman_profiles (id, user_id, full_name, phone, email, city_district, home_lat, home_lng, working_radius_km, skills, short_bio, profile_photo_url, rating, completed_jobs, availability_status, approved, blocked) values
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Mihkel Aas', '+372 5600 2001', 'mihkel@handygo.test', 'Kesklinn', 59.437, 24.7536, 8, array['Furniture assembly','Wall mounting','Small repairs']::public.task_category[], 'Careful installer for shelves, wardrobes, curtain rails, and quick fixes.', null, 4.9, 128, 'available', true, false),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000202', 'Sergei Ivanov', '+372 5600 2002', 'sergei@handygo.test', 'Lasnamae', 59.4388, 24.8456, 7, array['Plumbing','Small repairs','Moving help']::public.task_category[], 'Plumbing repairs, appliance hookups, and moving assistance around east Tallinn.', null, 4.7, 92, 'available', true, false),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000203', 'Kaur Lepp', '+372 5600 2003', 'kaur@handygo.test', 'Mustamae', 59.4079, 24.6807, 6, array['Electrical','Computer help','Wall mounting']::public.task_category[], 'Light electrical work, routers, smart home setup, and TV mounting.', null, 4.8, 76, 'available', true, false),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000204', 'Pavel Sokolov', '+372 5600 2004', 'pavel@handygo.test', 'Pohja-Tallinn', 59.4503, 24.7062, 5, array['Garden work','Moving help','Small repairs']::public.task_category[], 'Outdoor jobs, storage moves, and practical repairs for older apartments.', null, 4.6, 54, 'busy', true, false),
('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000205', 'Toomas Vaher', '+372 5600 2005', 'toomas@handygo.test', 'Nomme', 59.3876, 24.6869, 9, array['Furniture assembly','Garden work','Other']::public.task_category[], 'Flat-pack assembly, garden prep, and odd jobs in south-west Tallinn.', null, 4.5, 31, 'available', false, false);

insert into public.tasks (id, customer_id, customer_name, phone, email, address, lat, lng, category, description, estimated_duration_hours, preferred_time, preferred_datetime, status, assigned_handyman_id, created_at) values
('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Anna Saar', '+372 5550 1001', 'anna@example.com', 'Tartu mnt 18, Kesklinn, Tallinn', 59.4321, 24.7621, 'Furniture assembly', 'Assemble a new wardrobe and attach it to the wall.', 2, 'Today', null, 'searching', null, '2026-06-20T09:00:00Z'),
('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Martin Kask', '+372 5550 1002', 'martin@example.com', 'Akadeemia tee 20, Mustamae, Tallinn', 59.3964, 24.6712, 'Computer help', 'Set up home Wi-Fi mesh and connect a printer.', 1, 'ASAP', null, 'assigned', '20000000-0000-0000-0000-000000000003', '2026-06-20T10:20:00Z'),
('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'Irina Petrova', '+372 5550 1003', 'irina@example.com', 'Paepargi 35, Lasnamae, Tallinn', 59.4375, 24.8178, 'Plumbing', 'Kitchen sink is leaking under the cabinet.', 1, 'ASAP', null, 'searching', null, '2026-06-21T07:40:00Z'),
('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Karl Tamm', '+372 5550 1004', 'karl@example.com', 'Telliskivi 60a, Pohja-Tallinn, Tallinn', 59.4398, 24.7284, 'Moving help', 'Carry a sofa from van to third floor apartment.', 1, 'Scheduled', '2026-06-24T16:00:00Z', 'completed', '20000000-0000-0000-0000-000000000004', '2026-06-18T12:15:00Z'),
('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Liis Rebane', '+372 5550 1005', 'liis@example.com', 'Vabaduse pst 88, Nomme, Tallinn', 59.3886, 24.6962, 'Garden work', 'Trim hedge and clear garden waste bags.', 4, 'Today', null, 'cancelled', null, '2026-06-19T14:45:00Z');
