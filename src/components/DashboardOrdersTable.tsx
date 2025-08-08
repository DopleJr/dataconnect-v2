import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Filter, Calendar, Package, TrendingUp, TrendingDown, X, Check } from 'lucide-react';

interface OrderData {
  CREATION_DATE: string;
  ORDER_TYPE: string;
  DO_DESC: string;
  COUNT_ORDER: number;
  SUM_ORDER: number;
}

interface DashboardOrdersTableProps {
  data: OrderData[];
  title?: string;
}

type SortField = keyof OrderData;
type SortDirection = 'asc' | 'desc';

const DashboardOrdersTable: React.FC<DashboardOrdersTableProps> = ({ 
  data, 
  title = "Order Summary Dashboard" 
}) => {
  const [sortField, setSortField] = useState<SortField>('CREATION_DATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Get unique values for filters
  const uniqueOrderTypes = useMemo(() => 
    [...new Set(data.map(item => item.ORDER_TYPE))].sort(), [data]
  );
  
  const uniqueStatuses = useMemo(() => 
    [...new Set(data.map(item => item.DO_DESC))].sort(), [data]
  );

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = data;

    // Filter by order types
    if (selectedOrderTypes.length > 0) {
      filtered = filtered.filter(item => selectedOrderTypes.includes(item.ORDER_TYPE));
    }

    // Filter by statuses
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter(item => selectedStatuses.includes(item.DO_DESC));
    }

    // Filter by date range
    if (startDate) {
      filtered = filtered.filter(item => item.CREATION_DATE >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(item => item.CREATION_DATE <= endDate);
    }

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
  }, [data, sortField, sortDirection, selectedOrderTypes, selectedStatuses, startDate, endDate]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalOrders = processedData.reduce((sum, item) => sum + item.COUNT_ORDER, 0);
    const totalSum = processedData.reduce((sum, item) => sum + item.SUM_ORDER, 0);
    const avgOrderValue = totalOrders > 0 ? totalSum / totalOrders : 0;
    
    return {
      totalOrders: totalOrders.toLocaleString(),
      totalSum: totalSum.toLocaleString(),
      avgOrderValue: avgOrderValue.toFixed(2),
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

  const getStatusColor = (status: string) => {
    const colors = {
      'Shipped': 'bg-green-100 text-green-800 border-green-200',
      'Allocated': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Packed': 'bg-blue-100 text-blue-800 border-blue-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
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

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedOrderTypes([]);
    setSelectedStatuses([]);
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedOrderTypes.length > 0 || selectedStatuses.length > 0 || startDate || endDate;

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
            {summaryStats.recordCount} records
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
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
                <p className="text-sm font-medium text-gray-600">Total Sum</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalSum}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.avgOrderValue}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Records</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.recordCount}</p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </div>
        </div>
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

            {/* Status Multi-Select */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Statuses</label>
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-left focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
                >
                  <span className="truncate">
                    {selectedStatuses.length === 0 
                      ? 'All Statuses' 
                      : `${selectedStatuses.length} selected`
                    }
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {uniqueStatuses.map(status => (
                      <label key={status} className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={() => toggleStatus(status)}
                          className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className={`text-sm px-2 py-1 rounded-full border ${getStatusColor(status)}`}>
                          {status}
                        </span>
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
                {selectedStatuses.map(status => (
                  <span key={status} className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {status}
                    <button
                      onClick={() => toggleStatus(status)}
                      className="ml-2 hover:text-green-600"
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
          )}
        </div>
      </div>

      {/* Close dropdowns when clicking outside */}
      {(showOrderTypeDropdown || showStatusDropdown) && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => {
            setShowOrderTypeDropdown(false);
            setShowStatusDropdown(false);
          }}
        />
      )}
          
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('CREATION_DATE')}
              >
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>Creation Date</span>
                  {getSortIcon('CREATION_DATE')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('ORDER_TYPE')}
              >
                <div className="flex items-center space-x-1">
                  <span>Order Type</span>
                  {getSortIcon('ORDER_TYPE')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('DO_DESC')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  {getSortIcon('DO_DESC')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('COUNT_ORDER')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Order Count</span>
                  {getSortIcon('COUNT_ORDER')}
                </div>
              </th>
              <th 
                className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('SUM_ORDER')}
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Order Sum</span>
                  {getSortIcon('SUM_ORDER')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData.map((row, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDate(row.CREATION_DATE)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getOrderTypeColor(row.ORDER_TYPE)}`}>
                    {row.ORDER_TYPE}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(row.DO_DESC)}`}>
                    {row.DO_DESC}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {row.COUNT_ORDER.toLocaleString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {row.SUM_ORDER.toLocaleString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {processedData.length} of {data.length} records
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