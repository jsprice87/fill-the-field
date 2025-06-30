import React, { useState, useEffect } from 'react';
import { Card, Button, Stack, Group, Flex, Title, Text, Textarea, Checkbox } from '@mantine/core';
import { FileText, Eye } from 'lucide-react';
import { useFranchiseeSettings, useUpdateFranchiseeSetting } from '@/hooks/useFranchiseeSettings';
import { Modal } from '@/components/mantine/Modal';

const CustomWaiverCard: React.FC = () => {
  const { data: settings } = useFranchiseeSettings();
  const updateSetting = useUpdateFranchiseeSetting();
  const [waiverText, setWaiverText] = useState('');
  const [previewOpened, setPreviewOpened] = useState(false);

  // Update waiver text when settings load
  useEffect(() => {
    if (settings?.waiver_text !== undefined) {
      setWaiverText(settings.waiver_text);
    }
  }, [settings?.waiver_text]);

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
      <Card.Section withBorder>
        <Flex align="center" gap="sm" p="md">
          <FileText size={20} />
          <Title order={3}>Custom Waiver</Title>
        </Flex>
      </Card.Section>
      <Card.Section p="md">
        <Stack gap="md">
          <div>
            <Textarea
              label="Waiver Text"
              placeholder={defaultWaiver}
              value={waiverText}
              onChange={(e) => setWaiverText(e.target.value)}
              rows={8}
              description="This text will appear in the booking form for parents to accept before completing their registration."
            />
          </div>

          <Flex justify="space-between">
            <Button 
              variant="outline" 
              leftSection={<Eye size={16} />}
              onClick={() => setPreviewOpened(true)}
            >
              Preview
            </Button>

            <Button 
              onClick={handleSave}
              loading={updateSetting.isPending}
            >
              Save Waiver
            </Button>
          </Flex>

          <Modal
            opened={previewOpened}
            onClose={() => setPreviewOpened(false)}
            title="Waiver Preview"
            size="xl"
          >
            <Card bg="gray.1" p="md">
              <Title order={3} size="lg" mb="md">Liability Waiver and Release</Title>
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }} mb="md">
                {waiverText || defaultWaiver}
              </Text>
              <Flex align="center" gap="sm">
                <Checkbox id="preview-accept" />
                <Text size="sm">
                  I have read and accept the terms of this waiver
                </Text>
              </Flex>
            </Card>
          </Modal>

          <Card bg="blue.0" p="md">
            <Title order={4} c="blue.9" mb="xs">How it works:</Title>
            <Text size="sm" c="blue.8">
              • This waiver text will appear in the booking form
              <br />
              • Parents must check the acceptance box to complete booking
              <br />
              • If no custom text is provided, a default waiver will be used
              <br />
              • Waiver acceptance is recorded with each booking
            </Text>
          </Card>
        </Stack>
      </Card.Section>
    </Card>
  );
};

export default CustomWaiverCard;
