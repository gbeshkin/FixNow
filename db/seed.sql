insert into pricing_settings (id, hourly_rate, travel_fee, platform_commission_percent)
values (1, 30, 5, 15)
on conflict (id) do update set
  hourly_rate = excluded.hourly_rate,
  travel_fee = excluded.travel_fee,
  platform_commission_percent = excluded.platform_commission_percent,
  updated_at = now();

insert into users (id, role, email, label, profile_id) values
('user-cust-1', 'customer', 'anna@example.com', 'Anna Saar', 'cust-1'),
('user-cust-2', 'customer', 'martin@example.com', 'Martin Kask', 'cust-2'),
('user-cust-3', 'customer', 'irina@example.com', 'Irina Petrova', 'cust-3'),
('user-cust-4', 'customer', 'karl@example.com', 'Karl Tamm', 'cust-4'),
('user-cust-5', 'customer', 'liis@example.com', 'Liis Rebane', 'cust-5'),
('user-hm-1', 'handyman', 'mihkel@handygo.test', 'Mihkel Aas', 'hm-1'),
('user-hm-2', 'handyman', 'sergei@handygo.test', 'Sergei Ivanov', 'hm-2'),
('user-hm-3', 'handyman', 'kaur@handygo.test', 'Kaur Lepp', 'hm-3'),
('user-hm-4', 'handyman', 'pavel@handygo.test', 'Pavel Sokolov', 'hm-4'),
('user-hm-5', 'handyman', 'toomas@handygo.test', 'Toomas Vaher', 'hm-5'),
('user-admin-1', 'admin', 'admin@handygo.test', 'Admin', null)
on conflict (id) do update set
  role = excluded.role,
  email = excluded.email,
  label = excluded.label,
  profile_id = excluded.profile_id;

insert into customer_profiles (id, user_id, name, phone, email) values
('cust-1', 'user-cust-1', 'Anna Saar', '+372 5550 1001', 'anna@example.com'),
('cust-2', 'user-cust-2', 'Martin Kask', '+372 5550 1002', 'martin@example.com'),
('cust-3', 'user-cust-3', 'Irina Petrova', '+372 5550 1003', 'irina@example.com'),
('cust-4', 'user-cust-4', 'Karl Tamm', '+372 5550 1004', 'karl@example.com'),
('cust-5', 'user-cust-5', 'Liis Rebane', '+372 5550 1005', 'liis@example.com')
on conflict (id) do update set
  user_id = excluded.user_id,
  name = excluded.name,
  phone = excluded.phone,
  email = excluded.email;

insert into handyman_profiles (
  id, user_id, full_name, phone, email, city_district, home_lat, home_lng,
  working_radius_km, skills, short_bio, profile_photo_url, rating,
  completed_jobs, availability_status, approved, blocked
) values
('hm-1', 'user-hm-1', 'Mihkel Aas', '+372 5600 2001', 'mihkel@handygo.test', 'Kesklinn', 59.437, 24.7536, 8, array['Furniture assembly','Wall mounting','Small repairs'], 'Careful installer for shelves, wardrobes, curtain rails, and quick fixes.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80', 4.9, 128, 'available', true, false),
('hm-2', 'user-hm-2', 'Sergei Ivanov', '+372 5600 2002', 'sergei@handygo.test', 'Lasnamae', 59.4388, 24.8456, 7, array['Plumbing','Small repairs','Moving help'], 'Plumbing repairs, appliance hookups, and moving assistance around east Tallinn.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80', 4.7, 92, 'available', true, false),
('hm-3', 'user-hm-3', 'Kaur Lepp', '+372 5600 2003', 'kaur@handygo.test', 'Mustamae', 59.4079, 24.6807, 6, array['Electrical','Computer help','Wall mounting'], 'Light electrical work, routers, smart home setup, and TV mounting.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80', 4.8, 76, 'available', true, false),
('hm-4', 'user-hm-4', 'Pavel Sokolov', '+372 5600 2004', 'pavel@handygo.test', 'Pohja-Tallinn', 59.4503, 24.7062, 5, array['Garden work','Moving help','Small repairs'], 'Outdoor jobs, storage moves, and practical repairs for older apartments.', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80', 4.6, 54, 'busy', true, false),
('hm-5', 'user-hm-5', 'Toomas Vaher', '+372 5600 2005', 'toomas@handygo.test', 'Nomme', 59.3876, 24.6869, 9, array['Furniture assembly','Garden work','Other'], 'Flat-pack assembly, garden prep, and odd jobs in south-west Tallinn.', 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?auto=format&fit=crop&w=300&q=80', 4.5, 31, 'available', false, false)
on conflict (id) do update set
  user_id = excluded.user_id,
  full_name = excluded.full_name,
  phone = excluded.phone,
  email = excluded.email,
  city_district = excluded.city_district,
  home_lat = excluded.home_lat,
  home_lng = excluded.home_lng,
  working_radius_km = excluded.working_radius_km,
  skills = excluded.skills,
  short_bio = excluded.short_bio,
  profile_photo_url = excluded.profile_photo_url,
  rating = excluded.rating,
  completed_jobs = excluded.completed_jobs,
  availability_status = excluded.availability_status,
  approved = excluded.approved,
  blocked = excluded.blocked;

insert into tasks (
  id, customer_id, customer_name, phone, email, address, lat, lng, category,
  description, photo_file_names, estimated_duration_hours, customer_offer,
  handyman_counter_offer, handyman_counter_reason, negotiation_status,
  preferred_time, preferred_datetime, status, assigned_handyman_id, created_at
) values
('task-1', 'cust-1', 'Anna Saar', '+372 5550 1001', 'anna@example.com', 'Tartu mnt 18, Kesklinn, Tallinn', 59.4321, 24.7621, 'Furniture assembly', 'Assemble a new wardrobe and attach it to the wall.', array['wardrobe.jpg'], 2, 70, null, null, 'customer_offer', 'Today', null, 'searching', null, '2026-06-20T09:00:00.000Z'),
('task-2', 'cust-2', 'Martin Kask', '+372 5550 1002', 'martin@example.com', 'Akadeemia tee 20, Mustamae, Tallinn', 59.3964, 24.6712, 'Computer help', 'Set up home Wi-Fi mesh and connect a printer.', array[]::text[], 1, 40, 45, 'Printer and mesh setup may take longer than one hour.', 'handyman_counter', 'ASAP', null, 'assigned', 'hm-3', '2026-06-20T10:20:00.000Z'),
('task-3', 'cust-3', 'Irina Petrova', '+372 5550 1003', 'irina@example.com', 'Paepargi 35, Lasnamae, Tallinn', 59.4375, 24.8178, 'Plumbing', 'Kitchen sink is leaking under the cabinet.', array['sink-leak.jpg'], 1, 55, null, null, 'customer_offer', 'ASAP', null, 'searching', null, '2026-06-21T07:40:00.000Z'),
('task-4', 'cust-4', 'Karl Tamm', '+372 5550 1004', 'karl@example.com', 'Telliskivi 60a, Pohja-Tallinn, Tallinn', 59.4398, 24.7284, 'Moving help', 'Carry a sofa from van to third floor apartment.', array[]::text[], 1, 35, null, null, 'accepted', 'Scheduled', '2026-06-24T16:00', 'completed', 'hm-4', '2026-06-18T12:15:00.000Z'),
('task-5', 'cust-5', 'Liis Rebane', '+372 5550 1005', 'liis@example.com', 'Vabaduse pst 88, Nomme, Tallinn', 59.3886, 24.6962, 'Garden work', 'Trim hedge and clear garden waste bags.', array['hedge.jpg'], 4, 120, null, null, 'declined', 'Today', null, 'cancelled', null, '2026-06-19T14:45:00.000Z')
on conflict (id) do update set
  customer_id = excluded.customer_id,
  customer_name = excluded.customer_name,
  phone = excluded.phone,
  email = excluded.email,
  address = excluded.address,
  lat = excluded.lat,
  lng = excluded.lng,
  category = excluded.category,
  description = excluded.description,
  photo_file_names = excluded.photo_file_names,
  estimated_duration_hours = excluded.estimated_duration_hours,
  customer_offer = excluded.customer_offer,
  handyman_counter_offer = excluded.handyman_counter_offer,
  handyman_counter_reason = excluded.handyman_counter_reason,
  negotiation_status = excluded.negotiation_status,
  preferred_time = excluded.preferred_time,
  preferred_datetime = excluded.preferred_datetime,
  status = excluded.status,
  assigned_handyman_id = excluded.assigned_handyman_id,
  created_at = excluded.created_at;

insert into task_status_history (id, task_id, status, note, created_at) values
('hist-1', 'task-1', 'searching', 'Task created', '2026-06-20T09:00:00.000Z'),
('hist-2', 'task-2', 'assigned', 'Assigned to Kaur Lepp', '2026-06-20T10:24:00.000Z'),
('hist-3', 'task-4', 'completed', 'Task completed', '2026-06-18T18:15:00.000Z'),
('hist-4', 'task-5', 'cancelled', 'Customer cancelled', '2026-06-19T15:00:00.000Z')
on conflict (id) do update set
  task_id = excluded.task_id,
  status = excluded.status,
  note = excluded.note,
  created_at = excluded.created_at;
