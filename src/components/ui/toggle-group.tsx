import * as React from "react"
import { SegmentedControl } from "@mantine/core"

// Legacy wrapper for ToggleGroup - use Mantine SegmentedControl directly in new code
interface ToggleGroupProps {
  type?: "single" | "multiple"
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  children?: React.ReactNode
  className?: string
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline"
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ children, className, size = "md", variant = "default", type = "single", value, onValueChange, ...props }, ref) => {
    console.warn("ToggleGroup is deprecated. Use Mantine SegmentedControl directly instead.")
    
    // Convert children to data format for SegmentedControl
    const data = React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return {
          label: child.props.children,
          value: child.props.value || index.toString(),
        }
      }
      return null
    }).filter(Boolean)

    return (
      <div ref={ref} className={className} {...props}>
        <SegmentedControl
          data={data}
          value={Array.isArray(value) ? value[0] : value}
          onChange={(val) => onValueChange?.(type === "multiple" ? [val] : val)}
          size={size}
          variant={variant === "outline" ? "outline" : "default"}
        />
      </div>
    )
  }
)

ToggleGroup.displayName = "ToggleGroup"

// Legacy wrapper for ToggleGroupItem
interface ToggleGroupItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

const ToggleGroupItem = React.forwardRef<HTMLDivElement, ToggleGroupItemProps>(
  ({ value, children, className, ...props }, ref) => {
    // This is just a placeholder - the actual rendering is handled by SegmentedControl
    return null
  }
)

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
