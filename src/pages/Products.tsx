import { useState } from 'react';
import { useProducts, type Product } from '../hooks/useProducts';
import ProductFormModal from '../components/ProductFormModal';
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const { products, loading, createProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete ${title}?`)) {
      try {
        await deleteProduct(id);
        toast.success(`${title} deleted successfully.`);
      } catch (error) {
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleSave = async (productData: Partial<Product>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
      toast.success('Product updated successfully!');
    } else {
      await createProduct(productData);
      toast.success('Product created successfully!');
    }
  };

  // Format currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-PK', { style: 'currency', currency: 'PKR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4 md:mb-6">
        <h2 className="text-xl font-medium">Product CMS</h2>
        <button 
          onClick={handleOpenCreate}
          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── MOBILE CARD LAYOUT (hidden on md+) ─────────────────────── */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-6 py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
            <p className="text-neutral-500 text-sm">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-neutral-200 shadow-sm px-6 py-12 text-center">
            <p className="text-neutral-500 font-medium">No products found.</p>
            <p className="text-sm text-neutral-400 mt-1">Click "Add Product" to create your first item.</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl border border-neutral-200 shadow-sm p-4">
              {/* Product info row */}
              <div className="flex items-start gap-3">
                <div className="w-14 h-14 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 flex-shrink-0">
                  {product.image_urls && product.image_urls.length > 0 ? (
                    <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-neutral-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-neutral-900 leading-snug">{product.title}</div>
                  <div className="text-xs text-neutral-400 mt-0.5">{product.category}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {product.is_featured && (
                      <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Featured</span>
                    )}
                    {product.is_bestseller && (
                      <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Bestseller</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price + Status + Actions row */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100">
                <div>
                  <div className="text-sm font-medium text-neutral-900">{formatCurrency(product.sale_price)}</div>
                  {product.discount_pct > 0 && (
                    <div className="text-xs text-neutral-400 line-through">{formatCurrency(product.base_price)}</div>
                  )}
                </div>

                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                  product.stock_quantity === 0 ? 'bg-red-100 text-red-800' :
                  product.stock_quantity < 5 ? 'bg-orange-100 text-orange-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {product.stock_quantity === 0 ? 'Out of Stock' :
                   product.stock_quantity < 5 ? `Low (${product.stock_quantity})` :
                   `In Stock (${product.stock_quantity})`}
                </span>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEdit(product)}
                    className="text-brand-600 hover:text-brand-800 p-2 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id, product.title)}
                    className="text-red-600 hover:text-red-800 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── DESKTOP TABLE LAYOUT (hidden below md) ─────────────────── */}
      <div className="hidden md:block bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
                    <p className="text-neutral-500 text-sm">Loading products...</p>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-neutral-500 font-medium">No products found.</p>
                    <p className="text-sm text-neutral-400 mt-1">Click "Add Product" to create your first item.</p>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-neutral-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden border border-neutral-200 flex-shrink-0">
                          {product.image_urls && product.image_urls.length > 0 ? (
                            <img src={product.image_urls[0]} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{product.title}</div>
                          <div className="flex gap-2 mt-1">
                            {product.is_featured && <span className="text-[10px] uppercase font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded">Featured</span>}
                            {product.is_bestseller && <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Bestseller</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {product.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">{formatCurrency(product.sale_price)}</div>
                      {product.discount_pct > 0 && (
                        <div className="text-xs text-neutral-400 line-through">{formatCurrency(product.base_price)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
                        product.stock_quantity === 0 ? 'bg-red-100 text-red-800' : 
                        product.stock_quantity < 5 ? 'bg-orange-100 text-orange-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {product.stock_quantity === 0 ? 'Out of Stock' : 
                         product.stock_quantity < 5 ? `Low Stock (${product.stock_quantity})` : 
                         `In Stock (${product.stock_quantity})`}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => handleOpenEdit(product)}
                          className="text-brand-600 hover:text-brand-800 p-1.5 bg-brand-50 hover:bg-brand-100 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(product.id, product.title)}
                          className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <ProductFormModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          product={editingProduct}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
