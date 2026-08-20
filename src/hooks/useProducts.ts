import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface Product {
  id: string;
  title: string;
  category: string;
  description: string | null;
  ingredients: { name: string; description: string }[] | null;
  base_price: number;
  sale_price: number;
  discount_pct: number;
  cost_price: number;
  image_urls: string[];
  is_featured: boolean;
  is_bestseller: boolean;
  in_stock: boolean;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
}

// Describes the outcome of a smart delete operation
export type DeleteResult =
  | { action: 'hard_deleted' }
  | { action: 'soft_deleted' };

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)          // admin list also hides deactivated products
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to real-time product updates so stock reflects live changes
    // (e.g. stock_quantity decremented by the deduct_stock_on_order DB trigger)
    const channel = supabase
      .channel('public:products_live')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'products' },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createProduct = async (productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    setProducts([data, ...products]);
    return data;
  };

  const updateProduct = async (id: string, productData: Partial<Product>) => {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    setProducts(products.map((p) => (p.id === id ? data : p)));
    return data;
  };

  /**
   * Smart delete:
   * - If the product has NO order history → hard-delete (removes the row entirely).
   * - If the product HAS order history    → soft-delete (sets is_active = false).
   *   The product is removed from all listings but its row remains for FK integrity.
   *
   * Returns a DeleteResult so the caller can show an appropriate toast.
   */
  const deleteProduct = async (id: string): Promise<DeleteResult> => {
    // 1. Check whether this product appears in any order_items row
    const { count, error: countError } = await supabase
      .from('order_items')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', id);

    if (countError) {
      console.error('deleteProduct – order_items check failed:', countError);
      throw countError;
    }

    const hasOrderHistory = (count ?? 0) > 0;

    if (!hasOrderHistory) {
      // 2a. Safe to hard-delete — no FK references
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('deleteProduct – hard delete failed:', error);
        throw error;
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { action: 'hard_deleted' };
    } else {
      // 2b. Has order history — soft-delete instead
      const { error } = await supabase
        .from('products')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('deleteProduct – soft delete failed:', error);
        throw error;
      }

      // Remove from local list (it's no longer active)
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return { action: 'soft_deleted' };
    }
  };

  return {
    products,
    loading,
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
