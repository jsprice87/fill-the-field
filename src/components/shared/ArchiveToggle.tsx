
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Archive } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

interface ArchiveToggleProps {
  className?: string;
}

const ArchiveToggle: React.FC<ArchiveToggleProps> = ({ className }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const showArchived = searchParams.get('archived') === 'true';

  const handleToggle = (checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set('archived', 'true');
    } else {
      newParams.delete('archived');
    }
    setSearchParams(newParams);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Archive className="h-4 w-4 text-muted-foreground" />
      <Switch
        id="archive-toggle"
        checked={showArchived}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor="archive-toggle" className="text-sm font-medium">
        Show Archived
      </Label>
    </div>
  );
};

export default ArchiveToggle;
