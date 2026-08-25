import {
  CarFront,
  Clapperboard,
  HeartPulse,
  House,
  Repeat2,
  Shapes,
  ShoppingBag,
  ShoppingBasket,
  Utensils,
  Zap,
} from "lucide-react"

export const expenseCategoryOptions = [
  { id: 1, name: "Housing", icon: House, color: "bg-blue-100 text-blue-700", border: "border-blue-300 bg-blue-50 text-blue-800", bar: "bg-blue-500" },
  { id: 2, name: "Utilities", icon: Zap, color: "bg-amber-100 text-amber-700", border: "border-amber-300 bg-amber-50 text-amber-800", bar: "bg-amber-500" },
  { id: 3, name: "Groceries", icon: ShoppingBasket, color: "bg-emerald-100 text-emerald-700", border: "border-emerald-300 bg-emerald-50 text-emerald-800", bar: "bg-emerald-500" },
  { id: 4, name: "Dining Out", icon: Utensils, color: "bg-orange-100 text-orange-700", border: "border-orange-300 bg-orange-50 text-orange-800", bar: "bg-orange-500" },
  { id: 5, name: "Transportation", icon: CarFront, color: "bg-violet-100 text-violet-700", border: "border-violet-300 bg-violet-50 text-violet-800", bar: "bg-violet-500" },
  { id: 6, name: "Healthcare", icon: HeartPulse, color: "bg-rose-100 text-rose-700", border: "border-rose-300 bg-rose-50 text-rose-800", bar: "bg-rose-500" },
  { id: 7, name: "Subscriptions", icon: Repeat2, color: "bg-cyan-100 text-cyan-700", border: "border-cyan-300 bg-cyan-50 text-cyan-800", bar: "bg-cyan-500" },
  { id: 8, name: "Entertainment", icon: Clapperboard, color: "bg-fuchsia-100 text-fuchsia-700", border: "border-fuchsia-300 bg-fuchsia-50 text-fuchsia-800", bar: "bg-fuchsia-500" },
  { id: 9, name: "Shopping", icon: ShoppingBag, color: "bg-pink-100 text-pink-700", border: "border-pink-300 bg-pink-50 text-pink-800", bar: "bg-pink-500" },
  { id: 10, name: "Other", icon: Shapes, color: "bg-slate-100 text-slate-700", border: "border-slate-300 bg-slate-50 text-slate-800", bar: "bg-slate-500" },
] as const

export function getExpenseCategory(id: number) {
  return expenseCategoryOptions.find((category) => category.id === id) ?? expenseCategoryOptions.at(-1)!
}
