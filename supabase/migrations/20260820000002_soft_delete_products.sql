-- =====================================================
-- Migration: Soft-delete support for products
-- Adds is_active column so products with order history
-- can be deactivated instead of hard-deleted.
-- =====================================================

-- 1. Add is_active column (default true = all existing products stay visible)
alter table products
  add column if not exists is_active boolean not null default true;

-- 2. Update the existing "public read products" policy to only expose active products
drop policy if exists "public read products" on products;
create policy "public read products" on products
  for select using (is_active = true);

-- 3. Admin policy already covers all operations for authenticated users
--    No change needed there.
