import React, { useState, useEffect } from 'react';
import { Download, ChevronLeft, ChevronRight, Search, Filter, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import { getAllProducts } from '../services/api';
import toast from 'react-hot-toast';
import AdvancedSearchModal from './AdvancedSearchModal';

import { Column } from '../types';

interface SearchCondition {
  id: string;
  field: string;
  operation: string;
  value: string;
  boolean: 'AND' | 'OR';
}

interface TableProps {
  columns: Column[];
  title: string;
  type: 'stockinventory' | 'stockinbound'| 'stockoutbound' | 'outboundorders' | 'tracetransaction' | 'inboundallocation';
}

interface ColumnFilter {
  [key: string]: string;
}

interface ExportProgress {
  percentage: number;
  timeRemaining: string;
  currentSheet: number;
  totalSheets: number;
}

const TableSkeleton = ({ columns }: { columns: Column[] }) => (
  <tr>
    {columns.map((col, i) => (
      <td key={i} className="px-6 py-4 whitespace-nowrap">
        <div className="animate-pulse flex space-x-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </td>
    ))}
  </tr>
);

const ROWS_PER_SHEET = 500000;

const Table: React.FC<TableProps> = ({ columns, title, type }) => {
  const [allData, setAllData] = useState<any[]>([]);
  const [displayData, setDisplayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [hasData, setHasData] = useState(false);
  const [columnFilters, setColumnFilters] = useState<ColumnFilter>({});

  // Apply column filters to data
  const filteredData = React.useMemo(() => {
    if (!allData.length) return [];
    
    return allData.filter(row => {
      return Object.entries(columnFilters).every(([columnKey, filterValue]) => {
        if (!filterValue.trim()) return true;
        
        const cellValue = String(row[columnKey] || '').toLowerCase();
        const searchValue = filterValue.toLowerCase();
        
        return cellValue.includes(searchValue);
      });
    });
  }, [allData, columnFilters]);

  const cancelQuery = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setLoading(false);
      toast.info('Query cancelled');
    }
  };

  const fetchData = async (searchConditions: SearchCondition[] = []) => {
    // Cancel any existing request
    if (abortController) {
      abortController.abort();
    }

    const newAbortController = new AbortController();
    setAbortController(newAbortController);

    try {
      setLoading(true);
      
      const response = await getAllProducts({
        page: 1,
        limit: 10000000, // Load all data
        searchConditions,
        type,
        signal: newAbortController.signal
      });

      const data = response.data || [];
      setAllData(data);
      setDisplayData(data);
      setHasData(true);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Query was cancelled');
      } else {
        console.error('Error fetching data:', error);
        setAllData([]);
        setDisplayData([]);
        toast.error('Failed to fetch data');
      }
    } finally {
      setLoading(false);
      setAbortController(null);
    }
  };

  const handleAdvancedSearch = (conditions: SearchCondition[]) => {
    setCurrentPage(1);
    fetchData(conditions);
  };

  const handleClearData = () => {
    setAllData([]);
    setDisplayData([]);
    setHasData(false);
    setCurrentPage(1);
    setColumnFilters({});
  };

  const handleColumnFilterChange = (columnKey: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnKey]: value
    }));
    setCurrentPage(1);
  };

  const clearColumnFilter = (columnKey: string) => {
    setColumnFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[columnKey];
      return newFilters;
    });
  };

  const clearAllColumnFilters = () => {
    setColumnFilters({});
  };

  // Calculate pagination for filtered data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  useEffect(() => {
    setDisplayData(paginatedData);
  }, [filteredData, currentPage, itemsPerPage]);

  const calculateTimeRemaining = (startTime: number, progress: number): string => {
    if (progress === 0) return 'Calculating...';
    
    const elapsedTime = Date.now() - startTime;
    const estimatedTotalTime = (elapsedTime / progress) * 100;
    const remainingTime = estimatedTotalTime - elapsedTime;
    
    const seconds = Math.ceil(remainingTime / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes}m`;
  };

  const exportToXLSX = async () => {
    try {
      setExporting(true);
      const startTime = Date.now();

      const exportData = filteredData;

      if (!exportData || exportData.length === 0) {
        toast.error('No data available for export');
        return;
      }

      const totalSheets = Math.ceil(exportData.length / ROWS_PER_SHEET);
      const wb = XLSX.utils.book_new();

      for (let sheetIndex = 0; sheetIndex < totalSheets; sheetIndex++) {
        const start = sheetIndex * ROWS_PER_SHEET;
        const end = Math.min(start + ROWS_PER_SHEET, exportData.length);
        const sheetData = exportData.slice(start, end);

        const formattedData = sheetData.map(row => {
          const exportRow: { [key: string]: any } = {};
          columns.forEach(col => {
            exportRow[col.label] = row[col.key];
          });
          return exportRow;
        });

        const ws = XLSX.utils.json_to_sheet(formattedData);
        XLSX.utils.book_append_sheet(wb, ws, `${title} - Part ${sheetIndex + 1}`);

        const progress = ((sheetIndex + 1) / totalSheets) * 100;
        setExportProgress({
          percentage: Math.round(progress),
          timeRemaining: calculateTimeRemaining(startTime, progress),
          currentSheet: sheetIndex + 1,
          totalSheets
        });

        await new Promise(resolve => setTimeout(resolve, 0));
      }

      const fileName = `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExporting(false);
      setExportProgress(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsSearchModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
                disabled={loading}
              >
                <Search className="h-4 w-4 mr-2" />
                Advanced Search
              </button>
              
              {loading && (
                <button
                  onClick={cancelQuery}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
                >
                  Cancel Query
                </button>
              )}
              
              {hasData && (
                <button
                  onClick={handleClearData}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
                >
                  Clear Data
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={exportToXLSX}
                  disabled={exporting || filteredData.length === 0}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exporting ? 'Exporting...' : 'Export to Excel'}
                </button>
                
                {exportProgress && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg p-4 z-50">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Progress:</span>
                        <span>{exportProgress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${exportProgress.percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Sheet {exportProgress.currentSheet} of {exportProgress.totalSheets}</span>
                        <span>{exportProgress.timeRemaining} remaining</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <AdvancedSearchModal
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            columns={columns}
            onSearch={handleAdvancedSearch}
            isLoading={loading}
          />

          {hasData && Object.keys(columnFilters).length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-blue-800">Active Filters:</h3>
                <button
                  onClick={clearAllColumnFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear All
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(columnFilters).map(([columnKey, value]) => {
                  if (!value.trim()) return null;
                  const column = columns.find(col => col.key === columnKey);
                  return (
                    <div key={columnKey} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <span className="font-medium">{column?.label}:</span>
                      <span className="ml-1">{value}</span>
                      <button
                        onClick={() => clearColumnFilter(columnKey)}
                        className="ml-2 hover:text-blue-600"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {hasData ? (
                <>Showing {filteredData.length} of {allData.length} total records</>
              ) : (
                'Use Advanced Search to load data'
              )}
            </span>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="space-y-2">
                    <div>{column.label}</div>
                    {hasData && (
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={`Filter ${column.label}...`}
                          value={columnFilters[column.key] || ''}
                          onChange={(e) => handleColumnFilterChange(column.key, e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 normal-case"
                        />
                        {columnFilters[column.key] && (
                          <button
                            onClick={() => clearColumnFilter(column.key)}
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableSkeleton key={index} columns={columns} />
              ))
            ) : !hasData ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                  <div className="space-y-2">
                    <p className="text-lg">Use Advanced Search to load data</p>
                    <p className="text-sm">Configure your search criteria above to fetch and display data</p>
                  </div>
                </td>
              </tr>
            ) : allData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data found matching your search criteria
                </td>
              </tr>
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data matches your current filters
                </td>
              </tr>
            ) : (
              displayData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                  {columns.map((column) => (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Show</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border rounded px-2 py-1 text-sm"
            disabled={loading}
          >
            {[5, 10, 25, 50, 100].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <span className="text-sm text-gray-700">entries</span>
        </div>

        {hasData && (
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;