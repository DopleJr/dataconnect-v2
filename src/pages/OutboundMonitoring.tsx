import React from 'react';
import Table from '../components/Table';

const OutboundMonitoring: React.FC = () => {
  const columns = [
    { key: 'CREATION_DATE', label: 'CREATION_DATE', query: 'out2.CREATED_TIMESTAMP' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT_STATUS', query: 'out1.PRODUCT_STATUS_ID' },
    { key: 'ORDER_TYPE', label: 'ORDER_TYPE', query: 'out2.ORDER_TYPE' },
    { key: 'DO_DESC', label: 'DO_DESC', query: 'out2.MINIMUM_STATUS' },
    { key: 'COUNT_ORDER', label: 'COUNT_ORDER', query: '' },
    { key: 'SUM_ORDER', label: 'SUM_ORDER', query: '' },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Outbound Management</h1>
      <Table
        columns={columns}
        title="Outbound Monitoring"
        type="outboundmonitoring"
      />
    </div>
  );
};

export default OutboundMonitoring;