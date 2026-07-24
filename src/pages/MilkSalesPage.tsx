import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { FormWrapper } from '../components/shared/FormWrapper';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface MilkSaleRecord {
  id: string;
  saleDate: string;
  customerCode: string;
  customerName: string;
  milkType: string;
  quantity: number;
  ratePerLiter: number;
  totalAmount: number;
  paymentStatus: string;
}

export const MilkSalesPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [sales, setSales] = useState<MilkSaleRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Form State
  const [newSale, setNewSale] = useState({
    customerCode: '',
    customerName: '',
    milkType: 'COW',
    quantity: '',
    ratePerLiter: '',
  });

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/milk/sales', {
        page,
        limit,
      });

      const items = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.pagination?.total || res?.total || items.length;

      setSales(items);
      setTotal(totalCount);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch milk sales records', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, limit]);

  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newSale.quantity) || 0;
    const rate = parseFloat(newSale.ratePerLiter) || 0;

    try {
      await apiClient.post('/api/milk/sales', {
        customerCode: newSale.customerCode || 'CUST-WALK',
        customerName: newSale.customerName || 'Retail Customer',
        milkType: newSale.milkType,
        quantity: qty,
        ratePerLiter: rate,
        totalAmount: qty * rate,
        saleDate: new Date().toISOString().split('T')[0],
      });

      showSuccess('Milk sale dispatched and recorded', 'Success');
      setIsModalOpen(false);
      setNewSale({
        customerCode: '',
        customerName: '',
        milkType: 'COW',
        quantity: '',
        ratePerLiter: '',
      });
      fetchSales();
    } catch (err: any) {
      showError(err?.message || 'Could not post sale record', 'Save Error');
    }
  };

  const columns: Column<MilkSaleRecord>[] = [
    {
      key: 'saleDate',
      title: 'Date',
      render: (r) => <span className="text-slate-400 font-mono text-[11px]">{r.saleDate || new Date().toISOString().split('T')[0]}</span>,
    },
    {
      key: 'customerCode',
      title: 'Customer Code',
      render: (r) => <span className="font-mono text-purple-400 font-bold">{r.customerCode || 'N/A'}</span>,
    },
    {
      key: 'customerName',
      title: 'Buyer Name',
      render: (r) => <span className="font-semibold text-white">{r.customerName || 'Retail Buyer'}</span>,
    },
    {
      key: 'milkType',
      title: 'Type',
      render: (r) => <StatusBadge status={r.milkType || 'COW'} size="sm" />,
    },
    {
      key: 'quantity',
      title: 'Quantity (L)',
      align: 'right',
      render: (r) => <span className="font-bold text-white">{(r.quantity || 0).toFixed(1)} L</span>,
    },
    {
      key: 'ratePerLiter',
      title: 'Rate / L',
      align: 'right',
      render: (r) => <span className="text-slate-300 font-mono">₹{(r.ratePerLiter || 0).toFixed(2)}</span>,
    },
    {
      key: 'totalAmount',
      title: 'Total Amount (₹)',
      align: 'right',
      render: (r) => <span className="font-bold text-emerald-400">₹{(r.totalAmount || 0).toFixed(2)}</span>,
    },
    {
      key: 'paymentStatus',
      title: 'Payment',
      align: 'center',
      render: (r) => <StatusBadge status={r.paymentStatus || 'PAID'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search sales by buyer..." />

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Milk Sale / POS</span>
        </button>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={sales}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Milk Sales Recorded"
          emptyDescription="There are no commercial or retail sales recorded yet."
          emptyActionLabel="Record First Sale"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Milk Sale / POS Dispatch">
        <form onSubmit={handleCreateSale} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <FormWrapper label="Customer Code">
              <input
                type="text"
                value={newSale.customerCode}
                onChange={(e) => setNewSale({ ...newSale, customerCode: e.target.value })}
                placeholder="CUST-101"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-purple-400 font-mono"
              />
            </FormWrapper>

            <FormWrapper label="Buyer Name">
              <input
                type="text"
                value={newSale.customerName}
                onChange={(e) => setNewSale({ ...newSale, customerName: e.target.value })}
                placeholder="Sweet Shop / Retail"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormWrapper label="Milk Type" required>
              <select
                value={newSale.milkType}
                onChange={(e) => setNewSale({ ...newSale, milkType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="COW">Cow Milk</option>
                <option value="BUFFALO">Buffalo Milk</option>
              </select>
            </FormWrapper>

            <FormWrapper label="Quantity (L)" required>
              <input
                type="number"
                step="0.1"
                required
                value={newSale.quantity}
                onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                placeholder="50.0"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>

            <FormWrapper label="Rate / L (₹)" required>
              <input
                type="number"
                step="0.5"
                required
                value={newSale.ratePerLiter}
                onChange={(e) => setNewSale({ ...newSale, ratePerLiter: e.target.value })}
                placeholder="52.00"
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
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-semibold"
            >
              Confirm Sale Dispatch
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MilkSalesPage;
