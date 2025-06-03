
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onError: (error: string) => void;
  addDebugLog: (message: string) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.addDebugLog(`Map component error caught: ${error.message}`);
    console.error('Map ErrorBoundary caught an error:', error, errorInfo);
    
    // Check if it's a react-leaflet specific error
    const isReactLeafletError = error.stack?.includes('react-leaflet') || 
                               error.message.includes('leaflet') ||
                               error.message.includes('map') ||
                               error.message.includes('MapContainer');
    
    if (isReactLeafletError) {
      this.props.addDebugLog('Detected react-leaflet specific error');
      this.props.onError(`React-Leaflet component failed: ${error.message}`);
    } else {
      this.props.onError(`Map component error: ${error.message}`);
    }
  }

  render() {
    if (this.state.hasError) {
      return null; // Let parent handle the error display
    }

    return this.props.children;
  }
}

export default MapErrorBoundary;
