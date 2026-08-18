alter table products add column stock_quantity integer not null default 0;

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
