-- =====================================================================
-- Migration: Add Payment Status Tracking
-- Description: Adds payment_status column, trigger for auto-marking 
--              COD orders as paid when delivered, and updates RPCs.
-- =====================================================================

-- 1. Add payment_status column
alter table orders 
add column if not exists payment_status text not null default 'unpaid'
check (payment_status in ('unpaid', 'paid', 'refunded'));

-- 2. Trigger to auto-mark COD as paid
create or replace function auto_mark_cod_paid()
returns trigger as $$
begin
  if new.status = 'Delivered' and new.payment_method = 'COD' and new.payment_status = 'unpaid' then
    new.payment_status := 'paid';
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_auto_mark_cod_paid on orders;
create trigger trg_auto_mark_cod_paid
before update of status on orders
for each row
execute function auto_mark_cod_paid();

-- 3. Update get_order_by_number_and_phone RPC
create or replace function get_order_by_number_and_phone(
  p_order_number text,
  p_phone text
)
returns table (
  order_number text,
  status text,
  total_amount numeric,
  tracking_number text,
  courier text,
  payment_method text,
  payment_status text,
  created_at timestamptz
) as $$
begin
  return query
  select o.order_number, o.status, o.total_amount, o.tracking_number, o.courier, o.payment_method, o.payment_status, o.created_at
  from orders o
  where o.order_number = p_order_number
    and o.phone = p_phone;
end;
$$ language plpgsql security definer;

-- 4. Update get_orders_by_phone RPC
create or replace function get_orders_by_phone(
  p_phone text
)
returns table (
  order_number text,
  status text,
  total_amount numeric,
  payment_method text,
  payment_status text,
  created_at timestamptz
) as $$
begin
  return query
  select o.order_number, o.status, o.total_amount, o.payment_method, o.payment_status, o.created_at
  from orders o
  where o.phone = p_phone
  order by o.created_at desc;
end;
$$ language plpgsql security definer;
