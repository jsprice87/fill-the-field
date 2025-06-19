
import React from 'react';
import { ActionIcon } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip } from '@mantine/core';

interface CopyButtonProps {
  url: string;
  className?: string;
}

export const CopyButton: React.FC<CopyButtonProps> = ({ url, className = '' }) => {
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied ✓",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to copy URL:', error);
      toast({
        title: "Failed to copy link",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      handleCopy(e as any);
    }
  };

  return (
    <Tooltip label="Copy link" position="right" withArrow>
      <ActionIcon
        variant="subtle"
        onClick={handleCopy}
        onKeyDown={handleKeyDown}
        className={className}
        aria-label="Copy landing page URL"
        size="sm"
      >
        <IconCopy size={16} />
      </ActionIcon>
    </Tooltip>
  );
};
