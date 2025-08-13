-- Prevent duplicate vendor offers per need
-- This ensures that the same vendor cannot submit multiple offers for the same need

create unique index if not exists uniq_offers_need_vendor 
on public.offers(need_id, lower(vendor_name));

-- Add comment for documentation
comment on index uniq_offers_need_vendor is 'Prevents duplicate vendor offers per need (case-insensitive vendor name)';
