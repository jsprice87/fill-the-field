
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AdminGlobalSettings: React.FC = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      // Use raw query to access global_settings table
      const { data, error } = await supabase
        .from('global_settings' as any)
        .select('*')
        .eq('setting_key', 'mapbox_public_token')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading global settings:', error);
        toast.error('Failed to load settings');
        return;
      }

      if (data) {
        setMapboxToken(data.setting_value || '');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveMapboxToken = async () => {
    if (!mapboxToken.trim()) {
      toast.error('Please enter a valid Mapbox token');
      return;
    }

    if (!mapboxToken.startsWith('pk.')) {
      toast.error('Mapbox public token must start with "pk."');
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('global_settings' as any)
        .upsert({
          setting_key: 'mapbox_public_token',
          setting_value: mapboxToken.trim(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error('Error saving Mapbox token:', error);
        toast.error('Failed to save Mapbox token');
        return;
      }

      toast.success('Mapbox token saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save Mapbox token');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Global Settings</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Global Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>System Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="system-name">System Name</Label>
            <Input 
              id="system-name" 
              defaultValue="SuperLeadStar" 
              disabled
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mapbox Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="mapbox-token">Mapbox Public Token</Label>
            <Input
              id="mapbox-token"
              type="text"
              placeholder="pk.eyJ1IjoieW91cnVzZXJuYW1lIiwia..."
              value={mapboxToken}
              onChange={(e) => setMapboxToken(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-500">
              Your Mapbox public token for geocoding and map services. Get yours at{' '}
              <a 
                href="https://account.mapbox.com/access-tokens/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                account.mapbox.com
              </a>
            </p>
          </div>
          <Button 
            onClick={saveMapboxToken}
            disabled={isSaving || !mapboxToken.trim()}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Mapbox Token'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminGlobalSettings;
