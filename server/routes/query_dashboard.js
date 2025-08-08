import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get order summary dashboard data
router.get('/order-summary', async (req, res, next) => {
  try {
    const { 
      startDate = '', 
      endDate = '', 
      orderTypes = '',
      page = 1,
      limit = 1000
    } = req.query;

    // Build WHERE conditions
    const whereConditions = [];
    const queryParams = [];

    // Base conditions
    whereConditions.push(`out1.BUSINESS_UNIT_ID = 'CID001683'`);
    whereConditions.push(`out2.MINIMUM_STATUS IN ('1000', '2090', '7200', '8000', '9000')`);
    whereConditions.push(`out2.ORDER_TYPE IN ('TO_B2B', 'B2C_SHP', 'B2C_ZLR', 'B2C_COM', 'B2B_C', 'B2B_A', 'B2B_MGR', 'B2B_M', 'TO_B2C')`);

    // Date range filter
    if (startDate) {
      whereConditions.push(`out2.CREATED_TIMESTAMP >= ?`);
      queryParams.push(`${startDate} 00:00:00`);
    }
    if (endDate) {
      whereConditions.push(`out2.CREATED_TIMESTAMP <= ?`);
      queryParams.push(`${endDate} 23:59:59`);
    }

    // Order type filter
    if (orderTypes) {
      const types = orderTypes.split(',').map(type => type.trim()).filter(type => type);
      if (types.length > 0) {
        const placeholders = types.map(() => '?').join(',');
        whereConditions.push(`out2.ORDER_TYPE IN (${placeholders})`);
        queryParams.push(...types);
      }
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Main query
    const mainQuery = `
      SELECT
        DATE_FORMAT( DATE_ADD( out2.CREATED_TIMESTAMP, INTERVAL 7 HOUR ), '%Y-%m-%d' ) AS CREATION_DATE,
        out2.ORDER_TYPE,
        COUNT(DISTINCT CASE WHEN out2.MINIMUM_STATUS = '1000' THEN out2.ORIGINAL_ORDER_ID END) AS Released_Ord,
        COUNT(DISTINCT CASE WHEN out2.MINIMUM_STATUS = '2090' THEN out2.ORIGINAL_ORDER_ID END) AS Allocated_Ord,
        COUNT(DISTINCT CASE WHEN out2.MINIMUM_STATUS = '7200' THEN out2.ORIGINAL_ORDER_ID END) AS Packed_Ord,
        COUNT(DISTINCT CASE WHEN out2.MINIMUM_STATUS = '8000' THEN out2.ORIGINAL_ORDER_ID END) AS Shipped_Ord,
        CAST( COUNT( DISTINCT out2.ORIGINAL_ORDER_ID) AS SIGNED ) AS Total_Order,
        CAST(SUM(CASE WHEN out2.MINIMUM_STATUS = '1000' THEN out1.INITIAL_QUANTITY ELSE 0 END) AS SIGNED ) AS Released_Qty,
        CAST(SUM(CASE WHEN out2.MINIMUM_STATUS = '2090' THEN out1.INITIAL_QUANTITY ELSE 0 END) AS SIGNED ) AS Allocated_Qty,
        CAST(SUM(CASE WHEN out2.MINIMUM_STATUS = '7200' THEN out1.INITIAL_QUANTITY ELSE 0 END) AS SIGNED ) AS Packed_Qty,
        CAST(SUM(CASE WHEN out2.MINIMUM_STATUS = '8000' THEN out1.INITIAL_QUANTITY ELSE 0 END) AS SIGNED ) AS Shipped_Qty,
        CAST( SUM(out1.INITIAL_QUANTITY) AS SIGNED ) AS Total_Qty
      FROM
        default_pickpack.ppk_olpn_detail out1
        INNER JOIN default_dcorder.dco_original_order out2 ON out1.ORIGINAL_ORDER_ID = out2.ORIGINAL_ORDER_ID
        INNER JOIN default_dcorder.dco_order_line out4 ON out2.ORIGINAL_ORDER_ID = out4.original_order_id 
        AND out2.BUSINESS_UNIT_ID = out4.BUSINESS_UNIT_ID 
        AND out1.ORDER_LINE_ID = out4.ORDER_LINE_ID
        LEFT JOIN default_pickpack.ppk_olpn out3 ON out1.BUSINESS_UNIT_ID = out3.BUSINESS_UNIT_ID 
        AND out1.OLPN_ID = out3.OLPN_ID 
      ${whereClause}
      GROUP BY
        DATE_FORMAT( DATE_ADD( out2.CREATED_TIMESTAMP, INTERVAL 7 HOUR ), '%Y-%m-%d' ),
        out2.ORDER_TYPE
      ORDER BY 
        CREATION_DATE DESC,
        out2.ORDER_TYPE
      LIMIT ? OFFSET ?
    `;

    // Count query for pagination
    const countQuery = `
      SELECT COUNT(*) as total_count FROM (
        SELECT
          DATE_FORMAT( DATE_ADD( out2.CREATED_TIMESTAMP, INTERVAL 7 HOUR ), '%Y-%m-%d' ) AS CREATION_DATE,
          out2.ORDER_TYPE
        FROM
          default_pickpack.ppk_olpn_detail out1
          INNER JOIN default_dcorder.dco_original_order out2 ON out1.ORIGINAL_ORDER_ID = out2.ORIGINAL_ORDER_ID
          INNER JOIN default_dcorder.dco_order_line out4 ON out2.ORIGINAL_ORDER_ID = out4.original_order_id 
          AND out2.BUSINESS_UNIT_ID = out4.BUSINESS_UNIT_ID 
          AND out1.ORDER_LINE_ID = out4.ORDER_LINE_ID
          LEFT JOIN default_pickpack.ppk_olpn out3 ON out1.BUSINESS_UNIT_ID = out3.BUSINESS_UNIT_ID 
          AND out1.OLPN_ID = out3.OLPN_ID 
        ${whereClause}
        GROUP BY
          DATE_FORMAT( DATE_ADD( out2.CREATED_TIMESTAMP, INTERVAL 7 HOUR ), '%Y-%m-%d' ),
          out2.ORDER_TYPE
      ) as grouped_data
    `;

    console.log('Order Summary Query:', mainQuery);
    console.log('Query Params:', queryParams);

    // Get total count
    const [countResult] = await db.query(countQuery, queryParams);
    const total = countResult?.total_count || 0;

    if (total === 0) {
      return res.json({
        data: [],
        total: 0,
        page: Number(page),
        totalPages: 0
      });
    }

    // Calculate offset
    const offset = (Number(page) - 1) * Number(limit);

    // Get paginated results
    const items = await db.query(mainQuery, [...queryParams, Number(limit), offset]);
    
    console.log(`Order Summary Success! Total: ${total}, Page: ${page}`);
    
    res.json({
      data: items,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });

  } catch (error) {
    console.error('Order Summary Error:', error);
    next(error);
  }
});

export default router;