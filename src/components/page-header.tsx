import type { ComponentType, ReactNode, SVGProps } from "react"

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  icon: Icon,
}: {
  eyebrow?: string
  title: string
  description: string
  action?: ReactNode
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}) {
  return (
    <div className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          {Icon && (
            <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg border bg-muted/60 text-muted-foreground">
              <Icon className="size-4" />
            </div>
          )}
          <div className="min-w-0 space-y-1">
            {eyebrow && <p className="text-xs font-medium text-muted-foreground">{eyebrow}</p>}
            <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{title}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
          </div>
        </div>
        {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
