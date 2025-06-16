
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, Check } from "lucide-react"

export interface EnhancedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  showCharacterCount?: boolean
  maxLength?: number
}

const EnhancedTextarea = React.forwardRef<HTMLTextAreaElement, EnhancedTextareaProps>(
  ({ 
    className, 
    label, 
    error, 
    success, 
    hint, 
    required, 
    showCharacterCount = false,
    maxLength,
    id,
    value,
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()
    
    const hasError = !!error
    const hasSuccess = !!success && !error
    const characterCount = typeof value === 'string' ? value.length : 0

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className="text-body-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <textarea
            id={inputId}
            className={cn(
              "flex min-h-[120px] w-full rounded-lg border bg-background px-3 py-3 text-body-sm transition-all duration-200",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "resize-vertical",
              // Default state
              "border-gray-300 dark:border-gray-600",
              "focus-visible:border-primary-500 focus-visible:ring-primary-500/20",
              // Error state
              hasError && [
                "border-error-500 focus-visible:border-error-500 focus-visible:ring-error-500/20",
                "bg-error-50 dark:bg-error-900/10"
              ],
              // Success state
              hasSuccess && [
                "border-success-500 focus-visible:border-success-500 focus-visible:ring-success-500/20",
                "bg-success-50 dark:bg-success-900/10"
              ],
              // Focus state
              isFocused && "shadow-sm",
              className
            )}
            ref={ref}
            value={value}
            maxLength={maxLength}
            onFocus={(e) => {
              setIsFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setIsFocused(false)
              props.onBlur?.(e)
            }}
            {...props}
          />
          
          {hasError && (
            <div className="absolute right-3 top-3 text-error-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {hasSuccess && (
            <div className="absolute right-3 top-3 text-success-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-start">
          <div className="space-y-1 flex-1">
            {error && (
              <p className="text-body-sm text-error-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                {error}
              </p>
            )}
            {success && !error && (
              <p className="text-body-sm text-success-500 flex items-center gap-1">
                <Check className="h-3 w-3 flex-shrink-0" />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-body-sm text-muted-foreground">
                {hint}
              </p>
            )}
          </div>
          
          {showCharacterCount && maxLength && (
            <p className={cn(
              "text-body-sm ml-4 flex-shrink-0",
              characterCount > maxLength * 0.9 ? "text-warning-500" : "text-muted-foreground",
              characterCount >= maxLength ? "text-error-500" : ""
            )}>
              {characterCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
EnhancedTextarea.displayName = "EnhancedTextarea"

export { EnhancedTextarea }
