import { authenticatedFetch } from "src/lib/session-fetch"

export type UserProfile = {
  id: number | string
  username: string
  email: string
  display_name: string | null
  bio: string | null
  has_avatar: boolean
  preferred_language: AppLanguage
  created_at?: string
  updated_at?: string
}

export type AppLanguage = "en" | "de" | "hu"

export type ProfileInput = Pick<UserProfile, "username" | "email" | "display_name" | "bio">

export type AuthSession = {
  family_id: string
  expires_at: string
  last_used_at: string
  created_at: string
  user_agent: string | null
  is_current: boolean
  is_recognized_device: boolean
}

export type TodoStatus = "not_started" | "in_progress" | "completed" | "canceled"
export type TodoPriority = "P1" | "P2" | "P3" | "P4" | "P5"

export type Todo = {
  id: number
  title: string
  description: string
  priority: TodoPriority
  status: TodoStatus
  due_date: string | null
  created_at?: string
  updated_at?: string
  completed_at?: string | null
  sort_order: number
  source: "manual" | "cybro" | "import" | "system"
}

export type TodoInput = Pick<
  Todo,
  "title" | "description" | "priority" | "status" | "due_date" | "sort_order" | "source"
>

export type Expense = {
  id: number
  title: string
  amount: string | number
  expense_date: string
  category_id: number
  description?: string | null
  created_at?: string
  recurrence?: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
}

export type ExpenseInput = Pick<Expense, "title" | "amount" | "expense_date" | "category_id" | "description">

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
export type CancellationDifficulty = "EASY" | "NOTICE_REQUIRED" | "CONTRACT_LOCKED" | "NON_CANCELLABLE" | "ESSENTIAL"

export type RecurringExpense = {
  id: number
  title: string
  amount: string | number
  category_id: number
  frequency: RecurringFrequency
  start_date: string
  end_date: string | null
  cancellation_difficulty: CancellationDifficulty
  cancellable_from: string | null
  cancellation_notes: string | null
  active: boolean
  created_at?: string
  updated_at?: string
}

export type RecurringExpenseInput = Pick<
  RecurringExpense,
  "title" | "amount" | "category_id" | "frequency" | "start_date" | "end_date" | "cancellation_difficulty" | "cancellable_from" | "cancellation_notes" | "active"
>

export type RecurringCommitmentForecast = {
  recurring_expense_id: number
  included_in_coverage: boolean
  horizon_total: string | number
  horizon_payment_count: number
  daily_reserve: string | number
  weekly_reserve: string | number
  monthly_reserve: string | number
  remaining_total: string | number | null
  remaining_payment_count: number | null
  contract_total: string | number | null
  contract_payment_count: number | null
}

export type RecurringCoverage = {
  as_of: string
  through: string
  horizon_days: number
  totals: {
    daily_reserve: string | number
    weekly_reserve: string | number
    monthly_reserve: string | number
    horizon_total: string | number
  }
  commitments: RecurringCommitmentForecast[]
}

export type MovieListStatus = "WANT_TO_WATCH" | "WATCHED"

export type ExternalMovieRating = {
  source: string
  value: string
}

export type MovieSearchResult = {
  imdb_id: string
  title: string
  year: string | null
  poster_url: string | null
  library_id: number | null
  list_status: MovieListStatus | null
}

export type MovieDetails = MovieSearchResult & {
  plot: string | null
  director: string | null
  actors: string | null
  genre: string | null
  runtime: string | null
  content_rating: string | null
  released: string | null
  awards: string | null
  country: string | null
  language: string | null
  box_office: string | null
  external_ratings: ExternalMovieRating[]
}

export type UserMovie = Omit<MovieDetails, "library_id" | "list_status"> & {
  id: number
  list_status: MovieListStatus
  personal_rating: string | number | null
  critique: string | null
  watched_at: string | null
  created_at: string
  updated_at: string
}

export type UserMovieUpdate = Pick<UserMovie, "list_status" | "personal_rating" | "critique" | "watched_at">

export type MovieSearchResponse = {
  results: MovieSearchResult[]
  total_results: number
}

export type MovieRecommendation = MovieDetails & {
  recommendation_reason: string
  matched_preferences: string[]
  based_on: Array<{
    title: string
    personal_rating: string | number
  }>
}

export type MovieRecommendationsResponse = {
  recommendations: MovieRecommendation[]
}

export type Jurisdiction = "DE" | "HU"
export type InvoiceCurrency = "EUR" | "HUF"
export type InvoiceLanguage = "DE" | "HU" | "EN"
export type ClientType = "BUSINESS" | "PRIVATE"
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "CREDITED" | "CANCELLED"
export type InvoiceDisplayStatus = InvoiceStatus | "OVERDUE"
export type ComplianceStatus = "NOT_READY" | "NOT_REQUIRED" | "PENDING" | "SUBMITTED" | "ACCEPTED" | "REJECTED"

export type Business = {
  id: number
  legal_name: string
  jurisdiction: Jurisdiction
  tax_number: string | null
  vat_id: string | null
  registration_number: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  country_code: string
  email: string | null
  phone: string | null
  website: string | null
  bank_name: string | null
  iban: string | null
  bic: string | null
  default_currency: InvoiceCurrency
  default_language: InvoiceLanguage
  invoice_prefix: string
  next_invoice_number: number
  invoice_number_year: number
  default_payment_terms_days: number
  tax_exemption_note: string | null
  invoice_accent_color: string
  invoice_footer: string | null
  invoice_template: "MODERN" | "CLASSIC"
  invoice_thank_you: string | null
  logo_asset_id: number | null
  signature_asset_id: number | null
  created_at: string
  updated_at: string
}

export type BusinessInput = Omit<Business, "id" | "next_invoice_number" | "invoice_number_year" | "logo_asset_id" | "signature_asset_id" | "created_at" | "updated_at">

export type Client = {
  id: number
  business_id: number
  name: string
  client_type: ClientType
  segment: string
  contact_name: string | null
  email: string | null
  phone: string | null
  tax_number: string | null
  vat_id: string | null
  address_line1: string | null
  address_line2: string | null
  postal_code: string | null
  city: string | null
  country_code: string
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at">

export type InvoiceItemInput = {
  description: string
  quantity: string | number
  unit: string
  unit_price: string | number
  tax_rate: string | number
}

export type InvoiceItem = InvoiceItemInput & {
  id: number
  invoice_id: number
  net_total: string | number
  tax_total: string | number
  gross_total: string | number
  sort_order: number
}

export type InvoicePayment = {
  id: number
  invoice_id: number
  amount: string | number
  payment_date: string
  payment_method: "BANK_TRANSFER" | "CASH" | "CARD" | "OTHER"
  reference: string | null
  notes: string | null
  created_at: string
}

export type InvoicePaymentInput = Omit<InvoicePayment, "id" | "invoice_id" | "created_at">

export type InvoiceInput = {
  business_id: number
  client_id: number
  currency: InvoiceCurrency
  language: InvoiceLanguage
  issue_date: string
  service_date: string
  due_date: string
  notes: string | null
  items: InvoiceItemInput[]
}

export type InvoiceSummary = {
  id: number
  business_id: number
  business_name: string
  jurisdiction: Jurisdiction
  client_id: number
  client_name: string
  segment: string
  original_invoice_id: number | null
  invoice_type: "INVOICE" | "CREDIT_NOTE"
  invoice_number: string | null
  status: InvoiceStatus
  display_status: InvoiceDisplayStatus
  compliance_status: ComplianceStatus
  currency: InvoiceCurrency
  language: InvoiceLanguage
  issue_date: string
  service_date: string
  due_date: string
  subtotal: string | number
  tax_total: string | number
  total: string | number
  amount_paid: string | number
  balance_due: string | number
  notes: string | null
  correction_reason: string | null
  issued_at: string | null
  created_at: string
  updated_at: string
}

export type Invoice = InvoiceSummary & {
  items: InvoiceItem[]
  payments: InvoicePayment[]
  business: Business
  client: Client
  seller_snapshot: Record<string, unknown> | null
  client_snapshot: Record<string, unknown> | null
}

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const hasJsonBody = Boolean(init?.body) && !(init?.body instanceof FormData)
  const response = await authenticatedFetch(path, {
    ...init,
    headers: {
      ...(hasJsonBody ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = "Something went wrong. Please try again."
    try {
      const body = (await response.json()) as { detail?: string | Array<{ msg?: string }> }
      if (typeof body.detail === "string") message = body.detail
      else if (Array.isArray(body.detail)) message = body.detail.map((item) => item.msg).filter(Boolean).join(" ") || message
    } catch {
      // Keep the fallback for non-JSON server responses.
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

async function apiBlobRequest(path: string): Promise<Blob> {
  const response = await authenticatedFetch(path)
  if (!response.ok) {
    let message = "Could not download the file."
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Keep the fallback for a non-JSON response.
    }
    throw new ApiError(message, response.status)
  }
  return response.blob()
}

export const api = {
  profile: {
    update: (input: ProfileInput) =>
      apiRequest<UserProfile>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    uploadAvatar: (file: File) => {
      const body = new FormData()
      body.append("avatar", file)
      return apiRequest<UserProfile>("/auth/profile/avatar", { method: "POST", body })
    },
    getAvatar: () => apiBlobRequest("/auth/profile/avatar"),
    deleteAvatar: () =>
      apiRequest<UserProfile>("/auth/profile/avatar", { method: "DELETE" }),
  },
  settings: {
    updateLanguage: (preferredLanguage: AppLanguage) =>
      apiRequest<UserProfile>("/auth/settings", {
        method: "PUT",
        body: JSON.stringify({ preferred_language: preferredLanguage }),
      }),
    listSessions: () => apiRequest<AuthSession[]>("/auth/sessions"),
    revokeSession: (familyId: string) =>
      apiRequest<{ message: string; current_session_revoked: boolean }>(`/auth/sessions/${familyId}`, {
        method: "DELETE",
      }),
    revokeOtherSessions: () =>
      apiRequest<{ message: string; revoked_count: number }>("/auth/sessions/revoke-others", {
        method: "POST",
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      apiRequest<{ message: string; revoked_sessions: number }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      }),
  },
  todos: {
    list: () => apiRequest<Todo[]>("/todos/"),
    create: async (input: TodoInput) => {
      const result = await apiRequest<Todo[] | Todo>("/todos/", {
        method: "POST",
        body: JSON.stringify(input),
      })
      return Array.isArray(result) ? result[0] : result
    },
    update: (id: number, input: TodoInput) =>
      apiRequest<Todo>(`/todos/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    delete: (id: number) => apiRequest<{ message: string }>(`/todos/${id}`, { method: "DELETE" }),
  },
  expenses: {
    list: async () => {
      const result = await apiRequest<{ expenses: Expense[] }>("/expenses/")
      return result.expenses
    },
    create: async (input: ExpenseInput) => {
      const result = await apiRequest<Expense[] | Expense>("/expenses/", {
        method: "POST",
        body: JSON.stringify(input),
      })
      return Array.isArray(result) ? result[0] : result
    },
    update: async (id: number, input: ExpenseInput) => {
      const result = await apiRequest<Expense[] | Expense>(`/expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      })
      return Array.isArray(result) ? result[0] : result
    },
    delete: (id: number) =>
      apiRequest<{ message: string; id: number }>(`/expenses/${id}`, { method: "DELETE" }),
  },
  recurringExpenses: {
    list: () => apiRequest<RecurringExpense[]>("/recurring-expenses/"),
    coverage: () => apiRequest<RecurringCoverage>("/recurring-expenses/coverage"),
    create: (input: RecurringExpenseInput) =>
      apiRequest<RecurringExpense>("/recurring-expenses/", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    update: (id: number, input: RecurringExpenseInput) =>
      apiRequest<RecurringExpense>(`/recurring-expenses/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    delete: (id: number) =>
      apiRequest<{ message: string; id: number }>(`/recurring-expenses/${id}`, { method: "DELETE" }),
  },
  movies: {
    search: (query: string, page = 1) =>
      apiRequest<MovieSearchResponse>(`/movies/search?q=${encodeURIComponent(query)}&page=${page}`),
    details: (imdbId: string) => apiRequest<MovieDetails>(`/movies/catalog/${imdbId}`),
    get: (id: number) => apiRequest<UserMovie>(`/movies/${id}`),
    list: (status?: MovieListStatus) =>
      apiRequest<UserMovie[]>(`/movies/${status ? `?list_status=${status}` : ""}`),
    recommend: () => apiRequest<MovieRecommendationsResponse>("/movies/recommendations", { method: "POST" }),
    add: (imdbId: string, listStatus: MovieListStatus) =>
      apiRequest<UserMovie>("/movies/", {
        method: "POST",
        body: JSON.stringify({ imdb_id: imdbId, list_status: listStatus }),
      }),
    update: (id: number, input: UserMovieUpdate) =>
      apiRequest<UserMovie>(`/movies/${id}`, {
        method: "PUT",
        body: JSON.stringify(input),
      }),
    delete: (id: number) =>
      apiRequest<{ message: string; id: number }>(`/movies/${id}`, { method: "DELETE" }),
  },
  businesses: {
    list: () => apiRequest<Business[]>("/businesses/"),
    create: (input: BusinessInput) => apiRequest<Business>("/businesses/", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: BusinessInput) => apiRequest<Business>(`/businesses/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    delete: (id: number) => apiRequest<{ message: string; id: number; legal_name: string }>(`/businesses/${id}`, { method: "DELETE" }),
    uploadLogo: (id: number, file: File) => {
      const body = new FormData()
      body.append("logo", file)
      return apiRequest<Business>(`/businesses/${id}/logo`, { method: "POST", body })
    },
    getLogo: (id: number) => apiBlobRequest(`/businesses/${id}/logo`),
    deleteLogo: (id: number) => apiRequest<Business>(`/businesses/${id}/logo`, { method: "DELETE" }),
    uploadSignature: (id: number, file: File) => {
      const body = new FormData()
      body.append("signature", file)
      return apiRequest<Business>(`/businesses/${id}/signature`, { method: "POST", body })
    },
    getSignature: (id: number) => apiBlobRequest(`/businesses/${id}/signature`),
    deleteSignature: (id: number) => apiRequest<Business>(`/businesses/${id}/signature`, { method: "DELETE" }),
  },
  clients: {
    list: (businessId?: number) => apiRequest<Client[]>(`/clients/${businessId ? `?business_id=${businessId}` : ""}`),
    create: (input: ClientInput) => apiRequest<Client>("/clients/", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: ClientInput) => apiRequest<Client>(`/clients/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    delete: (id: number) => apiRequest<{ message: string; id: number }>(`/clients/${id}`, { method: "DELETE" }),
  },
  invoices: {
    list: (businessId?: number) => apiRequest<InvoiceSummary[]>(`/invoices/${businessId ? `?business_id=${businessId}` : ""}`),
    get: (id: number) => apiRequest<Invoice>(`/invoices/${id}`),
    create: (input: InvoiceInput) => apiRequest<Invoice>("/invoices/", { method: "POST", body: JSON.stringify(input) }),
    update: (id: number, input: InvoiceInput) => apiRequest<Invoice>(`/invoices/${id}`, { method: "PUT", body: JSON.stringify(input) }),
    delete: (id: number) => apiRequest<{ message: string; id: number }>(`/invoices/${id}`, { method: "DELETE" }),
    issue: (id: number) => apiRequest<Invoice>(`/invoices/${id}/issue`, { method: "POST" }),
    addPayment: (id: number, input: InvoicePaymentInput) => apiRequest<Invoice>(`/invoices/${id}/payments`, { method: "POST", body: JSON.stringify(input) }),
    deletePayment: (id: number, paymentId: number) => apiRequest<Invoice>(`/invoices/${id}/payments/${paymentId}`, { method: "DELETE" }),
    credit: (id: number, reason: string) => apiRequest<Invoice>(`/invoices/${id}/credit`, { method: "POST", body: JSON.stringify({ reason }) }),
    downloadPdf: (id: number) => apiBlobRequest(`/invoices/${id}/pdf`),
  },
}

export const expenseCategories = [
  "Housing",
  "Utilities",
  "Groceries",
  "Dining Out",
  "Transportation",
  "Healthcare",
  "Subscriptions",
  "Entertainment",
  "Shopping",
  "Other",
  "Installment Payments",
  "Insurance",
  "Legal & Tax",
]
