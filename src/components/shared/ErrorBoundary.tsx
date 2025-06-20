import React from 'react';
import { Card } from '@mantine/core';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@mantine/core';

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType;
  onReset: () => void;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Caught error: ", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // If a fallback component is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent />;
      }
      
      // Otherwise, use the default fallback UI
      return (
        <Card className="w-full">
          <Card.Section>
            <Card.Section className="flex items-center space-x-2 p-4 border-b">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>Something went wrong!</span>
            </Card.Section>
          </Card.Section>
          <Card.Section className="py-4 p-4">
            <p className="text-sm text-muted-foreground">
              There was an error rendering this section. Please try again.
            </p>
            <Button className="mt-4" onClick={() => {
              this.setState({ hasError: false });
              this.props.onReset();
            }}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </Card.Section>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
