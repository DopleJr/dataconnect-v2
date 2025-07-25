import React, { useState, useMemo } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';

interface Column {
  key: string;
  label: string;
}

interface TableFilterProps {
  columns: Column[];
  data: any[];
  onFilteredDataChange: (filteredData: any[]) => void;
}

interface ColumnFilter {
  [key: string]: {
    enabled: boolean;
    values: Set<string>;
    searchTerm: string;
  };
}

const TableFilter: React.FC<TableFilterProps> = ({
  columns,
  data,
  onFilteredDataChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<ColumnFilter>({});
  const [expandedColumns, setExpandedColumns] = useState<Set<string>>(new Set());

  // Get unique values for each column
  const columnValues = useMemo(() => {
    const values: { [key: string]: string[] } = {};
    columns.forEach(column => {
      const uniqueValues = [...new Set(
        data.map(row => String(row[column.key] || '')).filter(val => val !== '')
      )].sort();
      values[column.key] = uniqueValues;
    });
    return values;
  }, [data, columns]);

  // Apply filters to data
  const filteredData = useMemo(() => {
    let result = data;
    
    Object.entries(filters).forEach(([columnKey, filter]) => {
      if (filter.enabled && filter.values.size > 0) {
        result = result.filter(row => {
          const cellValue = String(row[columnKey] || '');
          return filter.values.has(cellValue);
        });
      }
    });
    
    return result;
  }, [data, filters]);

  // Update parent component when filtered data changes
  React.useEffect(() => {
    onFilteredDataChange(filteredData);
  }, [filteredData, onFilteredDataChange]);

  const toggleColumnExpansion = (columnKey: string) => {
    const newExpanded = new Set(expandedColumns);
    if (newExpanded.has(columnKey)) {
      newExpanded.delete(columnKey);
    } else {
      newExpanded.add(columnKey);
    }
    setExpandedColumns(newExpanded);
  };

  const toggleFilter = (columnKey: string, enabled: boolean) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        enabled,
        values: enabled ? prev[columnKey]?.values || new Set() : new Set(),
        searchTerm: prev[columnKey]?.searchTerm || ''
      }
    }));
  };

  const toggleValue = (columnKey: string, value: string) => {
    setFilters(prev => {
      const currentFilter = prev[columnKey] || { enabled: true, values: new Set(), searchTerm: '' };
      const newValues = new Set(currentFilter.values);
      
      if (newValues.has(value)) {
        newValues.delete(value);
      } else {
        newValues.add(value);
      }
      
      return {
        ...prev,
        [columnKey]: {
          ...currentFilter,
          values: newValues
        }
      };
    });
  };

  const selectAll = (columnKey: string) => {
    const filteredValues = getFilteredValues(columnKey);
    setFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        enabled: true,
        values: new Set(filteredValues),
        searchTerm: prev[columnKey]?.searchTerm || ''
      }
    }));
  };

  const clearAll = (columnKey: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        values: new Set(),
        searchTerm: prev[columnKey]?.searchTerm || ''
      }
    }));
  };

  const updateSearchTerm = (columnKey: string, searchTerm: string) => {
    setFilters(prev => ({
      ...prev,
      [columnKey]: {
        ...prev[columnKey],
        enabled: prev[columnKey]?.enabled || false,
        values: prev[columnKey]?.values || new Set(),
        searchTerm
      }
    }));
  };

  const getFilteredValues = (columnKey: string) => {
    const searchTerm = filters[columnKey]?.searchTerm?.toLowerCase() || '';
    return columnValues[columnKey]?.filter(value => 
      value.toLowerCase().includes(searchTerm)
    ) || [];
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const activeFiltersCount = Object.values(filters).filter(f => f.enabled && f.values.size > 0).length;

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            <Filter className="h-5 w-5" />
            <span className="font-medium">Column Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
          
          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {columns.map(column => {
              const isExpanded = expandedColumns.has(column.key);
              const currentFilter = filters[column.key];
              const filteredValues = getFilteredValues(column.key);
              const selectedCount = currentFilter?.values.size || 0;
              
              return (
                <div key={column.key} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={currentFilter?.enabled || false}
                        onChange={(e) => toggleFilter(column.key, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700 truncate">
                        {column.label}
                      </span>
                    </div>
                    <button
                      onClick={() => toggleColumnExpansion(column.key)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {selectedCount > 0 && (
                    <div className="text-xs text-blue-600 mb-2">
                      {selectedCount} selected
                    </div>
                  )}

                  {isExpanded && currentFilter?.enabled && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search values..."
                        value={currentFilter.searchTerm}
                        onChange={(e) => updateSearchTerm(column.key, e.target.value)}
                        className="w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => selectAll(column.key)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          Select All
                        </button>
                        <button
                          onClick={() => clearAll(column.key)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Clear
                        </button>
                      </div>

                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {filteredValues.map(value => (
                          <label key={value} className="flex items-center space-x-2 text-xs">
                            <input
                              type="checkbox"
                              checked={currentFilter.values.has(value)}
                              onChange={() => toggleValue(column.key, value)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="truncate" title={value}>{value}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFilter;