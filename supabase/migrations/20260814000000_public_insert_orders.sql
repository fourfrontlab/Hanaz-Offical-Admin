-- Allow anonymous inserts on orders
create policy "public can insert orders" on public.orders
  for insert with check (true);

-- Allow anonymous inserts on order_items
create policy "public can insert order_items" on public.order_items
  for insert with check (true);
