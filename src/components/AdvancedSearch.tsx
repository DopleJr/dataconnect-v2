import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Filter, X } from 'lucide-react';

interface Column {
  key: string;
  label: string;
}

interface SearchCondition {
  id: string;
  field: string;
  operation: string;
  value: string;
  boolean: 'AND' | 'OR';
}

interface AdvancedSearchProps {
  columns: Column[];
  onSearch: (conditions: SearchCondition[]) => void;
  onClear: () => void;
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

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  columns,
  onSearch,
  onClear,
  isLoading
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conditions, setConditions] = useState<SearchCondition[]>([
    {
      id: '1',
      field: columns[0]?.key || '',
      operation: '=',
      value: '',
      boolean: 'AND'
    }
  ]);

  const addCondition = () => {
    const newCondition: SearchCondition = {
      id: Date.now().toString(),
      field: columns[0]?.key || '',
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
    onSearch(validConditions);
  };

  const handleClear = () => {
    setConditions([{
      id: '1',
      field: columns[0]?.key || '',
      operation: '=',
      value: '',
      boolean: 'AND'
    }]);
    onClear();
  };

  const needsValue = (operation: string) => {
    return !['IS_NULL', 'IS_NOT_NULL'].includes(operation);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
        >
          <Filter className="h-5 w-5" />
          <span className="font-medium">Advanced Search</span>
          {isOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
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
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Field
                  </label>
                  <select
                    value={condition.field}
                    onChange={(e) => updateCondition(condition.id, 'field', e.target.value)}
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {columns.map(column => (
                      <option key={column.key} value={column.key}>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={condition.value}
                    onChange={(e) => updateCondition(condition.id, 'value', e.target.value)}
                    disabled={!needsValue(condition.operation)}
                    placeholder={
                      condition.operation === 'IN' ? 'value1,value2,value3' :
                      needsValue(condition.operation) ? 'Enter value...' : 'Not required'
                    }
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
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

          <div className="flex items-center justify-between pt-4 border-t">
            <button
              onClick={addCondition}
              className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Condition</span>
            </button>

            <div className="flex space-x-3">
              <button
                onClick={handleClear}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Search</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;