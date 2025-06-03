
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface NetworkHealthCheckProps {
  onHealthCheck?: (results: HealthCheckResults) => void;
}

interface HealthCheckResults {
  supabaseConnection: boolean;
  apiResponse: boolean;
  timestamp: string;
  errors: string[];
}

const NetworkHealthCheck: React.FC<NetworkHealthCheckProps> = ({ onHealthCheck }) => {
  const [healthResults, setHealthResults] = useState<HealthCheckResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runHealthCheck = async () => {
    setIsRunning(true);
    const results: HealthCheckResults = {
      supabaseConnection: false,
      apiResponse: false,
      timestamp: new Date().toISOString(),
      errors: []
    };

    try {
      // Test basic Supabase connection
      console.log('[HealthCheck] Testing Supabase connection...');
      const { data, error } = await supabase.from('franchisees').select('count').limit(1);
      
      if (error) {
        results.errors.push(`Supabase error: ${error.message}`);
        console.error('[HealthCheck] Supabase connection failed:', error);
      } else {
        results.supabaseConnection = true;
        console.log('[HealthCheck] Supabase connection successful');
      }

      // Test a simple API call
      console.log('[HealthCheck] Testing API response...');
      const { data: testData, error: testError } = await supabase
        .from('franchisees')
        .select('id, slug')
        .limit(1);

      if (testError) {
        results.errors.push(`API test error: ${testError.message}`);
        console.error('[HealthCheck] API test failed:', testError);
      } else {
        results.apiResponse = true;
        console.log('[HealthCheck] API test successful');
      }

    } catch (error) {
      results.errors.push(`Network error: ${error}`);
      console.error('[HealthCheck] Network test failed:', error);
    }

    setHealthResults(results);
    setIsRunning(false);
    onHealthCheck?.(results);
  };

  useEffect(() => {
    // Only run automatically in development or when debug is enabled
    if (window.location.hostname === 'localhost' || window.location.search.includes('debug=true')) {
      runHealthCheck();
    }
  }, []);

  // Only show in development or debug mode
  if (window.location.hostname !== 'localhost' && !window.location.search.includes('debug=true')) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded max-w-sm z-50">
      <h4 className="font-bold mb-2">Network Health Check</h4>
      
      <button
        onClick={runHealthCheck}
        disabled={isRunning}
        className="mb-2 px-2 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-50"
      >
        {isRunning ? 'Running...' : 'Run Check'}
      </button>

      {healthResults && (
        <div className="text-xs space-y-1">
          <div className={`flex items-center ${healthResults.supabaseConnection ? 'text-green-400' : 'text-red-400'}`}>
            <span className="mr-2">{healthResults.supabaseConnection ? '✓' : '✗'}</span>
            Supabase Connection
          </div>
          <div className={`flex items-center ${healthResults.apiResponse ? 'text-green-400' : 'text-red-400'}`}>
            <span className="mr-2">{healthResults.apiResponse ? '✓' : '✗'}</span>
            API Response
          </div>
          <div className="text-gray-300 text-xs">
            {healthResults.timestamp}
          </div>
          {healthResults.errors.length > 0 && (
            <div className="mt-2">
              <div className="font-semibold text-red-400">Errors:</div>
              {healthResults.errors.map((error, index) => (
                <div key={index} className="text-red-300 text-xs">{error}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NetworkHealthCheck;
