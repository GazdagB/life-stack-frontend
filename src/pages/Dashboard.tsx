import * as React from "react"
import { ArrowRight, CalendarCheck2, CircleDollarSign, ListChecks, WalletCards } from "lucide-react"
import { Link } from "react-router"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { api, type Expense, type Todo } from "src/lib/api"
import { useAuth } from "src/lib/auth"
import { getExpenseCategory } from "src/lib/expense-categories"

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" })

export default function Dashboard() {
  const { user } = useAuth()
  const [todos, setTodos] = React.useState<Todo[]>([])
  const [expenses, setExpenses] = React.useState<Expense[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let active = true
    Promise.all([api.todos.list(), api.expenses.list()])
      .then(([todoData, expenseData]) => {
        if (!active) return
        setTodos(todoData)
        setExpenses(expenseData)
      })
      .catch((reason: unknown) => active && setError(reason instanceof Error ? reason.message : "Could not load your dashboard."))
      .finally(() => active && setIsLoading(false))
    return () => { active = false }
  }, [])

  const today = new Date().toISOString().slice(0, 10)
  const month = today.slice(0, 7)
  const openTasks = todos.filter((todo) => !["completed", "canceled"].includes(todo.status))
  const dueToday = openTasks.filter((todo) => todo.due_date === today)
  const monthExpenses = expenses.filter((expense) => expense.expense_date?.startsWith(month))
  const monthSpend = monthExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0)
  const recentExpenses = [...expenses].sort((a, b) => b.expense_date.localeCompare(a.expense_date)).slice(0, 4)

  return (
    <>
      <PageHeader
        eyebrow="Your day at a glance"
        title={`Welcome back, ${user?.username ?? "there"}`}
        description="Keep tasks moving and stay on top of your spending from one focused workspace."
        action={<Button asChild><Link to="/todos"><ListChecks /> View tasks</Link></Button>}
      />
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Open tasks", value: isLoading ? "—" : openTasks.length, note: `${todos.length} total tasks`, icon: ListChecks },
          { label: "Due today", value: isLoading ? "—" : dueToday.length, note: dueToday.length ? "Ready for your attention" : "Your day is clear", icon: CalendarCheck2 },
          { label: "This month", value: isLoading ? "—" : money.format(monthSpend), note: `${monthExpenses.length} transactions`, icon: WalletCards },
          { label: "All expenses", value: isLoading ? "—" : expenses.length, note: "Tracked transactions", icon: CircleDollarSign },
        ].map((metric) => (
          <Card key={metric.label}>
            <CardHeader><CardDescription>{metric.label}</CardDescription><CardAction><div className="rounded-lg bg-muted p-2"><metric.icon className="size-4" /></div></CardAction></CardHeader>
            <CardContent><p className="text-2xl font-semibold tracking-tight">{metric.value}</p><p className="mt-1 text-xs text-muted-foreground">{metric.note}</p></CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader><CardTitle>Next up</CardTitle><CardDescription>Your highest-priority open work.</CardDescription><CardAction><Button asChild variant="ghost" size="sm"><Link to="/todos">See all <ArrowRight /></Link></Button></CardAction></CardHeader>
          <CardContent className="space-y-2">
            {openTasks.slice().sort((a, b) => a.priority.localeCompare(b.priority)).slice(0, 5).map((todo) => (
              <div key={todo.id} className="flex items-center gap-3 rounded-lg border p-3"><div className="size-2 rounded-full bg-foreground" /><div className="min-w-0 flex-1"><p className="truncate font-medium">{todo.title}</p><p className="text-xs text-muted-foreground">{todo.due_date ? `Due ${todo.due_date}` : "No due date"}</p></div><Badge variant="outline">{todo.priority}</Badge></div>
            ))}
            {!isLoading && openTasks.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Nothing waiting. Enjoy the breathing room.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Recent spending</CardTitle><CardDescription>Your latest recorded expenses.</CardDescription><CardAction><Button asChild variant="ghost" size="sm"><Link to="/expenses">See all <ArrowRight /></Link></Button></CardAction></CardHeader>
          <CardContent className="space-y-1">
            {recentExpenses.map((expense) => {
              const category = getExpenseCategory(expense.category_id)
              const CategoryIcon = category.icon
              return <div key={expense.id} className="flex items-center gap-3 border-b py-3 last:border-0"><div className={`flex size-9 items-center justify-center rounded-lg ${category.color}`}><CategoryIcon className="size-4" /></div><div className="min-w-0 flex-1"><p className="truncate font-medium">{expense.title}</p><p className="text-xs text-muted-foreground">{category.name}</p></div><span className="font-medium tabular-nums">{money.format(Number(expense.amount))}</span></div>
            })}
            {!isLoading && recentExpenses.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">No expenses recorded yet.</p>}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
