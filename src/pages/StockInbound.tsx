import React from 'react';
import Table from '../components/Table';

const StockInbound: React.FC = () => {
  const columns = [
    { key: 'ASN_ID', label: 'ASN_ID' },
    { key: 'LPN_ID', label: 'LPN_ID' },
    { key: 'ITEM_ID', label: 'ITEM_ID' },
    { key: 'INVENTORY_ATTRIBUTE1', label: 'INVENTORY_ATTRIBUTE1' },
    { key: 'INVENTORY_ATTRIBUTE2', label: 'INVENTORY_ATTRIBUTE2' },
    { key: 'PARENT_LPN_ID', label: 'PARENT_LPN_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS_ID' },
    { key: 'UPDATED_TIMESTAMP', label: 'UPDATED_TIMESTAMP' },
    { key: 'QUANTITY', label: 'QUANTITY' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      <Table
        columns={columns}
        title="Inbound Items"
        type="stockinbound"
      />
    </div>
  );
};

export default StockInbound;