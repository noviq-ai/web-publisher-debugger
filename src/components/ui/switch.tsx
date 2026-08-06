"use client"

import * as React from "react"
import { Switch as BaseSwitch } from '@base-ui/react/switch'

import { cn } from "@/shared/lib/utils"

const Switch = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<typeof BaseSwitch.Root>
>(({ className, ...props }, ref) => (
  <BaseSwitch.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input shadow-inner transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-checked:bg-primary",
      className
    )}
    {...props}
    ref={ref}
  >
    <BaseSwitch.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 translate-x-0 rounded-full bg-card shadow-sm ring-0 transition-transform data-checked:translate-x-4"
      )}
    />
  </BaseSwitch.Root>
))
Switch.displayName = 'Switch'

export { Switch }
