import * as React from "react"
import {
  Eye,
  EyeOff,
  KeyRound,
  Laptop,
  LoaderCircle,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "src/components/ui/alert-dialog"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Skeleton } from "src/components/ui/skeleton"
import { ApiError, api, type AuthSession } from "src/lib/api"

type DeviceDetails = {
  browser: string
  device: string
  mobile: boolean
}

function describeDevice(userAgent: string | null, unknownBrowser: string, unknownDevice: string): DeviceDetails {
  if (!userAgent) return { browser: unknownBrowser, device: unknownDevice, mobile: false }

  const browser = userAgent.match(/Edg\//) ? "Microsoft Edge"
    : userAgent.match(/Firefox\//) ? "Firefox"
      : userAgent.match(/(?:Chrome|CriOS)\//) ? "Google Chrome"
        : userAgent.match(/Safari\//) ? "Safari"
          : unknownBrowser
  const device = userAgent.match(/iPhone/) ? "iPhone"
    : userAgent.match(/iPad/) ? "iPad"
      : userAgent.match(/Android/) ? "Android"
        : userAgent.match(/Mac OS X/) ? "macOS"
          : userAgent.match(/Windows/) ? "Windows"
            : userAgent.match(/Linux/) ? "Linux"
              : unknownDevice

  return { browser, device, mobile: /Mobile|iPhone|iPad|Android/.test(userAgent) }
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete,
  visible,
  toggleVisibility,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  autoComplete: string
  visible: boolean
  toggleVisibility: () => void
}) {
  const { t } = useTranslation()
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className="pr-10"
          required
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute right-0.5 top-1/2 -translate-y-1/2"
          onClick={toggleVisibility}
          aria-label={t(visible ? "settings.security.hidePassword" : "settings.security.showPassword")}
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </Button>
      </div>
    </div>
  )
}

export function SecuritySettings() {
  const { t, i18n } = useTranslation()
  const [sessions, setSessions] = React.useState<AuthSession[]>([])
  const [loadingSessions, setLoadingSessions] = React.useState(true)
  const [sessionError, setSessionError] = React.useState(false)
  const [sessionActionError, setSessionActionError] = React.useState(false)
  const [revoking, setRevoking] = React.useState<string | "others" | null>(null)
  const [sessionNoticeCount, setSessionNoticeCount] = React.useState<number | null>(null)
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [passwordsVisible, setPasswordsVisible] = React.useState(false)
  const [changingPassword, setChangingPassword] = React.useState(false)
  const [passwordMessage, setPasswordMessage] = React.useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = React.useState(false)

  const locale = i18n.resolvedLanguage === "de" ? "de-DE" : i18n.resolvedLanguage === "hu" ? "hu-HU" : "en-US"

  const formatDate = React.useCallback((value: string) => {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date)
  }, [locale])

  async function refreshSessions() {
    setLoadingSessions(true)
    setSessionError(false)
    setSessionActionError(false)
    try {
      setSessions(await api.settings.listSessions())
    } catch {
      setSessionError(true)
    } finally {
      setLoadingSessions(false)
    }
  }

  React.useEffect(() => {
    let cancelled = false
    api.settings.listSessions()
      .then((activeSessions) => {
        if (!cancelled) setSessions(activeSessions)
      })
      .catch(() => {
        if (!cancelled) setSessionError(true)
      })
      .finally(() => {
        if (!cancelled) setLoadingSessions(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function revokeSession(familyId: string) {
    setRevoking(familyId)
    setSessionNoticeCount(null)
    setSessionActionError(false)
    try {
      await api.settings.revokeSession(familyId)
      setSessions((current) => current.filter((session) => session.family_id !== familyId))
    } catch {
      setSessionActionError(true)
    } finally {
      setRevoking(null)
    }
  }

  async function revokeOthers() {
    setRevoking("others")
    setSessionNoticeCount(null)
    setSessionActionError(false)
    try {
      const result = await api.settings.revokeOtherSessions()
      setSessionNoticeCount(result.revoked_count)
      setSessions((current) => current.filter((session) => session.is_current))
    } catch {
      setSessionActionError(true)
    } finally {
      setRevoking(null)
    }
  }

  async function submitPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPasswordSuccess(false)
    if (newPassword.length < 15) {
      setPasswordMessage(t("settings.security.passwordMinimum"))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage(t("settings.security.passwordMismatch"))
      return
    }
    if (newPassword === currentPassword) {
      setPasswordMessage(t("settings.security.passwordSame"))
      return
    }

    setChangingPassword(true)
    setPasswordMessage(null)
    try {
      await api.settings.changePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordSuccess(true)
      setSessions((current) => current.filter((session) => session.is_current))
    } catch (error) {
      if (error instanceof ApiError && error.status === 400 && error.message.includes("Current password")) {
        setPasswordMessage(t("settings.security.passwordIncorrect"))
      } else if (error instanceof ApiError && error.status === 400 && error.message.includes("different")) {
        setPasswordMessage(t("settings.security.passwordSame"))
      } else {
        setPasswordMessage(t("settings.security.passwordError"))
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const otherSessionCount = sessions.filter((session) => !session.is_current).length

  return (
    <section className="max-w-3xl space-y-4" aria-labelledby="security-settings-title">
      <div className="flex items-center gap-3 pt-3">
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary"><ShieldCheck className="size-5" /></div>
        <div>
          <h2 id="security-settings-title" className="font-heading text-xl font-semibold">{t("settings.security.title")}</h2>
          <p className="text-sm text-muted-foreground">{t("settings.security.description")}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2"><MonitorSmartphone className="size-4" />{t("settings.security.sessionsTitle")}</CardTitle>
              <CardDescription>{t("settings.security.sessionsDescription")}</CardDescription>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" onClick={() => void refreshSessions()} disabled={loadingSessions}>
              <RefreshCw className={loadingSessions ? "size-4 animate-spin" : "size-4"} />
              <span className="sr-only">{t("settings.security.loadingSessions")}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSessions ? (
            <div className="space-y-3" aria-label={t("settings.security.loadingSessions")}>
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : sessionError ? (
            <p className="text-sm text-destructive" role="alert">{t("settings.security.loadError")}</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("settings.security.noSessions")}</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const device = describeDevice(
                  session.user_agent,
                  t("settings.security.unknownBrowser"),
                  t("settings.security.unknownDevice"),
                )
                const DeviceIcon = device.mobile ? Smartphone : Laptop
                return (
                  <div key={session.family_id} className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <div className="rounded-lg bg-muted p-2"><DeviceIcon className="size-5" /></div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{device.browser} · {device.device}</p>
                          {session.is_current && <Badge variant="secondary">{t("settings.security.currentDevice")}</Badge>}
                          {!session.is_current && (
                            <Badge variant="outline">
                              {t(session.is_recognized_device ? "settings.security.recognizedDevice" : "settings.security.legacySession")}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{t("settings.security.lastActive", { date: formatDate(session.last_used_at) })}</p>
                        <p className="text-xs text-muted-foreground">{t("settings.security.signedIn", { date: formatDate(session.created_at) })} · {t("settings.security.expires", { date: formatDate(session.expires_at) })}</p>
                      </div>
                    </div>
                    {!session.is_current && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="outline" size="sm" disabled={revoking !== null}>
                            {revoking === session.family_id && <LoaderCircle className="size-4 animate-spin" />}
                            {t(revoking === session.family_id ? "settings.security.revoking" : "settings.security.revoke")}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t("settings.security.revokeTitle")}</AlertDialogTitle>
                            <AlertDialogDescription>{t("settings.security.revokeDescription")}</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t("settings.security.cancel")}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => void revokeSession(session.family_id)}>{t("settings.security.revokeConfirm")}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )
              })}
              <p className="text-xs leading-relaxed text-muted-foreground">{t("settings.security.deviceIdentityHelp")}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className={sessionActionError ? "text-sm text-destructive" : "text-sm text-emerald-700"} aria-live="polite">
              {sessionActionError
                ? t("settings.security.actionError")
                : sessionNoticeCount !== null
                  ? t("settings.security.revoked", { count: sessionNoticeCount })
                  : null}
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" variant="outline" disabled={otherSessionCount === 0 || revoking !== null}>
                  {revoking === "others" && <LoaderCircle className="size-4 animate-spin" />}
                  {t(revoking === "others" ? "settings.security.revokingOthers" : "settings.security.revokeOthers")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("settings.security.revokeOthersTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>{t("settings.security.revokeOthersDescription")}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("settings.security.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={() => void revokeOthers()}>{t("settings.security.revokeOthersConfirm")}</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="size-4" />{t("settings.security.passwordTitle")}</CardTitle>
          <CardDescription>{t("settings.security.passwordDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={(event) => void submitPassword(event)}>
            <PasswordInput id="current-password" label={t("settings.security.currentPassword")} value={currentPassword} onChange={setCurrentPassword} autoComplete="current-password" visible={passwordsVisible} toggleVisibility={() => setPasswordsVisible((value) => !value)} />
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput id="new-password" label={t("settings.security.newPassword")} value={newPassword} onChange={setNewPassword} autoComplete="new-password" visible={passwordsVisible} toggleVisibility={() => setPasswordsVisible((value) => !value)} />
              <PasswordInput id="confirm-password" label={t("settings.security.confirmPassword")} value={confirmPassword} onChange={setConfirmPassword} autoComplete="new-password" visible={passwordsVisible} toggleVisibility={() => setPasswordsVisible((value) => !value)} />
            </div>
            <p className="text-xs text-muted-foreground">{t("settings.security.passwordMinimum")}</p>
            <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className={passwordSuccess ? "text-sm text-emerald-700" : "text-sm text-destructive"} role="status" aria-live="polite">
                {passwordSuccess ? t("settings.security.passwordChanged") : passwordMessage}
              </p>
              <Button type="submit" disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
                {changingPassword && <LoaderCircle className="size-4 animate-spin" />}
                {t(changingPassword ? "settings.security.changingPassword" : "settings.security.changePassword")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  )
}
