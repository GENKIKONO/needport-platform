-- Add recruitment_closed flag to needs table
-- Controls whether public users can submit entries

alter table public.needs add column if not exists recruitment_closed boolean not null default false;

-- Update the entries INSERT policy to also require recruitment_closed = false
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

-- Add comment for documentation
comment on column public.needs.recruitment_closed is 'Whether public entry submission is closed for this need';
