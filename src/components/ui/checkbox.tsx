"use client"

import * as React from "react"
import { Checkbox as BaseCheckbox } from '@base-ui/react/checkbox'
import { IconCheckmark1 } from '@central-icons-react/round-outlined-radius-2-stroke-1.5/IconCheckmark1'

import { cn } from "@/shared/lib/utils"

const Checkbox = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof BaseCheckbox.Root>
>(({ className, ...props }, ref) => (
  <BaseCheckbox.Root
    ref={ref}
    className={cn(
      "peer grid h-4 w-4 shrink-0 place-content-center rounded-[5px] border border-border-secondary bg-card shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
      className
    )}
    {...props}
  >
    <BaseCheckbox.Indicator
      className={cn("grid place-content-center text-current")}
    >
      <IconCheckmark1 className="h-3.5 w-3.5" />
    </BaseCheckbox.Indicator>
  </BaseCheckbox.Root>
))
Checkbox.displayName = 'Checkbox'

export { Checkbox }
