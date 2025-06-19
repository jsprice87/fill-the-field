
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-body-lg font-medium ring-offset-background transition-all duration-ui ease-ui focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 min-h-[44px] min-w-[44px] interactive-button",
  {
    variants: {
      variant: {
        default: "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg",
        destructive: "bg-error-500 text-white hover:bg-error-500/90 hover:shadow-lg",
        outline: "border border-input bg-background hover:bg-gray-50 hover:text-accent-foreground hover:shadow-md dark:hover:bg-gray-700",
        secondary: "bg-gray-100 text-gray-700 hover:bg-gray-100/80 hover:shadow-md dark:bg-gray-700 dark:text-gray-300",
        ghost: "hover:bg-gray-100 hover:text-gray-700 hover:shadow-sm dark:hover:bg-gray-700 dark:hover:text-gray-300",
        link: "text-primary-500 underline-offset-4 hover:underline hover:text-primary-600",
        // Soccer Stars brand variants (preserved for /free-trial/)
        soccer_primary: "bg-brand-red text-white font-poppins font-medium hover:bg-brand-blue hover:shadow-lg transition-all duration-ui ease-ui",
        soccer_secondary: "bg-transparent border-2 border-brand-navy text-brand-navy font-poppins font-medium hover:bg-brand-navy hover:text-white hover:shadow-lg transition-all duration-ui ease-ui",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-body-sm",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        soccer: "h-12 px-6 py-3 text-base", // Soccer Stars sizing
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <div className="loading-spinner h-4 w-4 mr-2" />
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
