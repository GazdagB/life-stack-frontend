import * as React from "react"
import { PenLine } from "lucide-react"

import { api, type Business } from "src/lib/api"
import { cn } from "src/lib/utils"

export function BusinessSignature({ business, className }: { business: Business; className?: string }) {
  const [loadedSignature, setLoadedSignature] = React.useState<{ key: string; source: string } | null>(null)
  const signatureKey = business.signature_asset_id ? `${business.id}:${business.signature_asset_id}` : null

  React.useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false
    if (!signatureKey) return

    void api.businesses.getSignature(business.id).then((blob) => {
      if (cancelled) return
      objectUrl = URL.createObjectURL(blob)
      setLoadedSignature({ key: signatureKey, source: objectUrl })
    }).catch(() => undefined)

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [business.id, signatureKey])

  const source = loadedSignature?.key === signatureKey ? loadedSignature.source : null
  return (
    <div className={cn("flex h-20 w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-white", className)}>
      {source
        ? <img src={source} alt={`${business.legal_name} signature`} className="size-full object-contain p-2" />
        : <PenLine className="size-6 text-muted-foreground" />}
    </div>
  )
}
