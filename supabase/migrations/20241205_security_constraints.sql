-- Security hardening: Add length and value constraints
-- Prevents invalid data at the database level

-- Offers table constraints
alter table public.offers add constraint if not exists check_vendor_name_length 
  check (char_length(vendor_name) between 1 and 120);

alter table public.offers add constraint if not exists check_amount_positive 
  check (amount > 0);

-- Needs table constraints
alter table public.needs add constraint if not exists check_title_not_null_length 
  check (title is not null and char_length(title) between 1 and 120);

-- Entries table constraints (from Prompt 9)
alter table public.entries add constraint if not exists check_name_length 
  check (char_length(name) between 1 and 120);

alter table public.entries add constraint if not exists check_email_length 
  check (char_length(email) between 5 and 200);

alter table public.entries add constraint if not exists check_note_length 
  check (note is null or char_length(note) <= 500);

-- Add comments for documentation
comment on constraint check_vendor_name_length on public.offers is 'Vendor name must be 1-120 characters';
comment on constraint check_amount_positive on public.offers is 'Amount must be positive';
comment on constraint check_title_not_null_length on public.needs is 'Title must be 1-120 characters';
comment on constraint check_name_length on public.entries is 'Name must be 1-120 characters';
comment on constraint check_email_length on public.entries is 'Email must be 5-200 characters';
comment on constraint check_note_length on public.entries is 'Note must be 500 characters or less';
