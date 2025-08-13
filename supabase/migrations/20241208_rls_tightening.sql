-- Tighten RLS policies for production security
-- Revoke unnecessary permissions and ensure minimal access

-- Offers table: revoke anon write permissions, allow read to all
revoke insert, update, delete on public.offers from anon;
grant select on public.offers to anon;

-- Ensure offers read policy exists
drop policy if exists "read offers" on public.offers;
create policy "read offers" on public.offers
  for select using (true);

-- Remove any existing write policies for offers (admin uses service-role)
drop policy if exists "insert offers" on public.offers;
drop policy if exists "update offers" on public.offers;
drop policy if exists "delete offers" on public.offers;

-- Needs table: ensure read access, no write policies
grant select on public.needs to anon;

-- Ensure needs read policy exists
drop policy if exists "read needs" on public.needs;
create policy "read needs" on public.needs
  for select using (true);

-- Remove any existing write policies for needs (admin uses service-role)
drop policy if exists "insert needs" on public.needs;
drop policy if exists "update needs" on public.needs;
drop policy if exists "delete needs" on public.needs;

-- Entries table: allow insert for public submissions, deny read/update/delete to anon
grant insert on public.entries to anon;
revoke select, update, delete on public.entries from anon;

-- Ensure entries insert policy exists (from Prompt 9)
drop policy if exists "Allow insert entries for adopted needs" on public.entries;
create policy "Allow insert entries for adopted needs" on public.entries
  for insert to anon
  with check (
    exists(
      select 1 from public.needs n
      where n.id = entries.need_id
        and n.adopted_offer_id is not null
        and (n.deadline is null or n.deadline >= now())
        and n.recruitment_closed = false
    )
  );

-- Ensure entries block policy exists
drop policy if exists "Block all operations for anon" on public.entries;
create policy "Block all operations for anon" on public.entries
  for all to anon
  using (false)
  with check (false);

-- Entry notifications: no anon access (admin only)
revoke all on public.entry_notifications from anon;

-- Admin audit logs: no anon access (admin only)
revoke all on public.admin_audit_logs from anon;

-- Add comments for documentation
comment on policy "read offers" on public.offers is 'Allow public read access to offers';
comment on policy "read needs" on public.needs is 'Allow public read access to needs';
comment on policy "Allow insert entries for adopted needs" on public.entries is 'Allow public entry submission for adopted needs';
comment on policy "Block all operations for anon" on public.entries is 'Block all other operations for anonymous users';
