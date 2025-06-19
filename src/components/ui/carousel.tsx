import * as React from "react"
import {
  Carousel as CarouselPrimitive,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselRoot,
  CarouselTrigger,
} from "react-carousel"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "./button"

const Carousel = CarouselRoot

const CarouselItem = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CarouselPrimitive.Item
    ref={ref}
    className={cn("-mr-1 snap-start first:pl-0 last:pr-0", className)}
    {...props}
  />
))
CarouselItem.displayName = "CarouselItem"

const CarouselContent = React.forwardRef<
  React.ElementRef<typeof CarouselPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CarouselPrimitive.Content>
>(({ className, ...props }, ref) => (
  <CarouselPrimitive.Content
    ref={ref}
    className={cn(
      "group relative flex w-full overflow-hidden py-2",
      className
    )}
    {...props}
  />
))
CarouselContent.displayName = "CarouselContent"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full left-12 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </Button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ className, variant = "outline", size = "icon", ...props }, ref) => {
  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn(
        "absolute h-8 w-8 rounded-full right-12 top-1/2 -translate-y-1/2",
        className
      )}
      {...props}
    >
      <ArrowRight className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </Button>
  )
})
CarouselNext.displayName = "CarouselNext"

const CarouselTrigger = CarouselPrimitive.Indicator

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  CarouselTrigger,
}
