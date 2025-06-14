
import { Check } from "lucide-react";

interface Props {
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}

export default function TestUrlToggle({ checked, disabled = false, onChange }: Props) {
  return (
    <label 
      className={`inline-flex items-center gap-2 ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      }`}
    >
      <input
        type="checkbox"
        className="sr-only focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-checked={checked}
      />
      <span
        className={`relative inline-block h-7 w-12 rounded-full transition-colors duration-200 ease-in-out ${
          checked 
            ? (disabled ? 'bg-gray-300' : 'bg-emerald-500') 
            : (disabled ? 'bg-gray-100' : 'bg-gray-200')
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full transition-all duration-200 ease-in-out flex items-center justify-center ${
            disabled 
              ? 'bg-gray-400 shadow-none' 
              : 'bg-white shadow-sm'
          } ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
          style={{ 
            boxShadow: disabled ? 'none' : '0 0 2px rgba(0,0,0,0.15)' 
          }}
        >
          {checked && !disabled && (
            <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
          )}
        </span>
      </span>
      <span className="text-sm font-medium">
        Use Test URL
        <span className="ml-1 text-xs text-gray-500">
          ({checked ? 'Test URL selected' : 'Production URL selected'})
        </span>
      </span>
    </label>
  );
}
