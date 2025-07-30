import React, { useState } from 'react';
import { Search, Plus, Trash2, X, Download } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  query?: string;
}

interface SearchCondition {
  id: string;
  field: string;
  operation: string;
  value: string;
  boolean: 'AND' | 'OR';
}

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  columns: Column[];
  onSearch: (conditions: SearchCondition[]) => void;
  isLoading: boolean;
}

const operations = [
  { value: '=', label: 'Equals (=)' },
  { value: 'LIKE', label: 'Contains (LIKE)' },
  { value: 'BEGINS_WITH', label: 'Begins with' },
  { value: 'ENDS_WITH', label: 'Ends with' },
  { value: 'IN', label: 'In (comma separated)' },
  { value: '>', label: 'Greater than (>)' },
  { value: '<', label: 'Less than (<)' },
  { value: '>=', label: 'Greater or equal (>=)' },
  { value: '<=', label: 'Less or equal (<=)' },
  { value: '!=', label: 'Not equal (!=)' },
  { value: 'IS_NULL', label: 'Is empty' },
  { value: 'IS_NOT_NULL', label: 'Is not empty' }
];

const AdvancedSearchModal: React.FC<AdvancedSearchModalProps> = ({
  isOpen,
  onClose,
  columns,
  onSearch,
  isLoading
}) => {
  const [downloadOnly, setDownloadOnly] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>([
    {
      id: '1',
      field: columns.find(col => col.query)?.query || columns[0]?.key || '',
      operation: '=',
      value: '',
      boolean: 'AND'
    }
  ]);

  // Filter columns to only show those with query field
  const searchableColumns = columns.filter(col => col.query && col.query.trim() !== '');

  const addCondition = () => {
    const newCondition: SearchCondition = {
      id: Date.now().toString(),
      field: searchableColumns[0]?.query || '',
      operation: '=',
      value: '',
      boolean: 'AND'
    };
    setConditions([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter(c => c.id !== id));
    }
  };

  const updateCondition = (id: string, field: keyof SearchCondition, value: string) => {
    setConditions(conditions.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const handleSearch = () => {
    const validConditions = conditions.filter(c => 
      c.field && c.operation && (
        c.operation === 'IS_NULL' || 
        c.operation === 'IS_NOT_NULL' || 
        c.value.trim()
      )
    );
    
    if (downloadOnly) {
      handleDirectDownload(validConditions);
    } else {
      onSearch(validConditions);
      onClose();
    }
  };

  const handleDirectDownload = async (validConditions: SearchCondition[]) => {
    try {
      setIsDownloading(true);
      
      // Import the API function and export utility
      const { getAllProducts } = await import('../services/api');
      const { exportDirectDownload } = await import('../utils/excelExport');
      
      // Get the table type from the parent component (we'll need to pass this as a prop)
      // For now, we'll use a generic approach
      const response = await getAllProducts({
        page: 1,
        limit: 10000000, // Large limit to get all data
        searchConditions: validConditions,
        type: 'stockinventory', // This should be passed as prop
        downloadMode: true
      });

      if (response.data && response.data.length > 0) {
        await exportDirectDownload(response.data, columns, 'search_results');
        // Show success message
        const toast = await import('react-hot-toast');
        toast.default.success(`Downloaded ${response.data.length} records to Excel`);
      } else {
        const toast = await import('react-hot-toast');
        toast.default.info('No data found matching your criteria');
      }
      
      onClose();
    } catch (error) {
      console.error('Download error:', error);
      const toast = await import('react-hot-toast');
      toast.default.error('Failed to download data');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClear = () => {
    setDownloadOnly(false);
    setConditions([{
      id: '1',
      field: searchableColumns[0]?.query || '',
      operation: '=',
      value: '',
      boolean: 'AND'
    }]);
  };

  const needsValue = (operation: string) => {
    return !['IS_NULL', 'IS_NOT_NULL'].includes(operation);
  };

  const isTimeField = (fieldKey: string) => {
    return fieldKey.toLowerCase().includes('time') || 
           fieldKey.toLowerCase().includes('date') ||
           fieldKey.toLowerCase().includes('timestamp');
  };

  const formatDateTimeForInput = (value: string) => {
    if (!value) return '';
    
    // If it's already in the correct format (YYYY-MM-DDTHH:mm), return as is
    if (value.includes('T')) return value;
    
    // If it's in format YYYY-MM-DD HH:mm:ss, convert to YYYY-MM-DDTHH:mm
    if (value.includes(' ')) {
      const [datePart, timePart] = value.split(' ');
      const timeOnly = timePart.substring(0, 5); // Get HH:mm only
      return `${datePart}T${timeOnly}`;
    }
    
    return value;
  };

  const formatDateTimeForServer = (value: string) => {
    if (!value) return '';
    
    // If it's in datetime-local format (YYYY-MM-DDTHH:mm), convert to server format
    if (value.includes('T')) {
      return value.replace('T', ' ') + ':00'; // Add seconds
    }
    
    return value;
  };

  const handleDateTimeChange = (conditionId: string, value: string) => {
    const serverFormattedValue = formatDateTimeForServer(value);
    updateCondition(conditionId, 'value', serverFormattedValue);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Advanced Search</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <div key={condition.id} className="space-y-3">
                {index > 0 && (
                  <div className="flex items-center">
                    <select
                      value={condition.boolean}
                      onChange={(e) => updateCondition(condition.id, 'boolean', e.target.value)}
                      className="px-3 py-2 border rounded-md text-sm font-medium bg-gray-50"
                    >
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-4 border rounded-lg bg-gray-50">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Field
                    </label>
                    <select
                      value={condition.field}
                      onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {searchableColumns.map(column => (
                        <option key={column.key} value={column.query}>
                          {column.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Operation
                    </label>
                    <select
                      value={condition.operation}
                      onChange={(e) => updateCondition(condition.id, 'operation', e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {operations.map(op => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Value
                    </label>
                    {isTimeField(condition.field) && needsValue(condition.operation) ? (
                      <input
                        type="datetime-local"
                        value={formatDateTimeForInput(condition.value)}
                        onChange={(e) => handleDateTimeChange(condition.id, e.target.value)}
                        disabled={!needsValue(condition.operation)}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[200px]"
                      />
                    ) : (
                      <input
                        type="text"
                        value={condition.value}
                        onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                        disabled={!needsValue(condition.operation)}
                        placeholder={
                          condition.operation === 'IN' ? 'value1,value2,value3' :
                          needsValue(condition.operation) ? 'Enter value...' : 'Not required'
                        }
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed min-w-[200px]"
                      />
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {conditions.length > 1 && (
                      <button
                        onClick={() => removeCondition(condition.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                        title="Remove condition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={addCondition}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Condition</span>
            </button>
          </div>

          {/* Download Only Option */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={downloadOnly}
                onChange={(e) => setDownloadOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-sm font-medium text-blue-800">
                  Download to Excel only (don't load table)
                </span>
                <p className="text-xs text-blue-600 mt-1">
                  Downloads search results directly to Excel file without displaying in the table
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleClear}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Clear All
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSearch}
              disabled={isLoading || isDownloading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading || isDownloading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                  <span>{isDownloading ? 'Downloading...' : 'Searching...'}</span>
                </>
              ) : (
                <>
                  {downloadOnly ? (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      <span>Search</span>
                    </>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchModal;