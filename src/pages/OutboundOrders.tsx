import React from 'react';
import Table from '../components/Table';

const OutboundOrders: React.FC = () => {
  const columns = [
    { key: 'Transfer_Order_Number', label: 'Transfer Order Number' },
    { key: 'Transfer_Order_Priority', label: 'Transfer Order Priority' },
    { key: 'Transfer_Order_Item', label: 'Transfer Order Item' },
    { key: 'Source_Storage_Type', label: 'Source Storage Type' },
    { key: 'Article', label: 'Article' },
    { key: 'SSCC_Number', label: 'SSCC Number' },
    { key: 'Source_Storage_Bin', label: 'Source Storage Bin' },
    { key: 'Carton_Number', label: 'Carton Number' },
    { key: 'Creation_Date', label: 'Creation Date' },
    { key: 'GR_Number', label: 'GR Number' },
    { key: 'GR_Date', label: 'GR Date' },
    { key: 'Dest_target_quantity', label: 'Dest.Target Quantity' },
    { key: 'Actual_Qty', label: 'Actual Qty' },
    { key: 'User', label: 'User' },
    { key: 'Confirmation_Date', label: 'Confirmation Date' },
    { key: 'Confirmation_Time', label: 'Confirmation Time' },
    { key: 'Delivery', label: 'Delivery' },
    { key: 'Storage_Type', label: 'Storage Type' },
    { key: 'PO_Number', label: 'PO Number' },
    { key: 'Store_ID', label: 'Store ID' },
    { key: 'Store_Name', label: 'Store Name' },
    { key: 'Konsep', label: 'Konsep' },
    { key: 'Code_Colour', label: 'Code Colour' },
    { key: 'Colour_Description', label: 'Colour Description' },
    { key: 'Code_Size', label: 'Code Size' },
    { key: 'Size_Description', label: 'Size Description' },
    { key: 'Wave_Number', label: 'WAVE NUMBER' },
    { key: 'TASK_ID', label: 'TASK ID' },
    { key: 'OLPN_ID', label: 'OLPN ID' },
    { key: 'OLPN_ID2', label: 'OLPN ID2' },
    { key: 'LAST_LOCATION', label: 'LAST LOCATION' },
    { key: 'PARENT_CONTAINER_ID', label: 'PALLET ID' }, 
    { key: 'Wave_Status', label: 'WAVE STATUS' },
    { key: 'ASN_ID', label: 'ASN ID' },
    { key: 'EXT_DHL_CUST_REF7', label: 'ON' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT STATUS ID' },
    { key: 'ORDER_TYPE', label: 'ORDER TYPE' },
    
    { key: 'LPN_STATUS', label: 'LPN STATUS' },
       
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