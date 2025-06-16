
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input"> & { 
  soccer?: boolean; 
  error?: boolean;
  loading?: boolean;
}>(
  ({ className, type, soccer = false, error = false, loading = false, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-card-sm py-2 text-body-lg ring-offset-background file:border-0 file:bg-transparent file:text-body-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-ui ease-ui min-h-[44px] interactive-input",
            soccer && "input-soccer border-gray-300 font-poppins focus:border-brand-navy focus:ring-0 focus-visible:ring-0",
            error && "border-error-500 focus-visible:ring-error-500",
            loading && "pr-10",
            className
          )}
          ref={ref}
          disabled={loading || props.disabled}
          {...props}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="loading-spinner h-4 w-4" />
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
