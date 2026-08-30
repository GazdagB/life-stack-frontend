import * as React from "react"
import { Building2 } from "lucide-react"

import { api, type Business } from "src/lib/api"
import { cn } from "src/lib/utils"

export function BusinessLogo({ business, className }: { business: Business; className?: string }) {
  const [loadedLogo, setLoadedLogo] = React.useState<{ key: string; source: string } | null>(null)
  const logoKey = business.logo_asset_id ? `${business.id}:${business.logo_asset_id}` : null

  React.useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    if (!logoKey) return

    void api.businesses.getLogo(business.id).then((blob) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setLoadedLogo({ key: logoKey, source: objectUrl })
    }).catch(() => {
      // Fall back to the business icon when the asset cannot be loaded.
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [business.id, logoKey])

  const source = loadedLogo?.key === logoKey ? loadedLogo.source : null

  return (
    <div className={cn("flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-background", className)}>
      {source
        ? <img src={source} alt={`${business.legal_name} logo`} className="size-full object-contain p-1.5" />
        : <Building2 className="size-5 text-muted-foreground" />}
    </div>
  )
}
