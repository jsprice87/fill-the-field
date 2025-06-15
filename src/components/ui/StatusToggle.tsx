
import React from 'react';
import { Switch } from '@/components/ui/switch';

interface StatusToggleProps {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export function StatusToggle({ checked, disabled = false, onChange, id }: StatusToggleProps) {
  return (
    <div className="flex items-center space-x-3">
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label="Location status toggle"
      />
      <span className="text-sm font-medium text-gray-900">
        {checked ? "Location is active" : "Location is inactive"}
      </span>
    </div>
  );
}
