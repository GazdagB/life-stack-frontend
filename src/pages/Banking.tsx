import * as React from "react"
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Download,
  Landmark,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Unplug,
  WalletCards,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { useTranslation } from "react-i18next"

import { PageHeader } from "src/components/page-header"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "src/components/ui/alert-dialog"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "src/components/ui/select"
import { api, type BankConnection, type BankInstitution, type BankTransaction } from "src/lib/api"
import { expenseCategoryOptions } from "src/lib/expense-categories"
import { cn } from "src/lib/utils"


type ConnectionCountry = "DE" | "HU"
type PsuType = "personal" | "business"

export default function Banking() {
  const location = useLocation()
  if (location.pathname.endsWith("/callback")) return <BankConnectionCallback />
  if (location.pathname.endsWith("/import")) return <TransactionInbox />
  return <BankAccounts />
}

function BankAccounts() {
  const { t, i18n } = useTranslation("banking")
  const [connections, setConnections] = React.useState<BankConnection[]>([])
  const [institutions, setInstitutions] = React.useState<BankInstitution[]>([])
  const [country, setCountry] = React.useState<ConnectionCountry>("DE")
  const [psuType, setPsuType] = React.useState<PsuType>("personal")
  const [selectedBank, setSelectedBank] = React.useState("")
  const [search, setSearch] = React.useState("")
  const [showConnect, setShowConnect] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingBanks, setIsLoadingBanks] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [syncingId, setSyncingId] = React.useState<number | null>(null)
  const [disconnecting, setDisconnecting] = React.useState<BankConnection | null>(null)
  const [error, setError] = React.useState("")
  const [notice, setNotice] = React.useState("")
  const institutionRequest = React.useRef(0)

  const loadConnections = React.useCallback(async () => {
    try { setConnections(await api.banking.connections()) }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("loadError")) }
    finally { setIsLoading(false) }
  }, [t])

  React.useEffect(() => {
    let active = true
    api.banking.connections()
      .then((items) => { if (active) setConnections(items) })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : t("loadError")) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [t])

  function fetchInstitutions(nextCountry: ConnectionCountry, nextPsuType: PsuType = psuType) {
    const requestId = ++institutionRequest.current
    setIsLoadingBanks(true); setError(""); setSelectedBank(""); setInstitutions([])
    api.banking.institutions(nextCountry, nextPsuType)
      .then((items) => { if (institutionRequest.current === requestId) setInstitutions(items) })
      .catch((reason: unknown) => { if (institutionRequest.current === requestId) setError(reason instanceof Error ? reason.message : t("institutionError")) })
      .finally(() => { if (institutionRequest.current === requestId) setIsLoadingBanks(false) })
  }

  function toggleConnect() {
    const nextValue = !showConnect
    setShowConnect(nextValue)
    if (nextValue) fetchInstitutions(country)
  }

  function changeCountry(value: ConnectionCountry) {
    setCountry(value)
    fetchInstitutions(value)
  }

  function changePsuType(value: PsuType) {
    setPsuType(value)
    fetchInstitutions(country, value)
  }

  const filteredInstitutions = institutions.filter((institution) => institution.name.toLowerCase().includes(search.toLowerCase()))

  async function connectBank() {
    if (!selectedBank) return
    setIsConnecting(true); setError("")
    try {
      const result = await api.banking.startConnection(selectedBank, country, psuType)
      window.location.assign(result.authorization_url)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("startError")); setIsConnecting(false)
    }
  }

  async function synchronize(connection: BankConnection) {
    setSyncingId(connection.id); setError(""); setNotice("")
    try {
      const result = await api.banking.sync(connection.id)
      setNotice(t("newTransactions", { count: result.new_transactions }))
      await loadConnections()
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("syncError")) }
    finally { setSyncingId(null) }
  }

  async function disconnect() {
    if (!disconnecting) return
    try {
      await api.banking.disconnect(disconnecting.id)
      setDisconnecting(null)
      await loadConnections()
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("actionError")) }
  }

  return (
    <>
      <PageHeader icon={Landmark} eyebrow={t("eyebrow")} title={t("accountsTitle")} description={t("accountsDescription")} action={<Button onClick={toggleConnect}><Landmark />{showConnect ? t("close") : t("connect")}</Button>} />

      {showConnect && (
        <Card>
          <CardHeader><CardTitle>{t("connect")}</CardTitle><CardDescription>{t("connectionPrivacy")}</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><label className="text-sm font-medium">{t("country")}</label><Select value={country} onValueChange={(value) => changeCountry(value as ConnectionCountry)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="DE">🇩🇪 {t("germany")}</SelectItem><SelectItem value="HU">🇭🇺 {t("hungary")}</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><label className="text-sm font-medium">{t("accountType")}</label><Select value={psuType} onValueChange={(value) => changePsuType(value as PsuType)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="personal">{t("personal")}</SelectItem><SelectItem value="business">{t("business")}</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("bank")}</label>
              <div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("searchBanks")} /></div>
              <div className="max-h-64 overflow-y-auto rounded-lg border p-1">
                {isLoadingBanks ? <div className="flex items-center justify-center gap-2 p-8 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("loadingBanks")}</div> : filteredInstitutions.map((institution) => <button key={`${institution.country}-${institution.name}`} type="button" onClick={() => setSelectedBank(institution.name)} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors", selectedBank === institution.name ? "bg-accent font-medium text-accent-foreground" : "hover:bg-muted")}><Landmark className="size-4 shrink-0 text-muted-foreground" /><span className="truncate">{institution.name}</span>{institution.bic && <span className="ml-auto text-xs text-muted-foreground">{institution.bic}</span>}</button>)}
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t pt-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4" />{t("connectionPrivacy")}</p><Button disabled={!selectedBank || isConnecting} onClick={() => void connectBank()}>{isConnecting && <LoaderCircle className="animate-spin" />}{t("continueToBank")}</Button></div>
          </CardContent>
        </Card>
      )}

      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive"><p>{error}</p>{error.toLowerCase().includes("configured") && <p className="mt-1">{t("configuredHelp")}</p>}</div>}
      {notice && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</div>}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">{t("connectedAccounts")}</h2>
        {isLoading ? <Card><CardContent className="flex items-center justify-center p-12"><LoaderCircle className="animate-spin text-muted-foreground" /></CardContent></Card> : connections.filter((connection) => connection.status !== "DISCONNECTED").map((connection) => (
          <Card key={connection.id}>
            <CardHeader className="border-b"><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle className="flex items-center gap-2"><Landmark className="size-4" />{connection.institution_name}</CardTitle><CardDescription>{connection.institution_country} · {t(connection.psu_type)}</CardDescription></div><ConnectionStatus status={connection.status} /></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {connection.accounts.map((account) => <div key={account.id} className="rounded-lg border p-4"><div className="flex items-center gap-2"><WalletCards className="size-4 text-muted-foreground" /><p className="font-medium">{account.account_name || account.bank_name || t("account")}</p></div><p className="mt-1 text-xs text-muted-foreground">{account.iban_last4 ? t("endingIn", { last4: account.iban_last4 }) : account.currency}</p><p className="mt-4 text-xs text-muted-foreground">{t("balance")}</p><p className="mt-1 text-xl font-semibold tabular-nums">{account.current_balance === null ? "—" : new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: account.currency }).format(Number(account.current_balance))}</p></div>)}
              </div>
              {connection.last_error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{connection.last_error}</p>}
              <div className="flex flex-wrap items-center gap-2 border-t pt-4"><p className="mr-auto text-xs text-muted-foreground">{connection.last_synced_at ? t("synced", { date: new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium", timeStyle: "short" }).format(new Date(connection.last_synced_at)) }) : t("neverSynced")}{connection.consent_valid_until ? ` · ${t("consentUntil", { date: new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: "medium" }).format(new Date(connection.consent_valid_until)) })}` : ""}</p><Button variant="outline" disabled={syncingId === connection.id || connection.status === "EXPIRED"} onClick={() => void synchronize(connection)}>{syncingId === connection.id ? <LoaderCircle className="animate-spin" /> : <RefreshCw />}{syncingId === connection.id ? t("syncing") : t("sync")}</Button><Button variant="ghost" onClick={() => setDisconnecting(connection)}><Unplug />{t("disconnect")}</Button></div>
            </CardContent>
          </Card>
        ))}
        {!isLoading && connections.filter((connection) => connection.status !== "DISCONNECTED").length === 0 && <Card className="border-dashed"><CardContent className="flex flex-col items-center py-14 text-center"><Landmark className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">{t("noConnections")}</p><p className="mt-1 text-sm text-muted-foreground">{t("noConnectionsHelp")}</p></CardContent></Card>}
      </section>

      <AlertDialog open={Boolean(disconnecting)} onOpenChange={(open) => { if (!open) setDisconnecting(null) }}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{t("disconnectTitle")}</AlertDialogTitle><AlertDialogDescription>{t("disconnectDescription")}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{t("cancel")}</AlertDialogCancel><AlertDialogAction onClick={() => void disconnect()}>{t("disconnectConfirm")}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </>
  )
}

function ConnectionStatus({ status }: { status: BankConnection["status"] }) {
  const { t } = useTranslation("banking")
  if (status === "AUTHORIZED") return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle2 />{t("authorized")}</Badge>
  if (status === "EXPIRED") return <Badge variant="outline">{t("expired")}</Badge>
  if (status === "ERROR") return <Badge variant="destructive">{t("connectionError")}</Badge>
  return <Badge variant="secondary">{t("disconnected")}</Badge>
}

function TransactionInbox() {
  const { t, i18n } = useTranslation("banking")
  const [transactions, setTransactions] = React.useState<BankTransaction[]>([])
  const [total, setTotal] = React.useState(0)
  const [hasMore, setHasMore] = React.useState(false)
  const [categories, setCategories] = React.useState<Record<number, number>>({})
  const [workingId, setWorkingId] = React.useState<number | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    api.banking.transactions().then((page) => { setTransactions(page.items); setTotal(page.total); setHasMore(page.has_more); setCategories(Object.fromEntries(page.items.map((item) => [item.id, item.suggested_category_id ?? 10]))) }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : t("loadError"))).finally(() => setIsLoading(false))
  }, [t])

  async function loadMore() {
    setIsLoadingMore(true); setError("")
    try {
      const page = await api.banking.transactions("PENDING", transactions.length)
      setTransactions((items) => [...items, ...page.items])
      setCategories((current) => ({ ...current, ...Object.fromEntries(page.items.map((item) => [item.id, item.suggested_category_id ?? 10])) }))
      setTotal(page.total); setHasMore(page.has_more)
    } catch (reason) { setError(reason instanceof Error ? reason.message : t("loadError")) }
    finally { setIsLoadingMore(false) }
  }

  async function importItem(transaction: BankTransaction) {
    setWorkingId(transaction.id); setError("")
    try { await api.banking.importTransaction(transaction.id, categories[transaction.id] ?? 10); setTransactions((items) => items.filter((item) => item.id !== transaction.id)); setTotal((count) => Math.max(0, count - 1)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("actionError")) }
    finally { setWorkingId(null) }
  }

  async function ignoreItem(transaction: BankTransaction) {
    setWorkingId(transaction.id); setError("")
    try { await api.banking.ignoreTransaction(transaction.id); setTransactions((items) => items.filter((item) => item.id !== transaction.id)); setTotal((count) => Math.max(0, count - 1)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("actionError")) }
    finally { setWorkingId(null) }
  }

  return (
    <>
      <PageHeader icon={Download} eyebrow={t("eyebrow")} title={t("inboxTitle")} description={t("inboxDescription")} />
      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground"><p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 size-4 shrink-0" />{t("importHelp")}</p></div>
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      <Card>
        <CardHeader><div className="flex items-center justify-between"><div><CardTitle>{t("pendingTitle")}</CardTitle><CardDescription>{t("pendingCount", { count: total })}</CardDescription></div><Download className="size-5 text-muted-foreground" /></div></CardHeader>
        <CardContent className="divide-y p-0">
          {transactions.map((transaction) => <div key={transaction.id} className="space-y-3 p-4 sm:p-5"><div className="flex items-start gap-3"><div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", transaction.direction === "DEBIT" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700")}>{transaction.direction === "DEBIT" ? <ArrowUpRight className="size-4" /> : <ArrowDownLeft className="size-4" />}</div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{transaction.merchant_name || t("unknownMerchant")}</p><Badge variant="outline">{t(transaction.direction === "DEBIT" ? "debit" : "credit")}</Badge><Badge variant="secondary">{t(transaction.booking_status === "BOOKED" ? "booked" : "pending")}</Badge></div><p className="mt-1 truncate text-xs text-muted-foreground">{transaction.booking_date} · {transaction.account_name || transaction.bank_name || t("account")}{transaction.iban_last4 ? ` •••• ${transaction.iban_last4}` : ""}{transaction.description ? ` · ${transaction.description}` : ""}</p></div><p className={cn("font-semibold tabular-nums", transaction.direction === "CREDIT" && "text-emerald-700")}>{transaction.direction === "DEBIT" ? "−" : "+"}{new Intl.NumberFormat(i18n.resolvedLanguage, { style: "currency", currency: transaction.currency }).format(Number(transaction.amount))}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end"><Button size="sm" variant="ghost" disabled={workingId === transaction.id} onClick={() => void ignoreItem(transaction)}>{t("ignore")}</Button>{transaction.direction === "DEBIT" && <><div className="w-full sm:w-56"><Select value={String(categories[transaction.id] ?? 10)} onValueChange={(value) => setCategories((current) => ({ ...current, [transaction.id]: Number(value) }))}><SelectTrigger aria-label={t("category")}><SelectValue /></SelectTrigger><SelectContent>{expenseCategoryOptions.map((option) => { const Icon = option.icon; return <SelectItem key={option.id} value={String(option.id)}><span className="flex items-center gap-2"><Icon className="size-4" />{t(option.nameKey, { ns: "core" })}</span></SelectItem> })}</SelectContent></Select></div><Button size="sm" disabled={workingId === transaction.id || transaction.booking_status !== "BOOKED"} onClick={() => void importItem(transaction)}>{workingId === transaction.id ? <LoaderCircle className="animate-spin" /> : <Download />}{workingId === transaction.id ? t("importing") : t("import")}</Button></>}</div></div>)}
          {!isLoading && hasMore && <div className="flex justify-center p-4"><Button variant="outline" disabled={isLoadingMore} onClick={() => void loadMore()}>{isLoadingMore && <LoaderCircle className="animate-spin" />}{isLoadingMore ? t("loadingMore") : t("loadMore")}</Button></div>}
          {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" />{t("loadingBanks")}</div>}
          {!isLoading && transactions.length === 0 && <div className="flex flex-col items-center p-12 text-center"><Download className="mb-3 size-8 text-muted-foreground" /><p className="font-medium">{t("noTransactions")}</p><p className="mt-1 max-w-sm text-sm text-muted-foreground">{t("noTransactionsHelp")}</p></div>}
        </CardContent>
      </Card>
    </>
  )
}

function BankConnectionCallback() {
  const { t } = useTranslation("banking")
  const navigate = useNavigate()
  const started = React.useRef(false)
  const callback = React.useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    return {
      code: params.get("code"),
      state: params.get("state"),
      error: params.get("error_description") || params.get("error"),
    }
  }, [])
  const hasValidCallback = Boolean(callback.code && callback.state && !callback.error)
  const [status, setStatus] = React.useState<"loading" | "success" | "error">(hasValidCallback ? "loading" : "error")
  const [message, setMessage] = React.useState(callback.error || (hasValidCallback ? "" : t("callbackError")))

  React.useEffect(() => {
    if (started.current) return
    started.current = true
    if (!hasValidCallback || !callback.code || !callback.state) return
    api.banking.completeConnection(callback.code, callback.state)
      .then(() => { setStatus("success"); setMessage(t("callbackSuccess")) })
      .catch((reason: unknown) => { setStatus("error"); setMessage(reason instanceof Error ? reason.message : t("callbackError")) })
  }, [callback, hasValidCallback, t])

  return <div className="mx-auto flex min-h-[55vh] max-w-lg items-center"><Card className="w-full"><CardContent className="flex flex-col items-center py-12 text-center"><div className={cn("mb-4 flex size-12 items-center justify-center rounded-full", status === "success" ? "bg-emerald-100 text-emerald-700" : status === "error" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground")}>{status === "loading" ? <LoaderCircle className="animate-spin" /> : status === "success" ? <CheckCircle2 /> : <Unplug />}</div><h1 className="text-xl font-semibold">{t("callbackTitle")}</h1><p className="mt-2 text-sm text-muted-foreground">{status === "loading" ? t("callbackDescription") : message}</p>{status !== "loading" && <Button className="mt-6" onClick={() => navigate("/expenses/bank-accounts", { replace: true })}>{t("backToAccounts")}</Button>}</CardContent></Card></div>
}
