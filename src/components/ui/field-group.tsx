
import * as React from "react"
import { cn } from "@/lib/utils"

export interface FieldGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: 'horizontal' | 'vertical'
  gap?: 'sm' | 'md' | 'lg'
}

const FieldGroup = React.forwardRef<HTMLDivElement, FieldGroupProps>(
  ({ className, orientation = 'vertical', gap = 'md', children, ...props }, ref) => {
    const gapClasses = {
      sm: orientation === 'horizontal' ? 'gap-2' : 'space-y-2',
      md: orientation === 'horizontal' ? 'gap-4' : 'space-y-4',
      lg: orientation === 'horizontal' ? 'gap-6' : 'space-y-6'
    }

    return (
      <div
        ref={ref}
        className={cn(
          orientation === 'horizontal' ? 'flex flex-wrap items-start' : 'flex flex-col',
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
FieldGroup.displayName = "FieldGroup"

export { FieldGroup }
