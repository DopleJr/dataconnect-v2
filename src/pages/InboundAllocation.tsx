import React from 'react';
import Table from '../components/Table';

const InboundAllocation: React.FC = () => {
  const columns = [
    { key: 'Transfer_Order_Number', label: 'Transfer Order Number', query: 'out1.ORDER_ID' },
    { key: 'Transfer_Order_Priority', label: 'Transfer Order Priority', query: 'out6.ORDER_LINE_PRIORITY' },
    { key: 'Transfer_Order_Item', label: 'Transfer Order Item', query: 'out4.ORIGINAL_ORDER_LINE_ID' },
    { key: 'Source_Storage_Type', label: 'Source Storage Type', query: '' },
    { key: 'Article', label: 'Article', query: 'out1.ITEM_ID' },
    { key: 'SSCC_Number', label: 'SSCC Number', query: 'out1.INVENTORY_CONTAINER_ID' },
    { key: 'Source_Storage_Bin', label: 'Source Storage Bin', query: 'out3.PICK_LOCATION_ID' },
    { key: 'Carton_Number', label: 'Carton Number', query: '' },
    { key: 'Creation_Date', label: 'Creation Date', query: 'out6.CREATED_TIMESTAMP' },
    { key: 'GR_Number', label: 'GR Number', query: 'out8.EXT_DHL_CUST_REF3' },
    { key: 'GR_Date', label: 'GR Date', query: 'out8.UPDATED_TIMESTAMP' },
    { key: 'Dest_target_quantity', label: 'Dest.Target Quantity', query: '' },
    { key: 'Actual_Qty', label: 'Actual Qty', query: '' },
    { key: 'User', label: 'User', query: '' },
    { key: 'Confirmation_Date', label: 'Confirmation Date', query: '' },
    { key: 'Confirmation_Time', label: 'Confirmation Time', query: '' },
    { key: 'Delivery', label: 'Delivery', query: 'out1.ORDER_ID' },
    { key: 'Storage_Type', label: 'Storage Type', query: '' },
    { key: 'PO_Number', label: 'PO Number', query: 'out6.ITEM_ATTRIBUTE1' },
    { key: 'Store_ID', label: 'Store ID', query: 'out3.CUSTOMER_ID' },
    { key: 'Store_Name', label: 'Store Name', query: 'out3.DESTINATION_ADDRESS_FIRSTNAME' },
    { key: 'Konsep', label: 'Konsep', query: 'out4.EXT_DHL_CUST_REF5' },
    { key: 'Code_Colour', label: 'Code Colour', query: 'out5.COLOR_SUFFIX' },
    { key: 'Colour_Description', label: 'Colour Description', query: 'out5.COLOR' },
    { key: 'Code_Size', label: 'Code Size', query: 'out5.SIZE_CODE' },
    { key: 'Size_Description', label: 'Size Description', query: 'out5.SIZE_DESCRIPTION' },
    { key: 'Wave_Number', label: 'Wave Number', query: 'out1.GENERATION_NUMBER' },
    { key: 'OLPN_ID', label: 'OLPN ID', query: 'out1.OLPN_ID' },
    { key: 'LAST_LOCATION', label: 'LAST LOCATION', query: 'out11.LOCATION_ID' },
    { key: 'PARENT_CONTAINER_ID', label: 'PALLET ID', query: '' }, 
    { key: 'Wave_Status', label: 'Wave Status', query: 'out7.DESCRIPTION' },
    { key: 'ASN_ID', label: 'ASN ID', query: 'out9.ASN_ID' },
    { key: 'EXT_DHL_CUST_REF7', label: 'ON', query: 'out9.EXT_DHL_CUST_REF7' },
    { key: 'PRODUCT_STATUS_ID', label: 'PRODUCT STATUS ID', query: 'out1.PRODUCT_STATUS_ID' },
    { key: 'ORDER_TYPE', label: 'ORDER TYPE', query: 'out3.ORDER_TYPE' },
    { key: 'LPN_STATUS', label: 'LPN STATUS', query: 'out12.DESCRIPTION' },
       
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Inbound Management</h1>
      <Table
        columns={columns}
        title="Inbound Allocation"
        type="inboundallocation"
      />
    </div>
  );
};

export default InboundAllocation;