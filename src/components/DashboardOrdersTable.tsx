import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Filter, Calendar, Package, TrendingUp, TrendingDown, X, Check } from 'lucide-react';
import { getOrderSummary } from '../services/api';
import toast from 'react-hot-toast';

interface OrderData {
  CREATION_DATE: string;
  ORDER_TYPE: string;
  Released_Ord: number;
  Allocated_Ord: number;
  Packed_Ord: number;
  Shipped_Ord: number;
  Released_Qty: number;
  Allocated_Qty: number;
  Packed_Qty: number;
  Shipped_Qty: number;
  Total_Order: number;
  Total_Qty: number;
}

interface DashboardOrdersTableProps {
  title?: string;
}

type SortField = keyof OrderData;
type SortDirection = 'asc' | 'desc';

const DashboardOrdersTable: React.FC<DashboardOrdersTableProps> = ({ 
  title = "Order Summary Dashboard" 
}) => {
  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState<SortField>('CREATION_DATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'CREATION_DATE', 'ORDER_TYPE', 'Released_Ord', 'Allocated_Ord', 'Packed_Ord', 
    'Shipped_Ord', 'Released_Qty', 'Allocated_Qty', 'Packed_Qty', 'Shipped_Qty', 
    'Total_Order', 'Total_Qty'
  ]));

  // Define all available columns
  const allColumns = [
    { key: 'CREATION_DATE', label: 'Creation Date', icon: Calendar },
    { key: 'ORDER_TYPE', label: 'Order Type', icon: Package },
    { key: 'Released_Ord', label: 'Released Ord', icon: TrendingUp },
    { key: 'Allocated_Ord', label: 'Allocated Ord', icon: TrendingUp },
    { key: 'Packed_Ord', label: 'Packed Ord', icon: TrendingUp },
    { key: 'Shipped_Ord', label: 'Shipped Ord', icon: TrendingUp },
    { key: 'Released_Qty', label: 'Released Qty', icon: TrendingDown },
    { key: 'Allocated_Qty', label: 'Allocated Qty', icon: TrendingDown },
    { key: 'Packed_Qty', label: 'Packed Qty', icon: TrendingDown },
    { key: 'Shipped_Qty', label: 'Shipped Qty', icon: TrendingDown },
    { key: 'Total_Order', label: 'Total Order', icon: Filter },
    { key: 'Total_Qty', label: 'Total Qty', icon: Filter }
  ];

  // Get unique values for filters
  const uniqueOrderTypes = useMemo(() => 
    [...new Set(data.map(item => item.ORDER_TYPE))].sort(), [data]
  );

  // Fetch data from API
  const fetchOrderSummary = async () => {
    try {
      setLoading(true);
      const response = await getOrderSummary({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        orderTypes: selectedOrderTypes.length > 0 ? selectedOrderTypes : undefined,
        page: 1,
        limit: 1000
      });
      
      setData(response.data);
      setTotalRecords(response.total);
      
      if (response.data.length === 0) {
        toast.info('No data found for the selected criteria');
      }
    } catch (error) {
      console.error('Failed to fetch order summary:', error);
      toast.error('Failed to load order summary data');
      setData([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOrderSummary();
  }, []);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrderSummary();
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, selectedOrderTypes]);

  // Filter and sort data
  const processedData = useMemo(() => {
    // Data is already filtered by the API, just sort it
    let filtered = [...data];

    return filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle date sorting
      if (sortField === 'CREATION_DATE') {
        aValue = new Date(aValue as string).getTime();
        bValue = new Date(bValue as string).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortField, sortDirection]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalOrders = processedData.reduce((sum, item) => sum + item.Total_Order, 0);
    const totalQty = processedData.reduce((sum, item) => sum + item.Total_Qty, 0);
    const totalShipped = processedData.reduce((sum, item) => sum + item.Shipped_Ord, 0);
    const totalAllocated = processedData.reduce((sum, item) => sum + item.Allocated_Ord, 0);
    
    return {
      totalOrders: totalOrders.toLocaleString(),
      totalQty: totalQty.toLocaleString(),
      totalShipped: totalShipped.toLocaleString(),
      totalAllocated: totalAllocated.toLocaleString(),
      recordCount: processedData.length
    };
  }, [processedData]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4" /> : 
      <ChevronDown className="h-4 w-4" />;
  };

  const getOrderTypeColor = (orderType: string) => {
    const colors = {
      'B2C_COM': 'bg-blue-100 text-blue-800',
      'B2C_SHP': 'bg-green-100 text-green-800',
      'B2C_ZLR': 'bg-purple-100 text-purple-800',
      'TO_B2B': 'bg-orange-100 text-orange-800'
    };
    return colors[orderType as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const toggleOrderType = (orderType: string) => {
    setSelectedOrderTypes(prev => 
      prev.includes(orderType) 
        ? prev.filter(type => type !== orderType)
        : [...prev, orderType]
    );
  };

  const toggleColumn = (columnKey: string) => {
    setVisibleColumns(prev => {
      const newVisible = new Set(prev);
      if (newVisible.has(columnKey)) {
        // Don't allow hiding all columns
        if (newVisible.size > 1) {
          newVisible.delete(columnKey);
        }
      } else {
        newVisible.add(columnKey);
      }
      return newVisible;
    });
  };

  const showAllColumns = () => {
    setVisibleColumns(new Set(allColumns.map(col => col.key)));
  };

  const hideAllColumns = () => {
    // Keep at least Creation Date visible
    setVisibleColumns(new Set(['CREATION_DATE']));
  };

  const clearAllFilters = () => {
    setSelectedOrderTypes([]);
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedOrderTypes.length > 0 || startDate || endDate;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="text-white text-sm">
            {loading ? 'Loading...' : `${summaryStats.recordCount} records`}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white rounded-lg p-4 border border-gray-200 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalOrders}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalQty}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipped</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalShipped}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalAllocated}</p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Filters */}
      <div className="px-6 py-4 bg-white border-b border-gray-200">
        <div className="space-y-4">
          {/* Filter Header */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Clear All Filters
              </button>
            )}
            {loading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Loading data...</span>
              </div>
            )}
          </div>
          
          {/* Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Date Range Filter */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Date Range</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="End Date"
                />
              </div>
            </div>

            {/* Order Type Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Order Types</label>
              <div className="relative">
                <button
                  onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="truncate">
                    {selectedOrderTypes.length === 0 
                      ? 'All Order Types' 
                      : `${selectedOrderTypes.length} selected`
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showOrderTypeDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {uniqueOrderTypes.map(type => (
                      <label key={type} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedOrderTypes.includes(type)}
                          onChange={() => toggleOrderType(type)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm px-2 py-1 rounded-full ${getOrderTypeColor(type)}`}>
                          {type}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Column Visibility */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Show/Hide Columns</label>
              <div className="relative">
                <button
                  onClick={() => setShowColumnDropdown(!showColumnDropdown)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="truncate">
                    {visibleColumns.size} of {allColumns.length} columns
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showColumnDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-2 border-b border-gray-200 flex space-x-2">
                      <button
                        onClick={showAllColumns}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Show All
                      </button>
                      <button
                        onClick={hideAllColumns}
                        className="text-xs text-red-600 hover:text-red-800"
                      >
                        Hide All
                      </button>
                    </div>
                    {allColumns.map(column => (
                      <label key={column.key} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={visibleColumns.has(column.key)}
                          onChange={() => toggleColumn(column.key)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <column.icon className="h-4 w-4 mr-2 text-gray-400" />
                        <span className="text-sm">{column.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Active Filters</label>
              <div className="flex flex-wrap gap-2">
                {selectedOrderTypes.map(type => (
                  <span key={type} className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {type}
                    <button
                      onClick={() => toggleOrderType(type)}
                      className="ml-2 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {(startDate || endDate) && (
                  <span className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                    {startDate && endDate ? `${startDate} to ${endDate}` : 
                     startDate ? `From ${startDate}` : `Until ${endDate}`}
                    <button
                      onClick={() => {
                        setStartDate('');
                        setEndDate('');
                      }}
                      className="ml-2 hover:text-purple-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showOrderTypeDropdown || showColumnDropdown) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => {
            setShowOrderTypeDropdown(false);
            setShowColumnDropdown(false);
          }}
        />
      )}
          
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {allColumns.filter(col => visibleColumns.has(col.key)).map(column => (
                <th 
                  key={column.key}
                  className={`px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${
                    column.key === 'CREATION_DATE' || column.key === 'ORDER_TYPE' ? 'text-left' : 'text-right'
                  }`}
                  onClick={() => handleSort(column.key as SortField)}
                >
                  <div className={`flex items-center space-x-1 ${
                    column.key === 'CREATION_DATE' || column.key === 'ORDER_TYPE' ? '' : 'justify-end'
                  }`}>
                    {column.key === 'CREATION_DATE' && <column.icon className="h-4 w-4" />}
                    <span>{column.label}</span>
                    {getSortIcon(column.key as SortField)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {allColumns.filter(col => visibleColumns.has(col.key)).map(column => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : processedData.length === 0 ? (
              <tr>
                <td colSpan={allColumns.filter(col => visibleColumns.has(col.key)).length} className="px-6 py-8 text-center text-gray-500">
                  <div className="space-y-2">
                    <p className="text-lg">No data found</p>
                    <p className="text-sm">Try adjusting your filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              processedData.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                {allColumns.filter(col => visibleColumns.has(col.key)).map(column => (
                  <td key={column.key} className={`px-6 py-4 whitespace-nowrap ${
                    column.key === 'CREATION_DATE' || column.key === 'ORDER_TYPE' ? '' : 'text-right'
                  }`}>
                    {column.key === 'CREATION_DATE' ? (
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(row[column.key as keyof OrderData] as string)}
                        </div>
                      </div>
                    ) : column.key === 'ORDER_TYPE' ? (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(row[column.key as keyof OrderData] as string)}`}>
                        {row[column.key as keyof OrderData]}
                      </span>
                    ) : (
                      <div className="text-sm font-semibold text-gray-900">
                        {(row[column.key as keyof OrderData] as number).toLocaleString()}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {processedData.length} of {totalRecords} total records
          </span>
          <span>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOrdersTable;