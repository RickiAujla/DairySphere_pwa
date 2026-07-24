import React, { useState, useEffect } from 'react';
import { Boxes, RefreshCw } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  availableQty: number;
  unit: string;
  reorderLevel: number;
  stockStatus: string;
}

export const InventoryPage: React.FC = () => {
  const { showError } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/inventory');
      const data = Array.isArray(res) ? res : res?.data || [];
      setItems(data);
    } catch (err: any) {
      showError(err?.message || 'Failed to fetch inventory balances', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const columns: Column<InventoryItem>[] = [
    {
      key: 'sku',
      title: 'SKU',
      render: (r) => <span className="font-mono text-sky-400 font-bold">{r.sku}</span>,
    },
    {
      key: 'productName',
      title: 'Item Description',
      render: (r) => <span className="font-semibold text-white">{r.productName}</span>,
    },
    {
      key: 'availableQty',
      title: 'Stock Balance',
      align: 'right',
      render: (r) => (
        <span className="font-bold text-white">
          {r.availableQty} {r.unit}
        </span>
      ),
    },
    {
      key: 'reorderLevel',
      title: 'Reorder Point',
      align: 'right',
      render: (r) => <span className="text-slate-400 font-mono">{r.reorderLevel} {r.unit}</span>,
    },
    {
      key: 'stockStatus',
      title: 'Stock Status',
      align: 'center',
      render: (r) => <StatusBadge status={r.stockStatus || 'IN_STOCK'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Warehouse Stock Balances"
        subtitle="Real-time raw milk & processed dairy stock tracking"
        action={
          <button
            onClick={fetchInventory}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        }
        noPadding
      >
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="Inventory Empty"
          emptyDescription="No stock batches currently tracked."
        />
      </Card>
    </div>
  );
};

export default InventoryPage;
