-- Add notify_email column to needs table
-- Allows per-need notification email addresses

alter table public.needs add column if not exists notify_email text;

-- Add comment for documentation
comment on column public.needs.notify_email is 'Optional notification email for this specific need';
