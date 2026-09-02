import * as React from "react"
import {
  Banknote, Building2, Car, CreditCard, Landmark, LineChart as LineChartIcon,
  LoaderCircle, Pencil, PiggyBank, Plus, RefreshCw, Scale, Trash2, WalletCards, X,
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "src/components/ui/alert-dialog"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "src/components/ui/chart"
import { Input } from "src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { Textarea } from "src/components/ui/textarea"
import {
  api, type BankAccount, type NetWorthCategory, type NetWorthHistoryPoint,
  type NetWorthItem, type NetWorthItemInput, type NetWorthSummary,
} from "src/lib/api"
import { cn } from "src/lib/utils"


const categories: Array<{ value: NetWorthCategory; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; color: string }> = [
  { value: "CASH", icon: Banknote, color: "bg-emerald-100 text-emerald-700" },
  { value: "BANK", icon: Landmark, color: "bg-blue-100 text-blue-700" },
  { value: "INVESTMENT", icon: LineChartIcon, color: "bg-violet-100 text-violet-700" },
  { value: "PROPERTY", icon: Building2, color: "bg-amber-100 text-amber-700" },
  { value: "VEHICLE", icon: Car, color: "bg-cyan-100 text-cyan-700" },
  { value: "BUSINESS", icon: WalletCards, color: "bg-indigo-100 text-indigo-700" },
  { value: "LOAN", icon: PiggyBank, color: "bg-orange-100 text-orange-700" },
  { value: "CREDIT_CARD", icon: CreditCard, color: "bg-rose-100 text-rose-700" },
  { value: "OTHER", icon: Scale, color: "bg-slate-100 text-slate-700" },
]

const emptyItem = (): NetWorthItemInput => ({
  name: "", kind: "ASSET", category: "CASH", current_value: "", currency: "EUR",
  ownership_percent: 100, linked_bank_account_id: null, notes: null, active: true,
})

export default function NetWorth() {
  const { t, i18n } = useTranslation("netWorth")
  const [currency, setCurrency] = React.useState("EUR")
  const [items, setItems] = React.useState<NetWorthItem[]>([])
  const [summary, setSummary] = React.useState<NetWorthSummary | null>(null)
  const [history, setHistory] = React.useState<NetWorthHistoryPoint[]>([])
  const [bankAccounts, setBankAccounts] = React.useState<BankAccount[]>([])
  const [draft, setDraft] = React.useState<NetWorthItemInput>(emptyItem)
  const [editingId, setEditingId] = React.useState<number | null>(null)
  const [deleting, setDeleting] = React.useState<NetWorthItem | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSnapshotting, setIsSnapshotting] = React.useState(false)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")

  const load = React.useCallback(async () => {
    const [nextItems, nextSummary, nextHistory] = await Promise.all([
      api.netWorth.items(), api.netWorth.summary(currency), api.netWorth.history(currency),
    ])
    setItems(nextItems); setSummary(nextSummary); setHistory(nextHistory)
  }, [currency])

  React.useEffect(() => {
    let active = true
    Promise.all([
      api.netWorth.items(), api.netWorth.summary(currency), api.netWorth.history(currency),
      api.banking.connections(),
    ])
      .then(([nextItems, nextSummary, nextHistory, connections]) => {
        if (!active) return
        setItems(nextItems); setSummary(nextSummary); setHistory(nextHistory)
        setBankAccounts(connections.flatMap((connection) => connection.accounts))
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : t("loadError")) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [currency, t])

  const money = React.useMemo(() => new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency }), [currency, i18n.resolvedLanguage])
  const compactMoney = React.useMemo(() => new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }), [currency, i18n.resolvedLanguage])
  const chartConfig = React.useMemo(() => ({
    net_worth: { label: t("netWorth"), color: "var(--chart-2)" },
    assets: { label: t("assets"), color: "var(--chart-1)" },
    liabilities: { label: t("liabilities"), color: "var(--chart-5)" },
  }) satisfies ChartConfig, [t])
  const chartData = history.map((point) => ({ ...point, assets: Number(point.assets), liabilities: Number(point.liabilities), net_worth: Number(point.net_worth) }))
  const visibleItems = items.filter((item) => item.currency === currency)

  function openCreate() { setEditingId(null); setDraft({ ...emptyItem(), currency }); setShowForm(true); setError(""); setNotice("") }
  function changeCurrency(value: string) { setIsLoading(true); setError(""); setCurrency(value) }
  function openEdit(item: NetWorthItem) {
    setEditingId(item.id)
    setDraft({ name: item.name, kind: item.kind, category: item.category, current_value: String(item.current_value), currency: item.currency, ownership_percent: String(item.ownership_percent), linked_bank_account_id: item.linked_bank_account_id, notes: item.notes, active: item.active })
    setShowForm(true); setError(""); setNotice("")
  }
  function closeForm() { setShowForm(false); setEditingId(null); setDraft(emptyItem()) }

  async function saveItem(event: React.FormEvent) {
    event.preventDefault(); setIsSaving(true); setError("")
    try {
      if (editingId) await api.netWorth.update(editingId, draft)
      else await api.netWorth.create(draft)
      closeForm(); await load()
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("saveError")) }
    finally { setIsSaving(false) }
  }

  async function deleteItem() {
    if (!deleting) return
    try { await api.netWorth.delete(deleting.id); setDeleting(null); await load() }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("deleteError")) }
  }

  async function saveSnapshot() {
    setIsSnapshotting(true); setError(""); setNotice("")
    try { await api.netWorth.snapshot(); setNotice(t("snapshotSaved")); await load() }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("snapshotError")) }
    finally { setIsSnapshotting(false) }
  }

  function selectBank(value: string) {
    if (value === "manual") { setDraft((current) => ({ ...current, linked_bank_account_id: null })); return }
    const account = bankAccounts.find((item) => item.id === Number(value))
    setDraft((current) => ({ ...current, linked_bank_account_id: Number(value), category: "BANK", current_value: 0, currency: account?.currency ?? current.currency, name: current.name || account?.account_name || account?.bank_name || "" }))
  }

  return (
    <>
      <PageHeader icon={Scale} eyebrow={t("eyebrow")} title={t("title")} description={t("description")} action={<div className="flex flex-wrap gap-2"><Button variant="outline" disabled={isSnapshotting || items.length === 0} onClick={() => void saveSnapshot()}>{isSnapshotting ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}{isSnapshotting ? t("snapshotting") : t("snapshot")}</Button><Button onClick={showForm ? closeForm : openCreate}>{showForm ? <X /> : <Plus />}{showForm ? t("close") : t("addItem")}</Button></div>} />

      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      {showForm && <ItemForm draft={draft} setDraft={setDraft} editing={Boolean(editingId)} bankAccounts={bankAccounts} isSaving={isSaving} onSubmit={saveItem} onCancel={closeForm} onSelectBank={selectBank} />}

      <div className="flex justify-end"><div className="w-36"><Select value={currency} onValueChange={changeCurrency}><SelectTrigger aria-label={t("currency")}><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR · €</SelectItem><SelectItem value="HUF">HUF · Ft</SelectItem></SelectContent></Select></div></div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label={t("assets")} value={summary ? money.format(Number(summary.assets)) : "—"} icon={TrendingIcon} tone="text-emerald-700 bg-emerald-100" />
        <SummaryCard label={t("liabilities")} value={summary ? money.format(Number(summary.liabilities)) : "—"} icon={CreditCard} tone="text-rose-700 bg-rose-100" />
        <SummaryCard label={t("netWorth")} value={summary ? money.format(Number(summary.net_worth)) : "—"} icon={Scale} tone="text-blue-700 bg-blue-100" help={t("trackedItems", { count: summary?.item_count ?? 0 })} />
      </div>

      <Card>
        <CardHeader><CardTitle>{t("history")}</CardTitle><CardDescription>{t("historyHelp")}</CardDescription></CardHeader>
        <CardContent>
          {chartData.length > 0 ? <ChartContainer config={chartConfig} className="h-[300px] w-full aspect-auto"><LineChart data={chartData} accessibilityLayer><CartesianGrid vertical={false} /><XAxis dataKey="recorded_on" tickLine={false} axisLine={false} minTickGap={30} /><YAxis tickLine={false} axisLine={false} width={72} tickFormatter={(value) => compactMoney.format(Number(value))} /><ChartTooltip content={<ChartTooltipContent />} /><Line dataKey="assets" type="monotone" stroke="var(--color-assets)" strokeWidth={2} dot={false} /><Line dataKey="liabilities" type="monotone" stroke="var(--color-liabilities)" strokeWidth={2} dot={false} /><Line dataKey="net_worth" type="monotone" stroke="var(--color-net_worth)" strokeWidth={3} dot={{ r: 3 }} /></LineChart></ChartContainer> : <div className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">{isLoading ? <LoaderCircle className="animate-spin" /> : t("noHistory")}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>{t("holdings")}</CardTitle><CardDescription>{t("holdingsHelp")}</CardDescription></CardHeader>
        <CardContent className="divide-y p-0">
          {visibleItems.map((item) => <ItemRow key={item.id} item={item} money={money} t={t} onEdit={() => openEdit(item)} onDelete={() => setDeleting(item)} />)}
          {isLoading && <div className="flex items-center justify-center p-12"><LoaderCircle className="animate-spin text-muted-foreground" /></div>}
          {!isLoading && visibleItems.length === 0 && <div className="p-12 text-center"><p className="font-medium">{t("emptyTitle")}</p><p className="mt-1 text-sm text-muted-foreground">{t("emptyHelp")}</p><Button className="mt-5" onClick={openCreate}><Plus />{t("addItem")}</Button></div>}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle><AlertDialogDescription>{t("deleteHelp")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => void deleteItem()}>{t("deleteConfirm")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  )
}

function ItemForm({ draft, setDraft, editing, bankAccounts, isSaving, onSubmit, onCancel, onSelectBank }: { draft: NetWorthItemInput; setDraft: React.Dispatch<React.SetStateAction<NetWorthItemInput>>; editing: boolean; bankAccounts: BankAccount[]; isSaving: boolean; onSubmit: (event: React.FormEvent) => Promise<void>; onCancel: () => void; onSelectBank: (value: string) => void }) {
  const { t } = useTranslation("netWorth")
  return <Card><CardHeader><CardTitle>{editing ? t("editItem") : t("addItem")}</CardTitle></CardHeader><CardContent><form onSubmit={(event) => void onSubmit(event)} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <Field label={t("name")} className="sm:col-span-2"><Input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder={t("namePlaceholder")} required /></Field>
    <Field label={t("kind")}><Select value={draft.kind} onValueChange={(value) => setDraft({ ...draft, kind: value as NetWorthItemInput["kind"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ASSET">{t("asset")}</SelectItem><SelectItem value="LIABILITY">{t("liability")}</SelectItem></SelectContent></Select></Field>
    <Field label={t("category")}><Select value={draft.category} onValueChange={(value) => setDraft({ ...draft, category: value as NetWorthCategory })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{categories.map((category) => <SelectItem key={category.value} value={category.value}>{t(`categories.${category.value}`)}</SelectItem>)}</SelectContent></Select></Field>
    <Field label={t("dataSource")} className="sm:col-span-2"><Select value={draft.linked_bank_account_id ? String(draft.linked_bank_account_id) : "manual"} onValueChange={onSelectBank}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="manual">{t("manual")}</SelectItem>{bankAccounts.map((account) => <SelectItem key={account.id} value={String(account.id)}>{account.account_name || account.bank_name || t("linkedBank")} {account.iban_last4 ? `•••• ${account.iban_last4}` : ""}</SelectItem>)}</SelectContent></Select>{draft.linked_bank_account_id && <p className="text-xs text-muted-foreground">{t("bankBalanceHelp")}</p>}</Field>
    <Field label={t("value")}><Input type="number" min="0" step="0.01" value={draft.current_value} disabled={Boolean(draft.linked_bank_account_id)} onChange={(event) => setDraft({ ...draft, current_value: event.target.value })} required={!draft.linked_bank_account_id} /></Field>
    <Field label={t("currency")}><Select value={draft.currency} disabled={Boolean(draft.linked_bank_account_id)} onValueChange={(value) => setDraft({ ...draft, currency: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="EUR">EUR</SelectItem><SelectItem value="HUF">HUF</SelectItem></SelectContent></Select></Field>
    <Field label={t("ownership")}><div className="relative"><Input type="number" min="0.01" max="100" step="0.01" value={draft.ownership_percent} onChange={(event) => setDraft({ ...draft, ownership_percent: event.target.value })} required /><span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span></div></Field>
    <label className="flex items-center gap-2 self-end rounded-lg border px-3 py-2.5 text-sm"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft({ ...draft, active: event.target.checked })} />{t("active")}</label>
    <Field label={t("notes")} className="sm:col-span-2 lg:col-span-4"><Textarea value={draft.notes ?? ""} maxLength={500} onChange={(event) => setDraft({ ...draft, notes: event.target.value || null })} placeholder={t("notesPlaceholder")} /></Field>
    <div className="flex gap-2 sm:col-span-2 lg:col-span-4"><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{isSaving ? t("saving") : t("save")}</Button><Button type="button" variant="ghost" onClick={onCancel}>{t("cancel")}</Button></div>
  </form></CardContent></Card>
}

function Field({ label, className, children }: { label: string; className?: string; children: React.ReactNode }) { return <label className={cn("space-y-2", className)}><span className="text-sm font-medium">{label}</span>{children}</label> }

function SummaryCard({ label, value, icon: Icon, tone, help }: { label: string; value: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tone: string; help?: string }) { return <Card><CardContent className="flex items-center gap-4 p-5"><span className={cn("flex size-11 items-center justify-center rounded-xl", tone)}><Icon className="size-5" /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-semibold tabular-nums">{value}</p>{help && <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>}</div></CardContent></Card> }

function TrendingIcon(props: React.SVGProps<SVGSVGElement>) { return <LineChartIcon {...props} /> }

function ItemRow({ item, money, t, onEdit, onDelete }: { item: NetWorthItem; money: Intl.NumberFormat; t: ReturnType<typeof useTranslation>["t"]; onEdit: () => void; onDelete: () => void }) {
  const category = categories.find((entry) => entry.value === item.category) ?? categories.at(-1)!
  const Icon = category.icon
  return <div className={cn("flex flex-wrap items-center gap-3 p-4 sm:p-5", !item.active && "opacity-55")}><span className={cn("flex size-10 items-center justify-center rounded-xl", category.color)}><Icon className="size-5" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{item.name}</p><Badge variant={item.kind === "ASSET" ? "secondary" : "outline"}>{t(item.kind === "ASSET" ? "asset" : "liability")}</Badge>{item.linked_bank_account_id && <Badge variant="outline"><Landmark />{t("linked")}</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{t(`categories.${item.category}`)} · {t("owned", { percent: Number(item.ownership_percent) })}{item.iban_last4 ? ` · •••• ${item.iban_last4}` : ""}</p></div><p className={cn("font-semibold tabular-nums", item.kind === "LIABILITY" && "text-rose-700")}>{money.format(Number(item.effective_value) * Number(item.ownership_percent) / 100)}</p><div className="flex"><Button variant="ghost" size="icon" onClick={onEdit} aria-label={t("edit")}><Pencil /></Button><Button variant="ghost" size="icon" onClick={onDelete} aria-label={t("delete")}><Trash2 /></Button></div></div>
}
