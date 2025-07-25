import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', async (req, res, next) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      startDate = '', 
      endDate = '',
      type = ''
    } = req.query;

    let tableName = '';
    let joinClause = '';
    let selectClause = '';
    let selectClauseTrace = '';
    let selectClauseTrace2 = '';
    let groupByClause = '';
    let orderByClause = '';
    let havingClause = '';
    let groupByTrace = '';
    let groupByTrace2 = '';
    let orderByClauseTrace = '';
    let closureAlias = '';

    if (type === 'stockinbound') {
      tableName = 'default_receiving.rcv_receipt inb';
      joinClause = `
      INNER JOIN 
        default_item_master.ite_item inb2 
      ON 
        inb.ITEM_ID=inb2.ITEM_ID 
        AND inb2.PROFILE_ID='ID_CID001683'
			  AND inb.BUSINESS_UNIT_ID ='CID001683'
        AND inb.ORG_ID ='ID_0344'
       LEFT JOIN 
        default_receiving.rcv_lpn inb3
      ON 
        inb.LPN_ID=inb3.LPN_ID`;
      selectClause = `
        inb.ASN_ID,
        inb.LPN_ID,
        inb.ITEM_ID,
        inb.INVENTORY_ATTRIBUTE1,
        inb.INVENTORY_ATTRIBUTE2,
        inb.PARENT_LPN_ID,
        inb.PRODUCT_STATUS_ID,
        DATE_FORMAT(inb.UPDATED_TIMESTAMP, '%Y-%m-%d %H:%i:%s') AS UPDATED_TIMESTAMP,
        CAST(inb.QUANTITY AS UNSIGNED) AS QUANTITY
        `;
      havingClause = `inb2.PROFILE_ID='ID_CID001683'
			  AND inb.BUSINESS_UNIT_ID ='CID001683'
        AND inb.ORG_ID ='ID_0344'
        AND inb3.LPN_STATUS='4000'`;
      orderByClause = 'ORDER BY inb.UPDATED_TIMESTAMP DESC';
      
    } else if (type === 'stockoutbound') {
      tableName = 'default_pickpack.ppk_olpn_detail out1';
      joinClause = `
        
        INNER JOIN default_dcorder.dco_original_order out2 ON out1.ORIGINAL_ORDER_ID = out2.ORIGINAL_ORDER_ID
        INNER JOIN default_dcorder.dco_order_line out4 ON out2.ORIGINAL_ORDER_ID = out4.original_order_id 
        AND out2.BUSINESS_UNIT_ID = out4.BUSINESS_UNIT_ID 
        AND out1.ORDER_LINE_ID = out4.ORDER_LINE_ID
        LEFT JOIN default_pickpack.ppk_olpn out3 ON out1.BUSINESS_UNIT_ID = out3.BUSINESS_UNIT_ID 
        AND out1.OLPN_ID = out3.OLPN_ID 
        `;
      selectClause = `
        DATE_FORMAT(out2.UPDATED_TIMESTAMP, '%Y-%m-%d %H:%i:%s') AS UPDATED_TIMESTAMP,
        out2.ORIGINAL_ORDER_ID,
        out4.EXT_DHL_CUST_REF4 AS PRODUCT_STATUS_ID,
        out2.MINIMUM_STATUS AS STATUS_DO,
        out4.EXT_DHL_CUST_REF1 AS DO_LINE,
        out4.EXT_DHL_CUST_REF2 AS STO_LINE,
        out1.ITEM_ID,
        out1.OLPN_ID,
        CAST(out1.PACKED_QUANTITY AS UNSIGNED) AS PACKED_QUANTITY,
        out2.ORDER_TYPE,
        out3.STATUS AS STATUS_OLPN,
        out2.EXT_DHL_CUSTOMER_SHIP_TO AS SHIP_TO,
        DATE_FORMAT(DATE_ADD(out1.UPDATED_TIMESTAMP, INTERVAL 7 HOUR), '%Y-%m-%d %H:%i:%s') AS UPDATED_TIMESTAMP_OLPN,
        DATE_FORMAT(DATE_ADD(out2.CREATED_TIMESTAMP, INTERVAL 7 HOUR), '%Y-%m-%d %H:%i:%s') AS CREATED_TIMESTAMP_DO,
        CASE
						WHEN LOCATE( 'DhlCustRef1', out2.JSON_STORE ) > 0 THEN
						SUBSTRING( out2.JSON_STORE, LOCATE( 'DhlCustRef1', out2.JSON_STORE ) + 15, 10 ) ELSE NULL 
        END AS SO `;
      havingClause = `
      out1.BUSINESS_UNIT_ID = 'CID001683'
      AND out3.STATUS = '8000'
      `;
      orderByClause = 'ORDER BY out2.UPDATED_TIMESTAMP DESC';

    }
    else if (type === 'stockinventory') {
      tableName = 'default_dcinventory.dci_inventory a';
      joinClause = `INNER JOIN 
          default_item_master.ite_item b 
      ON 
          a.ITEM_ID=b.ITEM_ID 
      LEFT JOIN 
          default_dcinventory.dci_container_condition c 
      ON 
          a.ILPN_ID=c.INVENTORY_CONTAINER_ID
          `;
      selectClause = `
        a.ORG_ID , 
        a.LOCATION_ID , 
        a.INVENTORY_CONTAINER_TYPE_ID , 
        a.ILPN_ID , 
        a.ITEM_ID , 
        b.DESCRIPTION , 
        b.STYLE , 
        a.INVENTORY_TYPE_ID , 
        a.PRODUCT_STATUS_ID , 
        a.INVENTORY_ATTRIBUTE1 , 
        a.IS_IN_TRANSIT ,
        IF(a.CONSUMPTION_PRIORITY_DATE IS NULL, 
       DATE_FORMAT('2999-01-01', '%Y-%m-%d %H:%i:%s'), 
       DATE_FORMAT(a.CONSUMPTION_PRIORITY_DATE, '%Y-%m-%d %H:%i:%s')) AS CONSUMPTION_PRIORITY_DATE , 
       CAST(a.ON_HAND AS UNSIGNED) AS ON_HAND,
       CAST(a.ALLOCATED AS UNSIGNED) AS ALLOCATED,
       CAST((a.ON_HAND - a.ALLOCATED) AS UNSIGNED) AS AVAILABLE, 
        c.CONDITION_CODE ,
        CAST(a.TO_BE_FILLED AS UNSIGNED) AS TO_BE_FILLED,
        DATE_FORMAT(a.CREATED_TIMESTAMP, '%Y-%m-%d %H:%i:%s') AS CREATED_TIMESTAMP ,
        DATE_FORMAT(DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL 7 HOUR), '%Y-%m-%d') AS CURRENTDATE`;
      havingClause = `
        b.PROFILE_ID='ID_CID001683'
			  AND a.BUSINESS_UNIT_ID ='CID001683'
        AND a.ORG_ID ='ID_0344'
        AND a.IS_IN_TRANSIT ='0'
       `;  
      orderByClause = 'ORDER BY  a.CREATED_TIMESTAMP DESC';
    }
    else if (type === 'tracetransaction') {
      tableName = ``;
      joinClause = ``;
      selectClauseTrace = `
            -- Main query for individual transaction records
      (SELECT
          transaction_type AS Transaction,
          item_id AS Item_ID,
          wms_reference AS WMS_Reference,
          sap_reference AS SAP_Reference,
          CAST(SUM(inbound_qty) AS UNSIGNED) AS QTY_INB,
          CAST(SUM(outbound_qty) AS UNSIGNED) AS QTY_OUT,
          SUM(adjustment_qty) AS QTY_ADJ,  -- Sum without casting to unsigned
          DATE_FORMAT(DATE_ADD(transaction_date, INTERVAL 7 HOUR), '%Y-%m-%d %H:%i:%s') AS LastTransactionDate
      FROM (
          SELECT
              'Inbound' AS transaction_type,
              inb.ASN_ID AS wms_reference,
              inb.ASN_ID AS sap_reference,
              inb.ITEM_ID AS item_id,
              CAST(inb.QUANTITY AS UNSIGNED) AS quantity,
              DATE_FORMAT(inb.UPDATED_TIMESTAMP, '%Y-%m-%d %H:%i:%s') AS transaction_date,
              CAST(inb.QUANTITY AS UNSIGNED) AS inbound_qty,
              0 AS outbound_qty,
              0 AS adjustment_qty
          FROM default_receiving.rcv_receipt inb
          INNER JOIN default_item_master.ite_item inb2 ON inb.ITEM_ID = inb2.ITEM_ID
          LEFT JOIN default_receiving.rcv_lpn inb3 ON inb.LPN_ID = inb3.LPN_ID
          WHERE inb.BUSINESS_UNIT_ID = 'CID001683' 
            AND inb3.LPN_STATUS = '4000'
            AND inb.ASN_ID IS NOT NULL
          
          UNION ALL
          
          SELECT
              'Outbound' AS transaction_type,
              out1.ORIGINAL_ORDER_ID,
              CASE
                  WHEN LOCATE( 'DhlCustRef1', out2.JSON_STORE ) > 0 THEN
                  SUBSTRING( out2.JSON_STORE, LOCATE( 'DhlCustRef1', out2.JSON_STORE ) + 15, 10 ) ELSE NULL 
              END AS sap_reference,
              out1.ITEM_ID,
              out1.PACKED_QUANTITY,
              DATE_FORMAT(out1.UPDATED_TIMESTAMP, '%Y-%m-%d %H:%i:%s'),
              0,
              CAST(out1.PACKED_QUANTITY AS UNSIGNED) AS outbound_qty,
              0
          FROM default_pickpack.ppk_olpn_detail out1
          INNER JOIN default_dcorder.dco_original_order out2 ON out1.ORIGINAL_ORDER_ID = out2.ORIGINAL_ORDER_ID
          WHERE out1.ORIGINAL_ORDER_ID IS NOT NULL
          
          UNION ALL
          
          SELECT
              'Adjustment' AS transaction_type,
              inv1.REASON_CODE_ID,
              inv1.REASON_CODE_ID,
              inv1.ITEM_ID,
              inv1.ADJUSTED_QUANTITY,
              inv1.UPDATED_TIMESTAMP,
              0,
              0,
              CAST(inv1.ADJUSTED_QUANTITY AS SIGNED) 
              -- inv1.ADJUSTED_QUANTITY  -- Keep the original value for adjustment
          FROM default_task.tsk_activity_tracking inv1
          WHERE inv1.REASON_CODE_ID IS NOT NULL
      ) AS transaction_data`;
      selectClauseTrace2 = `
      UNION ALL
      
        -- Total aggregation row
        SELECT
            'TOTAL' AS Transaction,
            item_id AS Item_ID,
            '-' AS WMS_Reference,
            '-' AS SAP_Reference,
            CAST(SUM(inbound_qty) AS SIGNED) AS QTY_INB,
            CAST(SUM(outbound_qty) AS SIGNED) AS QTY_OUT,
            CAST(SUM(adjustment_qty) AS SIGNED) AS QTY_ADJ,
            -- SUM(adjustment_qty) AS QUANTITY ADJUSTMENT,  -- Sum without casting to unsigned
            NULL AS LastTransactionDate
        FROM (
            SELECT
                inb.ITEM_ID AS item_id,
                CAST(inb.QUANTITY AS UNSIGNED) AS inbound_qty,
                0 AS outbound_qty,
                0 AS adjustment_qty
            FROM default_receiving.rcv_receipt inb
            INNER JOIN default_item_master.ite_item inb2 ON inb.ITEM_ID = inb2.ITEM_ID
            LEFT JOIN default_receiving.rcv_lpn inb3 ON inb.LPN_ID = inb3.LPN_ID
            WHERE inb.BUSINESS_UNIT_ID = 'CID001683' 
              AND inb3.LPN_STATUS = '4000'
              AND inb.ASN_ID IS NOT NULL
              
            
            UNION ALL
            
            SELECT
                out1.ITEM_ID,
                0,
                CAST(out1.PACKED_QUANTITY AS UNSIGNED) AS outbound_qty,
                0
            FROM default_pickpack.ppk_olpn_detail out1
            WHERE out1.ORIGINAL_ORDER_ID IS NOT NULL
              
            
            UNION ALL
            
            SELECT
                inv1.ITEM_ID,
                0,
                0,
                inv1.ADJUSTED_QUANTITY  -- Keep the original value for adjustment
            FROM default_task.tsk_activity_tracking inv1
            WHERE inv1.REASON_CODE_ID IS NOT NULL
        ) AS total_data`;
    groupByTrace = `
      GROUP BY 
      transaction_type,
      item_id,
      wms_reference,
      DATE_FORMAT(DATE_ADD(transaction_date, INTERVAL 7 HOUR), '%Y-%m-%d %H:%i:%s') `; 
    groupByTrace2 = `
      GROUP BY item_id`;   
    orderByClauseTrace = `
      ORDER BY LastTransactionDate DESC )   `;
    closureAlias = `AS total_data`
    } else if ( type === 'inboundallocation') {
      tableName = '';
      selectClauseTrace = `
      (SELECT
      out1.ORDER_ID AS Transfer_Order_Number, 
        out6.ORDER_LINE_PRIORITY AS Transfer_Order_Priority, 
        CAST(out4.ORIGINAL_ORDER_LINE_ID AS UNSIGNED )AS Transfer_Order_Item, 
        CAST(002 AS SIGNED ) AS Source_Storage_Type, 
        out1.ITEM_ID AS Article,
        out1.INVENTORY_CONTAINER_ID AS SSCC_Number,
        out3.PICK_LOCATION_ID AS Source_Storage_Bin,
        '' AS Carton_Number,
        DATE(out6.CREATED_TIMESTAMP) AS Creation_Date,
        IFNULL(out8.EXT_DHL_CUST_REF3,9999999999) AS GR_Number,
        IFNULL(DATE(out8.UPDATED_TIMESTAMP),DATE(out6.CREATED_TIMESTAMP)) AS GR_Date,
        out6.ORIGINAL_ORDER_LINE_ID ,
        CAST(SUM(out1.ORIGINAL_QUANTITY) AS SIGNED) AS Dest_target_quantity, 
        CAST(0 AS SIGNED) AS Actual_Qty, 
        '' AS User,
        '' AS Confirmation_Date,
        '' AS Confirmation_Time,
        out1.ORDER_ID AS Delivery,
        CAST(002 AS SIGNED ) AS Storage_Type,
        out6.ITEM_ATTRIBUTE1 AS PO_Number,
        SUBSTRING(out3.CUSTOMER_ID, 7) AS Store_ID,
        out3.DESTINATION_ADDRESS_FIRSTNAME AS Store_Name,	
        out4.EXT_DHL_CUST_REF5 AS Konsep,
        SUBSTRING_INDEX(out5.COLOR_SUFFIX , '-', -1) AS Code_Colour,
        SUBSTRING_INDEX(out5.COLOR , ',', 1) AS Colour_Description, 
        SUBSTRING_INDEX(out5.SIZE_DESCRIPTION , '-', -1) AS Code_Size,
        SUBSTRING_INDEX(out5.SIZE_DESCRIPTION , ',', 1) AS Size_Description,
        out1.GENERATION_NUMBER AS Wave_Number,
        out7.DESCRIPTION AS Wave_Status,
        out9.ASN_ID AS ASN_ID,
        out9.EXT_DHL_EXT_ASN_TYPE AS ASN_TYPE,
        out10.DESCRIPTION AS ASN_STATUS,
        IFNULL(out11.LOCATION_ID,'NOT PUTAWAY') AS LAST_LOCATION
      
      FROM
        default_dcinventory.dci_allocation AS out1
        INNER JOIN
        default_pickpack.ppk_olpn out3
        ON 
          out1.OLPN_ID = out3.OLPN_ID AND
          out1.ORG_ID= out3.ORG_ID
        
        INNER JOIN
        default_dcorder.dco_order_line out4
        ON 
          out1.ORDER_LINE_ID = out4.ORDER_LINE_ID AND
          out1.ITEM_ID = out4.ITEM_ID AND
          out1.ORG_ID= out4.ORG_ID
        
        INNER JOIN
        default_item_master.ite_item out5
        ON 
          out1.ITEM_ID = out5.ITEM_ID
          
        INNER JOIN
        default_pickpack.ppk_olpn_detail out6
        ON 
          out1.OLPN_ID = out6.OLPN_ID AND
          out1.ORG_ID= out6.ORG_ID AND
          out1.OLPN_DETAIL_ID = out6.OLPN_DETAIL_ID
          
        INNER JOIN
        default_dcinventory.dci_allocation_status out7
        ON 
          out1.STATUS = out7.STATUS 
        
        LEFT JOIN
        default_receiving.rcv_asn_line out8
        ON 
          out1.ITEM_ID = out8.ITEM_ID AND
          out1.INVENTORY_ATTRIBUTE1 = out8.INVENTORY_ATTRIBUTE1
        
        LEFT JOIN
        default_receiving.rcv_asn out9
        ON 
          out1.INVENTORY_ATTRIBUTE1 = out9.EXT_DHL_EXT_PO_NBR	
        
        LEFT JOIN
        default_receiving.rcv_asn_status out10
        ON 
          out9.ASN_STATUS = out10.ASN_STATUS_ID		
        
        LEFT JOIN
        default_dcinventory.dci_inventory out11
        ON	
          out1.INVENTORY_CONTAINER_ID = out11.ILPN_ID AND
          out1.ITEM_ID = out11.ITEM_ID
        
        `;
      
      
      groupByTrace = `
      GROUP BY
      out1.ORDER_ID, 
      out1.ITEM_ID,
      out1.OLPN_ID,
      out3.PICK_LOCATION_ID,
      out1.GENERATION_NUMBER,
      out4.ORIGINAL_ORDER_LINE_ID,
      out4.EXT_DHL_CUST_REF5,
      out5.DESCRIPTION,
      out5.SIZE_DESCRIPTION,
      out5.COLOR_SUFFIX,
      out5.COLOR,
      out6.ORDER_LINE_PRIORITY,
      out6.ITEM_ATTRIBUTE1,
      out6.ORIGINAL_ORDER_LINE_ID,
      out3.CUSTOMER_ID,
      out3.DESTINATION_ADDRESS_FIRSTNAME,
      out6.CREATED_TIMESTAMP,
      out7.DESCRIPTION,
      out1.INVENTORY_CONTAINER_ID,
      out8.EXT_DHL_CUST_REF3,
      out8.UPDATED_TIMESTAMP,
      out9.ASN_ID,
      out9.EXT_DHL_EXT_ASN_TYPE,
      out10.DESCRIPTION,
      out11.LOCATION_ID
      `;
      orderByClauseTrace = `
      ORDER BY
      out1.ORDER_ID,
	    out6.ORIGINAL_ORDER_LINE_ID)`;
      closureAlias = `AS total_data`;
    }
    

    // Build the WHERE clause
    const whereConditions = [];
    const whereConditionsTrace = [];
    const whereConditionsTrace2 = [];
    const queryParams = [];
    

    if (search &&
      type === 'stockinventory' ||
      type === 'stockinbound' ||
      type === 'stockoutbound' 
    ) {
      whereConditions.push(
        type === 'stockinventory' ? '(a.ITEM_ID LIKE ? OR b.DESCRIPTION LIKE ? OR a.ILPN_ID LIKE ? OR a.LOCATION_ID LIKE ?)' : 
        type === 'stockinbound' ? '(inb.ITEM_ID LIKE ? OR inb.LPN_ID LIKE ? OR inb.INVENTORY_ATTRIBUTE1 LIKE ? OR inb.ASN_ID LIKE ?)':
        type === 'stockoutbound' ? '(out1.ITEM_ID LIKE ? OR out1.OLPN_ID LIKE ? OR out2.ORIGINAL_ORDER_ID LIKE ? OR out2.EXT_DHL_CUSTOMER_SHIP_TO LIKE ?)' :
        '');
      queryParams.push(       
        `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      //queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (search && type === 'tracetransaction'  ) {
      whereConditionsTrace.push(
        type === 'tracetransaction' ? `WHERE transaction_data.item_id = '${search}'` : 
          '');
      whereConditionsTrace2.push(
        type === 'tracetransaction' ? `WHERE total_data.item_id = '${search}'` : 
          '');
      //queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }
    if (search && type === 'inboundallocation'  ) {
      whereConditionsTrace.push(
        type === 'inboundallocation' ?
          `WHERE out3.ORG_ID = 'ID_0344'
          AND out3.ORDER_TYPE IN ('B2B_A','B2B_MGR','B2B_M')
          OR out1.ITEM_ID IN ('${search}')
          OR out1.INVENTORY_CONTAINER_ID IN ('${search}')
          OR out1.GENERATION_NUMBER IN ('${search}')
          ` : 
          '');
    }

    // Get the current date and format it as needed
    //const currentDate = new Date();
    //const DEFAULT_START_DATE = new Date(currentDate.getTime() - 86400000).toISOString();// Format: YYYY-MM-DD HH:MM:SS
    //const DEFAULT_END_DATE = currentDate.toISOString();   // Format: YYYY-MM-DD HH:MM:SS

    // Check if startDate and endDate are provided
    if (startDate) {
      whereConditions.push(
        type === 'stockinventory' ? 'a.CREATED_TIMESTAMP >= ?' : 
        type === 'stockinbound' ? 'inb.UPDATED_TIMESTAMP >= ?' :
        type === 'stockoutbound' ? 'DATE_ADD(out1.UPDATED_TIMESTAMP, INTERVAL 7 HOUR) >= ?' :
          '');
      queryParams.push(startDate);
    } 

    if (endDate) {
      whereConditions.push(
        type === 'stockinventory' ? 'a.CREATED_TIMESTAMP <= ?' :
        type === 'stockinbound' ? 'inb.UPDATED_TIMESTAMP <= ?' :
        type === 'stockoutbound' ? 'DATE_ADD(out1.UPDATED_TIMESTAMP, INTERVAL 7 HOUR) <= ?' :
              '');
      queryParams.push(endDate);
    } 

    
    // Get paginated results
    let whereClause = ``;
    if (
      type === 'stockinventory' ||
      type === 'stockinbound' ||
      type === 'stockoutbound' 
    ) {
      whereClause = whereConditions.length 
      ? `WHERE  ${whereConditions.join(' AND ')} AND ${havingClause} ` 
      : `WHERE  ${havingClause}`;
      }
      else if (type === 'tracetransaction'  ) {
        whereClause = ``;
    }
      else if (type === 'inboundallocation'  ) {
        whereClause = ``;
    }
    
    
    const countQuery = `SELECT COUNT(*) as total_count FROM ${tableName} ${joinClause} ${whereClause} ${selectClauseTrace} ${whereConditionsTrace} ${groupByTrace} ${selectClauseTrace2} ${whereConditionsTrace2} ${groupByTrace2} ${orderByClauseTrace} ${closureAlias}`;
    console.log('Count Query:', countQuery);
    console.log('Query Params:', queryParams);

    const [countResult] = await db.query(countQuery, queryParams);
    console.log('Count Result:', countResult);

    if (!countResult || !countResult.total_count) {
      console.log('Invalid count result. Returning empty data.');
      return res.json({
        data: [],
        totals: 0,
        page: Number(page),
        totalPages: 0
      });
    }

    const totals = countResult.total_count;
    console.log('Totals:', totals);

    if (totals === 0) {
      console.log('Totals is 0. Returning empty data.');
      return res.json({
        data: [],
        totals: 0,
        page: Number(page),
        totalPages: 0
      });
    }

    // Calculate offset
    const offset = (Number(page) - 1) * Number(limit);

    // Get paginated results
    let paginatedQuery = ``;
    if (
      type === 'stockinventory' ||
      type === 'stockinbound' ||
      type === 'stockoutbound' 
      ) {
      paginatedQuery = `SELECT ${selectClause} FROM ${tableName} ${joinClause} ${whereClause}    
      LIMIT ? OFFSET ?`;
      }
      else if (type === 'tracetransaction'  ) {
        paginatedQuery = `${selectClauseTrace} ${whereConditionsTrace} ${groupByTrace} ${selectClauseTrace2} ${whereConditionsTrace2} ${groupByTrace2} ${orderByClauseTrace} 
      LIMIT ? OFFSET ?`;
    }
    else if (type === 'inboundallocation'  ) {
      paginatedQuery = `${selectClauseTrace} ${whereConditionsTrace} ${groupByTrace} ${selectClauseTrace2} ${whereConditionsTrace2} ${groupByTrace2} ${orderByClauseTrace} 
      LIMIT ? OFFSET ?`;
    }
    console.log('Paginated Query:', paginatedQuery);
    console.log('Paginated Query Params:', [...queryParams, Number(limit), offset]);

    try {
      const items = await db.query(paginatedQuery, [...queryParams, Number(limit), offset]);
      console.log(`Success Retrieve Data ${type}.`);
      res.json({
        data: items,
        totals,
        page: Number(page),
        totalPages: Math.ceil(totals / Number(limit))
      });
    } catch (error) {
      console.log('Error occurred while fetching paginated results:', error);
      next(error);
    }
  } catch (error) {
    console.log('Error occurred:', error);
    next(error);
  }
});

// Get dashboard statistics
router.get('/stats', async (req, res, next) => {
  try {
    // Get total inventory
    const [totalInventory] = await db.query(
      `SELECT
          FORMAT(SUM(ON_HAND - ALLOCATED), 0, 'id_ID') as total  
      FROM 
          default_dcinventory.dci_inventory 
      WHERE 
          BUSINESS_UNIT_ID='CID001683' 
          AND IS_IN_TRANSIT = 0
          LIMIT 1;
      `
    );

    // Get total inbound
    const [totalInbound] = await db.query(
      `SELECT
          FORMAT(SUM(QUANTITY), 0, 'id_ID') as total
      FROM
          default_receiving.rcv_receipt
      WHERE BUSINESS_UNIT_ID = 'CID001683'
      LIMIT 1;
      `
    );

    // Get total outbound
    const [totalOutbound] = await db.query(
      `SELECT
          FORMAT(SUM(PACKED_QUANTITY), 0, 'id_ID') as total
      FROM
          default_pickpack.ppk_olpn_detail
      WHERE BUSINESS_UNIT_ID = 'CID001683'
      LIMIT 1;
      `
    );

    console.log('Total Inventory Result:', totalInventory.total);
    console.log('Total Inbound Result:', totalInbound.total);
    console.log('Total Outbound Result:', totalOutbound.total);
      
    res.json({
      totalInventory: (totalInventory.total || 0).toLocaleString('id-ID'),
      totalInbound: (totalInbound.total || 0).toLocaleString('id-ID'),
      totalOutbound: (totalOutbound.total || 0).toLocaleString('id-ID')
    });
  } catch (error) {
    next(error);
  }
});

// Get a record by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [records] = await db.query('SELECT * FROM default_inventory_management WHERE id = ?', [id]);
    
    if (records.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(records[0]);
  } catch (error) {
    next(error);
  }
});

// Create a new record
router.post('/', async (req, res, next) => {
  try {
    const { name, description, price, stock } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO default_inventory_management (name, description, price, stock) VALUES (?, ?, ?, ?)',
      [name, description || '', price, stock || 0]
    );
    
    const [newRecord] = await db.query('SELECT * FROM default_inventory_management WHERE id = ?', [result.insertId]);
    res.status(201).json(newRecord[0]);
  } catch (error) {
    next(error);
  }
});

// Update a record
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    
    if (!name || price === undefined) {
      return res.status(400).json({ error: 'Name and price are required' });
    }
    
    const [existingRecord] = await db.query('SELECT * FROM default_inventory_management WHERE id = ?', [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    await db.query(
      'UPDATE default_inventory_management SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?',
      [name, description || '', price, stock || 0, id]
    );
    
    const [updatedRecord] = await db.query('SELECT * FROM default_inventory_management WHERE id = ?', [id]);
    res.json(updatedRecord[0]);
  } catch (error) {
    next(error);
  }
});

// Delete a record
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [existingRecord] = await db.query('SELECT * FROM default_inventory_management WHERE id = ?', [id]);
    if (existingRecord.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    await db.query('DELETE FROM default_inventory_management WHERE id = ?', [id]);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
});

export default router;