import React from 'react';
import Table from '../components/Table';

const StockInventory: React.FC = () => {
  const columns = [
    { key: 'ORG_ID', label: 'ORG_ID' },
    { key: 'LOCATION_ID', label: 'LOCATION_ID' },
    { key: 'INVENTORY_CONTAINER_TYPE_ID', label: 'INVENTORY_CONTAINER_TYPE_ID' },
    { key: 'ILPN_ID', label: 'ILPN_ID' },
    { key: 'ITEM_ID', label: 'ITEM_ID' },
    { key: 'DESCRIPTION', label: 'DESCRIPTION' },
    { key: 'STYLE', label: 'STYLE' },
    { key: 'INVENTORY_TYPE_ID', label: 'INVENTORY_TYPE_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS_ID' },
    { key: 'IS_IN_TRANSIT', label: 'IS_IN_TRANSIT' },
    { key: 'CONSUMPTION_PRIORITY_DATE', label: 'CONSUMPTION_PRIORITY_DATE' },
    { key: 'ON_HAND', label: 'ON_HAND' },
    { key: 'ALLOCATED', label: 'ALLOCATED' },
    { key: 'AVAILABLE', label: 'AVAILABLE' },
    { key: 'CONDITION_CODE', label: 'CONDITION_CODE' },
    { key: 'TO_BE_FILLED', label: 'TO_BE_FILLED' },
    { key: 'CREATED_TIMESTAMP', label: 'CREATED_TIMESTAMP' },
    { key: 'CURRENTDATE', label: 'CURRENTDATE' },


  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      <Table
        columns={columns}
        title="Current Inventory"
        type="stockinventory"
      />
    </div>
  );
};

export default StockInventory;