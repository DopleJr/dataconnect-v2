import React from 'react';
import Table from '../components/Table';

const TraceTransaction: React.FC = () => {
  const columns = [
    { key: 'Transaction', label: 'Transaction' },
    { key: 'Product_status', label: 'Product Status' },
    { key: 'Item_ID', label: 'Item ID' },
    { key: 'WMS_Reference', label: 'WMS Reference' },
    { key: 'SAP_Reference', label: 'SAP Reference' },
    { key: 'QTY_INB', label: 'QTY INB' },
    { key: 'QTY_OUT', label: 'QTY OUT' },
    { key: 'QTY_ADJ', label: 'QTY ADJ' },
    { key: 'LastTransactionDate', label: 'Last Transaction Date' },
    
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      <Table
        columns={columns}
        title="Trace Trasaction"
        type="tracetransaction"
      />
    </div>
  );
};

export default TraceTransaction;