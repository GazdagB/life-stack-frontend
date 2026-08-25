const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

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

export type ExpenseInput = Pick<Expense, "title" | "amount" | "expense_date" | "category_id">

export type RecurringFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"

export type RecurringExpense = {
  id: number
  title: string
  amount: string | number
  category_id: number
  frequency: RecurringFrequency
  start_date: string
  end_date: string | null
  active: boolean
  created_at?: string
  updated_at?: string
}

export type RecurringExpenseInput = Pick<
  RecurringExpense,
  "title" | "amount" | "category_id" | "frequency" | "start_date" | "end_date" | "active"
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

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let message = "Something went wrong. Please try again."
    try {
      const body = (await response.json()) as { detail?: string }
      if (body.detail) message = body.detail
    } catch {
      // Keep the fallback for non-JSON server responses.
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const api = {
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
