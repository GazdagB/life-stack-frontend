import * as React from "react"
import { CircleDollarSign, LoaderCircle, Plus, Search, Trash2, TrendingUp, X } from "lucide-react"
import { useLocation } from "react-router"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { api, type Expense, type ExpenseInput } from "src/lib/api"
import { expenseCategoryOptions, getExpenseCategory } from "src/lib/expense-categories"
import { cn } from "src/lib/utils"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" })
const today = () => new Date().toISOString().slice(0, 10)
const emptyExpense = (): ExpenseInput => ({ title: "", amount: "", expense_date: today(), category_id: 10 })

export default function Expenses() {
  const location = useLocation()
  const isOverview = location.pathname.endsWith("/overview")
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [draft, setDraft] = React.useState<ExpenseInput>(emptyExpense)
  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    api.expenses.list().then(setExpenses).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load expenses.")).finally(() => setIsLoading(false))
  }, [])

  const currentMonth = today().slice(0, 7)
  const monthExpenses = expenses.filter((expense) => expense.expense_date.startsWith(currentMonth))
  const monthTotal = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const categoryTotals = expenseCategoryOptions.map((category) => ({ ...category, amount: expenses.filter((expense) => expense.category_id === category.id).reduce((sum, expense) => sum + Number(expense.amount), 0) })).filter((item) => item.amount > 0).sort((a, b) => b.amount - a.amount)
  const maxCategory = categoryTotals[0]?.amount ?? 1
  const filteredExpenses = [...expenses].filter((expense) => `${expense.title} ${getExpenseCategory(expense.category_id).name}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => b.expense_date.localeCompare(a.expense_date))

  async function createExpense(event: React.FormEvent) {
    event.preventDefault(); setError(""); setIsSaving(true)
    try {
      const created = await api.expenses.create(draft)
      setExpenses((current) => [created, ...current])
      setDraft(emptyExpense())
      setShowForm(false)
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the expense.") }
    finally { setIsSaving(false) }
  }

  async function deleteExpense(id: number) {
    const previous = expenses; setExpenses((current) => current.filter((expense) => expense.id !== id))
    try { await api.expenses.delete(id) }
    catch (reason) { setExpenses(previous); setError(reason instanceof Error ? reason.message : "Could not delete the expense.") }
  }

  return (
    <>
      <PageHeader
        eyebrow="Money"
        title={isOverview ? "Spending overview" : "All expenses"}
        description={isOverview ? "See where your money is going across every recorded category." : "A clean history of the everyday costs that shape your month."}
        action={!isOverview ? <Button onClick={() => setShowForm((value) => !value)}>{showForm ? <X /> : <Plus />}{showForm ? "Close" : "Add expense"}</Button> : undefined}
      />

      {showForm && !isOverview && (
        <Card><CardContent><form onSubmit={createExpense} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 sm:col-span-2"><label className="text-sm font-medium" htmlFor="expense-title">Expense</label><Input id="expense-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What did you pay for?" required /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="expense-amount">Amount</label><Input id="expense-amount" type="number" min="0.01" step="0.01" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} placeholder="0.00" required /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="expense-date">Date</label><Input id="expense-date" type="date" value={draft.expense_date} onChange={(event) => setDraft({ ...draft, expense_date: event.target.value })} required /></div>
          <fieldset className="space-y-2 sm:col-span-2 lg:col-span-4"><legend className="text-sm font-medium">Category</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{expenseCategoryOptions.map((category) => { const CategoryIcon = category.icon; const isSelected = draft.category_id === category.id; return <button key={category.id} type="button" onClick={() => setDraft({ ...draft, category_id: category.id })} aria-pressed={isSelected} className={cn("flex min-h-16 items-center gap-2 rounded-xl border p-2.5 text-left text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", isSelected ? category.border : "border-border bg-background text-muted-foreground hover:text-foreground")}><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", category.color)}><CategoryIcon className="size-4" /></span><span className="leading-tight">{category.name}</span></button> })}</div></fieldset>
          <div className="sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}Save expense</Button></div>
        </form></CardContent></Card>
      )}

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {isOverview ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><CardHeader><CardDescription>This month</CardDescription><CardAction><TrendingUp className="size-4 text-muted-foreground" /></CardAction></CardHeader><CardContent><p className="text-2xl font-semibold">{isLoading ? "—" : money.format(monthTotal)}</p><p className="mt-1 text-xs text-muted-foreground">{monthExpenses.length} transactions</p></CardContent></Card>
            <Card><CardHeader><CardDescription>All-time tracked</CardDescription><CardAction><CircleDollarSign className="size-4 text-muted-foreground" /></CardAction></CardHeader><CardContent><p className="text-2xl font-semibold">{isLoading ? "—" : money.format(total)}</p><p className="mt-1 text-xs text-muted-foreground">Across {expenses.length} transactions</p></CardContent></Card>
            <Card><CardHeader><CardDescription>Top category</CardDescription></CardHeader><CardContent><p className="text-2xl font-semibold">{categoryTotals[0]?.name ?? "—"}</p><p className="mt-1 text-xs text-muted-foreground">{categoryTotals[0] ? money.format(categoryTotals[0].amount) : "No spending yet"}</p></CardContent></Card>
          </div>
          <Card>
            <CardHeader><CardTitle>Spending by category</CardTitle><CardDescription>A relative view of all recorded expenses.</CardDescription></CardHeader>
            <CardContent className="space-y-5">
              {categoryTotals.map((category) => { const CategoryIcon = category.icon; return <div key={category.name} className="space-y-2"><div className="flex items-center justify-between gap-4 text-sm"><span className="flex items-center gap-2 font-medium"><span className={cn("flex size-7 items-center justify-center rounded-lg", category.color)}><CategoryIcon className="size-3.5" /></span>{category.name}</span><span className="tabular-nums text-muted-foreground">{money.format(category.amount)}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full transition-all", category.bar)} style={{ width: `${Math.max(4, (category.amount / maxCategory) * 100)}%` }} /></div></div> })}
              {!isLoading && categoryTotals.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">Add expenses to see your spending breakdown.</p>}
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="relative max-w-md"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search expenses…" /></div>
          <Card><CardContent className="divide-y p-0">
            {filteredExpenses.map((expense) => { const category = getExpenseCategory(expense.category_id); const CategoryIcon = category.icon; return <div key={expense.id} className="group flex items-center gap-3 p-4 sm:p-5"><div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", category.color)}><CategoryIcon className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{expense.title}</p><Badge variant="outline" className={category.border}>{category.name}</Badge></div><p className="mt-1 text-xs text-muted-foreground">{expense.expense_date}</p></div><span className="font-semibold tabular-nums">{money.format(Number(expense.amount))}</span><Button variant="ghost" size="icon" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => void deleteExpense(expense.id)} aria-label="Delete expense"><Trash2 /></Button></div> })}
            {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading expenses…</div>}
            {!isLoading && filteredExpenses.length === 0 && <div className="p-12 text-center"><p className="font-medium">No expenses found</p><p className="mt-1 text-sm text-muted-foreground">Add your first expense to start tracking.</p></div>}
          </CardContent></Card>
        </>
      )}
    </>
  )
}
