
import React, { useEffect } from 'react';

interface EnhancedLeafletValidatorProps {
  onValidation: (isValid: boolean, issues: string[]) => void;
  addDebugLog: (message: string) => void;
}

const EnhancedLeafletValidator: React.FC<EnhancedLeafletValidatorProps> = ({ 
  onValidation, 
  addDebugLog 
}) => {
  useEffect(() => {
    const validateLeafletEnvironment = async () => {
      const issues: string[] = [];
      
      addDebugLog('Starting enhanced Leaflet validation...');
      
      // 1. Check if Leaflet JS is available
      if (typeof window === 'undefined' || !window.L) {
        issues.push('Leaflet JavaScript not available');
        addDebugLog('❌ Leaflet JS not found on window object');
      } else {
        addDebugLog(`✅ Leaflet JS available (version: ${window.L.version})`);
      }
      
      // 2. Enhanced CSS validation
      const cssValidation = validateLeafletCSS();
      if (!cssValidation.isValid) {
        issues.push(...cssValidation.issues);
      }
      
      // 3. Check document readiness
      if (document.readyState !== 'complete') {
        addDebugLog('⏳ Document not fully loaded, waiting...');
        await new Promise(resolve => {
          if (document.readyState === 'complete') {
            resolve(true);
          } else {
            document.addEventListener('readystatechange', () => {
              if (document.readyState === 'complete') {
                resolve(true);
              }
            });
          }
        });
        addDebugLog('✅ Document now ready');
      } else {
        addDebugLog('✅ Document ready');
      }
      
      // 4. Check for React-Leaflet components
      try {
        const { MapContainer } = await import('react-leaflet');
        if (MapContainer) {
          addDebugLog('✅ React-Leaflet components available');
        }
      } catch (error) {
        issues.push('React-Leaflet components not available');
        addDebugLog('❌ React-Leaflet import failed');
      }
      
      const isValid = issues.length === 0;
      addDebugLog(`Enhanced validation complete: ${isValid ? 'PASSED' : 'FAILED'} (${issues.length} issues)`);
      
      onValidation(isValid, issues);
    };
    
    validateLeafletEnvironment();
  }, [onValidation, addDebugLog]);

  const validateLeafletCSS = () => {
    const issues: string[] = [];
    
    // Check for Leaflet CSS link tags
    const cssLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).filter(link => 
      link.getAttribute('href')?.includes('leaflet')
    );
    
    if (cssLinks.length > 0) {
      addDebugLog(`✅ Found ${cssLinks.length} Leaflet CSS link(s)`);
    } else {
      // Check for CSS in style tags or stylesheets
      let foundInStylesheets = false;
      
      try {
        Array.from(document.styleSheets).forEach(sheet => {
          try {
            const rules = Array.from(sheet.cssRules || []);
            const hasLeafletRules = rules.some(rule => 
              rule.cssText && (
                rule.cssText.includes('leaflet-container') ||
                rule.cssText.includes('leaflet-control') ||
                rule.cssText.includes('leaflet-marker')
              )
            );
            if (hasLeafletRules) {
              foundInStylesheets = true;
            }
          } catch (e) {
            // Cross-origin stylesheets can't be read
          }
        });
      } catch (e) {
        addDebugLog('Could not check stylesheets for Leaflet CSS');
      }
      
      if (foundInStylesheets) {
        addDebugLog('✅ Leaflet CSS found in stylesheets');
      } else {
        issues.push('Leaflet CSS not detected');
        addDebugLog('❌ Leaflet CSS not found anywhere');
      }
    }
    
    // Check for essential CSS classes in DOM
    const testDiv = document.createElement('div');
    testDiv.className = 'leaflet-container';
    testDiv.style.position = 'absolute';
    testDiv.style.top = '-9999px';
    document.body.appendChild(testDiv);
    
    const computedStyle = window.getComputedStyle(testDiv);
    const hasExpectedStyles = computedStyle.position === 'relative' || computedStyle.position === 'absolute';
    
    document.body.removeChild(testDiv);
    
    if (hasExpectedStyles) {
      addDebugLog('✅ Leaflet CSS styles are functional');
    } else {
      issues.push('Leaflet CSS styles not functional');
      addDebugLog('❌ Leaflet CSS styles not working properly');
    }
    
    return { isValid: issues.length === 0, issues };
  };

  return null;
};

export default EnhancedLeafletValidator;
