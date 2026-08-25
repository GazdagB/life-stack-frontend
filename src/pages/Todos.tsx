import * as React from "react"
import { Check, Circle, LoaderCircle, Plus, Search, Trash2, X } from "lucide-react"
import { useLocation } from "react-router"

import { PageHeader } from "src/components/page-header"
import { Badge } from "src/components/ui/badge"
import { Button } from "src/components/ui/button"
import { Card, CardContent } from "src/components/ui/card"
import { Input } from "src/components/ui/input"
import { Textarea } from "src/components/ui/textarea"
import { api, type Todo, type TodoInput, type TodoPriority, type TodoStatus } from "src/lib/api"
import { cn } from "src/lib/utils"

const emptyTodo: TodoInput = { title: "", description: "", priority: "P3", status: "not_started", due_date: null, sort_order: 0, source: "manual" }
const priorityStyles: Record<TodoPriority, string> = {
  P1: "border-red-200 bg-red-50 text-red-700", P2: "border-orange-200 bg-orange-50 text-orange-700", P3: "border-amber-200 bg-amber-50 text-amber-700", P4: "border-blue-200 bg-blue-50 text-blue-700", P5: "border-slate-200 bg-slate-50 text-slate-600",
}

export default function Todos() {
  const location = useLocation()
  const [todos, setTodos] = React.useState<Todo[]>([])
  const [draft, setDraft] = React.useState<TodoInput>(emptyTodo)
  const [search, setSearch] = React.useState("")
  const [showForm, setShowForm] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [error, setError] = React.useState("")

  React.useEffect(() => { api.todos.list().then(setTodos).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load tasks.")).finally(() => setIsLoading(false)) }, [])

  const today = new Date().toISOString().slice(0, 10)
  const mode = location.pathname.endsWith("/today") ? "today" : location.pathname.endsWith("/completed") ? "completed" : "all"
  const filteredTodos = todos.filter((todo) => mode === "today" ? todo.due_date === today && todo.status !== "completed" : mode === "completed" ? todo.status === "completed" : true).filter((todo) => `${todo.title} ${todo.description}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => a.priority.localeCompare(b.priority) || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999"))
  const titles = { all: ["All tasks", "Everything on your plate, organized by priority."], today: ["Today", "A focused view of everything due today."], completed: ["Completed", "A record of the progress you have already made."] } as const

  async function createTodo(event: React.FormEvent) {
    event.preventDefault(); setError(""); setIsSaving(true)
    try { const created = await api.todos.create(draft); setTodos((current) => [created, ...current]); setDraft(emptyTodo); setShowForm(false) }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create the task.") }
    finally { setIsSaving(false) }
  }

  async function setStatus(todo: Todo, status: TodoStatus) {
    const previous = todos; setTodos((current) => current.map((item) => item.id === todo.id ? { ...item, status } : item))
    try { const updated = await api.todos.update(todo.id, { ...todo, status }); setTodos((current) => current.map((item) => item.id === todo.id ? updated : item)) }
    catch (reason) { setTodos(previous); setError(reason instanceof Error ? reason.message : "Could not update the task.") }
  }

  async function deleteTodo(id: number) {
    const previous = todos; setTodos((current) => current.filter((todo) => todo.id !== id))
    try { await api.todos.delete(id) }
    catch (reason) { setTodos(previous); setError(reason instanceof Error ? reason.message : "Could not delete the task.") }
  }

  return (
    <>
      <PageHeader eyebrow="Tasks" title={titles[mode][0]} description={titles[mode][1]} action={<Button onClick={() => setShowForm((value) => !value)}>{showForm ? <X /> : <Plus />}{showForm ? "Close" : "New task"}</Button>} />
      {showForm && (
        <Card><CardContent><form onSubmit={createTodo} className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
          <div className="space-y-2 lg:col-span-2"><label className="text-sm font-medium" htmlFor="todo-title">Task title</label><Input id="todo-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="What needs to happen?" required /></div>
          <div className="space-y-2 lg:row-span-2"><label className="text-sm font-medium" htmlFor="todo-priority">Priority</label><select id="todo-priority" className="h-8 w-full rounded-lg border bg-background px-2.5 text-sm" value={draft.priority} onChange={(event) => setDraft({ ...draft, priority: event.target.value as TodoPriority })}>{(["P1", "P2", "P3", "P4", "P5"] as const).map((priority) => <option key={priority}>{priority}</option>)}</select></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="todo-description">Description</label><Textarea id="todo-description" value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Add useful context…" /></div>
          <div className="space-y-2"><label className="text-sm font-medium" htmlFor="todo-due-date">Due date</label><Input id="todo-due-date" type="date" value={draft.due_date ?? ""} onChange={(event) => setDraft({ ...draft, due_date: event.target.value || null })} /></div>
          <div className="flex items-end lg:col-start-3"><Button type="submit" className="w-full" disabled={isSaving}>{isSaving && <LoaderCircle className="animate-spin" />}Create task</Button></div>
        </form></CardContent></Card>
      )}
      {error && <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}
      <div className="relative max-w-md"><Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tasks…" /></div>
      <Card><CardContent className="divide-y p-0">
        {filteredTodos.map((todo) => { const isCompleted = todo.status === "completed"; return (
          <div key={todo.id} className="group flex items-start gap-3 p-4 sm:p-5">
            <button type="button" onClick={() => void setStatus(todo, isCompleted ? "not_started" : "completed")} className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors", isCompleted && "border-foreground bg-foreground text-background")} aria-label={isCompleted ? "Mark task as open" : "Complete task"}>{isCompleted ? <Check className="size-3" /> : <Circle className="size-3 text-transparent" />}</button>
            <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className={cn("font-medium", isCompleted && "text-muted-foreground line-through")}>{todo.title}</p><Badge variant="outline" className={priorityStyles[todo.priority]}>{todo.priority}</Badge>{todo.status === "in_progress" && <Badge variant="secondary">In progress</Badge>}</div>{todo.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{todo.description}</p>}<p className="mt-2 text-xs text-muted-foreground">{todo.due_date ? `Due ${todo.due_date}` : "No due date"}</p></div>
            <Button variant="ghost" size="icon" className="opacity-60 sm:opacity-0 sm:group-hover:opacity-100" onClick={() => void deleteTodo(todo.id)} aria-label="Delete task"><Trash2 /></Button>
          </div>
        ) })}
        {isLoading && <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground"><LoaderCircle className="size-4 animate-spin" /> Loading tasks…</div>}
        {!isLoading && filteredTodos.length === 0 && <div className="p-12 text-center"><p className="font-medium">No tasks here</p><p className="mt-1 text-sm text-muted-foreground">Try another view or create a new task.</p></div>}
      </CardContent></Card>
    </>
  )
}

