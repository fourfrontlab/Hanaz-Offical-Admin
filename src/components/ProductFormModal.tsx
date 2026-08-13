import { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import type { Product } from '../hooks/useProducts';
import DragDropImageUploader from './DragDropImageUploader';
import toast from 'react-hot-toast';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void>;
}

export default function ProductFormModal({ product, isOpen, onClose, onSave }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(
    product || {
      title: '',
      category: 'Brightening',
      description: '',
      ingredients: '',
      base_price: 0,
      sale_price: 0,
      discount_pct: 0,
      cost_price: 0,
      image_urls: [],
      is_featured: false,
      is_bestseller: false,
      in_stock: true,
    }
  );

  useEffect(() => {
    if (formData.base_price && formData.sale_price && formData.base_price > 0) {
      if (formData.base_price > formData.sale_price) {
        const discount = ((formData.base_price - formData.sale_price) / formData.base_price) * 100;
        setFormData(prev => ({ ...prev, discount_pct: Math.round(discount) }));
      } else {
        setFormData(prev => ({ ...prev, discount_pct: 0 }));
      }
    }
  }, [formData.base_price, formData.sale_price]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImagesChange = (urls: string[]) => {
    setFormData({ ...formData, image_urls: urls });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error saving product');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-xl font-medium text-neutral-900">
            {product ? 'Edit Product' : 'Create New Product'}
          </h2>
          <button onClick={onClose} className="p-2 text-neutral-400 hover:text-neutral-600 rounded-full hover:bg-neutral-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section: Basic Info */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Basic Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Product Title *</label>
                  <input required name="title" value={formData.title || ''} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="e.g., Hanaz Vitamin C Serum" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Category</label>
                  <select name="category" value={formData.category || ''} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500">
                    <option value="Brightening">Brightening</option>
                    <option value="Hydration">Hydration</option>
                    <option value="Anti-Aging">Anti-Aging</option>
                    <option value="Acne Care">Acne Care</option>
                    <option value="Cleansers">Cleansers</option>
                  </select>
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Description</label>
                  <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" />
                </div>
                
                <div className="space-y-1 md:col-span-2">
                  <label className="text-sm font-medium text-neutral-700">Ingredients</label>
                  <textarea name="ingredients" value={formData.ingredients || ''} onChange={handleChange} rows={2} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" />
                </div>
              </div>
            </div>

            {/* Section: Media */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Product Images</h3>
              <DragDropImageUploader imageUrls={formData.image_urls || []} onChange={handleImagesChange} />
            </div>

            {/* Section: Pricing */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Pricing & Inventory</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Base Price (Rs.)</label>
                  <input type="number" name="base_price" value={formData.base_price || 0} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Sale Price (Rs.) *</label>
                  <input required type="number" name="sale_price" value={formData.sale_price || 0} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Cost Price (Rs.)</label>
                  <input type="number" name="cost_price" value={formData.cost_price || 0} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-neutral-700">Discount %</label>
                  <input type="number" name="discount_pct" value={formData.discount_pct || 0} onChange={handleChange} className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:ring-brand-500 focus:border-brand-500 bg-neutral-50" readOnly title="Auto calculated from Base and Sale price" />
                </div>
              </div>
            </div>

            {/* Section: Visibility & Flags */}
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4 border-b border-neutral-100 pb-2">Storefront Visibility</h3>
              <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="in_stock" checked={formData.in_stock} onChange={handleChange} className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500" />
                  <span className="text-sm font-medium text-neutral-700">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500" />
                  <span className="text-sm font-medium text-neutral-700">Feature on Homepage</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="is_bestseller" checked={formData.is_bestseller} onChange={handleChange} className="w-4 h-4 text-brand-600 border-neutral-300 rounded focus:ring-brand-500" />
                  <span className="text-sm font-medium text-neutral-700">Mark as Bestseller</span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-700 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button type="submit" form="product-form" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors flex items-center gap-2 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Product
          </button>
        </div>

      </div>
    </div>
  );
}
