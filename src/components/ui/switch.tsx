
import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, disabled, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60",
      "data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-gray-200",
      "disabled:data-[state=checked]:bg-gray-300 disabled:data-[state=unchecked]:bg-gray-100",
      className
    )}
    disabled={disabled}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-6 w-6 rounded-full bg-white shadow-sm ring-0 transition-all duration-200 ease-in-out flex items-center justify-center",
        "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5",
        "disabled:bg-gray-400 disabled:shadow-none"
      )}
      style={{ 
        boxShadow: disabled ? 'none' : '0 0 2px rgba(0,0,0,0.15)' 
      }}
    >
      {props.checked && !disabled && (
        <Check className="h-3 w-3 text-emerald-600" strokeWidth={3} />
      )}
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
