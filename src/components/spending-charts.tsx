import * as React from "react"
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { useTranslation } from "react-i18next"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "src/components/ui/chart"
import type { Expense } from "src/lib/api"

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

function labelForKey(key: string, formatter: Intl.DateTimeFormat) {
  const [year, month] = key.split("-").map(Number)
  return formatter.format(new Date(year, month - 1, 1))
}

function totalsByMonth(expenses: Expense[]) {
  const totals = new Map<string, number>()
  expenses.forEach((expense) => {
    const key = expense.expense_date.slice(0, 7)
    totals.set(key, (totals.get(key) ?? 0) + Number(expense.amount))
  })
  return totals
}

function buildDailyData(expenses: Expense[], shortFormatter: Intl.DateTimeFormat, fullFormatter: Intl.DateTimeFormat) {
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
      label: shortFormatter.format(date),
      fullLabel: fullFormatter.format(date),
      spending: totals.get(key) ?? 0,
    }
  })
}

function buildMonthlyData(expenses: Expense[], formatter: Intl.DateTimeFormat) {
  const totals = totalsByMonth(expenses)
  const currentMonth = new Date()
  return Array.from({ length: 12 }, (_, index) => {
    const date = shiftMonth(currentMonth, index - 11)
    const key = monthKey(date.getFullYear(), date.getMonth())
    return { key, label: labelForKey(key, formatter), spending: totals.get(key) ?? 0 }
  })
}

function buildCumulativeData(expenses: Expense[], formatter: Intl.DateTimeFormat) {
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
    return { key, label: labelForKey(key, formatter), cumulative }
  })
}

function MoneyTooltip({ value, label, formatter }: { value: number; label: string; formatter: Intl.NumberFormat }) {
  return (
    <div className="flex min-w-40 items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono font-medium tabular-nums">{formatter.format(value)}</span>
    </div>
  )
}

export function SpendingCharts({ expenses, isLoading }: { expenses: Expense[]; isLoading: boolean }) {
  const { t, i18n } = useTranslation("core")
  const locale = i18n.resolvedLanguage
  const money = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2 }), [locale])
  const compactMoney = React.useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 }), [locale])
  const monthLabel = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", year: "2-digit" }), [locale])
  const dayLabel = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "short", day: "numeric" }), [locale])
  const fullDayLabel = React.useMemo(() => new Intl.DateTimeFormat(locale, { month: "long", day: "numeric", year: "numeric" }), [locale])
  const dailyConfig = React.useMemo(() => ({ spending: { label: t("charts.spending"), color: "var(--chart-1)" } }) satisfies ChartConfig, [t])
  const monthlyConfig = React.useMemo(() => ({ spending: { label: t("charts.spending"), color: "var(--chart-2)" } }) satisfies ChartConfig, [t])
  const cumulativeConfig = React.useMemo(() => ({ cumulative: { label: t("charts.totalTracked"), color: "var(--chart-4)" } }) satisfies ChartConfig, [t])
  const dailyData = React.useMemo(() => buildDailyData(expenses, dayLabel, fullDayLabel), [expenses, dayLabel, fullDayLabel])
  const monthlyData = React.useMemo(() => buildMonthlyData(expenses, monthLabel), [expenses, monthLabel])
  const cumulativeData = React.useMemo(() => buildCumulativeData(expenses, monthLabel), [expenses, monthLabel])
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
              <CardTitle>{t("charts.dailyTitle")}</CardTitle>
              <CardDescription>{t("charts.dailyDescription")}</CardDescription>
            </div>
            {!isLoading && hasDailyExpenses && (
              <div className="text-right">
                <p className="text-lg font-semibold tabular-nums">{money.format(dailyTotal)}</p>
                <p className="text-xs text-muted-foreground">{t("charts.spendingDays", { count: activeDays })}</p>
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
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line" formatter={(value, _name, item) => <MoneyTooltip formatter={money} value={Number(value)} label={String(item.payload?.fullLabel ?? item.payload?.label ?? t("charts.day"))} />} />} />
                <Line dataKey="spending" type="linear" stroke="var(--color-spending)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ChartContainer>
          ) : <ChartEmpty message={t("charts.noDaily")} />}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.monthlyTitle")}</CardTitle>
            <CardDescription>{t("charts.monthlyDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartLoading /> : hasExpenses ? (
              <ChartContainer config={monthlyConfig} className="h-[280px] w-full aspect-auto">
                <BarChart data={monthlyData} accessibilityLayer margin={{ left: 4, right: 4 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} interval="preserveStartEnd" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={64} tickFormatter={(value) => compactMoney.format(Number(value))} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel formatter={(value, _name, item) => <MoneyTooltip formatter={money} value={Number(value)} label={String(item.payload?.label ?? t("charts.month"))} />} />} />
                  <Bar dataKey="spending" fill="var(--color-spending)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : <ChartEmpty message={t("charts.empty")} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("charts.allTimeTitle")}</CardTitle>
            <CardDescription>{t("charts.allTimeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <ChartLoading /> : hasExpenses ? (
              <ChartContainer config={cumulativeConfig} className="h-[280px] w-full aspect-auto">
                <LineChart data={cumulativeData} accessibilityLayer margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} minTickGap={28} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} width={64} tickFormatter={(value) => compactMoney.format(Number(value))} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel indicator="line" formatter={(value, _name, item) => <MoneyTooltip formatter={money} value={Number(value)} label={String(item.payload?.label ?? t("charts.month"))} />} />} />
                  <Line dataKey="cumulative" type="monotone" stroke="var(--color-cumulative)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                </LineChart>
              </ChartContainer>
            ) : <ChartEmpty message={t("charts.empty")} />}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ChartLoading() {
  return <div className="h-[280px] animate-pulse rounded-xl bg-muted/60" />
}

function ChartEmpty({ message }: { message: string }) {
  return <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed px-6 text-center text-sm text-muted-foreground">{message}</div>
}
