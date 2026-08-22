create table contact_messages (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new'
    check (status in ('new', 'read', 'replied', 'archived')),
  created_at timestamptz default now()
);

alter table contact_messages enable row level security;

-- Public can insert (anyone submitting the contact form is not authenticated)
create policy "public can insert contact messages" on contact_messages
  for insert with check (true);

-- Only authenticated admin can read/update/delete
create policy "authenticated full access contact messages" on contact_messages
  for select using (auth.role() = 'authenticated');

create policy "authenticated update contact messages" on contact_messages
  for update using (auth.role() = 'authenticated');

create policy "authenticated delete contact messages" on contact_messages
  for delete using (auth.role() = 'authenticated');
