import React, { useState, useEffect } from 'react';
import { UserCheck, Plus } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { SearchBox } from '../components/shared/SearchBox';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { FormWrapper } from '../components/shared/FormWrapper';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface CustomerRecord {
  id: string;
  customerCode: string;
  name: string;
  customerType: string;
  phone?: string;
  status: string;
}

export const CustomersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    customerType: 'RETAIL',
    phone: '',
    customerCode: '',
  });

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/customers', { page, limit });
      const items = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.pagination?.total || res?.total || items.length;

      setCustomers(items);
      setTotal(totalCount);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch customer directory', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, limit]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) return;

    try {
      await apiClient.post('/api/customers', {
        customerCode: newCustomer.customerCode || `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: newCustomer.name,
        customerType: newCustomer.customerType,
        phone: newCustomer.phone,
      });

      showSuccess('Customer profile registered', 'Success');
      setIsModalOpen(false);
      setNewCustomer({ name: '', customerType: 'RETAIL', phone: '', customerCode: '' });
      fetchCustomers();
    } catch (err: any) {
      showError(err?.message || 'Could not save customer', 'Save Error');
    }
  };

  const columns: Column<CustomerRecord>[] = [
    {
      key: 'customerCode',
      title: 'Customer Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-purple-400">{r.customerCode}</span>,
    },
    {
      key: 'name',
      title: 'Name / Business',
      sortable: true,
      render: (r) => <span className="font-semibold text-white">{r.name}</span>,
    },
    {
      key: 'customerType',
      title: 'Type',
      render: (r) => <StatusBadge status={r.customerType || 'RETAIL'} size="sm" />,
    },
    {
      key: 'phone',
      title: 'Phone Number',
      render: (r) => <span className="text-slate-300 font-mono">{r.phone || 'N/A'}</span>,
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
        <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Search customers..." />

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      <Card noPadding>
        <DataTable
          columns={columns}
          data={customers}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Customers Registered"
          emptyDescription="Register commercial, retail or sweet shop buyers."
          emptyActionLabel="Register First Customer"
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Customer Account">
        <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
          <FormWrapper label="Customer Code (Optional)">
            <input
              type="text"
              value={newCustomer.customerCode}
              onChange={(e) => setNewCustomer({ ...newCustomer, customerCode: e.target.value })}
              placeholder="e.g. CUST-1001"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-purple-400 font-mono"
            />
          </FormWrapper>

          <FormWrapper label="Full Name / Company Name" required>
            <input
              type="text"
              required
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              placeholder="Royal Sweets & Dairy"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
            />
          </FormWrapper>

          <div className="grid grid-cols-2 gap-3">
            <FormWrapper label="Customer Type" required>
              <select
                value={newCustomer.customerType}
                onChange={(e) => setNewCustomer({ ...newCustomer, customerType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="RETAIL">Retail Customer</option>
                <option value="WHOLESALE">Wholesale Buyer</option>
                <option value="INSTITUTIONAL">Institutional / Hotel</option>
              </select>
            </FormWrapper>

            <FormWrapper label="Phone Number">
              <input
                type="text"
                value={newCustomer.phone}
                onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                placeholder="+91 98000 00000"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
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
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold"
            >
              Save Customer Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CustomersPage;
