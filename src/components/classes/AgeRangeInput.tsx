
import React from 'react';
import { TextInput } from "@/components/ui/input";

interface AgeRangeInputProps {
  minAge: number;
  maxAge: number;
  onMinAgeChange: (value: number) => void;
  onMaxAgeChange: (value: number) => void;
}

const AgeRangeInput: React.FC<AgeRangeInputProps> = ({
  minAge,
  maxAge,
  onMinAgeChange,
  onMaxAgeChange,
}) => {
  return (
    <div className="flex items-center space-x-2 min-w-36">
      <div className="flex-1">
        <TextInput
          type="number"
          min="1"
          max="18"
          value={minAge.toString()}
          onChange={(e) => onMinAgeChange(parseInt(e.target.value) || 1)}
          style={{ textAlign: 'center', minWidth: '64px' }}
          title="Minimum age"
        />
      </div>
      <span className="text-muted-foreground text-sm whitespace-nowrap">to</span>
      <div className="flex-1">
        <TextInput
          type="number"
          min="1"
          max="18"
          value={maxAge.toString()}
          onChange={(e) => onMaxAgeChange(parseInt(e.target.value) || 18)}
          style={{ textAlign: 'center', minWidth: '64px' }}
          title="Maximum age"
        />
      </div>
    </div>
  );
};

export default AgeRangeInput;
