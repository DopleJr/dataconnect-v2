import React from 'react';
import Table from '../components/Table';

const OutboundB2c: React.FC = () => {
  const columns = [
    { key: 'UPDATED_TIMESTAMP', label: 'UPDATED_TIMESTAMP', query: 'out2.UPDATED_TIMESTAMP' },
    { key: 'ORIGINAL_ORDER_ID', label: 'ORIGINAL_ORDER_ID', query: 'out2.ORIGINAL_ORDER_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS_ID', query: 'out4.EXT_DHL_CUST_REF4' },
    { key: 'STATUS_DO', label: 'STATUS_DO', query: 'out2.MINIMUM_STATUS' },
    { key: 'DO_DESC', label: 'DO_DESC', query: '' },
    { key: 'DO_LINE', label: 'DO_LINE', query: 'out4.EXT_DHL_CUST_REF1' },
    { key: 'STO_LINE', label: 'STO_LINE', query: 'out4.EXT_DHL_CUST_REF2' },
    { key: 'ITEM_ID', label: 'ITEM_ID', query: 'out1.ITEM_ID' },
    { key: 'OLPN_ID', label: 'OLPN_ID', query: 'out1.OLPN_ID' },
    { key: 'PACKED_QUANTITY', label: 'PACKED_QUANTITY', query: 'out1.PACKED_QUANTITY' },
    { key: 'ORDER_TYPE', label: 'ORDER_TYPE', query: '' },
    { key: 'STATUS_OLPN', label: 'STATUS_OLPN', query: 'out3.STATUS' },
    { key: 'OLPN_DESC', label: 'OLPN_DESC', query: '' },
    { key: 'SHIP_TO', label: 'SHIP_TO', query: 'out2.EXT_DHL_CUSTOMER_SHIP_TO' },
    { key: 'CUSTOMER', label: 'CUSTOMER', query: '' },
    { key: 'CONTAINER_TYPE_ID', label: 'CONTAINER TYPE', query: '' },
    { key: 'CONTAINER_SIZE_ID', label: 'CONTAINER SIZE', query: '' },
    { key: 'UPDATED_TIMESTAMP_OLPN', label: 'UPDATED_TIMESTAMP_OLPN', query: 'out1.UPDATED_TIMESTAMP' },
    { key: 'CREATED_TIMESTAMP_DO', label: 'CREATED_TIMESTAMP_DO', query: 'out2.CREATED_TIMESTAMP' },
    { key: 'SO', label: 'SO', query: '' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Outbound Management</h1>
      <Table
        columns={columns}
        title="Outbound B2C Items"
        type="outboundb2c"
      />
    </div>
  );
};

export default OutboundB2c;