import * as React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "src/components/ui/avatar"
import { api } from "src/lib/api"
import type { AuthUser } from "src/lib/auth"
import { cn } from "src/lib/utils"

export function ProfileAvatar({
  user,
  className,
  fallbackClassName,
}: {
  user: AuthUser | null
  className?: string
  fallbackClassName?: string
}) {
  const [loadedAvatar, setLoadedAvatar] = React.useState<{ key: string; source: string } | null>(null)
  const name = user?.display_name || user?.username || "User"
  const initials = name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()
  const avatarKey = user?.has_avatar ? `${user.id}:${user.updated_at ?? "avatar"}` : null

  React.useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    if (!avatarKey) return

    api.profile.getAvatar()
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setLoadedAvatar({ key: avatarKey, source: objectUrl })
      })
      .catch(() => undefined)

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [avatarKey])

  const source = loadedAvatar?.key === avatarKey ? loadedAvatar.source : null

  return (
    <Avatar className={className}>
      {source && <AvatarImage src={source} alt={`${name}'s profile picture`} />}
      <AvatarFallback className={cn("bg-foreground text-background", fallbackClassName)}>{initials || "U"}</AvatarFallback>
    </Avatar>
  )
}
