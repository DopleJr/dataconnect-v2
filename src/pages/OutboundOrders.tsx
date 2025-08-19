import React from 'react';
import Table from '../components/Table';

const OutboundOrders: React.FC = () => {
  const columns = [
    { key: 'Transfer_Order_Number', label: 'Transfer Order Number', query: 'out1.ORDER_ID' },
    { key: 'Transfer_Order_Priority', label: 'Transfer Order Priority', query: '' },
    { key: 'Transfer_Order_Item', label: 'Transfer Order Item', query: '' },
    { key: 'Source_Storage_Type', label: 'Source Storage Type', query: '' },
    { key: 'Article', label: 'Article', query: 'out1.ITEM_ID' },
    { key: 'SSCC_Number', label: 'SSCC Number', query: '' },
    { key: 'Source_Storage_Bin', label: 'Source Storage Bin', query: 'out3.LOCATION_ID' },
    { key: 'Carton_Number', label: 'Carton Number', query: '' },
    { key: 'Creation_Date', label: 'Creation Date', query: 'out3.CREATED_TIMESTAMP' },
    { key: 'GR_Number', label: 'GR Number', query: '' },
    { key: 'GR_Date', label: 'GR Date', query: '' },
    { key: 'Dest_target_quantity', label: 'Dest.Target Quantity', query: '' },
    { key: 'Actual_Qty', label: 'Actual Qty', query: '' },
    { key: 'USER', label: 'User', query: '' },
    { key: 'Confirmation_Date', label: 'Confirmation Date', query: 'out5.UPDATED_TIMESTAMP' },
    { key: 'Confirmation_Time', label: 'Confirmation Time', query: '' },
    { key: 'Delivery', label: 'Delivery', query: '' },
    { key: 'Storage_Type', label: 'Storage Type', query: '' },
    { key: 'PO_Number', label: 'PO Number', query: '' },
    { key: 'Store_ID', label: 'Store ID', query: 'out3.CUSTOMER_ID' },
    { key: 'Store_Name', label: 'Store Name', query: '' },
    { key: 'Konsep', label: 'Konsep', query: '' },
    { key: 'Code_Colour', label: 'Code Colour', query: '' },
    { key: 'Colour_Description', label: 'Colour Description', query: '' },
    { key: 'Code_Size', label: 'Code Size', query: '' },
    { key: 'Size_Description', label: 'Size Description', query: '' },
    { key: 'Wave_Number', label: 'WAVE NUMBER', query: 'out3.GENERATION_NUMBER' },
    { key: 'TASK_ID', label: 'TASK ID', query: 'out9.TASK_ID' },
    { key: 'OLPN_1ST', label: 'OLPN 1ST', query: 'out3.OLPN_ID' },
    { key: 'OLPN_2ND', label: 'OLPN 2ND', query: '' },
    //{ key: 'PARENT_CONTAINER_ID', label: 'PALLET ID', query: '' }, 
    //{ key: 'Wave_Status', label: 'WAVE STATUS', query: '' },
    { key: 'ASN_ID', label: 'ASN ID', query: 'out7.ASN_ID' },
    { key: 'ORD_NBR', label: 'ORD NBR', query: 'out7.EXT_DHL_CUST_REF7' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT STATUS ID', query: '' },
    { key: 'ORDER_TYPE', label: 'ORDER TYPE', query: 'out2.ORDER_TYPE' },
    { key: 'LPN_STATUS', label: 'LPN STATUS', query: '' },
    { key: 'LAST_LOCATION', label: 'LAST LOCATION', query: '' },
       
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Outbound Management</h1>
      <Table
        columns={columns}
        title="Outbound Items"
        type="outboundorders"
      />
    </div>
  );
};

export default OutboundOrders;