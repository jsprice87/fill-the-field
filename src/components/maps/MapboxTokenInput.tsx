
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { TextInput } from '@mantine/core';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Key } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSubmit: (token: string) => void;
  className?: string;
}

const MapboxTokenInput: React.FC<MapboxTokenInputProps> = ({ onTokenSubmit, className = "" }) => {
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    
    setIsSubmitting(true);
    try {
      onTokenSubmit(token.trim());
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <Key className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="font-agrandir text-xl text-brand-navy">
            Mapbox Token Required
          </CardTitle>
          <p className="font-poppins text-gray-600 text-sm">
            To show locations on the map, please enter your Mapbox public token.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <TextInput
                type="text"
                placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwia..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="font-mono text-sm"
                disabled={isSubmitting}
              />
              <p className="text-xs text-gray-500 mt-1">
                Your public token starts with "pk."
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-brand-blue hover:bg-brand-blue/90" 
              disabled={!token.trim() || isSubmitting}
            >
              {isSubmitting ? 'Loading Map...' : 'Load Map'}
            </Button>
            
            <div className="text-center">
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-brand-blue hover:underline"
              >
                Get your Mapbox token
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MapboxTokenInput;
