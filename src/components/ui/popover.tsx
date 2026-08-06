import * as React from 'react'
import { Popover as PopoverPrimitive } from '@base-ui/react/popover'

import { cn } from '@/shared/lib/utils'

const Popover = PopoverPrimitive.Root
const PopoverTrigger = PopoverPrimitive.Trigger

type PopoverContentProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup> & {
  align?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>['align']
  side?: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Positioner>['side']
  sideOffset?: number
}

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Popup>,
  PopoverContentProps
>(({ className, align, side, sideOffset, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner align={align} side={side} sideOffset={sideOffset} className="z-50 outline-none">
      <PopoverPrimitive.Popup
        ref={ref}
        className={cn(
          'w-72 origin-[var(--transform-origin)] rounded-lg border bg-popover p-4 text-popover-foreground shadow-lg outline-none data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95',
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = 'PopoverContent'

export { Popover, PopoverTrigger, PopoverContent }
