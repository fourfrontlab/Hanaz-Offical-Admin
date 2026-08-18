-- =====================================================================
-- Migration: Automatic stock deduction on order placement (Option A)
-- Trigger 1: Deduct stock_quantity when order_items row is inserted
-- Trigger 2: Restore stock_quantity when order status → Returned/Cancelled
-- =====================================================================

-- 1. Deduct stock at checkout (after order_items insert)
create or replace function deduct_stock_on_order()
returns trigger as $$
begin
  update products
  set stock_quantity = greatest(stock_quantity - new.qty, 0)
  where id = new.product_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_deduct_stock_on_order on order_items;
create trigger trg_deduct_stock_on_order
after insert on order_items
for each row
execute function deduct_stock_on_order();

-- 2. Restore stock when order is marked Returned or Cancelled
create or replace function restore_stock_on_return()
returns trigger as $$
begin
  if new.status in ('Returned', 'Cancelled') and old.status not in ('Returned', 'Cancelled') then
    update products p
    set stock_quantity = p.stock_quantity + oi.qty
    from order_items oi
    where oi.order_id = new.id
      and p.id = oi.product_id;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_restore_stock_on_return on orders;
create trigger trg_restore_stock_on_return
after update of status on orders
for each row
execute function restore_stock_on_return();
