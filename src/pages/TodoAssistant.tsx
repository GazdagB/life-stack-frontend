import * as React from "react"
import {
  Bot, CheckCircle2, CircleDashed, ClipboardCheck, Info, ListChecks,
  LoaderCircle, RefreshCw, ShieldCheck, Sparkles, UserCheck,
} from "lucide-react"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { normalizeAppLanguage } from "src/i18n"
import {
  api, type Todo, type TodoAIAssessment, type TodoAIClassification,
  type TodoAISupportedAction,
} from "src/lib/api"
import { cn } from "src/lib/utils"


type AssessmentFilter = "all" | "unassessed" | "stale" | TodoAIClassification
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>

const classificationConfig: Record<TodoAIClassification, { icon: IconType; style: string; panel: string }> = {
  FULLY_AI_ACTIONABLE: {
    icon: CheckCircle2,
    style: "border-emerald-200 bg-emerald-50 text-emerald-700",
    panel: "border-l-emerald-400",
  },
  PARTIALLY_AI_ACTIONABLE: {
    icon: Sparkles,
    style: "border-amber-200 bg-amber-50 text-amber-800",
    panel: "border-l-amber-400",
  },
  HUMAN_REQUIRED: {
    icon: UserCheck,
    style: "border-blue-200 bg-blue-50 text-blue-700",
    panel: "border-l-blue-400",
  },
}

const actionIcons: Record<TodoAISupportedAction, IconType> = {
  DRAFT_TEXT: ClipboardCheck,
  CREATE_CHECKLIST: ListChecks,
  SUMMARIZE: ClipboardCheck,
  TRANSLATE: Sparkles,
  RESEARCH_PLAN: ListChecks,
  GENERATE_PDF: ClipboardCheck,
}

function mergeAssessments(current: TodoAIAssessment[], next: TodoAIAssessment[]) {
  const merged = new Map(current.map((assessment) => [assessment.todo_id, assessment]))
  next.forEach((assessment) => merged.set(assessment.todo_id, assessment))
  return [...merged.values()]
}

export default function TodoAssistant() {
  const { t, i18n } = useTranslation("todoAssistant")
  const [todos, setTodos] = React.useState<Todo[]>([])
  const [assessments, setAssessments] = React.useState<TodoAIAssessment[]>([])
  const [filter, setFilter] = React.useState<AssessmentFilter>("all")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isAssessing, setIsAssessing] = React.useState(false)
  const [error, setError] = React.useState("")
  const [warning, setWarning] = React.useState("")

  React.useEffect(() => {
    let active = true
    Promise.all([api.todos.list(), api.todos.assessments()])
      .then(([nextTodos, nextAssessments]) => {
        if (!active) return
        setTodos(nextTodos)
        setAssessments(nextAssessments)
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : t("loadError"))
      })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [t])

  const openTodos = React.useMemo(
    () => todos.filter((todo) => !["completed", "canceled"].includes(todo.status)),
    [todos],
  )
  const assessmentByTodo = React.useMemo(
    () => new Map(assessments.map((assessment) => [assessment.todo_id, assessment])),
    [assessments],
  )
  const currentAssessments = assessments.filter((assessment) => !assessment.is_stale && openTodos.some((todo) => todo.id === assessment.todo_id))
  const filteredTodos = openTodos.filter((todo) => {
    const assessment = assessmentByTodo.get(todo.id)
    if (filter === "all") return true
    if (filter === "unassessed") return !assessment
    if (filter === "stale") return assessment?.is_stale
    return assessment?.classification === filter
  })

  async function assessOpenTodos() {
    const todoIds = openTodos.slice(0, 30).map((todo) => todo.id)
    if (!todoIds.length) return
    setIsAssessing(true); setError(""); setWarning("")
    try {
      const result = await api.todos.assess(todoIds, normalizeAppLanguage(i18n.resolvedLanguage))
      setAssessments((current) => mergeAssessments(current, result.assessments))
      if (result.provider_status === "fallback" || result.provider_status === "partial") {
        setWarning(t("fallback"))
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("assessError"))
    } finally {
      setIsAssessing(false)
    }
  }

  const summary = [
    { label: t("summary.open"), value: openTodos.length, icon: ListChecks, style: "bg-slate-100 text-slate-700" },
    { label: t("summary.assessed"), value: currentAssessments.length, icon: ClipboardCheck, style: "bg-violet-100 text-violet-700" },
    { label: t("summary.full"), value: currentAssessments.filter((item) => item.classification === "FULLY_AI_ACTIONABLE").length, icon: CheckCircle2, style: "bg-emerald-100 text-emerald-700" },
    { label: t("summary.partial"), value: currentAssessments.filter((item) => item.classification === "PARTIALLY_AI_ACTIONABLE").length, icon: Sparkles, style: "bg-amber-100 text-amber-800" },
    { label: t("summary.human"), value: currentAssessments.filter((item) => item.classification === "HUMAN_REQUIRED").length, icon: UserCheck, style: "bg-blue-100 text-blue-700" },
  ]

  return (
    <>
      <PageHeader
        icon={Bot}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={
          <div className="flex flex-col items-start gap-1 sm:items-end">
            <Button onClick={() => void assessOpenTodos()} disabled={isAssessing || !openTodos.length}>
              {isAssessing ? <LoaderCircle className="animate-spin" /> : <Sparkles />}
              {isAssessing ? t("assessing") : currentAssessments.length ? t("assessAgain") : t("assess")}
            </Button>
            <span className="text-xs text-muted-foreground">{t("limit")}</span>
          </div>
        }
      />

      <Card className="border-violet-200 bg-violet-50/60 shadow-none">
        <CardContent className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700"><ShieldCheck className="size-5" /></div>
          <div><p className="font-medium text-violet-950">{t("privacyTitle")}</p><p className="mt-1 text-sm leading-relaxed text-violet-900/70">{t("privacyDescription")}</p></div>
        </CardContent>
      </Card>

      {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {warning && <div role="status" className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><Info className="mt-0.5 size-4 shrink-0" />{warning}</div>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {summary.map(({ label, value, icon: Icon, style }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className={cn("flex size-9 items-center justify-center rounded-lg", style)}><Icon className="size-4" /></div>
              <div><p className="text-xl font-semibold tabular-nums">{value}</p><p className="text-xs text-muted-foreground">{label}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <div className="w-full space-y-1 sm:w-64">
          <label className="text-xs font-medium text-muted-foreground" id="todo-ai-filter-label">{t("filter")}</label>
          <Select value={filter} onValueChange={(value) => setFilter(value as AssessmentFilter)}>
            <SelectTrigger aria-labelledby="todo-ai-filter-label"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="unassessed">{t("filters.unassessed")}</SelectItem>
              <SelectItem value="stale">{t("filters.stale")}</SelectItem>
              <SelectItem value="FULLY_AI_ACTIONABLE">{t("filters.full")}</SelectItem>
              <SelectItem value="PARTIALLY_AI_ACTIONABLE">{t("filters.partial")}</SelectItem>
              <SelectItem value="HUMAN_REQUIRED">{t("filters.human")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {filteredTodos.map((todo) => {
          const assessment = assessmentByTodo.get(todo.id)
          if (!assessment) return (
            <Card key={todo.id} className="border-l-4 border-l-slate-300">
              <CardHeader><CardTitle>{todo.title}</CardTitle><CardDescription>{todo.description || t("unassessedHelp")}</CardDescription></CardHeader>
              <CardContent className="flex items-center gap-2 text-sm text-muted-foreground"><CircleDashed className="size-4" /> <span className="font-medium">{t("unassessed")}</span></CardContent>
            </Card>
          )

          const config = classificationConfig[assessment.classification]
          const StatusIcon = config.icon
          return (
            <Card key={todo.id} className={cn("border-l-4", config.panel, assessment.is_stale && "opacity-75")}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0"><CardTitle>{todo.title}</CardTitle>{todo.description && <CardDescription className="mt-1 line-clamp-2">{todo.description}</CardDescription>}</div>
                  <Badge variant="outline" className={config.style}><StatusIcon className="mr-1 size-3" />{t(`classifications.${assessment.classification}`)}</Badge>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-2 text-xs text-muted-foreground">
                  <span>{t("confidence", { count: assessment.confidence })}</span>
                  <span>·</span>
                  <span>{assessment.assessment_source === "AI" ? t("sourceAI") : t("sourceRules")}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {assessment.is_stale && <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><RefreshCw className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">{t("stale")}</p><p className="text-amber-800/80">{t("staleHelp")}</p></div></div>}
                <section><h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("why")}</h3><p className="leading-relaxed">{assessment.reason}</p></section>
                <div className="grid gap-4 sm:grid-cols-2">
                  {!!assessment.ai_steps.length && <StepList title={t("aiSteps")} steps={assessment.ai_steps} icon={Sparkles} className="text-violet-700" />}
                  {!!assessment.human_steps.length && <StepList title={t("humanSteps")} steps={assessment.human_steps} icon={UserCheck} className="text-blue-700" />}
                </div>
                {!!assessment.missing_information.length && <StepList title={t("missing")} steps={assessment.missing_information} icon={Info} className="text-amber-700" />}
                {!!assessment.supported_actions.length && (
                  <section><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("availableActions")}</h3><div className="flex flex-wrap gap-2">{assessment.supported_actions.map((action) => { const ActionIcon = actionIcons[action]; return <Badge key={action} variant="secondary"><ActionIcon className="mr-1 size-3" />{t(`actions.${action}`)}</Badge> })}</div></section>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("loading")}</div>}
      {!isLoading && !filteredTodos.length && <Card><CardContent className="py-12 text-center"><p className="font-medium">{t("emptyTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p></CardContent></Card>}
    </>
  )
}

function StepList({ title, steps, icon: Icon, className }: { title: string; steps: string[]; icon: IconType; className?: string }) {
  return <section><h3 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Icon className={cn("size-3.5", className)} />{title}</h3><ul className="space-y-1.5 text-sm">{steps.map((step, index) => <li key={`${step}-${index}`} className="flex gap-2"><span className="mt-2 size-1 shrink-0 rounded-full bg-current opacity-50" /><span>{step}</span></li>)}</ul></section>
}
