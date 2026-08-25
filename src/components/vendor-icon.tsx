import * as React from "react"
import { Icon } from "@iconify/react"

import { getExpenseCategory } from "src/lib/expense-categories"
import { cn } from "src/lib/utils"

type IconSearchResponse = {
  icons?: string[]
}

const CACHE_KEY = "life-stack:vendor-icons:v2"
const vendorIconCache = new Map<string, string | null>()

if (typeof window !== "undefined") {
  try {
    const cached = JSON.parse(window.localStorage.getItem(CACHE_KEY) ?? "{}") as Record<string, string | null>
    Object.entries(cached).forEach(([name, icon]) => vendorIconCache.set(name, icon))
  } catch {
    window.localStorage.removeItem(CACHE_KEY)
  }
}

const preferredBrandPrefixes = [
  "logos:",
  "thesvg-color:",
  "simple-icons:",
  "fa7-brands:",
  "fa6-brands:",
  "bxl:",
  "selfhst:",
  "tabler:brand-",
]

function selectBrandIcon(icons: string[]) {
  for (const prefix of preferredBrandPrefixes) {
    const icon = icons.find((candidate) => candidate.startsWith(prefix))
    if (icon) return icon
  }
  return null
}

async function searchVendorIcon(vendorName: string) {
  const words = vendorName.trim().toLowerCase().split(/\s+/).filter(Boolean)
  const queries = [...new Set([
    words.join(" "),
    words.slice(0, 2).join(" "),
    words[0],
  ].filter((query) => query.length >= 2))]

  for (const query of queries) {
    const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=32`)
    if (!response.ok) continue
    const result = await response.json() as IconSearchResponse
    const icon = selectBrandIcon(result.icons ?? [])
    if (icon) return icon
  }

  return null
}

function saveCache() {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(vendorIconCache)))
  } catch {
    // Icon lookup still works when local storage is unavailable.
  }
}

function initials(vendorName: string) {
  const words = vendorName.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export function VendorIcon({
  vendorName,
  categoryId,
  className,
}: {
  vendorName: string
  categoryId: number
  className?: string
}) {
  const normalizedName = vendorName.trim().toLowerCase()
  const [resolution, setResolution] = React.useState<{ name: string; icon: string | null }>({ name: "", icon: null })
  const iconId = vendorIconCache.has(normalizedName)
    ? vendorIconCache.get(normalizedName) ?? null
    : resolution.name === normalizedName ? resolution.icon : null

  React.useEffect(() => {
    let cancelled = false

    if (vendorIconCache.has(normalizedName)) return

    if (normalizedName.length < 2) return

    const timeout = window.setTimeout(() => {
      void searchVendorIcon(normalizedName)
        .then((resolvedIcon) => {
          if (cancelled) return
          vendorIconCache.set(normalizedName, resolvedIcon)
          saveCache()
          setResolution({ name: normalizedName, icon: resolvedIcon })
        })
        .catch(() => {
          if (!cancelled) setResolution({ name: normalizedName, icon: null })
        })
    }, 350)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [normalizedName])

  if (iconId) {
    return (
      <span
        className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-foreground shadow-sm ring-1 ring-foreground/10", className)}
        title={`${vendorName} brand icon`}
      >
        <Icon icon={iconId} className="size-5" aria-label={`${vendorName} brand icon`} />
      </span>
    )
  }

  const category = getExpenseCategory(categoryId)
  return (
    <span
      className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold tracking-tight", category.color, className)}
      title={`${vendorName || "Vendor"} monogram`}
      aria-label={`${vendorName || "Vendor"} monogram`}
    >
      {initials(vendorName)}
    </span>
  )
}
