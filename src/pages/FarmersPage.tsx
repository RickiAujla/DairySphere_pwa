import React, { useState, useEffect } from 'react';
import { Plus, Users, RefreshCw } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { SearchBox } from '../components/shared/SearchBox';
import { FilterPanel } from '../components/shared/FilterPanel';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { FormWrapper } from '../components/shared/FormWrapper';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface FarmerRecord {
  id: string;
  farmerCode: string;
  firstName: string;
  lastName: string;
  phone?: string;
  status: string;
}

export const FarmersPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [farmers, setFarmers] = useState<FarmerRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Form State
  const [newFarmer, setNewFarmer] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    farmerCode: '',
  });

  const fetchFarmers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/farmers', {
        page,
        limit,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
      });

      const items = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.pagination?.total || res?.total || items.length;

      setFarmers(items);
      setTotal(totalCount);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch farmers list', 'API Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFarmers();
  }, [page, limit, searchQuery, statusFilter]);

  const handleCreateFarmer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmer.firstName || !newFarmer.lastName) return;

    try {
      await apiClient.post('/api/farmers', {
        farmerCode: newFarmer.farmerCode || `FMR-${Math.floor(1000 + Math.random() * 9000)}`,
        firstName: newFarmer.firstName,
        lastName: newFarmer.lastName,
        phone: newFarmer.phone,
      });

      showSuccess('Farmer registered successfully', 'Success');
      setIsModalOpen(false);
      setNewFarmer({ firstName: '', lastName: '', phone: '', farmerCode: '' });
      fetchFarmers();
    } catch (err: any) {
      showError(err?.message || 'Could not register farmer', 'Registration Error');
    }
  };

  const columns: Column<FarmerRecord>[] = [
    {
      key: 'farmerCode',
      title: 'Farmer Code',
      sortable: true,
      render: (r) => <span className="font-mono font-bold text-sky-400">{r.farmerCode}</span>,
    },
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (r) => <span className="font-semibold text-white">{r.firstName} {r.lastName}</span>,
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
      {/* Top Filter & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-lg">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by code, first name, last name..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Register Farmer</span>
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        activeChips={
          statusFilter !== 'ALL'
            ? [{ id: 'status', label: 'Status', value: statusFilter }]
            : []
        }
        onRemoveChip={() => setStatusFilter('ALL')}
        onResetAll={() => setStatusFilter('ALL')}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Status Filter</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      {/* Main Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          data={farmers}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Registered Farmers Found"
          emptyDescription="There are no farmers matching your query."
          emptyActionLabel="Register First Farmer"
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

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register New Milk Supplier / Farmer"
      >
        <form onSubmit={handleCreateFarmer} className="space-y-4 text-xs">
          <FormWrapper label="Farmer Code (Optional)">
            <input
              type="text"
              value={newFarmer.farmerCode}
              onChange={(e) => setNewFarmer({ ...newFarmer, farmerCode: e.target.value })}
              placeholder="e.g. FMR-1002 (auto-generated if empty)"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sky-400 font-mono"
            />
          </FormWrapper>

          <div className="grid grid-cols-2 gap-3">
            <FormWrapper label="First Name" required>
              <input
                type="text"
                required
                value={newFarmer.firstName}
                onChange={(e) => setNewFarmer({ ...newFarmer, firstName: e.target.value })}
                placeholder="Ramesh"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>

            <FormWrapper label="Last Name" required>
              <input
                type="text"
                required
                value={newFarmer.lastName}
                onChange={(e) => setNewFarmer({ ...newFarmer, lastName: e.target.value })}
                placeholder="Kumar"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>
          </div>

          <FormWrapper label="Phone Number">
            <input
              type="text"
              value={newFarmer.phone}
              onChange={(e) => setNewFarmer({ ...newFarmer, phone: e.target.value })}
              placeholder="+91 98000 00000"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
            />
          </FormWrapper>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              Save Farmer Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default FarmersPage;
