import React, { useState, useEffect } from 'react';
import { DollarSign, RefreshCw } from 'lucide-react';
import { Card } from '../components/shared/Card';
import { DataTable, Column } from '../components/shared/DataTable';
import { StatusBadge } from '../components/shared/StatusBadge';
import { useToast } from '../context/ToastContext';
import { apiClient } from '../api/apiClient';

interface FinancialTransaction {
  id: string;
  txDate: string;
  referenceNo: string;
  accountType: string;
  partyName: string;
  type: string;
  amount: number;
  status: string;
}

export const FinancialPage: React.FC = () => {
  const { showError } = useToast();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFinancials = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get('/api/financial/ledger');
      const data = Array.isArray(res) ? res : res?.data || [];
      setTransactions(data);
    } catch (err: any) {
      showError(err?.message || 'Failed to load ledger records', 'Data Error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancials();
  }, []);

  const columns: Column<FinancialTransaction>[] = [
    {
      key: 'txDate',
      title: 'Date',
      render: (r) => <span className="text-slate-400 font-mono text-[11px]">{r.txDate || new Date().toISOString().split('T')[0]}</span>,
    },
    {
      key: 'referenceNo',
      title: 'Reference #',
      render: (r) => <span className="font-mono text-amber-400 font-bold">{r.referenceNo || 'TX-901'}</span>,
    },
    {
      key: 'partyName',
      title: 'Party / Account',
      render: (r) => <span className="font-semibold text-white">{r.partyName || 'General Account'}</span>,
    },
    {
      key: 'type',
      title: 'Type',
      render: (r) => <StatusBadge status={r.type || 'CREDIT'} size="sm" />,
    },
    {
      key: 'amount',
      title: 'Amount (₹)',
      align: 'right',
      render: (r) => (
        <span className={`font-bold ${r.type === 'DEBIT' ? 'text-rose-400' : 'text-emerald-400'}`}>
          {r.type === 'DEBIT' ? '-' : '+'}₹{(r.amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      key: 'status',
      title: 'Ledger Status',
      align: 'center',
      render: (r) => <StatusBadge status={r.status || 'POSTED'} size="sm" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card
        title="Financial Ledger & Farmer Payout Statements"
        subtitle="General ledger journal entries and automated supplier payouts"
        action={
          <button
            onClick={fetchFinancials}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        }
        noPadding
      >
        <DataTable
          columns={columns}
          data={transactions}
          keyExtractor={(r) => r.id}
          isLoading={isLoading}
          emptyTitle="No Ledger Entries Found"
          emptyDescription="All accounts currently balanced."
        />
      </Card>
    </div>
  );
};

export default FinancialPage;
