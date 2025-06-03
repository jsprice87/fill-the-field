
import React, { useEffect, useState } from 'react';

interface LeafletValidatorProps {
  onValidation: (isValid: boolean, issues: string[]) => void;
  addDebugLog: (message: string) => void;
}

const LeafletValidator: React.FC<LeafletValidatorProps> = ({ onValidation, addDebugLog }) => {
  const [validationComplete, setValidationComplete] = useState(false);

  useEffect(() => {
    const validateLeaflet = () => {
      const issues: string[] = [];
      
      addDebugLog('Starting Leaflet validation...');
      
      // Check if Leaflet CSS is loaded
      const leafletCSS = document.querySelector('link[href*="leaflet"], style[data-styled*="leaflet"]');
      if (!leafletCSS) {
        // Check if CSS is inline or in a different format
        const hasLeafletStyles = Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules || []).some(rule => 
              rule.cssText && rule.cssText.includes('leaflet')
            );
          } catch (e) {
            return false;
          }
        });
        
        if (!hasLeafletStyles) {
          issues.push('Leaflet CSS not detected');
          addDebugLog('❌ Leaflet CSS validation failed');
        } else {
          addDebugLog('✅ Leaflet CSS found in stylesheets');
        }
      } else {
        addDebugLog('✅ Leaflet CSS link found');
      }
      
      // Check if Leaflet JavaScript is available
      if (typeof window !== 'undefined' && !window.L) {
        issues.push('Leaflet JavaScript not loaded');
        addDebugLog('❌ Leaflet JS validation failed');
      } else {
        addDebugLog('✅ Leaflet JS available');
      }
      
      // Check if document is ready
      if (document.readyState !== 'complete') {
        issues.push('Document not fully loaded');
        addDebugLog('❌ Document not ready');
      } else {
        addDebugLog('✅ Document ready');
      }
      
      const isValid = issues.length === 0;
      addDebugLog(`Leaflet validation complete: ${isValid ? 'PASSED' : 'FAILED'} (${issues.length} issues)`);
      
      onValidation(isValid, issues);
      setValidationComplete(true);
    };
    
    // Run validation after a short delay to ensure everything is loaded
    const timeout = setTimeout(validateLeaflet, 100);
    
    return () => clearTimeout(timeout);
  }, [onValidation, addDebugLog]);

  return null;
};

export default LeafletValidator;
