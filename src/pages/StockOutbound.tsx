import React from 'react';
import Table from '../components/Table';

const StockOutbound: React.FC = () => {
  const columns = [
    { key: 'UPDATED_TIMESTAMP', label: 'UPDATED_TIMESTAMP' },
    { key: 'ORIGINAL_ORDER_ID', label: 'ORIGINAL_ORDER_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS_ID' },
    { key: 'STATUS_DO', label: 'STATUS_DO' },
    { key: 'DO_LINE', label: 'DO_LINE' },
    { key: 'STO_LINE', label: 'STO_LINE' },
    { key: 'ITEM_ID', label: 'ITEM_ID' },
    { key: 'OLPN_ID', label: 'OLPN_ID' },
    { key: 'PACKED_QUANTITY', label: 'PACKED_QUANTITY' },
    { key: 'ORDER_TYPE', label: 'ORDER_TYPE' },
    { key: 'STATUS_OLPN', label: 'STATUS_OLPN' },
    { key: 'SHIP_TO', label: 'SHIP_TO' },
    { key: 'UPDATED_TIMESTAMP_OLPN', label: 'UPDATED_TIMESTAMP_OLPN' },
    { key: 'CREATED_TIMESTAMP_DO', label: 'CREATED_TIMESTAMP_DO' },
    { key: 'SO', label: 'SO' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      <Table
        columns={columns}
        title="Outbound Items"
        type="stockoutbound"
      />
    </div>
  );
};

export default StockOutbound;