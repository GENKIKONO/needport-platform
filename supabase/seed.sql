-- Development seed data
-- Run this after database reset for quick QA setup

-- Insert test needs
INSERT INTO public.needs (id, title, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'テスト募集 - 未採用', NOW() - INTERVAL '2 days'),
  ('550e8400-e29b-41d4-a716-446655440002', 'テスト募集 - 採用済み', NOW() - INTERVAL '1 day');

-- Insert offers for first need (not adopted)
INSERT INTO public.offers (id, need_id, vendor_name, amount, created_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'A社', 500000, NOW() - INTERVAL '1 day'),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'B社', 450000, NOW() - INTERVAL '12 hours'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'C社', 600000, NOW() - INTERVAL '6 hours');

-- Insert offers for second need (will be adopted)
INSERT INTO public.offers (id, need_id, vendor_name, amount, created_at) VALUES
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002', 'D社', 300000, NOW() - INTERVAL '12 hours'),
  ('660e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440002', 'E社', 350000, NOW() - INTERVAL '6 hours');

-- Adopt the first offer for the second need
UPDATE public.needs 
SET adopted_offer_id = '660e8400-e29b-41d4-a716-446655440004',
    min_people = 5,
    deadline = (NOW() + INTERVAL '7 days')::date
WHERE id = '550e8400-e29b-41d4-a716-446655440002';

-- Insert some test entries
INSERT INTO public.entries (id, need_id, name, email, count, note, created_at) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '田中太郎', 'tanaka@example.com', 2, 'よろしくお願いします', NOW() - INTERVAL '2 hours'),
  ('770e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', '佐藤花子', 'sato@example.com', 1, NULL, NOW() - INTERVAL '1 hour');

-- Insert adoption logs
INSERT INTO public.adoption_logs (need_id, offer_id, action, created_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', 'ADOPT', NOW() - INTERVAL '6 hours');

-- Insert some audit logs
INSERT INTO public.admin_audit_logs (action, need_id, offer_id, payload, created_at) VALUES
  ('offer.add', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', '{"vendorName": "A社", "amount": 500000}', NOW() - INTERVAL '1 day'),
  ('offer.add', '550e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440002', '{"vendorName": "B社", "amount": 450000}', NOW() - INTERVAL '12 hours'),
  ('offer.adopt', '550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440004', '{"minPeople": 5, "deadline": "2024-12-15"}', NOW() - INTERVAL '6 hours');
