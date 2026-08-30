import * as React from "react"
import { Camera, LoaderCircle, Pencil, Save, Trash2, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import { ProfileAvatar } from "src/components/profile-avatar"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Textarea } from "src/components/ui/textarea"
import { api } from "src/lib/api"
import { useAuth } from "src/lib/auth"

type ProfileDraft = {
  display_name: string
  username: string
  email: string
  bio: string
}

function draftFromUser(user: ReturnType<typeof useAuth>["user"]): ProfileDraft {
  return {
    display_name: user?.display_name ?? "",
    username: user?.username ?? "",
    email: user?.email ?? "",
    bio: user?.bio ?? "",
  }
}

export default function Profile() {
  const { t, i18n } = useTranslation("core")
  const { user, updateUser } = useAuth()
  const [draft, setDraft] = React.useState<ProfileDraft>(() => draftFromUser(user))
  const [isSaving, setIsSaving] = React.useState(false)
  const [isUploading, setIsUploading] = React.useState(false)
  const [error, setError] = React.useState("")
  const [success, setSuccess] = React.useState("")
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)
    try {
      const updated = await api.profile.update({
        username: draft.username.trim(),
        email: draft.email.trim(),
        display_name: draft.display_name.trim() || null,
        bio: draft.bio.trim() || null,
      })
      updateUser(updated)
      setDraft(draftFromUser(updated))
      setSuccess(t("profile.detailsSaved"))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("profile.saveError"))
    } finally {
      setIsSaving(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError(t("profile.invalidImage"))
      return
    }

    setError("")
    setSuccess("")
    setIsUploading(true)
    try {
      const updated = await api.profile.uploadAvatar(file)
      updateUser(updated)
      setSuccess(t("profile.pictureUpdated"))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("profile.uploadError"))
    } finally {
      setIsUploading(false)
    }
  }

  async function removeAvatar() {
    setError("")
    setSuccess("")
    setIsUploading(true)
    try {
      const updated = await api.profile.deleteAvatar()
      updateUser(updated)
      setSuccess(t("profile.pictureRemoved"))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("profile.removeError"))
    } finally {
      setIsUploading(false)
    }
  }

  const createdAt = user?.created_at
    ? new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "long" }).format(new Date(user.created_at))
    : null

  return (
    <>
      <PageHeader
        eyebrow={t("profile.eyebrow")}
        title={t("profile.title")}
        description={t("profile.description")}
      />

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{t("profile.picture")}</CardTitle>
            <CardDescription>{t("profile.pictureHelp")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="group relative">
              <button type="button" className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" onClick={() => fileInputRef.current?.click()} disabled={isUploading} aria-label={user?.has_avatar ? t("profile.changePicture") : t("profile.uploadPicture")}>
                <ProfileAvatar user={user} className="size-32 rounded-full shadow-sm transition-opacity group-hover:opacity-90" fallbackClassName="text-3xl" />
              </button>
              <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full shadow-md" onClick={() => fileInputRef.current?.click()} disabled={isUploading} aria-label={user?.has_avatar ? t("profile.editPicture") : t("profile.addPicture")}>
                {isUploading ? <LoaderCircle className="animate-spin" /> : <Pencil />}
              </Button>
            </div>
            <p className="mt-4 font-semibold">{user?.display_name || user?.username}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event)} />
            <div className="mt-5 grid w-full gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <LoaderCircle className="animate-spin" /> : <Camera />}
                {user?.has_avatar ? t("profile.change") : t("profile.upload")}
              </Button>
              {user?.has_avatar && <Button type="button" variant="outline" onClick={() => void removeAvatar()} disabled={isUploading}><Trash2 />{t("profile.remove")}</Button>}
            </div>
            {createdAt && <p className="mt-5 text-xs text-muted-foreground">{t("profile.memberSince", { date: createdAt })}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted p-2.5"><UserRound className="size-5" /></div>
              <div><CardTitle>{t("profile.personalDetails")}</CardTitle><CardDescription>{t("profile.personalDescription")}</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="profile-display-name">{t("profile.displayName")}</Label><Input id="profile-display-name" value={draft.display_name} maxLength={80} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} placeholder={t("profile.displayNamePlaceholder")} autoComplete="name" /></div>
                <div className="space-y-2"><Label htmlFor="profile-username">{t("profile.username")}</Label><Input id="profile-username" value={draft.username} minLength={3} maxLength={20} onChange={(event) => setDraft({ ...draft, username: event.target.value })} autoComplete="username" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="profile-email">{t("profile.email")}</Label><Input id="profile-email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} autoComplete="email" required /></div>
              <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="profile-bio">{t("profile.bio")}</Label><span className="text-xs text-muted-foreground">{draft.bio.length}/280</span></div><Textarea id="profile-bio" value={draft.bio} maxLength={280} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} placeholder={t("profile.bioPlaceholder")} /></div>
              <div className="flex justify-end border-t pt-5"><Button type="submit" disabled={isSaving}><Save />{isSaving ? t("profile.saving") : t("profile.save")}</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
