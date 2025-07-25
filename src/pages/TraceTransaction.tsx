import React from 'react';
import Table from '../components/Table';

const TraceTransaction: React.FC = () => {
  const columns = [
    { key: 'Transaction', label: 'Transaction', query: 'transaction_data.transaction_type' },
    { key: 'Product_status', label: 'Product Status', query: 'transaction_data.product_status' },
    { key: 'Item_ID', label: 'Item ID', query: 'transaction_data.item_id' },
    { key: 'WMS_Reference', label: 'WMS Reference', query: 'transaction_data.wms_reference' },
    { key: 'SAP_Reference', label: 'SAP Reference', query: 'transaction_data.sap_reference' },
    { key: 'QTY_INB', label: 'QTY INB', query: '' },
    { key: 'QTY_OUT', label: 'QTY OUT', query: '' },
    { key: 'QTY_ADJ', label: 'QTY ADJ', query: '' },
    { key: 'LastTransactionDate', label: 'Last Transaction Date', query: 'transaction_data.transaction_date' },
    
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