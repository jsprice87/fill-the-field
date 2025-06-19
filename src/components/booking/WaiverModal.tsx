
import React from 'react';
import { Modal } from '@mantine/core';
import { FileText } from 'lucide-react';

interface WaiverModalProps {
  opened: boolean;
  onClose: () => void;
  waiverText?: string;
  franchiseeData?: any;
}

export const WaiverModal: React.FC<WaiverModalProps> = ({
  opened,
  onClose,
  waiverText = '',
  franchiseeData
}) => {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <div className="font-agrandir text-brand-navy flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Liability Waiver and Agreement
          {franchiseeData && (
            <span className="text-sm font-poppins text-gray-600">
              - {franchiseeData.company_name}
            </span>
          )}
        </div>
      }
      size="xl"
      overlayProps={{ blur: 3 }}
    >
      <div className="prose prose-sm max-w-none font-poppins">
        <div className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed max-h-96 overflow-y-auto">
          {waiverText}
        </div>
      </div>
    </Modal>
  );
};

export default WaiverModal;
