import * as React from "react"
import {
  Ban,
  BellRing,
  CalendarClock,
  CalendarDays,
  Calculator,
  LoaderCircle,
  LockKeyhole,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Repeat2,
  ShieldAlert,
  Trash2,
  Unlock,
  X,
} from "lucide-react"
import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import { VendorIcon } from "src/components/vendor-icon"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Textarea } from "src/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "src/components/ui/sheet"
import {
  api,
  type CancellationDifficulty,
  type RecurringCommitmentForecast,
  type RecurringCoverage,
  type RecurringExpense,
  type RecurringExpenseInput,
  type RecurringFrequency,
} from "src/lib/api"
import { expenseCategoryOptions, getExpenseCategory } from "src/lib/expense-categories"
import { cn } from "src/lib/utils"

const frequencyLabelKeys: Record<RecurringFrequency, string> = {
  DAILY: "frequencies.DAILY",
  WEEKLY: "frequencies.WEEKLY",
  MONTHLY: "frequencies.MONTHLY",
  YEARLY: "frequencies.YEARLY",
}

const cancellationOptions: Array<{
  value: CancellationDifficulty
  labelKey: string
  descriptionKey: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  color: string
  border: string
}> = [
  { value: "EASY", labelKey: "cancellation.EASY.label", descriptionKey: "cancellation.EASY.description", icon: Unlock, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-300 bg-emerald-50 text-emerald-800" },
  { value: "NOTICE_REQUIRED", labelKey: "cancellation.NOTICE_REQUIRED.label", descriptionKey: "cancellation.NOTICE_REQUIRED.description", icon: BellRing, color: "bg-amber-100 text-amber-700", border: "border-amber-300 bg-amber-50 text-amber-800" },
  { value: "CONTRACT_LOCKED", labelKey: "cancellation.CONTRACT_LOCKED.label", descriptionKey: "cancellation.CONTRACT_LOCKED.description", icon: LockKeyhole, color: "bg-orange-100 text-orange-700", border: "border-orange-300 bg-orange-50 text-orange-800" },
  { value: "NON_CANCELLABLE", labelKey: "cancellation.NON_CANCELLABLE.label", descriptionKey: "cancellation.NON_CANCELLABLE.description", icon: Ban, color: "bg-red-100 text-red-700", border: "border-red-300 bg-red-50 text-red-800" },
  { value: "ESSENTIAL", labelKey: "cancellation.ESSENTIAL.label", descriptionKey: "cancellation.ESSENTIAL.description", icon: ShieldAlert, color: "bg-rose-100 text-rose-700", border: "border-rose-300 bg-rose-50 text-rose-800" },
]

function getCancellationOption(value: CancellationDifficulty) {
  return cancellationOptions.find((option) => option.value === value) ?? cancellationOptions[0]
}

function emptyRecurringExpense(): RecurringExpenseInput {
  return {
    title: "",
    amount: "",
    category_id: 7,
    frequency: "MONTHLY",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: null,
    cancellation_difficulty: "EASY",
    cancellable_from: null,
    cancellation_notes: null,
    active: true,
  }
}

export default function RecurringExpenses() {
  const { t, i18n } = useTranslation("recurring")
  const { t: tCore } = useTranslation("core")
  const money = React.useMemo(() => new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: "EUR" }), [i18n.resolvedLanguage])
  const location = useLocation()
  const isCoverage = location.pathname.endsWith("/coverage")
  const [expenses, setExpenses] = React.useState<RecurringExpense[]>([])
  const [coverage, setCoverage] = React.useState<RecurringCoverage | null>(null)
  const [draft, setDraft] = React.useState<RecurringExpenseInput>(emptyRecurringExpense)
  const [showForm, setShowForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [selectedExpense, setSelectedExpense] = React.useState<RecurringExpense | null>(null)

  React.useEffect(() => {
    Promise.all([
      api.recurringExpenses.list(),
      api.recurringExpenses.coverage(),
    ])
      .then(([nextExpenses, nextCoverage]) => {
        setExpenses(nextExpenses)
        setCoverage(nextCoverage)
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t("errors.load")))
      .finally(() => setIsLoading(false))
  }, [t])

  const today = coverage?.as_of ?? new Date().toISOString().slice(0, 10)
  const forecastByExpenseId = React.useMemo(
    () => new Map(coverage?.commitments.map((forecast) => [forecast.recurring_expense_id, forecast]) ?? []),
    [coverage],
  )
  const coveredExpenses = expenses.filter((expense) => forecastByExpenseId.get(expense.id)?.included_in_coverage)

  async function refreshCoverage() {
    try {
      setCoverage(await api.recurringExpenses.coverage())
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("errors.refresh"))
    }
  }

  async function createExpense(event: React.FormEvent) {
    event.preventDefault()
    setError("")
    setIsSaving(true)
    try {
      const created = await api.recurringExpenses.create(draft)
      setExpenses((current) => [created, ...current])
      setDraft(emptyRecurringExpense())
      setShowForm(false)
      await refreshCoverage()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("errors.create"))
    } finally {
      setIsSaving(false)
    }
  }

  async function toggleExpense(expense: RecurringExpense) {
    const previous = expenses
    setExpenses((current) => current.map((item) => item.id === expense.id ? { ...item, active: !item.active } : item))
    try {
      const updated = await api.recurringExpenses.update(expense.id, { ...expense, active: !expense.active })
      setExpenses((current) => current.map((item) => item.id === expense.id ? updated : item))
      setSelectedExpense((current) => current?.id === expense.id ? updated : current)
      await refreshCoverage()
    } catch (reason) {
      setExpenses(previous)
      setError(reason instanceof Error ? reason.message : t("errors.update"))
    }
  }

  async function deleteExpense(id: number) {
    const previous = expenses
    setExpenses((current) => current.filter((expense) => expense.id !== id))
    try {
      await api.recurringExpenses.delete(id)
      setSelectedExpense((current) => current?.id === id ? null : current)
      await refreshCoverage()
    } catch (reason) {
      setExpenses(previous)
      setError(reason instanceof Error ? reason.message : t("errors.delete"))
    }
  }

  async function updateExpense(id: number, input: RecurringExpenseInput) {
    setError("")
    const updated = await api.recurringExpenses.update(id, input)
    setExpenses((current) => current.map((expense) => expense.id === id ? updated : expense))
    setSelectedExpense(updated)
    await refreshCoverage()
    return updated
  }

  if (isCoverage) {
    return (
      <>
        <PageHeader
          icon={Calculator}
          eyebrow={t("eyebrow")}
          title={t("coverageTitle")}
          description={t("coverageDescription")}
        />
        {error && <ErrorMessage message={error} />}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: t("dailyReserve"), value: coverage?.totals.daily_reserve, note: t("dailyNote"), icon: CalendarDays },
            { label: t("weeklyReserve"), value: coverage?.totals.weekly_reserve, note: t("weeklyNote"), icon: CalendarClock },
            { label: t("monthlyReserve"), value: coverage?.totals.monthly_reserve, note: t("monthlyNote"), icon: RefreshCw },
            { label: t("next12"), value: coverage?.totals.horizon_total, note: t("scheduledCommitments", { count: coveredExpenses.length }), icon: Calculator },
          ].map((total) => (
            <Card key={total.label}>
              <CardHeader><CardDescription>{total.label}</CardDescription><CardAction><div className="rounded-lg bg-muted p-2"><total.icon className="size-4" /></div></CardAction></CardHeader>
              <CardContent><p className="text-2xl font-semibold tracking-tight">{isLoading || total.value === undefined ? "—" : money.format(Number(total.value))}</p><p className="mt-1 text-xs text-muted-foreground">{total.note}</p></CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{t("breakdown")}</CardTitle>
            <CardDescription>{t("breakdownDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <div className="min-w-[840px]">
              <div className="grid grid-cols-[minmax(220px,1fr)_120px_120px_130px_130px] gap-4 border-b px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <span>{t("commitment")}</span><span className="text-right">{t("dailyReserve")}</span><span className="text-right">{t("monthlyReserve")}</span><span className="text-right">{t("next12")}</span><span className="text-right">{t("contractTotal")}</span>
              </div>
              {coveredExpenses.map((expense) => {
                const forecast = forecastByExpenseId.get(expense.id)!
                const cancellation = getCancellationOption(expense.cancellation_difficulty)
                return (
                  <button type="button" key={expense.id} onClick={() => setSelectedExpense(expense)} className="grid w-full grid-cols-[minmax(220px,1fr)_120px_120px_130px_130px] items-center gap-4 border-b px-4 py-4 text-left transition-colors last:border-0 hover:bg-muted/50">
                    <div className="flex min-w-0 items-center gap-3">
                      <VendorIcon vendorName={expense.title} categoryId={expense.category_id} className="size-9 rounded-lg" />
                      <div className="min-w-0"><div className="flex min-w-0 items-center gap-2"><p className="truncate font-medium">{expense.title}</p><Badge variant="outline" className={cn("shrink-0", cancellation.border)}>{t(cancellation.labelKey)}</Badge></div><p className="text-xs text-muted-foreground">{money.format(Number(expense.amount))} · {t(frequencyLabelKeys[expense.frequency])}</p></div>
                    </div>
                    <span className="text-right tabular-nums">{money.format(Number(forecast.daily_reserve))}</span>
                    <span className="text-right tabular-nums">{money.format(Number(forecast.monthly_reserve))}</span>
                    <span className="text-right font-medium tabular-nums">{money.format(Number(forecast.horizon_total))}</span>
                    <span className="text-right tabular-nums">{forecast.contract_total === null ? t("ongoing") : money.format(Number(forecast.contract_total))}</span>
                  </button>
                )
              })}
              {!isLoading && coveredExpenses.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">{t("coverageEmpty")}</div>}
              {isLoading && <Loading label={t("loadingCoverage")} />}
            </div>
          </CardContent>
        </Card>
        <p className="text-xs text-muted-foreground">{t("forecastFoot", { from: today, through: coverage?.through ?? t("nextPeriod") })}</p>
        {selectedExpense && <CommitmentSheet key={selectedExpense.id} expense={selectedExpense} forecast={forecastByExpenseId.get(selectedExpense.id) ?? null} onClose={() => setSelectedExpense(null)} onSave={(input) => updateExpense(selectedExpense.id, input)} onToggle={() => toggleExpense(selectedExpense)} onDelete={() => deleteExpense(selectedExpense.id)} />}
      </>
    )
  }

  return (
    <>
      <PageHeader
        icon={Repeat2}
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        action={<Button onClick={() => setShowForm((value) => !value)}>{showForm ? <X /> : <Plus />}{showForm ? t("close") : t("add")}</Button>}
      />

      {showForm && (
        <Card>
          <CardContent>
            <form onSubmit={createExpense} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium" htmlFor="recurring-title">{t("vendor")}</label><div className="flex gap-2"><Input id="recurring-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder={t("vendorPlaceholder")} required />{draft.title.trim() && <VendorIcon vendorName={draft.title} categoryId={draft.category_id} className="size-8 rounded-lg" />}</div><p className="text-xs text-muted-foreground">{t("vendorHelp")}</p></div>
              <div className="space-y-2"><label className="text-sm font-medium" htmlFor="recurring-amount">{t("amount")}</label><Input id="recurring-amount" type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} placeholder="0.00" required /></div>
              <div className="space-y-2"><label className="text-sm font-medium" htmlFor="recurring-start">{t("starts")}</label><Input id="recurring-start" type="date" value={draft.start_date} onChange={(event) => setDraft({ ...draft, start_date: event.target.value })} required /></div>
              <fieldset className="space-y-2 sm:col-span-2 lg:col-span-4"><legend className="text-sm font-medium">{t("frequency")}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(frequencyLabelKeys) as RecurringFrequency[]).map((frequency) => <button key={frequency} type="button" onClick={() => setDraft({ ...draft, frequency })} aria-pressed={draft.frequency === frequency} className={cn("rounded-xl border px-3 py-3 text-sm font-medium transition-colors", draft.frequency === frequency ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted")}>{t(frequencyLabelKeys[frequency])}</button>)}</div></fieldset>
              <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium" htmlFor="recurring-end">{t("paymentsEndOptional")}</label><Input id="recurring-end" type="date" min={draft.start_date} value={draft.end_date ?? ""} onChange={(event) => setDraft({ ...draft, end_date: event.target.value || null })} /><p className="text-xs text-muted-foreground">{t("paymentsEndHelp")}</p></div>
              <fieldset className="space-y-2 sm:col-span-2 lg:col-span-4"><legend className="text-sm font-medium">{t("cancellationDifficulty")}</legend><div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">{cancellationOptions.map((option) => { const OptionIcon = option.icon; const isSelected = draft.cancellation_difficulty === option.value; const supportsDate = option.value === "NOTICE_REQUIRED" || option.value === "CONTRACT_LOCKED"; return <button key={option.value} type="button" onClick={() => setDraft({ ...draft, cancellation_difficulty: option.value, cancellable_from: supportsDate ? draft.cancellable_from : null })} aria-pressed={isSelected} className={cn("rounded-xl border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm", isSelected ? option.border : "bg-background")}><span className="flex items-center gap-2 text-sm font-medium"><span className={cn("flex size-8 items-center justify-center rounded-lg", option.color)}><OptionIcon className="size-4" /></span>{t(option.labelKey)}</span><span className="mt-2 block text-xs text-muted-foreground">{t(option.descriptionKey)}</span></button> })}</div></fieldset>
              {(draft.cancellation_difficulty === "NOTICE_REQUIRED" || draft.cancellation_difficulty === "CONTRACT_LOCKED") && <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium" htmlFor="recurring-cancellable-from">{t("earliestCancellationDate")}</label><Input id="recurring-cancellable-from" type="date" min={draft.start_date} value={draft.cancellable_from ?? ""} onChange={(event) => setDraft({ ...draft, cancellable_from: event.target.value || null })} /><p className="text-xs text-muted-foreground">{t("noAutomaticStop")}</p></div>}
              <div className="space-y-2 sm:col-span-2 lg:col-span-4"><div className="flex items-center justify-between"><label className="text-sm font-medium" htmlFor="recurring-cancellation-notes">{t("cancellationNotesOptional")}</label><span className="text-xs text-muted-foreground">{draft.cancellation_notes?.length ?? 0}/280</span></div><Textarea id="recurring-cancellation-notes" value={draft.cancellation_notes ?? ""} maxLength={280} onChange={(event) => setDraft({ ...draft, cancellation_notes: event.target.value || null })} placeholder={t("cancellationPlaceholder")} /></div>
              <fieldset className="space-y-2 sm:col-span-2 lg:col-span-4"><legend className="text-sm font-medium">{t("category")}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{expenseCategoryOptions.map((category) => { const CategoryIcon = category.icon; const isSelected = draft.category_id === category.id; return <button key={category.id} type="button" onClick={() => setDraft({ ...draft, category_id: category.id })} aria-pressed={isSelected} className={cn("flex min-h-16 items-center gap-2 rounded-xl border p-2.5 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isSelected ? category.border : "border-border bg-background text-muted-foreground hover:text-foreground")}><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", category.color)}><CategoryIcon className="size-4" /></span><span className="leading-tight">{tCore(category.nameKey)}</span></button> })}</div></fieldset>
              <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{t("saveCommitment")}</Button></div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid gap-4 lg:grid-cols-2">
        {expenses.map((expense) => {
          const category = getExpenseCategory(expense.category_id)
          const cancellation = getCancellationOption(expense.cancellation_difficulty)
          const hasEnded = Boolean(expense.end_date && expense.end_date < today)
          const isUpcoming = expense.start_date > today
          return (
            <Card
              key={expense.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedExpense(expense)}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedExpense(expense) }}
              className={cn("cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md", (!expense.active || hasEnded) && "opacity-60")}
            >
              <CardContent className="flex items-start gap-3">
                <VendorIcon vendorName={expense.title} categoryId={expense.category_id} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{expense.title}</p><Badge variant="outline" className={category.border}>{tCore(category.nameKey)}</Badge><Badge variant="outline" className={cancellation.border}>{t(cancellation.labelKey)}</Badge>{!expense.active && <Badge variant="secondary">{t("paused")}</Badge>}{hasEnded && <Badge variant="secondary">{t("ended")}</Badge>}{isUpcoming && <Badge variant="secondary">{t("upcoming")}</Badge>}</div>
                  <p className="mt-1 text-xl font-semibold">{money.format(Number(expense.amount))}<span className="ml-1 text-sm font-normal text-muted-foreground">/ {t(frequencyLabelKeys[expense.frequency])}</span></p>
                  <p className="mt-2 text-xs text-muted-foreground">{t("from", { date: expense.start_date })}{expense.end_date ? ` · ${t("until", { date: expense.end_date })}` : ` · ${t("noEndDate")}`}</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); void toggleExpense(expense) }} aria-label={expense.active ? t("pauseCommitment") : t("resumeCommitment")}>{expense.active ? <Pause /> : <Play />}</Button>
                  <Button variant="ghost" size="icon" onClick={(event) => { event.stopPropagation(); void deleteExpense(expense.id) }} aria-label={t("deleteCommitment")}><Trash2 /></Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {isLoading && <Card><Loading label={t("loading")} /></Card>}
      {!isLoading && expenses.length === 0 && <Card><CardContent className="p-12 text-center"><p className="font-medium">{t("emptyTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("emptyDescription")}</p></CardContent></Card>}
      {selectedExpense && <CommitmentSheet key={selectedExpense.id} expense={selectedExpense} forecast={forecastByExpenseId.get(selectedExpense.id) ?? null} onClose={() => setSelectedExpense(null)} onSave={(input) => updateExpense(selectedExpense.id, input)} onToggle={() => toggleExpense(selectedExpense)} onDelete={() => deleteExpense(selectedExpense.id)} />}
    </>
  )
}

function CommitmentSheet({
  expense,
  forecast,
  onClose,
  onSave,
  onToggle,
  onDelete,
}: {
  expense: RecurringExpense
  forecast: RecurringCommitmentForecast | null
  onClose: () => void
  onSave: (input: RecurringExpenseInput) => Promise<RecurringExpense>
  onToggle: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const { t, i18n } = useTranslation("recurring")
  const { t: tCore } = useTranslation("core")
  const money = React.useMemo(() => new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: "EUR" }), [i18n.resolvedLanguage])
  const [isEditing, setIsEditing] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [editError, setEditError] = React.useState("")
  const [editDraft, setEditDraft] = React.useState<RecurringExpenseInput>({ ...expense })
  const category = getExpenseCategory(expense.category_id)
  const cancellation = getCancellationOption(expense.cancellation_difficulty)
  const CancellationIcon = cancellation.icon

  async function saveChanges(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setEditError("")
    try {
      const updated = await onSave(editDraft)
      setEditDraft({ ...updated })
      setIsEditing(false)
    } catch (reason) {
      setEditError(reason instanceof Error ? reason.message : t("errors.save"))
    } finally {
      setIsSaving(false)
    }
  }

  function beginEditing() {
    setEditDraft({ ...expense })
    setEditError("")
    setIsEditing(true)
  }

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <div className="flex items-center gap-3">
            <VendorIcon vendorName={expense.title} categoryId={expense.category_id} />
            <div className="min-w-0">
              <SheetTitle className="truncate text-lg">{expense.title}</SheetTitle>
              <SheetDescription>{tCore(category.nameKey)} · {t(frequencyLabelKeys[expense.frequency])}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {isEditing ? (
          <form onSubmit={saveChanges} className="space-y-5 px-4 pb-6">
            {editError && <ErrorMessage message={editError} />}
            <div className="space-y-2"><label className="text-sm font-medium" htmlFor="edit-recurring-title">{t("vendor")}</label><Input id="edit-recurring-title" value={editDraft.title} onChange={(event) => setEditDraft({ ...editDraft, title: event.target.value })} required /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium" htmlFor="edit-recurring-amount">{t("amount")}</label><Input id="edit-recurring-amount" type="number" min="0.01" step="0.01" value={editDraft.amount} onChange={(event) => setEditDraft({ ...editDraft, amount: event.target.value })} required /></div>
              <div className="space-y-2"><label className="text-sm font-medium" id="edit-recurring-frequency-label">{t("frequency")}</label><Select value={editDraft.frequency} onValueChange={(value) => setEditDraft({ ...editDraft, frequency: value as RecurringFrequency })}><SelectTrigger aria-labelledby="edit-recurring-frequency-label"><SelectValue /></SelectTrigger><SelectContent>{(Object.keys(frequencyLabelKeys) as RecurringFrequency[]).map((frequency) => <SelectItem key={frequency} value={frequency}>{t(frequencyLabelKeys[frequency])}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium" htmlFor="edit-recurring-start">{t("starts")}</label><Input id="edit-recurring-start" type="date" value={editDraft.start_date} onChange={(event) => setEditDraft({ ...editDraft, start_date: event.target.value })} required /></div>
              <div className="space-y-2"><label className="text-sm font-medium" htmlFor="edit-recurring-end">{t("paymentsEnd")}</label><Input id="edit-recurring-end" type="date" min={editDraft.start_date} value={editDraft.end_date ?? ""} onChange={(event) => setEditDraft({ ...editDraft, end_date: event.target.value || null })} /></div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium" id="edit-cancellation-difficulty-label">{t("cancellationDifficulty")}</label><Select value={editDraft.cancellation_difficulty} onValueChange={(nextValue) => { const value = nextValue as CancellationDifficulty; const supportsDate = value === "NOTICE_REQUIRED" || value === "CONTRACT_LOCKED"; setEditDraft({ ...editDraft, cancellation_difficulty: value, cancellable_from: supportsDate ? editDraft.cancellable_from : null }) }}><SelectTrigger aria-labelledby="edit-cancellation-difficulty-label"><SelectValue /></SelectTrigger><SelectContent>{cancellationOptions.map((option) => <SelectItem key={option.value} value={option.value}>{t(option.labelKey)}</SelectItem>)}</SelectContent></Select></div>
            {(editDraft.cancellation_difficulty === "NOTICE_REQUIRED" || editDraft.cancellation_difficulty === "CONTRACT_LOCKED") && <div className="space-y-2"><label className="text-sm font-medium" htmlFor="edit-cancellable-from">{t("earliestCancellationDate")}</label><Input id="edit-cancellable-from" type="date" min={editDraft.start_date} value={editDraft.cancellable_from ?? ""} onChange={(event) => setEditDraft({ ...editDraft, cancellable_from: event.target.value || null })} /><p className="text-xs text-muted-foreground">{t("editCancellationHelp")}</p></div>}
            <div className="space-y-2"><div className="flex items-center justify-between"><label className="text-sm font-medium" htmlFor="edit-cancellation-notes">{t("cancellationNotes")}</label><span className="text-xs text-muted-foreground">{editDraft.cancellation_notes?.length ?? 0}/280</span></div><Textarea id="edit-cancellation-notes" value={editDraft.cancellation_notes ?? ""} maxLength={280} onChange={(event) => setEditDraft({ ...editDraft, cancellation_notes: event.target.value || null })} placeholder={t("editCancellationPlaceholder")} /></div>
            <div className="space-y-2"><label className="text-sm font-medium" id="edit-recurring-category-label">{t("category")}</label><Select value={String(editDraft.category_id)} onValueChange={(value) => setEditDraft({ ...editDraft, category_id: Number(value) })}><SelectTrigger aria-labelledby="edit-recurring-category-label"><SelectValue /></SelectTrigger><SelectContent>{expenseCategoryOptions.map((option) => <SelectItem key={option.id} value={String(option.id)}>{tCore(option.nameKey)}</SelectItem>)}</SelectContent></Select></div>
            <button type="button" onClick={() => setEditDraft({ ...editDraft, active: !editDraft.active })} className={cn("flex w-full items-center justify-between rounded-xl border p-3 text-left", editDraft.active ? "border-emerald-300 bg-emerald-50" : "bg-muted/40")}><span><span className="block text-sm font-medium">{t("activeCommitment")}</span><span className="text-xs text-muted-foreground">{t("activeHelp")}</span></span><Badge variant={editDraft.active ? "default" : "secondary"}>{editDraft.active ? t("active") : t("paused")}</Badge></button>
            <div className="flex justify-end gap-2 border-t pt-4"><Button type="button" variant="outline" onClick={() => setIsEditing(false)}>{t("cancel")}</Button><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{t("saveChanges")}</Button></div>
          </form>
        ) : (
          <div className="space-y-6 px-4 pb-6">
            <div className={cn("rounded-xl border p-4", cancellation.border)}>
              <div className="flex items-start gap-3">
                <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", cancellation.color)}><CancellationIcon className="size-4" /></span>
                <div><p className="font-medium">{t(cancellation.labelKey)}</p><p className="mt-1 text-xs opacity-80">{t(cancellation.descriptionKey)}</p>{expense.cancellable_from && <p className="mt-2 text-xs font-medium">{t("earliestCancellation", { date: expense.cancellable_from })}</p>}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{t("next12")}</p><p className="mt-1 text-lg font-semibold">{forecast ? money.format(Number(forecast.horizon_total)) : "—"}</p><p className="text-xs text-muted-foreground">{forecast ? t("payments", { count: forecast.horizon_payment_count }) : t("loadingForecast")}</p></div>
              <div className="rounded-xl border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{t("remaining")}</p><p className="mt-1 text-lg font-semibold">{forecast ? (forecast.remaining_total === null ? t("ongoing") : money.format(Number(forecast.remaining_total))) : "—"}</p><p className="text-xs text-muted-foreground">{t("fromToday")}</p></div>
              <div className="rounded-xl border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{t("contractTotal")}</p><p className="mt-1 text-lg font-semibold">{forecast ? (forecast.contract_total === null ? t("ongoing") : money.format(Number(forecast.contract_total))) : "—"}</p><p className="text-xs text-muted-foreground">{t("startThroughEnd")}</p></div>
              <div className="rounded-xl border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">{t("payment")}</p><p className="mt-1 text-lg font-semibold">{money.format(Number(expense.amount))}</p><p className="text-xs text-muted-foreground">{t(frequencyLabelKeys[expense.frequency])}</p></div>
            </div>
            <div className="divide-y rounded-xl border">
              <DetailRow label={t("status")} value={expense.active ? t("active") : t("paused")} />
              <DetailRow label={t("category")} value={tCore(category.nameKey)} />
              <DetailRow label={t("startDate")} value={expense.start_date} />
              <DetailRow label={t("paymentsEnd")} value={expense.end_date ?? t("noEndDate")} />
              {expense.cancellable_from && <DetailRow label={t("cancellableFrom")} value={expense.cancellable_from} />}
            </div>
            {expense.cancellation_notes && <div className="rounded-xl border bg-muted/30 p-4"><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("cancellationNotes")}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{expense.cancellation_notes}</p></div>}
            <div className="grid grid-cols-2 gap-2"><Button onClick={beginEditing}><Pencil />{t("edit")}</Button><Button variant="outline" onClick={() => void onToggle()}>{expense.active ? <Pause /> : <Play />}{expense.active ? t("pause") : t("resume")}</Button></div>
            <Button variant="destructive" className="w-full" onClick={() => void onDelete()}><Trash2 />{t("deleteCommitment")}</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 px-3 py-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium">{value}</span></div>
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{message}</div>
}

function Loading({ label }: { label: string }) {
  return <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{label}</div>
}
