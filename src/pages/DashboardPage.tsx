import React, { useState, useEffect } from 'react';
import { Milk, Users, DollarSign, UserCheck, Plus, RefreshCw, Activity, Package } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface CollectionSummary {
  id: string;
  farmerCode: string;
  farmerName: string;
  milkType: string;
  shift: string;
  quantity: number;
  totalAmount: number;
  status: string;
}

export const DashboardPage: React.FC = () => {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [collections, setCollections] = useState<CollectionSummary[]>([]);
  const [stats, setStats] = useState({
    totalMilk: 0,
    farmersCount: 0,
    totalPayout: 0,
    buyersCount: 0,
  });

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [farmersRes, customersRes, collectionsRes] = await Promise.allSettled([
        apiClient.get('/api/farmers'),
        apiClient.get('/api/customers'),
        apiClient.get('/api/milk/collections'),
      ]);

      let farmerCount = 0;
      if (farmersRes.status === 'fulfilled' && farmersRes.value) {
        const data = farmersRes.value;
        farmerCount = Array.isArray(data) ? data.length : data?.data?.length || 0;
      }

      let buyerCount = 0;
      if (customersRes.status === 'fulfilled' && customersRes.value) {
        const data = customersRes.value;
        buyerCount = Array.isArray(data) ? data.length : data?.data?.length || 0;
      }

      let items: CollectionSummary[] = [];
      if (collectionsRes.status === 'fulfilled' && collectionsRes.value) {
        const resData = collectionsRes.value;
        const rawItems = Array.isArray(resData) ? resData : resData?.data || [];
        items = rawItems.map((c: any) => ({
          id: c.id,
          farmerCode: c.farmerCode || 'FMR-101',
          farmerName: c.farmerName || 'Supplier',
          milkType: c.milkType || 'COW',
          shift: c.shift || 'MORNING',
          quantity: c.quantity || 0,
          totalAmount: c.totalAmount || 0,
          status: 'COMPLETED',
        }));
      }

      setCollections(items);

      const totalVol = items.reduce((acc, i) => acc + i.quantity, 0);
      const totalPayoutVal = items.reduce((acc, i) => acc + i.totalAmount, 0);

      setStats({
        totalMilk: totalVol,
        farmersCount: farmerCount,
        totalPayout: totalPayoutVal,
        buyersCount: buyerCount,
      });
    } catch (err: any) {
      showError('Could not fetch dashboard metrics', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const columns: Column<CollectionSummary>[] = [
    {
      key: 'farmerCode',
      title: 'Farmer Code',
      sortable: true,
      render: (r) => <span className="font-mono text-sky-400 font-semibold">{r.farmerCode}</span>,
    },
    {
      key: 'farmerName',
      title: 'Farmer Name',
      sortable: true,
      render: (r) => <span className="font-medium text-white">{r.farmerName}</span>,
    },
    {
      key: 'milkType',
      title: 'Type',
      render: (r) => <StatusBadge status={r.milkType} size="sm" />,
    },
    {
      key: 'shift',
      title: 'Shift',
      render: (r) => <span className="text-slate-300 font-medium">{r.shift}</span>,
    },
    {
      key: 'quantity',
      title: 'Quantity (L)',
      align: 'right',
      sortable: true,
      render: (r) => <span className="font-bold text-white">{r.quantity.toFixed(1)} L</span>,
    },
    {
      key: 'totalAmount',
      title: 'Total (₹)',
      align: 'right',
      sortable: true,
      render: (r) => <span className="font-bold text-emerald-400">₹{r.totalAmount.toFixed(2)}</span>,
    },
    {
      key: 'status',
      title: 'Status',
      align: 'center',
      render: (r) => <StatusBadge status={r.status} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card noPadding>
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Today Milk Intake</span>
              <Milk className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {stats.totalMilk.toFixed(1)} <span className="text-xs font-normal text-slate-400">Liters</span>
            </div>
            <p className="text-[11px] text-slate-500">Live intake aggregated across active branches</p>
          </div>
        </Card>

        <Card noPadding>
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Farmers</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.farmersCount}</div>
            <p className="text-[11px] text-slate-500">Registered cooperative milk suppliers</p>
          </div>
        </Card>

        <Card noPadding>
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Calculated Payout</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">₹{stats.totalPayout.toLocaleString()}</div>
            <p className="text-[11px] text-slate-500">Total liability accrued for current shift</p>
          </div>
        </Card>

        <Card noPadding>
          <div className="p-5 space-y-2">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Active Buyers</span>
              <UserCheck className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.buyersCount}</div>
            <p className="text-[11px] text-slate-500">Retailers and commercial accounts</p>
          </div>
        </Card>
      </div>

      {/* Recent Collections Data Table */}
      <Card
        title="Recent Milk Collection Register"
        subtitle="Real-time shift intake entries from collection centers"
        action={
          <button
            onClick={fetchDashboardData}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        }
        noPadding
      >
        <DataTable
          columns={columns}
          data={collections}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Recent Intake Records"
          emptyDescription="There are no milk intake records registered for today yet."
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
