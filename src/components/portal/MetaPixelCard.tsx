import React, { useState, useEffect } from 'react';
import { Card, Button, Text } from '@mantine/core';
import { TextInput } from '@/components/mantine/TextInput';
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
        <Card.Section>
          <Card.Section className="flex items-center gap-2 p-4 border-b">
            <Facebook className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Meta Pixel Tracking</h3>
          </Card.Section>
        </Card.Section>
        <Card.Section className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </Card.Section>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Section>
        <Card.Section className="flex items-center gap-2 p-4 border-b">
          <Facebook className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Meta Pixel Tracking</h3>
        </Card.Section>
      </Card.Section>
      <Card.Section className="space-y-4 p-4">
        <div>
          <TextInput
            label="Meta Pixel ID"
            placeholder="123456789012345 (12-17 digits)"
            value={metaPixelId}
            onChange={(e) => handleInputChange(e.target.value)}
            disabled={updateSetting.isPending}
            error={validationError}
          />
          <Text size="sm" c="dimmed" mt="xs">
            Enter your Meta Pixel ID to track page views, leads, and conversions on your booking pages. Leave blank to disable Meta tracking.
          </Text>
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
      </Card.Section>
    </Card>
  );
};

export default MetaPixelCard;
