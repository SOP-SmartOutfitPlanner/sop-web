"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    animated?: boolean;
  }
>(({ className, value, animated = false, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-gray-200/80",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 transition-all duration-500 ease-out",
        "bg-gradient-to-r from-blue-500 via-purple-500 to-violet-600",
        "shadow-[0_0_20px_rgba(99,102,241,0.4)]"
      )}
      style={{ 
        transform: `translateX(-${100 - (value || 0)}%)`,
      }}
      asChild={animated}
    >
      {animated ? (
        <motion.div
          initial={{ transform: "translateX(-100%)" }}
          animate={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      ) : undefined}
    </ProgressPrimitive.Indicator>
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
