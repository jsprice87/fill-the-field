
import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EnhancedCheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
  description?: string
  error?: string
  indeterminate?: boolean
}

const EnhancedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  EnhancedCheckboxProps
>(({ className, label, description, error, indeterminate, ...props }, ref) => {
  const hasError = !!error

  return (
    <div className="space-y-2">
      <div className="flex items-start space-x-3">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            "peer h-5 w-5 shrink-0 rounded border-2 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "data-[state=checked]:bg-primary-500 data-[state=checked]:border-primary-500 data-[state=checked]:text-white",
            "data-[state=indeterminate]:bg-primary-500 data-[state=indeterminate]:border-primary-500 data-[state=indeterminate]:text-white",
            // Default state
            "border-gray-300 dark:border-gray-600 bg-background",
            "focus-visible:ring-primary-500/20",
            // Error state
            hasError && [
              "border-error-500 focus-visible:ring-error-500/20"
            ],
            className
          )}
          {...props}
        >
          <CheckboxPrimitive.Indicator
            className={cn("flex items-center justify-center text-current")}
          >
            {indeterminate ? (
              <Minus className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        
        {(label || description) && (
          <div className="space-y-1 flex-1">
            {label && (
              <label className="text-body-sm font-medium text-gray-900 dark:text-gray-50 cursor-pointer">
                {label}
              </label>
            )}
            {description && (
              <p className="text-body-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-body-sm text-error-500 ml-8">
          {error}
        </p>
      )}
    </div>
  )
})
EnhancedCheckbox.displayName = "EnhancedCheckbox"

export { EnhancedCheckbox }
