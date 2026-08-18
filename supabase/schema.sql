-- ==========================================
-- Hanaz Official Supabase Schema
-- ==========================================

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null, -- e.g. 'Brightening', 'Hydration'
  description text,
  ingredients text,
  base_price numeric not null default 0,
  sale_price numeric not null default 0,
  discount_pct numeric default 0,
  cost_price numeric not null default 0, -- used for profit calc, admin-only visibility
  stock_quantity integer not null default 0,
  image_urls text[] default '{}',
  is_featured boolean default false,
  is_bestseller boolean default false,
  in_stock boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null, -- human-friendly ID shown in UI
  customer_name text not null,
  phone text not null,
  address text,
  payment_method text not null check (payment_method in ('COD', 'Prepaid')),
  status text not null default 'Pending'
    check (status in ('Pending', 'Processing', 'Dispatched', 'Delivered', 'Returned', 'Cancelled')),
  total_amount numeric not null default 0,
  net_profit numeric default 0, -- computed when Delivered, reversed when Returned/Cancelled
  tracking_number text,
  courier text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ORDER ITEMS
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id),
  title_snapshot text not null, -- product title at time of order
  qty integer not null default 1,
  price_at_order numeric not null,
  cost_at_order numeric not null -- product cost_price at time of order, for profit calc
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

alter table products enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- PRODUCTS: public can read, only authenticated users can write
create policy "public read products" on products
  for select using (true);
create policy "authenticated write products" on products
  for all using (auth.role() = 'authenticated');

-- ORDERS: fully admin-only, no public access at all
create policy "authenticated full access orders" on orders
  for all using (auth.role() = 'authenticated');

-- ORDER_ITEMS: same as orders
create policy "authenticated full access order_items" on order_items
  for all using (auth.role() = 'authenticated');

-- ==========================================
-- FUNCTIONS AND TRIGGERS
-- ==========================================

create or replace function adjust_order_profit()
returns trigger as $$
declare
  computed_profit numeric;
begin
  -- Sum (price - cost) * qty across this order's items
  select coalesce(sum((price_at_order - cost_at_order) * qty), 0)
  into computed_profit
  from order_items
  where order_id = new.id;

  if new.status = 'Delivered' then
    new.net_profit := computed_profit;
  elsif new.status in ('Returned', 'Cancelled') then
    new.net_profit := 0;
  end if;

  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_adjust_order_profit
before update of status on orders
for each row
execute function adjust_order_profit();

create or replace function sync_in_stock()
returns trigger as $$
begin
  new.in_stock := new.stock_quantity > 0;
  return new;
end;
$$ language plpgsql;

create trigger trg_sync_in_stock
before insert or update of stock_quantity on products
for each row
execute function sync_in_stock();
