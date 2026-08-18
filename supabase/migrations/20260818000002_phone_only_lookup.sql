-- =====================================================================
-- Migration: Phone-Only Order Lookup RPC
-- Description: Adds a function to retrieve a lightweight list of orders
--              using just a phone number.
-- =====================================================================

create or replace function get_orders_by_phone(
  p_phone text
)
returns table (
  order_number text,
  status text,
  total_amount numeric,
  created_at timestamptz
) as $$
begin
  return query
  select o.order_number, o.status, o.total_amount, o.created_at
  from orders o
  where o.phone = p_phone
  order by o.created_at desc;
end;
$$ language plpgsql security definer;
