import { authenticatedFetch } from "src/lib/session-fetch"

export type UserProfile = {
  id: number | string
  username: string
  email: string
  display_name: string | null
  bio: string | null
  has_avatar: boolean
  created_at?: string
  updated_at?: string
}

export type ProfileInput = Pick<UserProfile, "username" | "email" | "display_name" | "bio">

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
  if (!response.ok) throw new ApiError("Could not load the profile picture.", response.status)
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
