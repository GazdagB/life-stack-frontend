import * as React from "react"
import { Camera, LoaderCircle, Pencil, Save, Trash2, UserRound } from "lucide-react"

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
      setSuccess("Profile details saved.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your profile.")
    } finally {
      setIsSaving(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Choose a PNG, JPEG, or WebP image no larger than 5 MB.")
      return
    }

    setError("")
    setSuccess("")
    setIsUploading(true)
    try {
      const updated = await api.profile.uploadAvatar(file)
      updateUser(updated)
      setSuccess("Profile picture updated.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not upload your profile picture.")
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
      setSuccess("Profile picture removed.")
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not remove your profile picture.")
    } finally {
      setIsUploading(false)
    }
  }

  const createdAt = user?.created_at
    ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(new Date(user.created_at))
    : null

  return (
    <>
      <PageHeader
        eyebrow="My account"
        title="Profile"
        description="Manage the identity and profile picture shown throughout Life Stack."
      />

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {success && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">{success}</div>}

      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>PNG, JPEG, or WebP. Maximum 5 MB.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <div className="group relative">
              <button type="button" className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4" onClick={() => fileInputRef.current?.click()} disabled={isUploading} aria-label={user?.has_avatar ? "Change profile picture" : "Upload profile picture"}>
                <ProfileAvatar user={user} className="size-32 rounded-full shadow-sm transition-opacity group-hover:opacity-90" fallbackClassName="text-3xl" />
              </button>
              <Button type="button" size="icon" className="absolute bottom-0 right-0 rounded-full shadow-md" onClick={() => fileInputRef.current?.click()} disabled={isUploading} aria-label={user?.has_avatar ? "Edit profile picture" : "Add profile picture"}>
                {isUploading ? <LoaderCircle className="animate-spin" /> : <Pencil />}
              </Button>
            </div>
            <p className="mt-4 font-semibold">{user?.display_name || user?.username}</p>
            <p className="text-sm text-muted-foreground">@{user?.username}</p>
            <input ref={fileInputRef} type="file" className="hidden" accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event)} />
            <div className="mt-5 grid w-full gap-2">
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? <LoaderCircle className="animate-spin" /> : <Camera />}
                {user?.has_avatar ? "Change picture" : "Upload picture"}
              </Button>
              {user?.has_avatar && <Button type="button" variant="outline" onClick={() => void removeAvatar()} disabled={isUploading}><Trash2 />Remove picture</Button>}
            </div>
            {createdAt && <p className="mt-5 text-xs text-muted-foreground">Member since {createdAt}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-muted p-2.5"><UserRound className="size-5" /></div>
              <div><CardTitle>Personal details</CardTitle><CardDescription>Update how your account is identified.</CardDescription></div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="profile-display-name">Display name</Label><Input id="profile-display-name" value={draft.display_name} maxLength={80} onChange={(event) => setDraft({ ...draft, display_name: event.target.value })} placeholder="How you want to be addressed" autoComplete="name" /></div>
                <div className="space-y-2"><Label htmlFor="profile-username">Username</Label><Input id="profile-username" value={draft.username} minLength={3} maxLength={20} onChange={(event) => setDraft({ ...draft, username: event.target.value })} autoComplete="username" required /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="profile-email">Email address</Label><Input id="profile-email" type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} autoComplete="email" required /></div>
              <div className="space-y-2"><div className="flex items-center justify-between"><Label htmlFor="profile-bio">Bio</Label><span className="text-xs text-muted-foreground">{draft.bio.length}/280</span></div><Textarea id="profile-bio" value={draft.bio} maxLength={280} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} placeholder="A short note about you, your goals, or what you use Life Stack for." /></div>
              <div className="flex justify-end border-t pt-5"><Button type="submit" disabled={isSaving}><Save />{isSaving ? "Saving…" : "Save profile"}</Button></div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
