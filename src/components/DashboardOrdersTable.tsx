import React, { useState, useMemo, useEffect } from 'react';
import { ChevronUp, ChevronDown, Filter, Calendar, Package, TrendingUp, TrendingDown, X, Check, Shirt, Truck, RefreshCw, Download, Camera } from 'lucide-react';
import { getOrderSummary } from '../services/api';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';


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
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const [data, setData] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [sortField, setSortField] = useState<SortField>('CREATION_DATE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedOrderTypes, setSelectedOrderTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>(getCurrentDate());
  const [endDate, setEndDate] = useState<string>(getCurrentDate());
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false);
  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set([
    'CREATION_DATE', 'ORDER_TYPE', 'Released_Ord', 'Allocated_Ord', 'Packed_Ord', 
    'Shipped_Ord', 'Released_Qty', 'Allocated_Qty', 'Packed_Qty', 'Shipped_Qty', 
    'Total_Order', 'Total_Qty'
  ]));
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

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
    { key: 'Total_Order', label: 'Total Order', icon: Shirt },
    { key: 'Total_Qty', label: 'Total Qty', icon: Shirt }
  ];

  // Get unique values for filters
  const uniqueOrderTypes = useMemo(() => {
    // Define all possible order types
    const allOrderTypes = [
      'TO_B2B', 'B2C_SHP', 'B2C_ZLR', 'B2C_COM', 
      'B2B_C', 'B2B_A', 'B2B_MGR', 'B2B_M', 'TO_B2C'
    ];
    
    // Get order types from current data
    const dataOrderTypes = [...new Set(data.map(item => item.ORDER_TYPE))];
    
    // Combine and deduplicate, keeping all possible types
    const combinedTypes = [...new Set([...allOrderTypes, ...dataOrderTypes])];
    
    return combinedTypes.sort();
  }, [data]);

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
      setLastRefresh(new Date());
      
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
      setIsManualRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchOrderSummary();
  }, []);

  // Auto-refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrderSummary();
      toast.success('Data refreshed automatically', {
        duration: 2000,
        icon: '🔄'
      });
    }, 3 * 60 * 1000); // 3 minutes in milliseconds

    return () => clearInterval(interval);
  }, [startDate, endDate, selectedOrderTypes]);

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchOrderSummary();
    }, 500); // Debounce API calls

    return () => clearTimeout(timeoutId);
  }, [startDate, endDate, selectedOrderTypes]);

  // Filter and sort data
  const processedData = useMemo(() => {
    // Group data by creation date and merge
    const groupedByDate = data.reduce((acc, item) => {
      const date = item.CREATION_DATE;
      if (!acc[date]) {
        acc[date] = {
          CREATION_DATE: date,
          ORDER_TYPE: 'MERGED', // Indicate this is a merged row
          Released_Ord: 0,
          Allocated_Ord: 0,
          Packed_Ord: 0,
          Shipped_Ord: 0,
          Released_Qty: 0,
          Allocated_Qty: 0,
          Packed_Qty: 0,
          Shipped_Qty: 0,
          Total_Order: 0,
          Total_Qty: 0
        };
      }
      
      // Sum all the values for the same date
      acc[date].Released_Ord += item.Released_Ord;
      acc[date].Allocated_Ord += item.Allocated_Ord;
      acc[date].Packed_Ord += item.Packed_Ord;
      acc[date].Shipped_Ord += item.Shipped_Ord;
      acc[date].Released_Qty += item.Released_Qty;
      acc[date].Allocated_Qty += item.Allocated_Qty;
      acc[date].Packed_Qty += item.Packed_Qty;
      acc[date].Shipped_Qty += item.Shipped_Qty;
      acc[date].Total_Order += item.Total_Order;
      acc[date].Total_Qty += item.Total_Qty;
      
      return acc;
    }, {} as Record<string, OrderData>);

    // Convert back to array
    let filtered = Object.values(groupedByDate);

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
    const totalAllocated = processedData.reduce((sum, item) => sum + item.Allocated_Ord, 0);
    const totalOrders = processedData.reduce((sum, item) => sum + item.Total_Order, 0);
    const totalQty = processedData.reduce((sum, item) => sum + item.Total_Qty, 0);
    const totalShipped = processedData.reduce((sum, item) => sum + item.Shipped_Ord, 0);
    
    return {
      totalAllocated: totalAllocated.toLocaleString(),
      totalOrders: totalOrders.toLocaleString(),
      totalQty: totalQty.toLocaleString(),
      totalShipped: totalShipped.toLocaleString(),
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
      'MERGED': 'bg-gray-100 text-gray-800 font-bold',
      'B2C_COM': 'bg-blue-100 text-blue-800',
      'B2C_SHP': 'bg-green-100 text-green-800',
      'B2C_ZLR': 'bg-purple-100 text-purple-800',
      'TO_B2B': 'bg-orange-100 text-orange-800',
      'TO_B2C': 'bg-pink-100 text-pink-800',
      'B2B_C': 'bg-indigo-100 text-indigo-800',
      'B2B_A': 'bg-yellow-100 text-yellow-800',
      'B2B_MGR': 'bg-red-100 text-red-800',
      'B2B_M': 'bg-teal-100 text-teal-800'
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
    setStartDate(getCurrentDate());
    setEndDate(getCurrentDate());
  };

  const hasActiveFilters = selectedOrderTypes.length > 0 || 
    startDate !== getCurrentDate() || 
    endDate !== getCurrentDate();

  const handleManualRefresh = async () => {
    setIsManualRefreshing(true);
    await fetchOrderSummary();
    toast.success('Data refreshed manually', {
      duration: 2000,
      icon: '🔄'
    });
  };

  const exportToExcel = async () => {
    if (processedData.length === 0) {
      toast.error('No data to export');
      return;
    }

    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = processedData.map(row => ({
        'Creation Date': formatDate(row.CREATION_DATE),
        'Order Type': row.ORDER_TYPE,
        'Released Orders': row.Released_Ord,
        'Allocated Orders': row.Allocated_Ord,
        'Packed Orders': row.Packed_Ord,
        'Shipped Orders': row.Shipped_Ord,
        'Released Quantity': row.Released_Qty,
        'Allocated Quantity': row.Allocated_Qty,
        'Packed Quantity': row.Packed_Qty,
        'Shipped Quantity': row.Shipped_Qty,
        'Total Orders': row.Total_Order,
        'Total Quantity': row.Total_Qty
      }));

      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = Object.keys(exportData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Order Summary');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `order_summary_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(wb, filename);
      
      toast.success(`Exported ${exportData.length} records to Excel`, {
        duration: 3000,
        icon: '📊'
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  const copyDashboardToImage = async () => {
    try {
      setIsCapturing(true);
      
      // Try multiple ways to find the dashboard element
      let dashboardElement = document.getElementById('dashboard-container');
      
      if (!dashboardElement) {
        dashboardElement = document.querySelector('[data-dashboard="true"]');
      }
      
      if (!dashboardElement) {
        dashboardElement = document.querySelector('.bg-white.rounded-xl.shadow-lg');
      }
      
      if (!dashboardElement) {
        toast.error('Dashboard element not found');
        return;
      }

      console.log('Found dashboard element:', dashboardElement);
      console.log('Element dimensions:', {
        width: dashboardElement.offsetWidth,
        height: dashboardElement.offsetHeight,
        scrollWidth: dashboardElement.scrollWidth,
        scrollHeight: dashboardElement.scrollHeight
      });

      // Scroll to top and ensure element is visible
      window.scrollTo(0, 0);
      dashboardElement.scrollIntoView({ behavior: 'instant', block: 'start' });
      
      // Wait longer for content to fully render
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture with more robust settings
      const canvas = await html2canvas(dashboardElement, {
        scale: 1, // Reduced scale for better compatibility
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false, // Disable for better compatibility
        logging: false,
        width: dashboardElement.offsetWidth,
        height: dashboardElement.offsetHeight,
        scrollX: 0,
        scrollY: 0,
        x: dashboardElement.offsetLeft,
        y: dashboardElement.offsetTop,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById('dashboard-container');
          if (clonedElement) {
            // Force visibility and basic styles
            clonedElement.style.visibility = 'visible';
            clonedElement.style.display = 'block';
            clonedElement.style.position = 'relative';
            clonedElement.style.backgroundColor = '#ffffff';
            
            // Force all child elements to be visible
            const allElements = clonedElement.querySelectorAll('*');
            allElements.forEach(el => {
              const element = el as HTMLElement;
              element.style.visibility = 'visible';
              element.style.display = element.style.display === 'none' ? 'block' : element.style.display;
              
              // Apply Tailwind color mappings
              if (element.classList.contains('bg-white')) element.style.backgroundColor = '#ffffff';
              if (element.classList.contains('bg-gray-50')) element.style.backgroundColor = '#f9fafb';
              if (element.classList.contains('bg-gray-100')) element.style.backgroundColor = '#f3f4f6';
              if (element.classList.contains('text-gray-900')) element.style.color = '#111827';
              if (element.classList.contains('text-gray-800')) element.style.color = '#1f2937';
              if (element.classList.contains('text-gray-700')) element.style.color = '#374151';
              if (element.classList.contains('text-gray-600')) element.style.color = '#4b5563';
              if (element.classList.contains('text-gray-500')) element.style.color = '#6b7280';
              if (element.classList.contains('text-white')) element.style.color = '#ffffff';
              if (element.classList.contains('border-gray-200')) element.style.borderColor = '#e5e7eb';
              if (element.classList.contains('border-gray-100')) element.style.borderColor = '#f3f4f6';
              
              // Handle gradients
              if (element.classList.contains('bg-gradient-to-r') && 
                  element.classList.contains('from-blue-600') && 
                  element.classList.contains('to-blue-700')) {
                element.style.background = 'linear-gradient(to right, #2563eb, #1d4ed8)';
                element.style.color = '#ffffff';
              }
              
              // Handle shadows
              if (element.classList.contains('shadow-lg')) {
                element.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)';
              }
              if (element.classList.contains('shadow')) {
                element.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)';
              }
              
              // Handle rounded corners
              if (element.classList.contains('rounded-xl')) element.style.borderRadius = '0.75rem';
              if (element.classList.contains('rounded-lg')) element.style.borderRadius = '0.5rem';
              if (element.classList.contains('rounded-full')) element.style.borderRadius = '9999px';
            });
            
            // Ensure tables render properly
            const tables = clonedElement.querySelectorAll('table');
            tables.forEach(table => {
              (table as HTMLElement).style.borderCollapse = 'collapse';
              (table as HTMLElement).style.width = '100%';
            });
          }
        }
      });

      console.log('Canvas created:', {
        width: canvas.width,
        height: canvas.height
      });

      // Check if canvas has content
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has no content - element may not be visible');
      }

      // Try to copy to clipboard first
      if (navigator.clipboard && canvas.toBlob) {
        canvas.toBlob(async (blob) => {
          if (blob) {
            try {
              await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
              ]);
              toast.success('Dashboard copied to clipboard!', {
                duration: 3000,
                icon: '📋'
              });
            } catch (clipboardError) {
              // Fallback to download
              downloadImage(canvas);
            }
          }
        }, 'image/png');
      } else {
        // Fallback to download
        downloadImage(canvas);
      }
    } catch (error) {
      console.error('Failed to capture dashboard:', error);
      toast.error('Failed to capture dashboard');
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadImage = (canvas: HTMLCanvasElement) => {
    // Create download link
    const link = document.createElement('a');
    link.download = `dashboard_${new Date().toISOString().split('T')[0]}.png`;
    link.href = canvas.toDataURL('image/png');
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Dashboard image downloaded!', {
      duration: 3000,
      icon: '📸'
    });
  };

  return (
    <div 
      id="dashboard-container" 
      data-dashboard="true"
      className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100"
      style={{ 
        minHeight: '600px',
        position: 'relative',
        zIndex: 1
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          <div className="text-white text-sm flex items-center space-x-4">
            <button
              onClick={handleManualRefresh}
              disabled={loading || isManualRefreshing}
              className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh data manually"
            >
              <RefreshCw className={`h-4 w-4 ${isManualRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">
                {isManualRefreshing ? 'Refreshing...' : 'Refresh'}
              </span>
            </button>
            <button
              onClick={exportToExcel}
              disabled={loading || isExporting || processedData.length === 0}
              className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export data to Excel"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">
                {isExporting ? 'Exporting...' : 'Excel'}
              </span>
            </button>
            <button
              onClick={copyDashboardToImage}
              disabled={isCapturing}
              className="flex items-center space-x-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Copy dashboard as image"
            >
              <Camera className={`h-4 w-4 ${isCapturing ? 'animate-pulse' : ''}`} />
              <span className="text-sm">
                {isCapturing ? 'Capturing...' : 'Image'}
              </span>
            </button>
            <span>{loading ? 'Loading...' : `${summaryStats.recordCount} records`}</span>
            <span className="text-xs opacity-75">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
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
          {/* 1. Total Allocated */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 order-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Allocated</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalAllocated}</p>
              </div>
              <Filter className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          {/* 2. Total Orders */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 order-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalOrders}</p>
              </div>
              <Shirt className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          {/* 3. Total Quantity */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 order-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalQty}</p>
              </div>
              <Shirt className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          {/* 4. Total Shipped */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 order-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipped</p>
                <p className="text-2xl font-bold text-gray-900">{summaryStats.totalShipped}</p>
              </div>
              <Truck className="h-8 w-8 text-purple-500" />
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
            Last updated: {lastRefresh.toLocaleTimeString()} • Auto-refresh: 3min
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardOrdersTable;