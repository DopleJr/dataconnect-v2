import React, { useState, useEffect } from 'react';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import * as XLSX from 'xlsx';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { getAllProducts } from '../services/api';
import toast from 'react-hot-toast';

interface Column {
  key: string;
  label: string;
}

interface TableProps {
  columns: Column[];
  title: string;
  type: 'stockinventory' | 'stockinbound'| 'stockoutbound' | 'outboundorders' | 'tracetransaction' | 'inboundallocation';
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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [dbConnected, setDbConnected] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await getAllProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        type
      });

      setData(response.data || []);
      setTotal(response.total || 0);
      setTotalPages(response.totalPages || 1);
      setDbConnected(true);
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
      setDbConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, searchTerm, startDate, endDate, type]);

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

      // Use totals for limit if available, otherwise use data length
      const limit = 10000000;

      const exportData = !dbConnected ? data : await getAllProducts({
        page: 1,
        limit: limit,
        search: searchTerm,
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        type
      }).then(res => res.data).catch(() => data);

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
            <div className="relative">
              <button
                onClick={exportToXLSX}
                disabled={exporting}
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

          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 w-full border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <DatePicker
                selected={startDate}
                onChange={(date) => {
                  setStartDate(date);
                  setCurrentPage(1);
                }}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>

            <div className="flex-1">
              <DatePicker
                selected={endDate}
                onChange={(date) => {
                  setEndDate(date);
                  setCurrentPage(1);
                }}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                dateFormat="yyyy-MM-dd"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              Array.from({ length: itemsPerPage }).map((_, index) => (
                <TableSkeleton key={index} columns={columns} />
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-4 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
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
      </div>
    </div>
  );
};

export default Table;