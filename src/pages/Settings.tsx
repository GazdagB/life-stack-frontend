import * as React from "react"
import { Check, Globe2, LoaderCircle, Languages, Settings2 } from "lucide-react"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import { SecuritySettings } from "src/components/security-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { api } from "src/lib/api"
import { useAuth } from "src/lib/auth"
import {
  changeAppLanguage,
  normalizeAppLanguage,
  supportedLanguages,
  type AppLanguage,
} from "src/i18n"
import { cn } from "src/lib/utils"

const languageMetadata: Record<AppLanguage, { flag: string }> = {
  en: { flag: "🇬🇧" },
  de: { flag: "🇩🇪" },
  hu: { flag: "🇭🇺" },
}

export default function Settings() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const [savingLanguage, setSavingLanguage] = React.useState<AppLanguage | null>(null)
  const [message, setMessage] = React.useState<"saved" | "error" | null>(null)
  const activeLanguage = normalizeAppLanguage(user?.preferred_language)

  async function selectLanguage(language: AppLanguage) {
    if (language === activeLanguage || savingLanguage) return

    const previousLanguage = activeLanguage
    setSavingLanguage(language)
    setMessage(null)
    await changeAppLanguage(language)

    try {
      const updatedUser = await api.settings.updateLanguage(language)
      updateUser(updatedUser)
      setMessage("saved")
    } catch {
      await changeAppLanguage(previousLanguage)
      setMessage("error")
    } finally {
      setSavingLanguage(null)
    }
  }

  return (
    <>
      <PageHeader
        icon={Settings2}
        eyebrow={t("settings.eyebrow")}
        title={t("settings.title")}
        description={t("settings.description")}
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-muted p-2.5"><Languages className="size-5" /></div>
            <div className="space-y-1">
              <CardTitle>{t("settings.languageTitle")}</CardTitle>
              <CardDescription>{t("settings.languageDescription")}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t("settings.languageTitle")}>
            {supportedLanguages.map((language) => {
              const isActive = language === activeLanguage
              const isSaving = language === savingLanguage
              return (
                <button
                  key={language}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  disabled={savingLanguage !== null}
                  onClick={() => void selectLanguage(language)}
                  className={cn(
                    "relative flex min-h-32 flex-col items-start rounded-xl border bg-background p-4 text-left transition-colors hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-wait disabled:opacity-70",
                    isActive && "border-primary bg-primary/5 ring-1 ring-primary",
                  )}
                >
                  <span className="text-2xl" aria-hidden="true">{languageMetadata[language].flag}</span>
                  <span className="mt-3 font-semibold">{t(`settings.languages.${language}.name`)}</span>
                  <span className="text-xs text-muted-foreground">{t(`settings.languages.${language}.description`)}</span>
                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center">
                    {isSaving ? <LoaderCircle className="size-4 animate-spin" /> : isActive ? <Check className="size-4 text-primary" /> : null}
                  </span>
                </button>
              )
            })}
          </div>

          <div className="flex flex-col gap-2 border-t pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-muted-foreground"><Globe2 className="size-4" />{t("settings.languageHelp")}</p>
            <p aria-live="polite" className={cn("font-medium", message === "error" ? "text-destructive" : "text-emerald-700")}>
              {savingLanguage ? t("settings.saving") : message ? t(`settings.${message === "saved" ? "saved" : "saveError"}`) : null}
            </p>
          </div>
        </CardContent>
      </Card>

      <SecuritySettings />
    </>
  )
}
