import * as React from "react"
import {
  AlertTriangle,
  Banknote,
  Building2,
  CheckCircle2,
  Download,
  FilePlus2,
  FileText,
  ImagePlus,
  LoaderCircle,
  Pencil,
  PenLine,
  Plus,
  ReceiptText,
  Search,
  Send,
  Trash2,
  Users,
} from "lucide-react"
import { useLocation } from "react-router"
import { useTranslation } from "react-i18next"
import type { TFunction } from "i18next"

import { PageHeader } from "src/components/page-header"
import { BusinessLogo } from "src/components/business-logo"
import { BusinessSignature } from "src/components/business-signature"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Label } from "src/components/ui/label"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "src/components/ui/sheet"
import { Textarea } from "src/components/ui/textarea"
import {
  api,
  type Business,
  type BusinessInput,
  type Client,
  type ClientInput,
  type Invoice,
  type InvoiceDisplayStatus,
  type InvoiceInput,
  type InvoiceItemInput,
  type InvoicePaymentInput,
  type InvoiceSummary,
} from "src/lib/api"
import { cn } from "src/lib/utils"

const today = () => {
  const date = new Date()
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}
const selectClass = "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
const invoiceUnits = [
  "service", "hour", "unit", "item", "piece", "flat_rate", "day", "week", "month", "year", "kilometer", "square_meter",
] as const

function invoiceUnitLabel(value: string, t: TFunction<"business">) {
  return invoiceUnits.includes(value as (typeof invoiceUnits)[number]) ? t(`units.${value}`) : value
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`)
  date.setDate(date.getDate() + days)
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-")
}

function currency(value: string | number, code: string) {
  return new Intl.NumberFormat(code === "HUF" ? "hu-HU" : "de-DE", { style: "currency", currency: code, maximumFractionDigits: code === "HUF" ? 0 : 2 }).format(Number(value))
}

function currencyBreakdown(invoices: InvoiceSummary[], value: (invoice: InvoiceSummary) => number) {
  const totals = new Map<string, number>()
  invoices.forEach((invoice) => totals.set(invoice.currency, (totals.get(invoice.currency) ?? 0) + value(invoice)))
  return [...totals.entries()].filter(([, amount]) => amount !== 0).map(([code, amount]) => currency(amount, code)).join(" · ") || currency(0, "EUR")
}

function formatDate(value: string, locale?: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`))
}

const statusStyles: Record<InvoiceDisplayStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200",
  ISSUED: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  PARTIALLY_PAID: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  PAID: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
  OVERDUE: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  CREDITED: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  CANCELLED: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200",
}

function StatusBadge({ status }: { status: InvoiceDisplayStatus }) {
  const { t } = useTranslation("business")
  return <Badge className={cn("border-0", statusStyles[status])}>{t(`statuses.${status}`)}</Badge>
}

function businessDraft(business?: Business): BusinessInput {
  return business ? {
    legal_name: business.legal_name, jurisdiction: business.jurisdiction, tax_number: business.tax_number,
    vat_id: business.vat_id, registration_number: business.registration_number, address_line1: business.address_line1,
    address_line2: business.address_line2, postal_code: business.postal_code, city: business.city,
    country_code: business.country_code, email: business.email, phone: business.phone, website: business.website, bank_name: business.bank_name,
    iban: business.iban, bic: business.bic, default_currency: business.default_currency,
    default_language: business.default_language, invoice_prefix: business.invoice_prefix,
    default_payment_terms_days: business.default_payment_terms_days, tax_exemption_note: business.tax_exemption_note,
    invoice_accent_color: business.invoice_accent_color, invoice_footer: business.invoice_footer,
    invoice_template: business.invoice_template, invoice_thank_you: business.invoice_thank_you,
  } : {
    legal_name: "", jurisdiction: "DE", tax_number: null, vat_id: null, registration_number: null,
    address_line1: null, address_line2: null, postal_code: null, city: null, country_code: "DE",
    email: null, phone: null, website: null, bank_name: null, iban: null, bic: null, default_currency: "EUR",
    default_language: "DE", invoice_prefix: "", default_payment_terms_days: 14, tax_exemption_note: null,
    invoice_accent_color: "#2563EB", invoice_footer: null, invoice_template: "MODERN", invoice_thank_you: null,
  }
}

function clientDraft(businessId: number, client?: Client): ClientInput {
  return client ? {
    business_id: client.business_id, name: client.name, client_type: client.client_type, segment: client.segment,
    contact_name: client.contact_name, email: client.email, phone: client.phone, tax_number: client.tax_number,
    vat_id: client.vat_id, address_line1: client.address_line1, address_line2: client.address_line2,
    postal_code: client.postal_code, city: client.city, country_code: client.country_code,
    notes: client.notes, active: client.active,
  } : {
    business_id: businessId, name: "", client_type: "BUSINESS", segment: "IT", contact_name: null,
    email: null, phone: null, tax_number: null, vat_id: null, address_line1: null, address_line2: null,
    postal_code: null, city: null, country_code: "DE", notes: null, active: true,
  }
}

function businessReady(business: Business) {
  const hasTaxIdentity = business.jurisdiction === "DE"
    ? Boolean(business.tax_number || business.vat_id)
    : Boolean(business.tax_number)
  return Boolean(hasTaxIdentity && business.address_line1 && business.postal_code && business.city)
}

function nextInvoiceNumber(business: Business) {
  const year = new Date().getFullYear()
  const sequence = business.invoice_number_year === year ? business.next_invoice_number : 1
  return business.invoice_prefix
    ? `${business.invoice_prefix}-${year}-${String(sequence).padStart(4, "0")}`
    : `${String(sequence).padStart(3, "0")}/${year}`
}

export default function BusinessHub() {
  const { t, i18n } = useTranslation("business")
  const location = useLocation()
  const mode = location.pathname.endsWith("/clients") ? "clients" : location.pathname.endsWith("/invoices") ? "invoices" : "overview"
  const [businesses, setBusinesses] = React.useState<Business[]>([])
  const [clients, setClients] = React.useState<Client[]>([])
  const [invoices, setInvoices] = React.useState<InvoiceSummary[]>([])
  const [businessFilter, setBusinessFilter] = React.useState<number | "ALL">("ALL")
  const [segmentFilter, setSegmentFilter] = React.useState("ALL")
  const [search, setSearch] = React.useState("")
  const [businessEditor, setBusinessEditor] = React.useState<Business | "NEW" | null>(null)
  const [clientEditor, setClientEditor] = React.useState<Client | "NEW" | null>(null)
  const [invoiceEditor, setInvoiceEditor] = React.useState<Invoice | "NEW" | null>(null)
  const [selectedInvoice, setSelectedInvoice] = React.useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isLoadingDetail, setIsLoadingDetail] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    let active = true
    Promise.all([api.businesses.list(), api.clients.list(), api.invoices.list()])
      .then(([nextBusinesses, nextClients, nextInvoices]) => {
        if (!active) return
        setBusinesses(nextBusinesses); setClients(nextClients); setInvoices(nextInvoices)
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : t("errors.load")) })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [t])

  const visibleClients = clients.filter((client) =>
    (businessFilter === "ALL" || client.business_id === businessFilter)
    && (segmentFilter === "ALL" || client.segment === segmentFilter)
    && `${client.name} ${client.contact_name ?? ""} ${client.email ?? ""} ${client.segment}`.toLowerCase().includes(search.toLowerCase()),
  )
  const visibleInvoices = invoices.filter((invoice) =>
    (businessFilter === "ALL" || invoice.business_id === businessFilter)
    && `${invoice.invoice_number ?? "draft"} ${invoice.client_name} ${invoice.business_name} ${invoice.segment}`.toLowerCase().includes(search.toLowerCase()),
  )
  const segments = [...new Set(clients.filter((client) => businessFilter === "ALL" || client.business_id === businessFilter).map((client) => client.segment))].sort()
  const openInvoices = invoices.filter((invoice) => invoice.invoice_type === "INVOICE" && ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(invoice.display_status))
  const paidInvoices = invoices.filter((invoice) => invoice.invoice_type === "INVOICE" && Number(invoice.amount_paid) > 0)
  const overdue = invoices.filter((invoice) => invoice.display_status === "OVERDUE")

  async function openInvoice(id: number) {
    setIsLoadingDetail(true); setError("")
    try { setSelectedInvoice(await api.invoices.get(id)) }
    catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.invoiceLoad")) }
    finally { setIsLoadingDetail(false) }
  }

  function replaceInvoice(invoice: Invoice) {
    setInvoices((current) => {
      const exists = current.some((item) => item.id === invoice.id)
      const updated = exists ? current.map((item) => item.id === invoice.id ? invoice : item) : [invoice, ...current]
      return invoice.invoice_type === "CREDIT_NOTE" && invoice.original_invoice_id
        ? updated.map((item) => item.id === invoice.original_invoice_id ? { ...item, status: "CREDITED", display_status: "CREDITED" } : item)
        : updated
    })
    setSelectedInvoice(invoice)
  }

  const page = { eyebrow: t(`pages.${mode}.eyebrow`), title: t(`pages.${mode}.title`), description: t(`pages.${mode}.description`) }

  return (
    <>
      <PageHeader {...page} action={mode === "overview"
        ? <Button onClick={() => setBusinessEditor("NEW")}><Plus />{t("addBusiness")}</Button>
        : mode === "clients"
          ? <Button onClick={() => setClientEditor("NEW")} disabled={businesses.length === 0}><Plus />{t("addClient")}</Button>
          : <Button onClick={() => setInvoiceEditor("NEW")} disabled={clients.filter((client) => client.active).length === 0}><FilePlus2 />{t("newInvoice")}</Button>} />
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

      {isLoading ? <LoadingCards /> : mode === "overview" ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title={t("collected")} value={currencyBreakdown(paidInvoices, (invoice) => Number(invoice.amount_paid))} note={t("collectedNote")} icon={CheckCircle2} />
            <MetricCard title={t("outstanding")} value={currencyBreakdown(openInvoices, (invoice) => Number(invoice.balance_due))} note={t("openInvoices", { count: openInvoices.length })} icon={Banknote} />
            <MetricCard title={t("overdue")} value={String(overdue.length)} note={overdue.length ? currencyBreakdown(overdue, (invoice) => Number(invoice.balance_due)) : t("nothingOverdue")} icon={AlertTriangle} tone={overdue.length ? "danger" : "default"} />
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {businesses.map((business) => {
              const readiness = businessReady(business)
              const count = clients.filter((client) => client.business_id === business.id).length
              return <Card key={business.id} className="overflow-hidden"><CardHeader><div className="flex items-start justify-between gap-4"><div className="flex items-start gap-3"><div className={cn("rounded-xl p-3", business.jurisdiction === "DE" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700")}><Building2 className="size-5" /></div><div><CardTitle>{business.legal_name}</CardTitle><CardDescription>{business.jurisdiction === "DE" ? t("germany") : t("hungary")} · {t("clientsCount", { count })} · {business.default_currency}</CardDescription></div></div><Badge variant={readiness ? "secondary" : "destructive"}>{readiness ? t("ready") : t("setup")}</Badge></div></CardHeader><CardContent className="space-y-4"><div className="grid grid-cols-2 gap-3 text-sm"><Detail label={t("taxIdentity")} value={business.tax_number ?? business.vat_id ?? t("missing")} /><Detail label={t("nextInvoice")} value={nextInvoiceNumber(business)} /><Detail label={t("registeredAddress")} value={[business.address_line1, business.postal_code, business.city].filter(Boolean).join(", ") || t("missing")} /><Detail label={t("bank")} value={business.iban ?? t("notConfigured")} /></div><div className="flex items-center justify-between border-t pt-4"><p className="text-xs text-muted-foreground">{business.jurisdiction === "DE" ? t("deCompliance") : t("huCompliance")}</p><Button variant="outline" size="sm" onClick={() => setBusinessEditor(business)}><Pencil />{t("edit")}</Button></div></CardContent></Card>
            })}
          </div>
        </>
      ) : mode === "clients" ? (
        <>
          <Filters businesses={businesses} businessFilter={businessFilter} setBusinessFilter={setBusinessFilter} search={search} setSearch={setSearch} placeholder={t("searchClients")} />
          <div className="flex flex-wrap gap-2"><Button size="sm" variant={segmentFilter === "ALL" ? "default" : "outline"} onClick={() => setSegmentFilter("ALL")}>{t("allSegments")}</Button>{segments.map((segment) => <Button key={segment} size="sm" variant={segmentFilter === segment ? "default" : "outline"} onClick={() => setSegmentFilter(segment)}>{segment}</Button>)}</div>
          <Card><CardContent className="divide-y p-0">
            {visibleClients.map((client) => { const business = businesses.find((item) => item.id === client.business_id); return <button key={client.id} type="button" onClick={() => setClientEditor(client)} className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 sm:p-5"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted"><Users className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{client.name}</p><Badge variant="secondary">{client.segment}</Badge>{!client.active && <Badge variant="outline">{t("inactive")}</Badge>}</div><p className="mt-1 truncate text-xs text-muted-foreground">{business?.legal_name} · {[client.contact_name, client.email, client.city].filter(Boolean).join(" · ") || t("contactIncomplete")}</p></div><Pencil className="size-4 text-muted-foreground" /></button> })}
            {visibleClients.length === 0 && <Empty icon={Users} title={t("noClients")} description={t("noClientsHelp")} />}
          </CardContent></Card>
        </>
      ) : (
        <>
          <Filters businesses={businesses} businessFilter={businessFilter} setBusinessFilter={setBusinessFilter} search={search} setSearch={setSearch} placeholder={t("searchInvoices")} />
          <Card><CardContent className="divide-y p-0">
            {visibleInvoices.map((invoice) => <button key={invoice.id} type="button" onClick={() => void openInvoice(invoice.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left transition-colors hover:bg-muted/50 sm:grid-cols-[150px_1fr_130px_140px] sm:p-5"><div><p className="font-mono text-sm font-medium">{invoice.invoice_number ?? t("draftNumber", { id: invoice.id })}</p><p className="mt-1 text-xs text-muted-foreground">{formatDate(invoice.issue_date, i18n.resolvedLanguage)}</p></div><div className="hidden min-w-0 sm:block"><p className="truncate font-medium">{invoice.client_name}</p><p className="truncate text-xs text-muted-foreground">{invoice.business_name} · {invoice.segment}</p></div><StatusBadge status={invoice.display_status} /><div className="text-right"><p className="font-semibold tabular-nums">{currency(invoice.total, invoice.currency)}</p>{Number(invoice.balance_due) > 0 && invoice.status !== "DRAFT" && <p className="text-xs text-muted-foreground">{currency(invoice.balance_due, invoice.currency)} {t("open")}</p>}</div></button>)}
            {visibleInvoices.length === 0 && <Empty icon={FileText} title={t("noInvoices")} description={t("noInvoicesHelp")} />}
          </CardContent></Card>
        </>
      )}

      {businessEditor && <BusinessEditor key={businessEditor === "NEW" ? "new" : businessEditor.id} business={businessEditor === "NEW" ? undefined : businessEditor} onClose={() => setBusinessEditor(null)} onSaved={(business) => { setBusinesses((current) => current.some((item) => item.id === business.id) ? current.map((item) => item.id === business.id ? business : item) : [...current, business]); setBusinessEditor(null) }} onDeleted={(id) => { setBusinesses((current) => current.filter((item) => item.id !== id)); setClients((current) => current.filter((item) => item.business_id !== id)); if (businessFilter === id) setBusinessFilter("ALL"); setBusinessEditor(null) }} />}
      {clientEditor && businesses.length > 0 && <ClientEditor key={clientEditor === "NEW" ? "new" : clientEditor.id} client={clientEditor === "NEW" ? undefined : clientEditor} businesses={businesses} initialBusinessId={businessFilter === "ALL" ? businesses[0].id : businessFilter} onClose={() => setClientEditor(null)} onSaved={(client) => { setClients((current) => current.some((item) => item.id === client.id) ? current.map((item) => item.id === client.id ? client : item) : [client, ...current]); setClientEditor(null) }} onDeleted={(id) => { setClients((current) => current.filter((item) => item.id !== id)); setClientEditor(null) }} />}
      {invoiceEditor && <InvoiceEditor key={invoiceEditor === "NEW" ? "new" : invoiceEditor.id} invoice={invoiceEditor === "NEW" ? undefined : invoiceEditor} businesses={businesses} clients={clients.filter((client) => client.active)} onClose={() => setInvoiceEditor(null)} onSaved={(invoice) => { replaceInvoice(invoice); setInvoiceEditor(null) }} />}
      {(selectedInvoice || isLoadingDetail) && <InvoiceDetail key={selectedInvoice?.id ?? "loading"} invoice={selectedInvoice} isLoading={isLoadingDetail} onClose={() => setSelectedInvoice(null)} onUpdated={replaceInvoice} onEdit={(invoice) => { setSelectedInvoice(null); setInvoiceEditor(invoice) }} onDeleted={(id) => { setInvoices((current) => current.filter((item) => item.id !== id)); setSelectedInvoice(null) }} />}
    </>
  )
}

function MetricCard({ title, value, note, icon: Icon, tone = "default" }: { title: string; value: string; note: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; tone?: "default" | "danger" }) {
  return <Card><CardHeader><div className="flex items-center justify-between"><CardDescription>{title}</CardDescription><Icon className={cn("size-4 text-muted-foreground", tone === "danger" && "text-destructive")} /></div></CardHeader><CardContent><p className="text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></CardContent></Card>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 truncate font-medium" title={value}>{value}</p></div>
}

function Filters({ businesses, businessFilter, setBusinessFilter, search, setSearch, placeholder }: { businesses: Business[]; businessFilter: number | "ALL"; setBusinessFilter: (value: number | "ALL") => void; search: string; setSearch: (value: string) => void; placeholder: string }) {
  const { t } = useTranslation("business")
  return <div className="grid gap-3 sm:grid-cols-[240px_1fr]"><select className={selectClass} value={businessFilter} onChange={(event) => setBusinessFilter(event.target.value === "ALL" ? "ALL" : Number(event.target.value))}><option value="ALL">{t("allBusinesses")}</option>{businesses.map((business) => <option key={business.id} value={business.id}>{business.legal_name}</option>)}</select><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} /></div></div>
}

function Empty({ icon: Icon, title, description }: { icon: React.ComponentType<React.SVGProps<SVGSVGElement>>; title: string; description: string }) {
  return <div className="flex flex-col items-center p-12 text-center"><div className="mb-3 rounded-xl bg-muted p-3"><Icon className="size-6 text-muted-foreground" /></div><p className="font-medium">{title}</p><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>
}

function LoadingCards() {
  return <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((item) => <Card key={item}><CardContent><div className="h-28 animate-pulse rounded-xl bg-muted" /></CardContent></Card>)}</div>
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return <div className={cn("space-y-2", className)}><Label>{label}</Label>{children}</div>
}

function BusinessEditor({ business, onClose, onSaved, onDeleted }: { business?: Business; onClose: () => void; onSaved: (business: Business) => void; onDeleted: (id: number) => void }) {
  const { t } = useTranslation("business")
  const [draft, setDraft] = React.useState(() => businessDraft(business))
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [removeLogo, setRemoveLogo] = React.useState(false)
  const [signatureFile, setSignatureFile] = React.useState<File | null>(null)
  const [signaturePreview, setSignaturePreview] = React.useState<string | null>(null)
  const [removeSignature, setRemoveSignature] = React.useState(false)
  const set = <K extends keyof BusinessInput>(key: K, value: BusinessInput[K]) => setDraft((current) => ({ ...current, [key]: value }))
  React.useEffect(() => () => { if (logoPreview) URL.revokeObjectURL(logoPreview) }, [logoPreview])
  React.useEffect(() => () => { if (signaturePreview) URL.revokeObjectURL(signaturePreview) }, [signaturePreview])
  async function save(event: React.FormEvent) {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      let updated = business ? await api.businesses.update(business.id, draft) : await api.businesses.create(draft)
      if (logoFile) updated = await api.businesses.uploadLogo(updated.id, logoFile)
      else if (removeLogo && updated.logo_asset_id) updated = await api.businesses.deleteLogo(updated.id)
      if (signatureFile) updated = await api.businesses.uploadSignature(updated.id, signatureFile)
      else if (removeSignature && updated.signature_asset_id) updated = await api.businesses.deleteSignature(updated.id)
      onSaved(updated)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("errors.businessSave"))
    } finally {
      setIsSaving(false)
    }
  }
  function selectLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError(t("media.invalidLogo"))
      return
    }
    setError("")
    setLogoFile(file)
    setRemoveLogo(false)
    setLogoPreview(URL.createObjectURL(file))
  }
  function clearLogo() {
    setLogoFile(null)
    setLogoPreview(null)
    setRemoveLogo(true)
  }
  function selectSignature(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError(t("media.invalidSignature"))
      return
    }
    setError("")
    setSignatureFile(file)
    setRemoveSignature(false)
    setSignaturePreview(URL.createObjectURL(file))
  }
  function clearSignature() {
    setSignatureFile(null)
    setSignaturePreview(null)
    setRemoveSignature(true)
  }
  async function removeBusiness() {
    if (!business || !window.confirm(t("media.confirmDelete", { name: business.legal_name }))) return
    setIsSaving(true)
    setError("")
    try {
      await api.businesses.delete(business.id)
      onDeleted(business.id)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t("errors.businessDelete"))
    } finally {
      setIsSaving(false)
    }
  }
  function changeJurisdiction(value: "DE" | "HU") { setDraft((current) => ({ ...current, jurisdiction: value, country_code: value, default_currency: value === "DE" ? "EUR" : "HUF", default_language: value })) }
  const hasVisibleLogo = Boolean(logoPreview || (business?.logo_asset_id && !removeLogo))
  const hasVisibleSignature = Boolean(signaturePreview || (business?.signature_asset_id && !removeSignature))
  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{business ? t("editor.editBusiness") : t("editor.addBusiness")}</SheetTitle>
          <SheetDescription>{t("editor.businessHelp")}</SheetDescription>
        </SheetHeader>
        <form onSubmit={save} className="space-y-6 px-4 pb-6">
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <section className="space-y-4 rounded-xl border bg-muted/20 p-4">
            <div>
              <h3 className="font-medium">{t("editor.branding")}</h3>
              <p className="text-xs text-muted-foreground">{t("editor.brandingHelp")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {logoPreview
                ? <div className="flex size-20 items-center justify-center overflow-hidden rounded-xl border bg-background"><img src={logoPreview} alt={t("media.logoAlt")} className="size-full object-contain p-2" /></div>
                : business && business.logo_asset_id && !removeLogo
                  ? <BusinessLogo business={business} className="size-20" />
                  : <div className="flex size-20 items-center justify-center rounded-xl border border-dashed bg-background"><ImagePlus className="size-6 text-muted-foreground" /></div>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild><label className="cursor-pointer"><ImagePlus />{hasVisibleLogo ? t("editor.changeLogo") : t("editor.uploadLogo")}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={selectLogo} /></label></Button>
                {hasVisibleLogo && <Button type="button" variant="outline" onClick={clearLogo}><Trash2 />{t("editor.remove")}</Button>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
              {signaturePreview
                ? <div className="flex h-20 w-44 items-center justify-center overflow-hidden rounded-xl border bg-white"><img src={signaturePreview} alt={t("media.signatureAlt")} className="size-full object-contain p-2" /></div>
                : business && business.signature_asset_id && !removeSignature
                  ? <BusinessSignature business={business} />
                  : <div className="flex h-20 w-44 items-center justify-center rounded-xl border border-dashed bg-white"><PenLine className="size-6 text-muted-foreground" /></div>}
              <div className="space-y-2"><p className="text-sm font-medium">{t("editor.signature")}</p><div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" asChild><label className="cursor-pointer"><PenLine />{hasVisibleSignature ? t("editor.changeSignature") : t("editor.uploadSignature")}<input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp" onChange={selectSignature} /></label></Button>
                {hasVisibleSignature && <Button type="button" variant="outline" onClick={clearSignature}><Trash2 />{t("editor.remove")}</Button>}
              </div><p className="text-xs text-muted-foreground">{t("editor.signatureHelp")}</p></div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label={t("editor.pdfTemplate")}><select className={selectClass} value={draft.invoice_template} onChange={(e) => set("invoice_template", e.target.value as BusinessInput["invoice_template"])}><option value="MODERN">{t("editor.modern")}</option><option value="CLASSIC">{t("editor.classic")}</option></select></FormField>
              <FormField label={t("editor.website")}><Input type="url" value={draft.website ?? ""} onChange={(e) => set("website", e.target.value || null)} placeholder="https://example.com" /></FormField>
              <FormField label={t("editor.accent")}><div className="grid grid-cols-[48px_1fr] gap-2"><Input type="color" className="p-1" value={draft.invoice_accent_color} onChange={(e) => set("invoice_accent_color", e.target.value.toUpperCase())} /><Input value={draft.invoice_accent_color} pattern="#[0-9A-Fa-f]{6}" onChange={(e) => set("invoice_accent_color", e.target.value.toUpperCase())} /></div></FormField>
              <FormField label={t("editor.thanks")}><Input value={draft.invoice_thank_you ?? ""} maxLength={300} onChange={(e) => set("invoice_thank_you", e.target.value || null)} placeholder="Vielen Dank für Ihren Auftrag!" /></FormField>
              <FormField label={t("editor.footer")} className="sm:col-span-2"><Textarea value={draft.invoice_footer ?? ""} maxLength={500} onChange={(e) => set("invoice_footer", e.target.value || null)} placeholder={t("editor.footerPlaceholder")} /></FormField>
            </div>
          </section>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t("editor.legalName")} className="sm:col-span-2"><Input value={draft.legal_name} onChange={(e) => set("legal_name", e.target.value)} required /></FormField>
            <FormField label={t("editor.jurisdiction")}><select className={selectClass} value={draft.jurisdiction} onChange={(e) => changeJurisdiction(e.target.value as "DE" | "HU")}><option value="DE">{t("germany")}</option><option value="HU">{t("hungary")}</option></select></FormField>
            <FormField label={t("editor.taxNumber")}><Input value={draft.tax_number ?? ""} onChange={(e) => set("tax_number", e.target.value || null)} required={draft.jurisdiction === "HU" || !draft.vat_id} /></FormField>
            <FormField label={t("editor.vatId")}><Input value={draft.vat_id ?? ""} onChange={(e) => set("vat_id", e.target.value || null)} required={draft.jurisdiction === "DE" && !draft.tax_number} /></FormField>
            <p className="text-xs text-muted-foreground sm:col-span-2">{draft.jurisdiction === "DE" ? t("editor.deTaxHelp") : t("editor.huTaxHelp")}</p>
            <FormField label={t("editor.registration")}><Input value={draft.registration_number ?? ""} onChange={(e) => set("registration_number", e.target.value || null)} /></FormField>
            <FormField label={t("editor.street")} className="sm:col-span-2"><Input value={draft.address_line1 ?? ""} onChange={(e) => set("address_line1", e.target.value || null)} required /></FormField>
            <FormField label={t("editor.address2")} className="sm:col-span-2"><Input value={draft.address_line2 ?? ""} onChange={(e) => set("address_line2", e.target.value || null)} /></FormField>
            <FormField label={t("editor.postal")}><Input value={draft.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value || null)} required /></FormField>
            <FormField label={t("editor.city")}><Input value={draft.city ?? ""} onChange={(e) => set("city", e.target.value || null)} required /></FormField>
            <FormField label={t("editor.countryCode")}><Input value={draft.country_code} maxLength={2} onChange={(e) => set("country_code", e.target.value.toUpperCase())} required /></FormField>
            <FormField label={t("editor.email")}><Input type="email" value={draft.email ?? ""} onChange={(e) => set("email", e.target.value || null)} /></FormField>
            <FormField label={t("editor.bankName")}><Input value={draft.bank_name ?? ""} onChange={(e) => set("bank_name", e.target.value || null)} /></FormField>
            <FormField label="IBAN"><Input value={draft.iban ?? ""} onChange={(e) => set("iban", e.target.value || null)} /></FormField>
            <FormField label="BIC"><Input value={draft.bic ?? ""} onChange={(e) => set("bic", e.target.value || null)} /></FormField>
            <FormField label={t("editor.invoicePrefix")}><Input value={draft.invoice_prefix} onChange={(e) => set("invoice_prefix", e.target.value.toUpperCase())} placeholder={t("editor.prefixPlaceholder")} /></FormField>
            <FormField label={t("editor.paymentTerms")}><Input type="number" min="0" max="365" value={draft.default_payment_terms_days} onChange={(e) => set("default_payment_terms_days", Number(e.target.value))} required /></FormField>
            <p className="text-xs text-muted-foreground sm:col-span-2">{t("editor.prefixHelp")}</p>
            <FormField label={t("editor.taxExemption")} className="sm:col-span-2"><Textarea value={draft.tax_exemption_note ?? ""} onChange={(e) => set("tax_exemption_note", e.target.value || null)} placeholder={t("editor.taxExemptionPlaceholder")} /></FormField>
          </div>
          <SheetFooter className="justify-between sm:justify-between">
            {business ? <Button type="button" variant="destructive" onClick={() => void removeBusiness()} disabled={isSaving}><Trash2 />{t("editor.deleteBusiness")}</Button> : <span />}
            <div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("editor.cancel")}</Button><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{t("editor.saveBusiness")}</Button></div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function ClientEditor({ client, businesses, initialBusinessId, onClose, onSaved, onDeleted }: { client?: Client; businesses: Business[]; initialBusinessId: number; onClose: () => void; onSaved: (client: Client) => void; onDeleted: (id: number) => void }) {
  const { t } = useTranslation("business")
  const [draft, setDraft] = React.useState(() => clientDraft(initialBusinessId, client))
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const set = <K extends keyof ClientInput>(key: K, value: ClientInput[K]) => setDraft((current) => ({ ...current, [key]: value }))
  async function save(event: React.FormEvent) { event.preventDefault(); setIsSaving(true); setError(""); try { onSaved(client ? await api.clients.update(client.id, draft) : await api.clients.create(draft)) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.clientSave")) } finally { setIsSaving(false) } }
  async function remove() { if (!client) return; setIsSaving(true); setError(""); try { await api.clients.delete(client.id); onDeleted(client.id) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.clientDelete")) } finally { setIsSaving(false) } }
  return <Sheet open onOpenChange={(open) => { if (!open) onClose() }}><SheetContent className="overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{client ? t("client.edit") : t("client.add")}</SheetTitle><SheetDescription>{t("client.help")}</SheetDescription></SheetHeader><form onSubmit={save} className="space-y-6 px-4 pb-6">{error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="grid gap-4 sm:grid-cols-2"><FormField label={t("client.business")} className="sm:col-span-2"><select className={selectClass} value={draft.business_id} onChange={(e) => set("business_id", Number(e.target.value))}>{businesses.map((business) => <option key={business.id} value={business.id}>{business.legal_name}</option>)}</select></FormField><FormField label={t("client.name")} className="sm:col-span-2"><Input value={draft.name} onChange={(e) => set("name", e.target.value)} required /></FormField><FormField label={t("client.type")}><select className={selectClass} value={draft.client_type} onChange={(e) => set("client_type", e.target.value as ClientInput["client_type"])}><option value="BUSINESS">{t("client.businessType")}</option><option value="PRIVATE">{t("client.privateType")}</option></select></FormField><FormField label={t("client.segment")}><Input value={draft.segment} onChange={(e) => set("segment", e.target.value)} placeholder={t("client.segmentPlaceholder")} required /></FormField><FormField label={t("client.contact")}><Input value={draft.contact_name ?? ""} onChange={(e) => set("contact_name", e.target.value || null)} /></FormField><FormField label={t("editor.email")}><Input type="email" value={draft.email ?? ""} onChange={(e) => set("email", e.target.value || null)} /></FormField><FormField label={t("editor.phone")}><Input value={draft.phone ?? ""} onChange={(e) => set("phone", e.target.value || null)} /></FormField><FormField label={t("editor.taxNumber")}><Input value={draft.tax_number ?? ""} onChange={(e) => set("tax_number", e.target.value || null)} /></FormField><FormField label={t("editor.vatId")}><Input value={draft.vat_id ?? ""} onChange={(e) => set("vat_id", e.target.value || null)} /></FormField><FormField label={t("editor.street")} className="sm:col-span-2"><Input value={draft.address_line1 ?? ""} onChange={(e) => set("address_line1", e.target.value || null)} /></FormField><FormField label={t("editor.postal")}><Input value={draft.postal_code ?? ""} onChange={(e) => set("postal_code", e.target.value || null)} /></FormField><FormField label={t("editor.city")}><Input value={draft.city ?? ""} onChange={(e) => set("city", e.target.value || null)} /></FormField><FormField label={t("editor.countryCode")}><Input value={draft.country_code} maxLength={2} onChange={(e) => set("country_code", e.target.value.toUpperCase())} /></FormField><FormField label={t("client.notes")} className="sm:col-span-2"><Textarea value={draft.notes ?? ""} onChange={(e) => set("notes", e.target.value || null)} /></FormField><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.active} onChange={(e) => set("active", e.target.checked)} />{t("client.active")}</label></div><SheetFooter className="justify-between sm:justify-between">{client ? <Button type="button" variant="destructive" onClick={() => void remove()} disabled={isSaving}><Trash2 />{t("client.delete")}</Button> : <span />}<div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose}>{t("editor.cancel")}</Button><Button type="submit" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}{t("client.save")}</Button></div></SheetFooter></form></SheetContent></Sheet>
}

function invoiceDraft(businesses: Business[], clients: Client[], invoice?: Invoice): InvoiceInput {
  if (invoice) return { business_id: invoice.business_id, client_id: invoice.client_id, currency: invoice.currency, language: invoice.language, issue_date: invoice.issue_date, service_date: invoice.service_date, due_date: invoice.due_date, notes: invoice.notes, items: invoice.items.map((item) => ({ description: item.description, quantity: item.quantity, unit: item.unit, unit_price: item.unit_price, tax_rate: item.tax_rate })) }
  const business = businesses[0]
  const date = today()
  return { business_id: business?.id ?? 0, client_id: clients.find((client) => client.business_id === business?.id)?.id ?? 0, currency: business?.default_currency ?? "EUR", language: business?.default_language ?? "EN", issue_date: date, service_date: date, due_date: addDays(date, business?.default_payment_terms_days ?? 14), notes: null, items: [{ description: "", quantity: 1, unit: "service", unit_price: "", tax_rate: business?.jurisdiction === "HU" ? 27 : 19 }] }
}

function InvoiceEditor({ invoice, businesses, clients, onClose, onSaved }: { invoice?: Invoice; businesses: Business[]; clients: Client[]; onClose: () => void; onSaved: (invoice: Invoice) => void }) {
  const { t } = useTranslation("business")
  const [draft, setDraft] = React.useState(() => invoiceDraft(businesses, clients, invoice))
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")
  const availableClients = clients.filter((client) => client.business_id === draft.business_id)
  const total = draft.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0) * (1 + Number(item.tax_rate || 0) / 100), 0)
  function changeBusiness(id: number) { const business = businesses.find((item) => item.id === id)!; const client = clients.find((item) => item.business_id === id); setDraft((current) => ({ ...current, business_id: id, client_id: client?.id ?? 0, currency: business.default_currency, language: business.default_language, due_date: addDays(current.issue_date, business.default_payment_terms_days), items: current.items.map((item) => ({ ...item, tax_rate: business.jurisdiction === "HU" ? 27 : 19 })) })) }
  function changeItem(index: number, patch: Partial<InvoiceItemInput>) { setDraft((current) => ({ ...current, items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item) })) }
  async function save(event: React.FormEvent) { event.preventDefault(); setIsSaving(true); setError(""); try { onSaved(invoice ? await api.invoices.update(invoice.id, draft) : await api.invoices.create(draft)) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.invoiceSave")) } finally { setIsSaving(false) } }
  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="w-full gap-0 overflow-hidden sm:max-w-4xl">
        <SheetHeader className="shrink-0 border-b pr-12"><SheetTitle>{invoice ? t("invoice.editDraft") : t("invoice.new")}</SheetTitle><SheetDescription>{t("invoice.help")}</SheetDescription></SheetHeader>
        <form onSubmit={save} className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pb-24 pt-4">
          {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FormField label={t("invoice.issuingBusiness")} className="sm:col-span-2"><select className={selectClass} value={draft.business_id} onChange={(e) => changeBusiness(Number(e.target.value))}>{businesses.map((business) => <option key={business.id} value={business.id}>{business.legal_name}</option>)}</select></FormField>
            <FormField label={t("invoice.client")} className="sm:col-span-2"><select className={selectClass} value={draft.client_id} onChange={(e) => setDraft({ ...draft, client_id: Number(e.target.value) })} required><option value="0" disabled>{t("invoice.selectClient")}</option>{availableClients.map((client) => <option key={client.id} value={client.id}>{client.name} · {client.segment}</option>)}</select></FormField>
            <FormField label={t("invoice.issueDate")}><Input type="date" value={draft.issue_date} onChange={(e) => setDraft({ ...draft, issue_date: e.target.value })} required /></FormField>
            <FormField label={t("invoice.serviceDate")}><Input type="date" value={draft.service_date} onChange={(e) => setDraft({ ...draft, service_date: e.target.value })} required /></FormField>
            <FormField label={t("invoice.dueDate")}><Input type="date" min={draft.issue_date} value={draft.due_date} onChange={(e) => setDraft({ ...draft, due_date: e.target.value })} required /></FormField>
            <FormField label={t("invoice.currency")}><select className={selectClass} value={draft.currency} onChange={(e) => setDraft({ ...draft, currency: e.target.value as InvoiceInput["currency"] })}><option>EUR</option><option>HUF</option></select></FormField>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3"><div><h3 className="font-medium">{t("invoice.lineItems")}</h3><p className="text-xs text-muted-foreground">{t("invoice.lineHelp")}</p></div><Button type="button" size="sm" variant="outline" className="shrink-0" onClick={() => setDraft((current) => ({ ...current, items: [...current.items, { description: "", quantity: 1, unit: "service", unit_price: "", tax_rate: businesses.find((business) => business.id === current.business_id)?.jurisdiction === "HU" ? 27 : 19 }] }))}><Plus />{t("invoice.addLine")}</Button></div>
            {draft.items.map((item, index) => <div key={index} className="grid gap-3 rounded-xl border bg-muted/20 p-3 md:grid-cols-2 lg:grid-cols-[minmax(180px,1fr)_80px_110px_120px_90px_auto]">
              <Input className="md:col-span-2 lg:col-span-1" value={item.description} onChange={(e) => changeItem(index, { description: e.target.value })} placeholder={t("invoice.description")} aria-label={t("invoice.description")} required />
              <Input type="number" min="0.001" step="0.001" value={item.quantity} onChange={(e) => changeItem(index, { quantity: e.target.value })} placeholder={t("invoice.quantity")} aria-label={t("invoice.quantity")} required />
              <select className={selectClass} value={item.unit} onChange={(e) => changeItem(index, { unit: e.target.value })} aria-label={t("invoice.billingUnit")} required>{!invoiceUnits.includes(item.unit as (typeof invoiceUnits)[number]) && <option value={item.unit}>{t("units.existing", { unit: item.unit })}</option>}{invoiceUnits.map((unit) => <option key={unit} value={unit}>{t(`units.${unit}`)}</option>)}</select>
              <Input type="number" min="0" step="0.01" value={item.unit_price} onChange={(e) => changeItem(index, { unit_price: e.target.value })} placeholder={t("invoice.netPrice")} aria-label={t("invoice.netUnitPrice")} required />
              <div className="relative"><Input type="number" min="0" max="100" step="0.01" className="pr-7" value={item.tax_rate} onChange={(e) => changeItem(index, { tax_rate: e.target.value })} aria-label={t("invoice.taxRate")} required /><span className="absolute right-2 top-2 text-sm text-muted-foreground">%</span></div>
              <Button type="button" size="icon" variant="ghost" aria-label={t("invoice.removeLine")} disabled={draft.items.length === 1} onClick={() => setDraft((current) => ({ ...current, items: current.items.filter((_, itemIndex) => itemIndex !== index) }))}><Trash2 /></Button>
            </div>)}
          </div>
          <FormField label={t("invoice.notes")}><Textarea value={draft.notes ?? ""} onChange={(e) => setDraft({ ...draft, notes: e.target.value || null })} placeholder={t("invoice.notesPlaceholder")} /></FormField>
          <div className="flex items-center justify-between rounded-xl border bg-muted/30 p-4"><span className="text-sm text-muted-foreground">{t("invoice.estimated")}</span><span className="text-xl font-semibold tabular-nums">{currency(total, draft.currency)}</span></div>
          <SheetFooter className="sticky bottom-0 -mx-4 mt-0 flex-row justify-end border-t bg-popover px-4 py-3"><Button type="button" variant="outline" onClick={onClose}>{t("editor.cancel")}</Button><Button type="submit" disabled={isSaving || !draft.client_id}>{isSaving && <LoaderCircle className="animate-spin" />}{t("invoice.saveDraft")}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function InvoiceDetail({ invoice, isLoading, onClose, onUpdated, onEdit, onDeleted }: { invoice: Invoice | null; isLoading: boolean; onClose: () => void; onUpdated: (invoice: Invoice) => void; onEdit: (invoice: Invoice) => void; onDeleted: (id: number) => void }) {
  const { t, i18n } = useTranslation("business")
  const [working, setWorking] = React.useState(false)
  const [error, setError] = React.useState("")
  const [showPayment, setShowPayment] = React.useState(false)
  const [showCredit, setShowCredit] = React.useState(false)
  const [payment, setPayment] = React.useState<InvoicePaymentInput>({ amount: invoice?.balance_due ?? "", payment_date: today(), payment_method: "BANK_TRANSFER", reference: null, notes: null })
  const [creditReason, setCreditReason] = React.useState("")
  async function run(action: () => Promise<Invoice>) { setWorking(true); setError(""); try { onUpdated(await action()) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.action")) } finally { setWorking(false) } }
  async function download() { if (!invoice) return; setWorking(true); setError(""); try { const blob = await api.invoices.downloadPdf(invoice.id); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `${(invoice.invoice_number ?? "invoice").replaceAll("/", "-")}.pdf`; link.click(); URL.revokeObjectURL(url) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.pdf")) } finally { setWorking(false) } }
  async function remove() { if (!invoice) return; setWorking(true); try { await api.invoices.delete(invoice.id); onDeleted(invoice.id) } catch (reason) { setError(reason instanceof Error ? reason.message : t("errors.draftDelete")) } finally { setWorking(false) } }
  return <Sheet open onOpenChange={(open) => { if (!open) onClose() }}><SheetContent className="overflow-y-auto sm:max-w-2xl">{isLoading || !invoice ? <div className="flex h-full items-center justify-center"><LoaderCircle className="size-7 animate-spin" /></div> : <><SheetHeader><div className="flex items-start justify-between gap-4 pr-8"><div><SheetTitle>{invoice.invoice_number ?? t("invoice.draftTitle", { id: invoice.id })}</SheetTitle><SheetDescription>{invoice.client_name} · {invoice.business_name}</SheetDescription></div><StatusBadge status={invoice.display_status} /></div></SheetHeader><div className="space-y-6 px-4 pb-6">{error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}<div className="grid grid-cols-3 gap-3"><Detail label={t("invoice.issued")} value={formatDate(invoice.issue_date, i18n.resolvedLanguage)} /><Detail label={t("invoice.due")} value={formatDate(invoice.due_date, i18n.resolvedLanguage)} /><Detail label={t("invoice.compliance")} value={invoice.compliance_status.replaceAll("_", " ").toLowerCase()} /></div><div className="divide-y rounded-xl border">{invoice.items.map((item) => <div key={item.id} className="flex items-start justify-between gap-4 p-3 text-sm"><div><p className="font-medium">{item.description}</p><p className="text-xs text-muted-foreground">{Number(item.quantity)} {invoiceUnitLabel(item.unit, t)} × {currency(item.unit_price, invoice.currency)} · {Number(item.tax_rate)}% {t("invoice.tax")}</p></div><p className="font-medium tabular-nums">{currency(item.gross_total, invoice.currency)}</p></div>)}</div><div className="ml-auto max-w-xs space-y-2 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">{t("invoice.net")}</span><span>{currency(invoice.subtotal, invoice.currency)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">{t("invoice.totalTax")}</span><span>{currency(invoice.tax_total, invoice.currency)}</span></div><div className="flex justify-between border-t pt-2 text-base font-semibold"><span>{t("invoice.total")}</span><span>{currency(invoice.total, invoice.currency)}</span></div>{Number(invoice.amount_paid) > 0 && <><div className="flex justify-between text-emerald-700"><span>{t("invoice.paid")}</span><span>-{currency(invoice.amount_paid, invoice.currency)}</span></div><div className="flex justify-between font-semibold"><span>{t("invoice.balance")}</span><span>{currency(invoice.balance_due, invoice.currency)}</span></div></>}</div>{invoice.payments.length > 0 && <section><h3 className="mb-2 text-sm font-medium">{t("invoice.payments")}</h3><div className="divide-y rounded-xl border">{invoice.payments.map((item) => <div key={item.id} className="flex items-center justify-between p-3 text-sm"><div><p>{formatDate(item.payment_date, i18n.resolvedLanguage)} · {t(`invoice.methods.${item.payment_method}`)}</p><p className="text-xs text-muted-foreground">{item.reference || t("invoice.noReference")}</p></div><div className="flex items-center gap-2"><span className="font-medium">{currency(item.amount, invoice.currency)}</span><Button size="icon" variant="ghost" onClick={() => void run(() => api.invoices.deletePayment(invoice.id, item.id))}><Trash2 /></Button></div></div>)}</div></section>}{showPayment && <form onSubmit={(event) => { event.preventDefault(); void run(() => api.invoices.addPayment(invoice.id, payment)).then(() => setShowPayment(false)) }} className="space-y-3 rounded-xl border bg-muted/20 p-4"><h3 className="font-medium">{t("invoice.recordPayment")}</h3><div className="grid gap-3 sm:grid-cols-2"><FormField label={t("invoice.amount")}><Input type="number" min="0.01" max={Number(invoice.balance_due)} step="0.01" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} required /></FormField><FormField label={t("invoice.paymentDate")}><Input type="date" value={payment.payment_date} onChange={(e) => setPayment({ ...payment, payment_date: e.target.value })} required /></FormField><FormField label={t("invoice.method")}><select className={selectClass} value={payment.payment_method} onChange={(e) => setPayment({ ...payment, payment_method: e.target.value as InvoicePaymentInput["payment_method"] })}>{(["BANK_TRANSFER", "CASH", "CARD", "OTHER"] as const).map((method) => <option key={method} value={method}>{t(`invoice.methods.${method}`)}</option>)}</select></FormField><FormField label={t("invoice.reference")}><Input value={payment.reference ?? ""} onChange={(e) => setPayment({ ...payment, reference: e.target.value || null })} /></FormField></div><Button type="submit" disabled={working}>{t("invoice.savePayment")}</Button></form>}{showCredit && <form onSubmit={(event) => { event.preventDefault(); void run(() => api.invoices.credit(invoice.id, creditReason)).then(() => setShowCredit(false)) }} className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4"><h3 className="font-medium">{t("invoice.creditTitle")}</h3><p className="text-xs text-muted-foreground">{t("invoice.creditHelp")}</p><Textarea value={creditReason} minLength={3} onChange={(e) => setCreditReason(e.target.value)} placeholder={t("invoice.creditPlaceholder")} required /><Button type="submit" variant="destructive" disabled={working || creditReason.trim().length < 3}>{t("invoice.createCredit")}</Button></form>}<div className="flex flex-wrap justify-end gap-2 border-t pt-5">{invoice.status === "DRAFT" ? <><Button variant="destructive" onClick={() => void remove()} disabled={working}><Trash2 />{t("invoice.deleteDraft")}</Button><Button variant="outline" onClick={() => onEdit(invoice)}><Pencil />{t("invoice.edit")}</Button><Button onClick={() => void run(() => api.invoices.issue(invoice.id))} disabled={working}>{working ? <LoaderCircle className="animate-spin" /> : <Send />}{t("invoice.issue")}</Button></> : <><Button variant="outline" onClick={() => void download()} disabled={working}><Download />{t("invoice.download")}</Button>{["ISSUED", "PARTIALLY_PAID"].includes(invoice.status) && Number(invoice.balance_due) > 0 && <Button variant="outline" onClick={() => setShowPayment((current) => !current)}><Banknote />{t("invoice.recordPayment")}</Button>}{invoice.invoice_type === "INVOICE" && !["CREDITED", "CANCELLED"].includes(invoice.status) && <Button variant="outline" onClick={() => setShowCredit((current) => !current)}><ReceiptText />{t("invoice.credit")}</Button>}</>}</div></div></>}</SheetContent></Sheet>
}
