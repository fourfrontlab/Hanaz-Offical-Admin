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
  created_at: string;
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

  const deleteProduct = async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    setProducts(products.filter((p) => p.id !== id));
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
