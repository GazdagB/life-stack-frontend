import { FileLock2, LogIn, ShieldCheck } from "lucide-react"
import { Link, useLocation } from "react-router"
import { useTranslation } from "react-i18next"

import { Button } from "src/components/ui/button"
import { Card, CardContent } from "src/components/ui/card"
import { changeAppLanguage, normalizeAppLanguage, type AppLanguage } from "src/i18n"
import { legalTranslations, type LegalDocument } from "src/locales/legal"
import { cn } from "src/lib/utils"

const languageLabels: Record<AppLanguage, string> = { en: "EN", de: "DE", hu: "HU" }

export default function Legal() {
  const { i18n } = useTranslation()
  const location = useLocation()
  const language = normalizeAppLanguage(i18n.resolvedLanguage)
  const copy = legalTranslations[language]
  const isTerms = location.pathname.endsWith("/terms")
  const document = isTerms ? copy.termsDocument : copy.privacyDocument
  const operatorName = import.meta.env.VITE_LEGAL_OPERATOR_NAME?.trim() || "LifeOS private operator"
  const contactEmail = import.meta.env.VITE_LEGAL_CONTACT_EMAIL?.trim()

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><ShieldCheck className="size-5" /></span>
            <span className="min-w-0"><span className="block font-semibold leading-tight">LifeOS</span><span className="block truncate text-xs text-muted-foreground">{copy.brandSubtitle}</span></span>
          </Link>
          <nav className="ml-auto hidden items-center gap-1 sm:flex" aria-label="Legal documents">
            <Button asChild variant={!isTerms ? "secondary" : "ghost"} size="sm"><Link to="/privacy">{copy.privacy}</Link></Button>
            <Button asChild variant={isTerms ? "secondary" : "ghost"} size="sm"><Link to="/terms">{copy.terms}</Link></Button>
          </nav>
          <div className="flex items-center rounded-lg border bg-card p-0.5" aria-label={copy.language}>
            {(Object.keys(languageLabels) as AppLanguage[]).map((item) => <button key={item} type="button" aria-pressed={language === item} onClick={() => void changeAppLanguage(item)} className={cn("rounded-md px-2 py-1 text-xs font-medium transition-colors", language === item ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}>{languageLabels[item]}</button>)}
          </div>
          <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex"><Link to="/login"><LogIn />{copy.signIn}</Link></Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-16">
        <LegalDocumentView document={document} operatorName={operatorName} contactEmail={contactEmail} contactLabel={copy.contact} controllerLabel={copy.controller} contactFallback={copy.contactFallback} />
      </main>

      <footer className="border-t bg-card/60">
        <div className="mx-auto flex max-w-4xl flex-col gap-3 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 LifeOS</p>
          <div className="flex gap-4"><Link className="hover:text-foreground" to="/privacy">{copy.privacy}</Link><Link className="hover:text-foreground" to="/terms">{copy.terms}</Link></div>
        </div>
      </footer>
    </div>
  )
}

function LegalDocumentView({ document, operatorName, contactEmail, controllerLabel, contactLabel, contactFallback }: { document: LegalDocument; operatorName: string; contactEmail?: string; controllerLabel: string; contactLabel: string; contactFallback: string }) {
  return (
    <article>
      <div className="mb-9 max-w-3xl">
        <div className="mb-4 flex size-11 items-center justify-center rounded-xl border bg-card text-primary shadow-xs"><FileLock2 className="size-5" /></div>
        <p className="text-sm font-medium text-primary">{document.updated}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{document.title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">{document.summary}</p>
      </div>

      <Card className="mb-8 border-amber-300/70 bg-amber-50/60 text-amber-950 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-100">
        <CardContent className="leading-6">{document.notice}</CardContent>
      </Card>

      <Card className="mb-8">
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{controllerLabel}</p><p className="mt-1 font-medium">{operatorName}</p></div>
          <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{contactLabel}</p>{contactEmail ? <a className="mt-1 block font-medium text-primary hover:underline" href={`mailto:${contactEmail}`}>{contactEmail}</a> : <p className="mt-1 text-sm leading-6 text-muted-foreground">{contactFallback}</p>}</div>
        </CardContent>
      </Card>

      <div className="space-y-9">
        {document.sections.map((section) => (
          <section key={section.heading} className="scroll-mt-24">
            <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph} className="mt-3 leading-7 text-muted-foreground">{paragraph}</p>)}
            {section.bullets && <ul className="mt-3 space-y-2 pl-5 text-muted-foreground">{section.bullets.map((bullet) => <li key={bullet} className="list-disc pl-1 leading-7 marker:text-primary">{bullet}</li>)}</ul>}
          </section>
        ))}
      </div>
    </article>
  )
}
