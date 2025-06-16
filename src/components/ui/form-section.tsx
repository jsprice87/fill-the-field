
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FormSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  description?: string
  required?: boolean
}

const FormSection = React.forwardRef<HTMLDivElement, FormSectionProps>(
  ({ className, title, description, required, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4", className)}
        {...props}
      >
        {(title || description) && (
          <div className="space-y-1">
            {title && (
              <h3 className="text-h3 text-gray-900 dark:text-gray-50">
                {title}
                {required && <span className="text-error-500 ml-1">*</span>}
              </h3>
            )}
            {description && (
              <p className="text-body-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    )
  }
)
FormSection.displayName = "FormSection"

export { FormSection }
