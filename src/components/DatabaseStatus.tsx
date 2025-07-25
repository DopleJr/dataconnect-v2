import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { checkDatabaseConnection } from '../services/api';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkDatabaseConnection();
        if (result.connected) {
          setStatus('connected');
          
          // Hide the status after 5 seconds if connected
          setTimeout(() => {
            setVisible(false);
          }, 5000);
        } else {
          setStatus('error');
        }
      } catch (error) {
        setStatus('error');
      }
    };

    checkConnection();
  }, []);

  if (!visible) return null;

  return (
    <div className={`fixed bottom-4 right-4 rounded-lg shadow-lg p-4 transition-all duration-300 ${
      status === 'loading' ? 'bg-gray-100' :
      status === 'connected' ? 'bg-green-50' : 'bg-red-50'
    }`}>
      <div className="flex items-center space-x-2">
        {status === 'loading' && (
          <>
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-sm font-medium text-gray-700">Checking database connection...</span>
          </>
        )}
        
        {status === 'connected' && (
          <>
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">Connected to MySQL database</span>
          </>
        )}
        
        {status === 'error' && (
          <>
            <XCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-700">Database connection failed</span>
            <button 
              className="ml-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors duration-200"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </>
        )}
        
        {status !== 'loading' && (
          <button 
            className="ml-2 text-gray-400 hover:text-gray-600"
            onClick={() => setVisible(false)}
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
      
      {status === 'error' && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
          <AlertCircle className="inline h-3 w-3 mr-1" />
          Make sure your MySQL server is running and credentials are correct in the server configuration.
        </div>
      )}
    </div>
  );
};

export default DatabaseStatus;