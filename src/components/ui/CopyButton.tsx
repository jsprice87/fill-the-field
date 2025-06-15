
import React from 'react';
import { ClipboardCopy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={handleCopy}
          onKeyDown={handleKeyDown}
          className={`h-6 w-6 flex items-center justify-center rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors ${className}`}
          aria-label="Copy landing page URL"
          tabIndex={0}
        >
          <ClipboardCopy className="h-4 w-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        Copy link
      </TooltipContent>
    </Tooltip>
  );
};
