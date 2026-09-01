import * as React from "react"
import { CalendarDays, CircleDollarSign, LoaderCircle, Plus, ReceiptText, Search, Trash2, TrendingUp, X } from "lucide-react"
import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "src/components/ui/sheet"
import { Textarea } from "src/components/ui/textarea"
import { api, type Expense, type ExpenseInput } from "src/lib/api"
import { expenseCategoryOptions, getExpenseCategory } from "src/lib/expense-categories"
import { cn } from "src/lib/utils"

const SpendingCharts = React.lazy(() => import("src/components/spending-charts").then((module) => ({ default: module.SpendingCharts })))
const today = () => new Date().toISOString().slice(0, 10)
const emptyExpense = (): ExpenseInput => ({ title: "", amount: "", expense_date: today(), category_id: 10, description: null })

export default function Expenses() {
  const { t, i18n } = useTranslation("core")
  const location = useLocation()
  const isOverview = location.pathname.endsWith("/overview")
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [draft, setDraft] = React.useState<ExpenseInput>(emptyExpense)
  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [selectedExpense, setSelectedExpense] = React.useState<Expense | null>(null)

  React.useEffect(() => {
    api.expenses.list().then(setExpenses).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t("expenses.loadError"))).finally(() => setIsLoading(false))
  }, [t])

  const money = new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: "EUR" })

  const currentMonth = today().slice(0, 7)
  const monthExpenses = expenses.filter((expense) => expense.expense_date.startsWith(currentMonth))
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const categoryTotals = expenseCategoryOptions.map((category) => ({ ...category, amount: expenses.filter((expense) => expense.category_id === category.id).reduce((sum, expense) => sum + Number(expense.amount), 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount)
  const maxCategory = categoryTotals[0]?.amount ?? 1
  const filteredExpenses = [...expenses].filter((expense) => { const category = getExpenseCategory(expense.category_id); return `${expense.title} ${category.name} ${t(category.nameKey)} ${expense.description ?? ""}`.toLowerCase().includes(search.toLowerCase()) }).sort((a, b) => b.expense_date.localeCompare(a.expense_date))

  async function createExpense(event: React.FormEvent) {
    event.preventDefault(); setError(""); setIsSaving(true)
    try {
      const created = await api.expenses.create(draft)
      setExpenses((current) => [created, ...current])
      setDraft(emptyExpense())
      setShowForm(false)
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("expenses.createError")) }
    finally { setIsSaving(false) }
  }

  async function deleteExpense(id: number) {
    const previous = expenses; setExpenses((current) => current.filter((expense) => expense.id !== id))
    try { await api.expenses.delete(id); setSelectedExpense((current) => current?.id === id ? null : current) }
    catch (reason) { setExpenses(previous); setError(reason instanceof Error ? reason.message : t("expenses.deleteError")) }
  }

  return (
    <>
      <PageHeader
        icon={isOverview ? TrendingUp : CircleDollarSign}
        eyebrow={t("expenses.eyebrow")}
        title={isOverview ? t("expenses.overviewTitle") : t("expenses.allTitle")}
        description={isOverview ? t("expenses.overviewDescription") : t("expenses.allDescription")}
        action={!isOverview ? <Button onClick={() => setShowForm((value) => !value)}>{showForm ? <X /> : <Plus />}{showForm ? t("expenses.close") : t("expenses.addExpense")}</Button> : undefined}
      />

      {showForm && !isOverview && (
        <Card><CardContent><form onSubmit={createExpense} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium" htmlFor="expense-title">{t("expenses.expense")}</label><Input id="expense-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder={t("expenses.expensePlaceholder")} required /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="expense-amount">{t("expenses.amount")}</label><Input id="expense-amount" type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} placeholder="0.00" required /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="expense-date">{t("expenses.date")}</label><Input id="expense-date" type="date" value={draft.expense_date} onChange={(event) => setDraft({ ...draft, expense_date: event.target.value })} required /></div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-4"><div className="flex items-center justify-between"><label className="text-sm font-medium" htmlFor="expense-description">{t("expenses.optionalDescription")}</label><span className="text-xs text-muted-foreground">{draft.description?.length ?? 0}/1000</span></div><Textarea id="expense-description" value={draft.description ?? ""} maxLength={1000} onChange={(event) => setDraft({ ...draft, description: event.target.value || null })} placeholder={t("expenses.descriptionPlaceholder")} /></div>
          <fieldset className="space-y-2 sm:col-span-2 lg:col-span-4"><legend className="text-sm font-medium">{t("expenses.category")}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{expenseCategoryOptions.map((category) => { const CategoryIcon = category.icon; const isSelected = draft.category_id === category.id; return <button key={category.id} type="button" onClick={() => setDraft({ ...draft, category_id: category.id })} aria-pressed={isSelected} className={cn("flex min-h-16 items-center gap-2 rounded-xl border p-2.5 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isSelected ? category.border : "border-border bg-background text-muted-foreground hover:text-foreground")}><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", category.color)}><CategoryIcon className="size-4" /></span><span className="leading-tight">{t(category.nameKey)}</span></button> })}</div></fieldset>
          <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{t("expenses.saveExpense")}</Button></div>
        </form></CardContent></Card>
      )}

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {isOverview ? (
        <>
          <React.Suspense fallback={<ChartCardsLoading />}><SpendingCharts expenses={expenses} isLoading={isLoading} /></React.Suspense>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><CardDescription>{t("expenses.thisMonth")}</CardDescription><CardAction><TrendingUp className="size-4 text-muted-foreground" /></CardAction></CardHeader><CardContent><p className="text-2xl font-semibold">{isLoading ? "—" : money.format(monthTotal)}</p><p className="mt-1 text-xs text-muted-foreground">{t("expenses.transactions", { count: monthExpenses.length })}</p></CardContent></Card>
            <Card><CardHeader><CardDescription>{t("expenses.allTimeTracked")}</CardDescription><CardAction><CircleDollarSign className="size-4 text-muted-foreground" /></CardAction></CardHeader><CardContent><p className="text-2xl font-semibold">{isLoading ? "—" : money.format(total)}</p><p className="mt-1 text-xs text-muted-foreground">{t("expenses.acrossTransactions", { count: expenses.length })}</p></CardContent></Card>
            <Card><CardHeader><CardDescription>{t("expenses.topCategory")}</CardDescription></CardHeader><CardContent><p className="text-2xl font-semibold">{categoryTotals[0] ? t(categoryTotals[0].nameKey) : "—"}</p><p className="mt-1 text-xs text-muted-foreground">{categoryTotals[0] ? money.format(categoryTotals[0].amount) : t("expenses.noSpending")}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>{t("expenses.spendingByCategory")}</CardTitle><CardDescription>{t("expenses.categoryDescription")}</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {categoryTotals.map((category) => { const CategoryIcon = category.icon; return <div key={category.id} className="space-y-2"><div className="flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 font-medium"><span className={cn("flex size-7 items-center justify-center rounded-lg", category.color)}><CategoryIcon className="size-3.5" /></span>{t(category.nameKey)}</span><span className="tabular-nums text-muted-foreground">{money.format(category.amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", category.bar)} style={{ width: `${Math.max(4, (category.amount / maxCategory) * 100)}%` }} /></div></div> })}
              {!isLoading && categoryTotals.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{t("expenses.noBreakdown")}</p>}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="relative max-w-md"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("expenses.searchPlaceholder")} /></div>
          <Card><CardContent className="divide-y p-0">
            {filteredExpenses.map((expense) => {
              const category = getExpenseCategory(expense.category_id)
              const CategoryIcon = category.icon
              return (
                <div key={expense.id} role="button" tabIndex={0} onClick={() => setSelectedExpense(expense)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedExpense(expense) }} className="group flex cursor-pointer items-center gap-3 p-4 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5">
                  <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", category.color)}><CategoryIcon className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-medium">{expense.title}</p><Badge variant="outline" className={category.border}>{t(category.nameKey)}</Badge></div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{expense.expense_date}{expense.description ? ` · ${expense.description}` : ""}</p>
                  </div>
                  <span className="font-semibold tabular-nums">{money.format(Number(expense.amount))}</span>
                  <Button variant="ghost" size="icon" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100" onClick={(event) => { event.stopPropagation(); void deleteExpense(expense.id) }} aria-label={t("expenses.deleteExpense")}><Trash2 /></Button>
                </div>
              )
            })}
            {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> {t("expenses.loading")}</div>}
            {!isLoading && filteredExpenses.length === 0 && <div className="p-12 text-center"><p className="font-medium">{t("expenses.emptyTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("expenses.emptyDescription")}</p></div>}
          </CardContent></Card>
        </>
      )}
      {selectedExpense && <ExpenseSheet expense={selectedExpense} onClose={() => setSelectedExpense(null)} onDelete={() => deleteExpense(selectedExpense.id)} />}
    </>
  )
}

function ExpenseSheet({ expense, onClose, onDelete }: { expense: Expense; onClose: () => void; onDelete: () => Promise<void> }) {
  const { t, i18n } = useTranslation("core")
  const category = getExpenseCategory(expense.category_id)
  const CategoryIcon = category.icon
  const money = new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: "EUR" })
  const expenseDate = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "long" }).format(new Date(`${expense.expense_date}T00:00:00`))
  const recordedAt = expense.created_at ? new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium", timeStyle: "short" }).format(new Date(expense.created_at)) : null

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="overflow-y-auto sm:max-w-lg">
        <SheetHeader className="border-b pr-12">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", category.color)}><CategoryIcon className="size-5" /></div>
            <div className="min-w-0"><SheetTitle className="truncate text-lg">{expense.title}</SheetTitle><SheetDescription>{t(category.nameKey)}</SheetDescription></div>
          </div>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <div className="rounded-2xl border bg-muted/30 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{t("expenses.amountPaid")}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight">{money.format(Number(expense.amount))}</p>
          </div>
          <div className="divide-y rounded-xl border">
            <ExpenseDetailRow icon={CalendarDays} label={t("expenses.expenseDate")} value={expenseDate} />
            <ExpenseDetailRow icon={CategoryIcon} label={t("expenses.category")} value={t(category.nameKey)} />
            {recordedAt && <ExpenseDetailRow icon={ReceiptText} label={t("expenses.recorded")} value={recordedAt} />}
          </div>
          <div className="rounded-xl border p-4">
            <div className="flex items-center gap-2 text-sm font-medium"><ReceiptText className="size-4 text-muted-foreground" />{t("expenses.description")}</div>
            <p className={cn("mt-3 whitespace-pre-wrap text-sm leading-relaxed", !expense.description && "italic text-muted-foreground")}>{expense.description || t("expenses.noDescription")}</p>
          </div>
          <Button variant="destructive" className="w-full" onClick={() => void onDelete()}><Trash2 />{t("expenses.deleteExpense")}</Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ExpenseDetailRow({ icon: Icon, label, value }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; label: string; value: string }) {
  return <div className="flex items-center gap-3 px-3 py-3 text-sm"><Icon className="size-4 shrink-0 text-muted-foreground" /><span className="text-muted-foreground">{label}</span><span className="ml-auto text-right font-medium">{value}</span></div>
}

function ChartCardsLoading() {
  return <div className="space-y-4"><Card><CardHeader><div className="h-5 w-36 animate-pulse rounded bg-muted" /><div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" /></CardHeader><CardContent><div className="h-[300px] animate-pulse rounded-xl bg-muted/60" /></CardContent></Card><div className="grid gap-4 xl:grid-cols-2">{[0, 1].map((item) => <Card key={item}><CardHeader><div className="h-5 w-36 animate-pulse rounded bg-muted" /><div className="h-4 w-64 max-w-full animate-pulse rounded bg-muted" /></CardHeader><CardContent><div className="h-[280px] animate-pulse rounded-xl bg-muted/60" /></CardContent></Card>)}</div></div>
}
