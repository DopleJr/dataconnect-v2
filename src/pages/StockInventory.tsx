import React from 'react';
import Table from '../components/Table';

const StockInventory: React.FC = () => {
  const columns = [
    { key: 'ORG_ID', label: 'ORG_ID', query: 'a.ORG_ID' },
    { key: 'LOCATION_ID', label: 'LOCATION_ID', query: 'a.LOCATION_ID' },
    { key: 'INVENTORY_CONTAINER_TYPE_ID', label: 'INVENTORY_CONTAINER_TYPE_ID', query: 'a.INVENTORY_CONTAINER_TYPE_ID' },
    { key: 'ILPN_ID', label: 'ILPN_ID', query: 'a.ILPN_ID' },
    { key: 'ITEM_ID', label: 'ITEM_ID', query: 'a.ITEM_ID' },
    { key: 'DESCRIPTION', label: 'DESCRIPTION', query: 'b.DESCRIPTION' },
    { key: 'STYLE', label: 'STYLE', query: 'b.STYLE' },
    { key: 'INVENTORY_TYPE_ID', label: 'INVENTORY_TYPE_ID', query: 'a.INVENTORY_TYPE_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS_ID', query: 'a.PRODUCT_STATUS_ID' },
    { key: 'IS_IN_TRANSIT', label: 'IS_IN_TRANSIT', query: 'a.IS_IN_TRANSIT' },
    { key: 'CONSUMPTION_PRIORITY_DATE', label: 'CONSUMPTION_PRIORITY_DATE', query: 'a.CONSUMPTION_PRIORITY_DATE' },
    { key: 'ON_HAND', label: 'ON_HAND', query: 'a.ON_HAND' },
    { key: 'ALLOCATED', label: 'ALLOCATED', query: 'a.ALLOCATED' },
    { key: 'AVAILABLE', label: 'AVAILABLE', query: '' },
    { key: 'CONDITION_CODE', label: 'CONDITION_CODE', query: 'c.CONDITION_CODE' },
    { key: 'TO_BE_FILLED', label: 'TO_BE_FILLED', query: 'a.TO_BE_FILLED' },
    { key: 'CREATED_TIMESTAMP', label: 'CREATED_TIMESTAMP', query: 'a.CREATED_TIMESTAMP' },
    { key: 'CURRENTDATE', label: 'CURRENTDATE', query: '' },

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