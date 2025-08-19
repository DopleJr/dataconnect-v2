import React from 'react';
import Table from '../components/Table';

const TraceTransaction: React.FC = () => {
  const columns = [
    { key: 'bussines_unit', label: 'Bussines Unit', query: 'bussines_unit' },
    { key: 'transaction_type', label: 'TRX Type', query: '' },
    { key: 'transaction_desc', label: 'TRX Desc', query: '' },
    { key: 'Product_status', label: 'Product Status', query: 'product_status' },
    { key: 'Item_ID', label: 'Item ID', query: 'item_id' },
    { key: 'WMS_Reference', label: 'WMS Reference', query: '' },
    { key: 'SAP_Reference', label: 'SAP Reference', query: '' },
    { key: 'QTY_INB', label: 'QTY INB', query: '' },
    { key: 'QTY_OUT', label: 'QTY OUT', query: '' },
    { key: 'QTY_ADJ', label: 'QTY ADJ', query: '' },
    { key: 'transaction_date', label: 'Transaction Date', query: 'transaction_date' },
    
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