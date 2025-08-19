import React from 'react';
import Table from '../components/Table';

const OutboundAppsFormat: React.FC = () => {
  const columns = [
    { key: 'SHIPPED_DATE_TIME', label: 'Shipped Date Time', query: 'out4.SHIPPED_DATE_TIME' },
    { key: 'ORDER_CUST_REF1', label: 'Order CustRef1', query: '' },
    { key: 'ORDER_CUST_REF6', label: 'Order CustRef6', query: '' },
    { key: 'ORDER_STATUS_DESCRIPTION', label: 'Order Status Description', query: 'out4.STATUS' },
    { key: 'ORDER_PLANNING_RUN_ID', label: 'Order Planning Run ID', query: 'out4.ORDER_PLANNING_RUN_ID' },
    { key: 'ORDER_TYPE', label: 'ORD_TYPE', query: 'out2.ORDER_TYPE' },
    { key: 'SHIPTO', label: 'SHIPTO', query: 'out2.EXT_DHL_CUSTOMER_SHIP_TO' },
    { key: 'DESTINATION_ADDRESS_FIRSTNAME', label: 'Destination Address First Name', query: '' },
    { key: 'ORDER_ID', label: 'Manhattan Order Number', query: 'out4.ORDER_ID' },
    { key: 'ORIGINAL_ORDER_ID', label: 'Original Order ID', query: 'out4.ORIGINAL_ORDER_ID' },
    { key: 'ORDER_LINE_ID', label: 'Order Line ID', query: 'out4.ORDER_LINE_ID' },
    { key: 'ITEM_ID', label: 'Item ID', query: 'out4.ITEM_ID' },
    { key: 'ITEM_DESCRIPTION', label: 'Item Desc', query: '' },
    { key: 'ITEM_STYLE', label: 'Item Style', query: 'out4.EXT_DHL_CUST_REF5' },
    { key: 'INITIAL_QUANTITY', label: 'Initial Quantity', query: '' },
    { key: 'PACKED_QUANTITY', label: 'Packed Quantity', query: '' },
    { key: 'ORDER_UPDATED_BY', label: 'Order Updated By', query: 'out6.UPDATED_BY' },
    { key: 'PACKER', label: 'Packer ID', query: '' },
    { key: 'OLPN_ID', label: 'OLPN ID', query: 'out3.OLPN_ID' },
    { key: 'CONTAINER_TYPE_ID', label: 'Container Type', query: '' },
    { key: 'CONTAINER_SIZE_ID', label: 'Container Size', query: '' },
    { key: 'CURRENT_LOCATION', label: 'Current Location ID', query: 'out3.PICK_LOCATION_ID' },
    { key: 'PRODUCT_STATUS_ID', label: 'Product Status ID', query: 'out1.PRODUCT_STATUS_ID' },
    { key: 'SHIPMENT_SEAL_ID', label: 'Shipment Seal Number', query: '' },
    { key: 'TRAILER_ID', label: 'Trailer ID', query: '' },
    { key: 'SHIPMENT_ID', label: 'Shipment ID', query: '' },
    { key: 'FACILITY_LPN_CREATED_TIMESTAMP', label: 'Facility - LPN Created Timestamp', query: 'out2.CREATED_TIMESTAMP ' },
    { key: 'FACILITY_LPN_UPDATED_TIMESTAMP', label: 'Facility - LPN Updated Timestamp', query: 'out2.UPDATED_TIMESTAMP' },
    { key: 'LPN_STATUS_DESCRIPTION', label: 'LPN Status description', query: 'out7.DESCRIPTION' },
    { key: 'TASK_ID', label: 'Task ID', query: 'out6.TASK_ID' },
    

  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Outbound Management</h1>
      <Table
        columns={columns}
        title="Outbound Apps Format"
        type="outboundappsformat"
      />
    </div>
  );
};

export default OutboundAppsFormat;