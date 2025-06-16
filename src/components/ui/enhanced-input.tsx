
import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, Check, Eye, EyeOff } from "lucide-react"

export interface EnhancedInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  showPasswordToggle?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const EnhancedInput = React.forwardRef<HTMLInputElement, EnhancedInputProps>(
  ({ 
    className, 
    type, 
    label, 
    error, 
    success, 
    hint, 
    required, 
    showPasswordToggle = false,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [isFocused, setIsFocused] = React.useState(false)
    const inputId = id || React.useId()
    
    const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type

    const hasError = !!error
    const hasSuccess = !!success && !error
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon || showPasswordToggle

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
          {hasLeftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={inputType}
            className={cn(
              "flex h-12 w-full rounded-lg border bg-background px-3 py-2 text-body-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              "disabled:cursor-not-allowed disabled:opacity-50",
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
              // Icon spacing
              hasLeftIcon && "pl-10",
              hasRightIcon && "pr-10",
              className
            )}
            ref={ref}
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
          
          {hasRightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
              {showPasswordToggle ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : (
                rightIcon
              )}
            </div>
          )}
          
          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-error-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {hasSuccess && !hasRightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-success-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>
        
        {(error || success || hint) && (
          <div className="space-y-1">
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
        )}
      </div>
    )
  }
)
EnhancedInput.displayName = "EnhancedInput"

export { EnhancedInput }
