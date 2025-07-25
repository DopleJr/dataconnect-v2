# Inventory Module Tutorial

## 1. Modifying Database Queries

### 1.1 Table Structure
The inventory system uses three main tables:
- `default_inventory_management`: Main inventory table
- `default_inbound_management`: Inbound transactions
- `default_outbound_management`: Outbound transactions

### 1.2 Modifying Queries in query.js

#### Dashboard Statistics
To modify dashboard card statistics, edit the `/stats` endpoint in `server/routes/query.js`:

```javascript
router.get('/stats', async (req, res, next) => {
  try {
    // Modify these queries to change dashboard statistics
    const [totalInventory] = await db.query(
      'SELECT COUNT(*) as total FROM default_inventory_management'
    );

    // Example: Get total value of inventory
    const [totalValue] = await db.query(
      'SELECT SUM(price * stock) as total FROM default_inventory_management'
    );

    // Example: Get low stock items
    const [lowStock] = await db.query(
      'SELECT COUNT(*) as total FROM default_inventory_management WHERE stock < 10'
    );

    res.json({
      totalInventory: totalInventory[0].total || 0,
      totalValue: totalValue[0].total || 0,
      lowStock: lowStock[0].total || 0
    });
  } catch (error) {
    next(error);
  }
});
```

#### Table Queries
To modify table data queries, update the main GET endpoint:

```javascript
router.get('/', async (req, res, next) => {
  try {
    // Modify table selection based on type
    if (type === 'inventory') {
      tableName = 'default_inventory_management';
      selectClause = 'i.*, COALESCE(inb.total_inbound, 0) as total_inbound';
      joinClause = `
        LEFT JOIN (
          SELECT product_id, SUM(quantity) as total_inbound 
          FROM default_inbound_management 
          GROUP BY product_id
        ) inb ON i.id = inb.product_id
      `;
    }

    // Add custom WHERE conditions
    if (customFilter) {
      whereConditions.push('i.stock < ?');
      queryParams.push(10); // Example: Low stock threshold
    }
  } catch (error) {
    next(error);
  }
});
```

## 2. Modifying Table Columns

### 2.1 Adding/Removing Columns in React Components

#### Step 1: Update Column Definitions
In your page component (e.g., `src/pages/Inventory.tsx`), modify the columns array:

```typescript
const columns = [
  { key: 'name', label: 'Product Name' },
  { key: 'description', label: 'Description' },
  { key: 'price', label: 'Price' },
  { key: 'stock', label: 'Stock' },
  // Add new column
  { key: 'total_inbound', label: 'Total Inbound' },
  // Add calculated column
  { key: 'value', label: 'Total Value' },
  { key: 'created_at', label: 'Created At' }
];
```

#### Step 2: Update Database Query
In `server/routes/query.js`, modify the SELECT clause to include new columns:

```javascript
// For regular columns
selectClause = 'i.*, inb.quantity';

// For calculated columns
selectClause = `
  i.*,
  inb.quantity,
  (i.price * i.stock) as value,
  COALESCE(inb.total_inbound, 0) as total_inbound
`;
```

### 2.2 Example: Adding a "Total Value" Column

1. Update page component (`src/pages/Inventory.tsx`):
```typescript
const columns = [
  // ... existing columns
  { key: 'total_value', label: 'Total Value' }
];
```

2. Update query (`server/routes/query.js`):
```javascript
const selectClause = `
  i.*,
  (i.price * i.stock) as total_value
`;
```

3. Format the value in the Table component if needed:
```typescript
<td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
  {column.key === 'total_value' 
    ? `$${Number(row[column.key]).toFixed(2)}`
    : row[column.key]}
</td>
```

## 3. Best Practices

1. **Performance**
   - Use appropriate indexes on frequently queried columns
   - Optimize JOIN operations
   - Use EXPLAIN to analyze query performance

2. **Data Consistency**
   - Use transactions for related operations
   - Validate data before insertion/update
   - Handle NULL values appropriately

3. **Security**
   - Always use parameterized queries
   - Validate and sanitize input
   - Implement proper access control

4. **Maintenance**
   - Document any custom columns or calculations
   - Keep track of added indexes
   - Update TypeScript interfaces when adding columns