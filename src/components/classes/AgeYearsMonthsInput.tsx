
import React from 'react';
import { Group } from '@mantine/core';
import { NumberInput } from '@/components/mantine/NumberInput';

interface AgeYearsMonthsInputProps {
  years: number;
  months: number;
  onYearsChange: (value: number) => void;
  onMonthsChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const AgeYearsMonthsInput: React.FC<AgeYearsMonthsInputProps> = ({
  years,
  months,
  onYearsChange,
  onMonthsChange,
  placeholder = "Age",
  disabled = false,
  className = "",
}) => {
  return (
    <Group gap="xs" className={className}>
      <NumberInput
        value={years}
        onChange={(value) => onYearsChange(typeof value === 'number' ? value : 0)}
        min={0}
        max={18}
        hideControls
        placeholder="Yrs"
        disabled={disabled}
        className="w-16"
        title={`${placeholder} years`}
      />
      <span className="text-gray-400 text-sm">y</span>
      <NumberInput
        value={months}
        onChange={(value) => onMonthsChange(typeof value === 'number' ? value : 0)}
        min={0}
        max={11}
        hideControls
        placeholder="Mo"
        disabled={disabled}
        className="w-16"
        title={`${placeholder} months`}
      />
      <span className="text-gray-400 text-sm">m</span>
    </Group>
  );
};

export default AgeYearsMonthsInput;
