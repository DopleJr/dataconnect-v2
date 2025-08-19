import React from 'react';
import Table from '../components/Table';

const OutboundSto: React.FC = () => {
  const columns = [
    { key: 'UPDATED_TIMESTAMP_DO', label: 'UPDATED_TIMESTAMP_DO', query: 'out4.UPDATED_TIMESTAMP' },
    { key: 'ORDER_TYPE', label: 'ORDER_TYPE', query: 'out2.ORDER_TYPE' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS', query: 'out4.PRODUCT_STATUS_ID' },
    { key: 'SHIP_TO', label: 'SHIP_TO', query: 'out2.EXT_DHL_CUSTOMER_SHIP_TO' },
    { key: 'ORDER_ID', label: 'ORDER_ID', query: 'out4.ORDER_ID' },
    { key: 'ORIGINAL_ORDER_ID', label: 'ORIGINAL_ORDER_ID', query: 'out2.ORIGINAL_ORDER_ID' },
    { key: 'STATUS_LINE', label: 'STATUS_LINE', query: 'out4.STATUS' },
    { key: 'DO_LINE', label: 'DO_LINE', query: '' },
    { key: 'ITEM_ID', label: 'ITEM_ID', query: '' },
    { key: 'CONCEPT', label: 'CONCEPT', query: 'out4.EXT_DHL_CUST_REF5' },
    { key: 'ORDERED', label: 'ORDERED', query: '' },
    { key: 'ALLOCATED', label: 'ALLOCATED', query: '' },
    { key: 'PACKED', label: 'PACKED', query: '' },
    { key: 'SHIPPED', label: 'SHIPPED', query: '' },
    { key: 'UPDATED_TIMESTAMP_LINE', label: 'UPDATED_TIMESTAMP_OLPN', query: '' },
    { key: 'CREATED_TIMESTAMP_DO', label: 'CREATED_TIMESTAMP_DO', query: 'out4.CREATED_TIMESTAMP' },
    { key: 'SO', label: 'SO', query: '' },
    { key: 'Wave', label: 'WAVE', query: 'out4.ORDER_PLANNING_RUN_ID' },
    { key: 'LAST_STATUS', label: 'LAST_STATUS', query: '' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inventory Management</h1>
      <Table
        columns={columns}
        title="Outbound Sto"
        type="outboundsto"
      />
    </div>
  );
};

export default OutboundSto;