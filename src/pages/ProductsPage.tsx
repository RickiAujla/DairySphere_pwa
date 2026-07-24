import React, { useState, useEffect } from 'react';
import { Package, Plus } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { FormWrapper } from '../components/shared/FormWrapper';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface ProductRecord {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  status: string;
}

export const ProductsPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Form State
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: 'DAIRY_PROCESSED',
    price: '',
    unit: 'KG',
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/products', { page, limit });
      const items = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.pagination?.total || res?.total || items.length;

      setProducts(items);
      setTotal(totalCount);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch product catalog', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name) return;

    try {
      await apiClient.post('/api/products', {
        sku: newProduct.sku || `SKU-${Math.floor(100 + Math.random() * 900)}`,
        name: newProduct.name,
        category: newProduct.category,
        price: parseFloat(newProduct.price) || 0,
        unit: newProduct.unit,
      });

      showSuccess('Product added to catalog', 'Success');
      setIsModalOpen(false);
      setNewProduct({ sku: '', name: '', category: 'DAIRY_PROCESSED', price: '', unit: 'KG' });
      fetchProducts();
    } catch (err: any) {
      showError(err?.message || 'Could not save product', 'Save Error');
    }
  };

  const columns: Column<ProductRecord>[] = [
    {
      key: 'sku',
      title: 'SKU Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-amber-400">{r.sku}</span>,
    },
    {
      key: 'name',
      title: 'Product Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-white">{r.name}</span>,
    },
    {
      key: 'category',
      title: 'Category',
      render: (r) => <StatusBadge status={r.category || 'DAIRY'} size="sm" />,
    },
    {
      key: 'unit',
      title: 'Unit',
      render: (r) => <span className="text-slate-300 font-mono text-[11px]">{r.unit || 'KG'}</span>,
    },
    {
      key: 'price',
      title: 'Unit Price (₹)',
      align: 'right',
      render: (r) => <span className="font-bold text-emerald-400">₹{(r.price || 0).toFixed(2)}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      align: 'center',
      render: (r) => <StatusBadge status={r.status || 'ACTIVE'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search products..." />

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={products}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Products Found"
          emptyDescription="Add dairy products like Paneer, Curd, Ghee, Butter to catalog."
          emptyActionLabel="Add First Product"
          onEmptyAction={() => setIsModalOpen(true)}
          pagination={{
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
            onPageChange: setPage,
            onLimitChange: setLimit,
          }}
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Product to Catalog">
        <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
          <FormWrapper label="SKU Code">
            <input
              type="text"
              value={newProduct.sku}
              onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
              placeholder="SKU-PAN-500G"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-amber-400 font-mono"
            />
          </FormWrapper>

          <FormWrapper label="Product Name" required>
            <input
              type="text"
              required
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              placeholder="Fresh Malai Paneer 500g"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
            />
          </FormWrapper>

          <div className="grid grid-cols-3 gap-3">
            <FormWrapper label="Category" required>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="RAW_MILK">Raw Milk</option>
                <option value="DAIRY_PROCESSED">Processed Dairy</option>
                <option value="SWEETS">Dairy Sweets</option>
              </select>
            </FormWrapper>

            <FormWrapper label="Unit" required>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="KG">Kilogram (KG)</option>
                <option value="L">Liter (L)</option>
                <option value="PACKET">Packet</option>
              </select>
            </FormWrapper>

            <FormWrapper label="Price (₹)" required>
              <input
                type="number"
                step="1"
                required
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                placeholder="220"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-emerald-400 font-bold"
              />
            </FormWrapper>
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-semibold"
            >
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductsPage;
