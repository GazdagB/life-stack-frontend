import * as React from "react"
import {
  ArrowLeft, Bot, Check, Clipboard, FileDown, Info, LoaderCircle,
  Save, Send, ShieldCheck, Sparkles, UserRound,
} from "lucide-react"
import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Textarea } from "src/components/ui/textarea"
import { normalizeAppLanguage } from "src/i18n"
import { api, type TodoAIWorkBundle } from "src/lib/api"
import { cn } from "src/lib/utils"


export default function TodoAssistantChat() {
  const { todoId } = useParams()
  const id = Number(todoId)
  const hasValidId = Number.isInteger(id) && id > 0
  const { t, i18n } = useTranslation("todoAssistant")
  const [bundle, setBundle] = React.useState<TodoAIWorkBundle | null>(null)
  const [message, setMessage] = React.useState("")
  const [pendingMessage, setPendingMessage] = React.useState("")
  const [draftTitle, setDraftTitle] = React.useState("")
  const [draftContent, setDraftContent] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSending, setIsSending] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [notice, setNotice] = React.useState("")
  const [error, setError] = React.useState("")
  const chatEnd = React.useRef<HTMLDivElement>(null)

  function applyBundle(next: TodoAIWorkBundle) {
    setBundle(next)
    setDraftTitle(next.session.deliverable_title ?? next.todo.title)
    setDraftContent(next.session.deliverable_content ?? "")
  }

  React.useEffect(() => {
    if (!hasValidId) return
    let active = true
    api.todos.startWork(id, normalizeAppLanguage(i18n.resolvedLanguage))
      .then((next) => { if (active) applyBundle(next) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : t("work.startError")) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [hasValidId, id, i18n.resolvedLanguage, t])

  React.useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }, [bundle?.messages.length, pendingMessage])

  async function sendMessage(event: React.FormEvent) {
    event.preventDefault()
    const content = message.trim()
    if (!content || isSending) return
    setMessage(""); setPendingMessage(content); setIsSending(true); setError(""); setNotice("")
    try {
      const next = await api.todos.sendWorkMessage(id, content, normalizeAppLanguage(i18n.resolvedLanguage))
      const savedUserTurn = [...next.messages].reverse().find((item) => item.role === "USER")
      if (!savedUserTurn || savedUserTurn.content !== content) {
        throw new Error(t("work.sendNotSaved"))
      }
      applyBundle(next)
    } catch (reason) {
      setMessage(content)
      setError(reason instanceof Error ? reason.message : t("work.sendError"))
    } finally {
      setPendingMessage(""); setIsSending(false)
    }
  }

  async function saveDraft() {
    if (!draftTitle.trim() || !draftContent.trim()) return
    setIsSaving(true); setError(""); setNotice("")
    try {
      const next = await api.todos.saveWorkDraft(id, draftTitle.trim(), draftContent.trim())
      applyBundle(next); setNotice(t("work.saved"))
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("work.saveError"))
    } finally {
      setIsSaving(false)
    }
  }

  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(`${draftTitle}\n\n${draftContent}`)
      setNotice(t("work.copied"))
    } catch {
      setError(t("work.saveError"))
    }
  }

  async function downloadPdf() {
    setIsDownloading(true); setError(""); setNotice("")
    try {
      if (bundle?.session.deliverable_title !== draftTitle || bundle?.session.deliverable_content !== draftContent) {
        const next = await api.todos.saveWorkDraft(id, draftTitle.trim(), draftContent.trim())
        applyBundle(next)
      }
      const blob = await api.todos.downloadWorkPdf(id)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url; link.download = `todo-${id}-draft.pdf`; link.click()
      URL.revokeObjectURL(url)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("work.pdfError"))
    } finally {
      setIsDownloading(false)
    }
  }

  if (!hasValidId) return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{t("work.startError")}</div>

  if (isLoading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("work.loading")}</div>

  if (!bundle) return <><Button variant="ghost" asChild className="w-fit"><Link to="/todos/assistant"><ArrowLeft />{t("work.back")}</Link></Button><div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error || t("work.startError")}</div></>

  const hasPdf = bundle.assessment.supported_actions.includes("GENERATE_PDF")

  return (
    <>
      <PageHeader
        icon={Bot}
        eyebrow={t("work.eyebrow")}
        title={bundle.todo.title}
        description={t("work.description")}
        action={<Button variant="outline" asChild><Link to="/todos/assistant"><ArrowLeft />{t("work.back")}</Link></Button>}
      />

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {notice && <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><Check className="size-4" />{notice}</div>}

      <div className="grid items-start gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="space-y-4 xl:sticky xl:top-4">
          <Card size="sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><ShieldCheck className="size-4 text-violet-600" />{t("work.preloaded")}</CardTitle><CardDescription>{t("work.preloadedHelp")}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {bundle.todo.description && <p className="rounded-lg bg-muted/60 p-3 leading-relaxed">{bundle.todo.description}</p>}
              <ContextList title={t("work.aiPart")} values={bundle.assessment.ai_steps} icon={Sparkles} className="text-violet-600" />
              <ContextList title={t("work.yourPart")} values={bundle.assessment.human_steps} icon={UserRound} className="text-blue-600" />
            </CardContent>
          </Card>
        </div>

        <div className="min-w-0 space-y-5">
          <Card className="min-h-[32rem]">
            <CardHeader className="border-b">
              <div className="flex flex-wrap items-center justify-between gap-2"><div><CardTitle>{t("work.chatTitle")}</CardTitle><CardDescription>{t("work.chatHelp")}</CardDescription></div><Badge variant="secondary">{t(`work.phases.${bundle.session.phase}`)}</Badge></div>
            </CardHeader>
            <CardContent className="flex min-h-[26rem] flex-col gap-4">
              <div className="flex-1 space-y-4 overflow-y-auto py-1" aria-live="polite">
                {bundle.messages.map((item) => <ChatMessage key={item.id} role={item.role} content={item.content} />)}
                {pendingMessage && <ChatMessage role="USER" content={pendingMessage} />}
                {isSending && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Bot className="size-4" /><LoaderCircle className="size-4 animate-spin" />{t("work.sending")}</div>}
                <div ref={chatEnd} />
              </div>

              {!!bundle.session.questions.length && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-900"><Info className="size-4" />{t("work.questions")}</p>
                  <ul className="space-y-1.5 text-sm text-amber-900/80">{bundle.session.questions.map((question) => <li key={question} className="flex gap-2"><span>•</span><span>{question}</span></li>)}</ul>
                </div>
              )}

              <form onSubmit={sendMessage} className="flex items-end gap-2 border-t pt-4">
                <Textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder={t("work.messagePlaceholder")} maxLength={4000} rows={3} disabled={isSending} className="min-h-20 resize-y" />
                <Button type="submit" size="icon" disabled={!message.trim() || isSending} aria-label={t("work.send")} className="mb-0.5 shrink-0"><Send /></Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{t("work.deliverable")}</CardTitle><CardDescription>{t("work.draftHelp")}</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              {bundle.session.deliverable_content ? (
                <>
                  <div className="space-y-2"><label htmlFor="work-title" className="text-sm font-medium">{t("work.titleLabel")}</label><Input id="work-title" value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)} maxLength={240} /></div>
                  <div className="space-y-2"><label htmlFor="work-content" className="text-sm font-medium">{t("work.contentLabel")}</label><Textarea id="work-content" value={draftContent} onChange={(event) => setDraftContent(event.target.value)} rows={16} maxLength={20000} className="font-mono text-sm leading-relaxed" /></div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button variant="outline" onClick={() => void copyDraft()}><Clipboard />{t("work.copy")}</Button>
                    {hasPdf && <Button variant="outline" onClick={() => void downloadPdf()} disabled={isDownloading}>{isDownloading ? <LoaderCircle className="animate-spin" /> : <FileDown />}{isDownloading ? t("work.downloadingPdf") : t("work.downloadPdf")}</Button>}
                    <Button onClick={() => void saveDraft()} disabled={isSaving || !draftTitle.trim() || !draftContent.trim()}>{isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}{isSaving ? t("work.savingDraft") : t("work.saveDraft")}</Button>
                  </div>
                </>
              ) : <div className="flex min-h-32 items-center justify-center rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">{t("work.noDraft")}</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function ChatMessage({ role, content }: { role: "USER" | "ASSISTANT"; content: string }) {
  const isUser = role === "USER"
  return <div className={cn("flex gap-2", isUser && "justify-end")}><div className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", isUser ? "order-2 bg-foreground text-background" : "bg-violet-100 text-violet-700")}>{isUser ? <UserRound className="size-3.5" /> : <Bot className="size-3.5" />}</div><div className={cn("max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed", isUser ? "bg-foreground text-background" : "bg-muted")}>{content}</div></div>
}

function ContextList({ title, values, icon: Icon, className }: { title: string; values: string[]; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; className: string }) {
  if (!values.length) return null
  return <section><h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Icon className={cn("size-3.5", className)} />{title}</h3><ul className="space-y-1.5 text-sm">{values.map((value) => <li key={value} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-50" /><span>{value}</span></li>)}</ul></section>
}
