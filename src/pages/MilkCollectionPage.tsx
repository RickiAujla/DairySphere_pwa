import React, { useState, useEffect } from 'react';
import { Milk, Plus, RefreshCw } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { SearchBox } from '../components/shared/SearchBox';
import { FilterPanel } from '../components/shared/FilterPanel';
import { StatusBadge } from '../components/shared/StatusBadge';
import { Modal } from '../components/shared/Modal';
import { FormWrapper } from '../components/shared/FormWrapper';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface MilkCollectionRecord {
  id: string;
  collectionDate: string;
  farmerCode: string;
  farmerName: string;
  milkType: string;
  shift: string;
  quantity: number;
  fat: number;
  snf: number;
  ratePerLiter: number;
  totalAmount: number;
}

export const MilkCollectionPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [collections, setCollections] = useState<MilkCollectionRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [shiftFilter, setShiftFilter] = useState('ALL');
  const [milkTypeFilter, setMilkTypeFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // Form State
  const [newEntry, setNewEntry] = useState({
    farmerCode: '',
    farmerName: '',
    milkType: 'COW',
    shift: 'MORNING',
    quantity: '',
    fat: '',
    snf: '',
    ratePerLiter: '',
  });

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/milk/collections', {
        page,
        limit,
        shift: shiftFilter !== 'ALL' ? shiftFilter : undefined,
        milkType: milkTypeFilter !== 'ALL' ? milkTypeFilter : undefined,
      });

      const items = Array.isArray(res) ? res : res?.data || [];
      const totalCount = res?.pagination?.total || res?.total || items.length;

      setCollections(items);
      setTotal(totalCount);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch milk collection register', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCollections();
  }, [page, limit, shiftFilter, milkTypeFilter]);

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newEntry.quantity) || 0;
    const rate = parseFloat(newEntry.ratePerLiter) || 0;

    try {
      await apiClient.post('/api/milk/collections', {
        farmerCode: newEntry.farmerCode || 'FMR-101',
        farmerName: newEntry.farmerName || 'Walk-in Farmer',
        milkType: newEntry.milkType,
        shift: newEntry.shift,
        quantity: qty,
        fat: parseFloat(newEntry.fat) || 0,
        snf: parseFloat(newEntry.snf) || 0,
        ratePerLiter: rate,
        totalAmount: qty * rate,
        collectionDate: new Date().toISOString().split('T')[0],
      });

      showSuccess('Milk collection entry recorded', 'Success');
      setIsModalOpen(false);
      setNewEntry({
        farmerCode: '',
        farmerName: '',
        milkType: 'COW',
        shift: 'MORNING',
        quantity: '',
        fat: '',
        snf: '',
        ratePerLiter: '',
      });
      fetchCollections();
    } catch (err: any) {
      showError(err?.message || 'Could not post collection entry', 'Save Error');
    }
  };

  const columns: Column<MilkCollectionRecord>[] = [
    {
      key: 'collectionDate',
      title: 'Date',
      render: (r) => <span className="text-slate-400 font-mono text-[11px]">{r.collectionDate || new Date().toISOString().split('T')[0]}</span>,
    },
    {
      key: 'farmerCode',
      title: 'Farmer Code',
      render: (r) => <span className="font-mono text-sky-400 font-bold">{r.farmerCode || 'N/A'}</span>,
    },
    {
      key: 'farmerName',
      title: 'Farmer Name',
      render: (r) => <span className="font-semibold text-white">{r.farmerName || 'Supplier'}</span>,
    },
    {
      key: 'milkType',
      title: 'Milk Type',
      render: (r) => <StatusBadge status={r.milkType || 'COW'} size="sm" />,
    },
    {
      key: 'shift',
      title: 'Shift',
      render: (r) => <span className="text-slate-300">{r.shift || 'MORNING'}</span>,
    },
    {
      key: 'quantity',
      title: 'Qty (L)',
      align: 'right',
      render: (r) => <span className="font-bold text-white">{(r.quantity || 0).toFixed(1)} L</span>,
    },
    {
      key: 'fat',
      title: 'Fat % / SNF %',
      align: 'center',
      render: (r) => <span className="text-slate-300 font-mono">{r.fat || 0}% / {r.snf || 0}%</span>,
    },
    {
      key: 'totalAmount',
      title: 'Total (₹)',
      align: 'right',
      render: (r) => <span className="font-bold text-emerald-400">₹{(r.totalAmount || 0).toFixed(2)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBox value={searchQuery} onChange={setSearchQuery} placeholder="Filter collections..." />

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Record Milk Intake</span>
        </button>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        activeChips={[
          ...(shiftFilter !== 'ALL' ? [{ id: 'shift', label: 'Shift', value: shiftFilter }] : []),
          ...(milkTypeFilter !== 'ALL' ? [{ id: 'type', label: 'Milk Type', value: milkTypeFilter }] : []),
        ]}
        onResetAll={() => {
          setShiftFilter('ALL');
          setMilkTypeFilter('ALL');
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Shift Filter</label>
            <select
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="ALL">All Shifts</option>
              <option value="MORNING">Morning Shift</option>
              <option value="EVENING">Evening Shift</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-semibold">Milk Type Filter</label>
            <select
              value={milkTypeFilter}
              onChange={(e) => setMilkTypeFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            >
              <option value="ALL">All Types</option>
              <option value="COW">Cow Milk</option>
              <option value="BUFFALO">Buffalo Milk</option>
            </select>
          </div>
        </div>
      </FilterPanel>

      {/* Main Table */}
      <Card noPadding>
        <DataTable
          columns={columns}
          data={collections}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Milk Collections Recorded"
          emptyDescription="Start recording daily milk intake from suppliers."
          emptyActionLabel="New Intake Entry"
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

      {/* Entry Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Milk Collection Intake">
        <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <FormWrapper label="Farmer Code">
              <input
                type="text"
                value={newEntry.farmerCode}
                onChange={(e) => setNewEntry({ ...newEntry, farmerCode: e.target.value })}
                placeholder="FMR-101"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-sky-400 font-mono"
              />
            </FormWrapper>

            <FormWrapper label="Farmer Name">
              <input
                type="text"
                value={newEntry.farmerName}
                onChange={(e) => setNewEntry({ ...newEntry, farmerName: e.target.value })}
                placeholder="Name"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormWrapper label="Milk Type" required>
              <select
                value={newEntry.milkType}
                onChange={(e) => setNewEntry({ ...newEntry, milkType: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="COW">Cow Milk</option>
                <option value="BUFFALO">Buffalo Milk</option>
              </select>
            </FormWrapper>

            <FormWrapper label="Shift" required>
              <select
                value={newEntry.shift}
                onChange={(e) => setNewEntry({ ...newEntry, shift: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="MORNING">Morning Shift</option>
                <option value="EVENING">Evening Shift</option>
              </select>
            </FormWrapper>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <FormWrapper label="Quantity (L)" required>
              <input
                type="number"
                step="0.1"
                required
                value={newEntry.quantity}
                onChange={(e) => setNewEntry({ ...newEntry, quantity: e.target.value })}
                placeholder="25.5"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>

            <FormWrapper label="Fat %">
              <input
                type="number"
                step="0.1"
                value={newEntry.fat}
                onChange={(e) => setNewEntry({ ...newEntry, fat: e.target.value })}
                placeholder="4.2"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>

            <FormWrapper label="SNF %">
              <input
                type="number"
                step="0.1"
                value={newEntry.snf}
                onChange={(e) => setNewEntry({ ...newEntry, snf: e.target.value })}
                placeholder="8.5"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </FormWrapper>
          </div>

          <FormWrapper label="Rate Per Liter (₹)" required>
            <input
              type="number"
              step="0.5"
              required
              value={newEntry.ratePerLiter}
              onChange={(e) => setNewEntry({ ...newEntry, ratePerLiter: e.target.value })}
              placeholder="38.50"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-emerald-400 font-bold"
            />
          </FormWrapper>

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
              Save Collection Entry
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MilkCollectionPage;
