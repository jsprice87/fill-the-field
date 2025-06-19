
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Facebook } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';

const MetaPixelCard: React.FC = () => {
  const { data: settings, isLoading } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  
  const [metaPixelId, setMetaPixelId] = useState('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Initialize local state when settings load
  useEffect(() => {
    if (settings) {
      setMetaPixelId(settings.meta_pixel_id || '');
      setHasUnsavedChanges(false);
    }
  }, [settings]);

  const validatePixelId = (value: string): boolean => {
    if (!value.trim()) {
      setValidationError('');
      return true; // Empty is valid (means no pixel)
    }
    
    const pixelRegex = /^\d{12,17}$/;
    const isValid = pixelRegex.test(value.trim());
    
    if (!isValid) {
      setValidationError('Meta Pixel ID must be 12-17 digits');
    } else {
      setValidationError('');
    }
    
    return isValid;
  };

  const handleInputChange = (value: string) => {
    setMetaPixelId(value);
    setHasUnsavedChanges(value !== (settings?.meta_pixel_id || ''));
    validatePixelId(value);
  };

  const handleSave = async () => {
    const trimmedValue = metaPixelId.trim();
    
    if (trimmedValue && !validatePixelId(trimmedValue)) {
      return;
    }

    try {
      await updateSetting.mutateAsync({ 
        key: 'meta_pixel_id', 
        value: trimmedValue 
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving Meta Pixel ID:', error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            Meta Pixel Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-5 w-5" />
          Meta Pixel Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
          <Input
            id="meta_pixel_id"
            placeholder="123456789012345 (12-17 digits)"
            value={metaPixelId}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={updateSetting.isPending}
            className={validationError ? 'border-red-500' : ''}
          />
          {validationError && (
            <p className="text-sm text-red-600 mt-1">{validationError}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Enter your Meta Pixel ID to track page views, leads, and conversions on your booking pages. Leave blank to disable Meta tracking.
          </p>
        </div>
        
        {hasUnsavedChanges && (
          <Button 
            onClick={handleSave}
            disabled={updateSetting.isPending || !!validationError}
            className="w-full"
          >
            {updateSetting.isPending ? 'Saving...' : 'Save Pixel ID'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default MetaPixelCard;
