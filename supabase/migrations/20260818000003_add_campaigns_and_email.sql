create table campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text not null default 'all', -- 'all' for now; expand later if customer accounts are added
  message_template text, -- e.g. 'Abandoned Cart Flow', 'Custom' — free text for now
  subject text,
  message_content text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled', 'sent', 'failed', 'cancelled')),
  sent_at timestamptz,
  created_at timestamptz default now()
);

alter table campaigns enable row level security;

create policy "authenticated full access campaigns" on campaigns
  for all using (auth.role() = 'authenticated');

alter table orders add column if not exists email text;
