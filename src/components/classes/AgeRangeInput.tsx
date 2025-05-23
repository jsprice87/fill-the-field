
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="flex items-center space-x-2">
      <div className="flex-1">
        <Input
          type="number"
          min="1"
          max="18"
          value={minAge}
          onChange={(e) => onMinAgeChange(parseInt(e.target.value) || 1)}
          className="w-full text-center"
          title="Minimum age"
        />
      </div>
      <span className="text-muted-foreground text-sm">to</span>
      <div className="flex-1">
        <Input
          type="number"
          min="1"
          max="18"
          value={maxAge}
          onChange={(e) => onMaxAgeChange(parseInt(e.target.value) || 18)}
          className="w-full text-center"
          title="Maximum age"
        />
      </div>
    </div>
  );
};

export default AgeRangeInput;
