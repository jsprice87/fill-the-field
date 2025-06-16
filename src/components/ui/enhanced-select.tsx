
import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface EnhancedSelectProps {
  label?: string
  error?: string
  success?: string
  hint?: string
  required?: boolean
  placeholder?: string
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  className?: string
}

const EnhancedSelect = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Root>,
  EnhancedSelectProps
>(({ 
  label, 
  error, 
  success, 
  hint, 
  required, 
  placeholder = "Select an option...",
  children,
  className,
  ...props 
}, ref) => {
  const inputId = React.useId()
  const hasError = !!error
  const hasSuccess = !!success && !error

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
      
      <SelectPrimitive.Root {...props}>
        <SelectPrimitive.Trigger
          id={inputId}
          ref={ref}
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-lg border bg-background px-3 py-2 text-body-sm transition-all duration-200",
            "placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "[&>span]:line-clamp-1",
            // Default state
            "border-gray-300 dark:border-gray-600",
            "focus:border-primary-500 focus:ring-primary-500/20",
            // Error state
            hasError && [
              "border-error-500 focus:border-error-500 focus:ring-error-500/20",
              "bg-error-50 dark:bg-error-900/10"
            ],
            // Success state
            hasSuccess && [
              "border-success-500 focus:border-success-500 focus:ring-success-500/20",
              "bg-success-50 dark:bg-success-900/10"
            ],
            className
          )}
        >
          <SelectPrimitive.Value placeholder={placeholder} />
          <SelectPrimitive.Icon asChild>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border bg-background shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2",
              "data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
            )}
            position="popper"
          >
            <SelectPrimitive.ScrollUpButton className="flex cursor-default items-center justify-center py-1">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {children}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex cursor-default items-center justify-center py-1">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      
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
})
EnhancedSelect.displayName = "EnhancedSelect"

const EnhancedSelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-body-sm outline-none",
      "focus:bg-gray-100 focus:text-gray-900 dark:focus:bg-gray-800 dark:focus:text-gray-50",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
EnhancedSelectItem.displayName = "EnhancedSelectItem"

export { EnhancedSelect, EnhancedSelectItem }
