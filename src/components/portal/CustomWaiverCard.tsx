import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea, Button } from '@mantine/core';
import { FileText, Eye } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { Modal } from '@/components/mantine/Modal';
import { Title, Text } from '@mantine/core';

const CustomWaiverCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  const [waiverText, setWaiverText] = useState(settings?.waiver_text || '');
  const [previewOpened, setPreviewOpened] = useState(false);

  const handleSave = () => {
    updateSetting.mutate({
      key: 'waiver_text',
      value: waiverText
    });
  };

  const defaultWaiver = `I acknowledge that participation in soccer activities involves certain inherent risks including, but not limited to, the risk of injury. I voluntarily assume all risks associated with participation and agree to release and hold harmless Soccer Stars, its instructors, and facility owners from any claims arising from participation in this program.

I confirm that my child is physically capable of participating in soccer activities and has no medical conditions that would prevent safe participation.

I grant permission for emergency medical treatment if needed during program activities.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Custom Waiver
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="waiver-text">Waiver Text</Label>
          <Textarea
            id="waiver-text"
            placeholder={defaultWaiver}
            value={waiverText}
            onChange={(e) => setWaiverText(e.target.value)}
            rows={8}
            className="mt-1"
          />
          <p className="text-sm text-muted-foreground mt-1">
            This text will appear in the booking form for parents to accept before completing their registration.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => setPreviewOpened(true)}
          >
            <Eye className="h-4 w-4" />
            Preview
          </Button>

          <Button 
            onClick={handleSave}
            disabled={updateSetting.isPending}
          >
            {updateSetting.isPending ? 'Saving...' : 'Save Waiver'}
          </Button>
        </div>

        <Modal
          opened={previewOpened}
          onClose={() => setPreviewOpened(false)}
          title="Waiver Preview"
          size="xl"
        >
          <div className="bg-gray-50 p-4 rounded-lg">
            <Title order={3} size="lg" mb="md">Liability Waiver and Release</Title>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap' }} mb="md">
              {waiverText || defaultWaiver}
            </Text>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="preview-accept" className="rounded" />
              <label htmlFor="preview-accept" className="text-sm">
                I have read and accept the terms of this waiver
              </label>
            </div>
          </div>
        </Modal>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• This waiver text will appear in the booking form</li>
            <li>• Parents must check the acceptance box to complete booking</li>
            <li>• If no custom text is provided, a default waiver will be used</li>
            <li>• Waiver acceptance is recorded with each booking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomWaiverCard;
