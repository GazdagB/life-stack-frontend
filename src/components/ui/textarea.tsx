import type * as React from "react"

import { cn } from "src/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed shadow-xs outline-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/80 hover:bg-muted/20 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
