import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "src/components/ui/chart"
import type { Expense } from "src/lib/api"

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
})

const compactMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
})

const monthLabel = new Intl.DateTimeFormat("en-US", { month: "short", year: "2-digit" })
const dayLabel = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
const fullDayLabel = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" })

const dailyConfig = {
  spending: { label: "Spending", color: "var(--chart-1)" },
} satisfies ChartConfig

const monthlyConfig = {
  spending: { label: "Spending", color: "var(--chart-2)" },
} satisfies ChartConfig

const cumulativeConfig = {
  cumulative: { label: "Total tracked", color: "var(--chart-4)" },
} satisfies ChartConfig

function monthKey(year: number, zeroBasedMonth: number) {
  return `${year}-${String(zeroBasedMonth + 1).padStart(2, "0")}`
}

function dayKey(date: Date) {
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

function shiftDay(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset)
}

function shiftMonth(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1)
}

function labelForKey(key: string) {
  const [year, month] = key.split("-").map(Number)
  return monthLabel.format(new Date(year, month - 1, 1))
}

function totalsByMonth(expenses: Expense[]) {
  const totals = new Map<string, number>()
  expenses.forEach((expense) => {
    const key = expense.expense_date.slice(0, 7)
    totals.set(key, (totals.get(key) ?? 0) + Number(expense.amount))
  })
  return totals
}

function buildDailyData(expenses: Expense[]) {
  const totals = new Map<string, number>()
  expenses.forEach((expense) => {
    totals.set(expense.expense_date, (totals.get(expense.expense_date) ?? 0) + Number(expense.amount))
  })

  const today = new Date()
  return Array.from({ length: 30 }, (_, index) => {
    const date = shiftDay(today, index - 29)
    const key = dayKey(date)
    return {
      key,
      label: dayLabel.format(date),
      fullLabel: fullDayLabel.format(date),
      spending: totals.get(key) ?? 0,
    }
  })
}

function buildMonthlyData(expenses: Expense[]) {
  const totals = totalsByMonth(expenses)
  const currentMonth = new Date()
  return Array.from({ length: 12 }, (_, index) => {
    const date = shiftMonth(currentMonth, index - 11)
    const key = monthKey(date.getFullYear(), date.getMonth())
    return { key, label: labelForKey(key), spending: totals.get(key) ?? 0 }
  })
}

function buildCumulativeData(expenses: Expense[]) {
  if (expenses.length === 0) return []

  const totals = totalsByMonth(expenses)
  const keys = [...totals.keys()].sort()
  const [firstYear, firstMonth] = keys[0].split("-").map(Number)
  const [lastExpenseYear, lastExpenseMonth] = keys.at(-1)!.split("-").map(Number)
  const first = new Date(firstYear, firstMonth - 1, 1)
  const lastExpense = new Date(lastExpenseYear, lastExpenseMonth - 1, 1)
  const current = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const last = lastExpense > current ? lastExpense : current
  const months = (last.getFullYear() - first.getFullYear()) * 12 + last.getMonth() - first.getMonth()
  let cumulative = 0

  return Array.from({ length: months + 1 }, (_, index) => {
    const date = shiftMonth(first, index)
    const key = monthKey(date.getFullYear(), date.getMonth())
    cumulative += totals.get(key) ?? 0
    return { key, label: labelForKey(key), cumulative }
  })
}

function MoneyTooltip({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex min-w-40 items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">{money.format(value)}</span>
    </div>
  )
}

export function SpendingCharts({ expenses, isLoading }: { expenses: Expense[]; isLoading: boolean }) {
  const dailyData = React.useMemo(() => buildDailyData(expenses), [expenses])
  const monthlyData = React.useMemo(() => buildMonthlyData(expenses), [expenses])
  const cumulativeData = React.useMemo(() => buildCumulativeData(expenses), [expenses])
  const hasExpenses = expenses.length > 0
  const dailyTotal = dailyData.reduce((sum, day) => sum + day.spending, 0)
  const activeDays = dailyData.filter((day) => day.spending > 0).length
  const hasDailyExpenses = activeDays > 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle>Daily spending</CardTitle>
              <CardDescription>Recorded expenses day by day over the last 30 days.</CardDescription>
            </div>
            {!isLoading && hasDailyExpenses && (
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">{money.format(dailyTotal)}</p>
                <p className="text-xs text-muted-foreground">{activeDays} spending {activeDays === 1 ? "day" : "days"}</p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? <ChartLoading /> : hasDailyExpenses ? (
            <ChartContainer config={dailyConfig} className="h-[300px] w-full aspect-auto">
              <LineChart data={dailyData} accessibilityLayer margin={{ left: 4, right: 12 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={28} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} width={64} tickFormatter={(value) => compactMoney.format(Number(value))} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line" formatter={(value, _name, item) => <MoneyTooltip value={Number(value)} label={String(item.payload?.fullLabel ?? item.payload?.label ?? "Day")} />} />} />
                <Line dataKey="spending" type="linear" stroke="var(--color-spending)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          ) : <ChartEmpty message="No expenses were recorded during the last 30 days." />}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly spending</CardTitle>
            <CardDescription>Actual expenses recorded during the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartLoading /> : hasExpenses ? (
              <ChartContainer config={monthlyConfig} className="h-[280px] w-full aspect-auto">
                <BarChart data={monthlyData} accessibilityLayer margin={{ left: 4, right: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={64} tickFormatter={(value) => compactMoney.format(Number(value))} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value, _name, item) => <MoneyTooltip value={Number(value)} label={String(item.payload?.label ?? "Month")} />} />} />
                  <Bar dataKey="spending" fill="var(--color-spending)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <ChartEmpty />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All-time spending</CardTitle>
            <CardDescription>Cumulative tracked expenses, grouped month by month.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartLoading /> : hasExpenses ? (
              <ChartContainer config={cumulativeConfig} className="h-[280px] w-full aspect-auto">
                <LineChart data={cumulativeData} accessibilityLayer margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={64} tickFormatter={(value) => compactMoney.format(Number(value))} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line" formatter={(value, _name, item) => <MoneyTooltip value={Number(value)} label={String(item.payload?.label ?? "Month")} />} />} />
                  <Line dataKey="cumulative" type="monotone" stroke="var(--color-cumulative)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ChartContainer>
            ) : <ChartEmpty />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChartLoading() {
  return <div className="h-[280px] animate-pulse rounded-xl bg-muted/60" />
}

function ChartEmpty({ message = "Add expenses to start building your spending history." }: { message?: string }) {
  return <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm text-muted-foreground">{message}</div>
}
