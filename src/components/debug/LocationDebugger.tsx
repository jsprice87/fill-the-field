/**
 * Temporary debugging component for diagnosing location positioning issues
 * To use: Add <LocationDebugger /> to any page during development
 */

import React, { useState } from 'react';
import { Button, Card, Stack, Group, Text, Textarea, Alert } from '@mantine/core';
import { diagnoseLocationIssue } from '@/utils/geocodingDebug';

const LocationDebugger: React.FC = () => {
  const [results, setResults] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Pre-populate with suspected Lilley Gulch data for testing
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: 'CO',
    zip: ''
  });
  
  const handleDebug = async () => {
    if (!formData.address || !formData.city || !formData.zip) {
      setResults('❌ Please fill in all required fields (address, city, zip)');
      return;
    }
    
    setIsLoading(true);
    setResults('🔍 Debugging location... Check browser console for detailed output.\n\n');
    
    try {
      // Capture console output
      const originalLog = console.log;
      let output = '';
      
      console.log = (...args) => {
        const message = args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
        ).join(' ');
        output += message + '\n';
        originalLog(...args);
      };
      
      await diagnoseLocationIssue(formData);
      
      // Restore console.log
      console.log = originalLog;
      
      setResults(output);
    } catch (error) {
      setResults(`❌ Error during debugging: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const testLilleyGulch = () => {
    setFormData({
      address: '6063 S Independence St',
      city: 'Littleton',
      state: 'CO',
      zip: '80123'
    });
  };
  
  const testKnownGood = () => {
    setFormData({
      address: '550 E Iliff Ave',
      city: 'Denver',
      state: 'CO',
      zip: '80210'
    });
  };
  
  return (
    <Card withBorder padding="lg" style={{ margin: '20px', maxWidth: '800px' }}>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>🐛 Location Geocoding Debugger</Text>
          <Text size="xs" c="dimmed">Development Tool</Text>
        </Group>
        
        <Alert color="blue" title="Debug Tool">
          This tool helps diagnose location positioning issues by testing geocoding services.
          Use it to investigate why locations appear in wrong places on maps.
        </Alert>
        
        <Group grow>
          <Button variant="outline" onClick={testLilleyGulch} size="sm">
            Test Lilley Gulch (Correct Address)
          </Button>
          <Button variant="outline" onClick={testKnownGood} size="sm">
            Test Known Good Location
          </Button>
        </Group>
        
        <Group grow>
          <input
            type="text"
            placeholder="Address (e.g., Lilley Gulch)"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </Group>
        
        <Group grow>
          <input
            type="text"
            placeholder="State"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <input
            type="text"
            placeholder="ZIP Code"
            value={formData.zip}
            onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </Group>
        
        <Button 
          onClick={handleDebug} 
          loading={isLoading}
          disabled={!formData.address || !formData.city || !formData.zip}
        >
          🔍 Debug Location
        </Button>
        
        {results && (
          <Textarea
            label="Debug Results"
            value={results}
            readOnly
            autosize
            minRows={10}
            maxRows={20}
            style={{ fontFamily: 'monospace', fontSize: '12px' }}
          />
        )}
        
        <Alert color="orange" title="Usage Instructions">
          <Text size="sm">
            1. Enter the problematic location details<br/>
            2. Click "Debug Location" to test geocoding<br/>
            3. Check results for coordinate accuracy<br/>
            4. Compare with known good locations<br/>
            5. Remove this component before production
          </Text>
        </Alert>
      </Stack>
    </Card>
  );
};

export default LocationDebugger;