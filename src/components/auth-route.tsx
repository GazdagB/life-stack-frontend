import { LoaderCircle } from "lucide-react"
import { Navigate, Outlet } from "react-router"

import { useAuth } from "src/lib/auth"

function AuthLoadingScreen() {
  return (
    <main className="flex min-h-svh items-center justify-center" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
        Checking your session…
      </div>
    </main>
  )
}

export function ProtectedRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuth()

  if (isCheckingAuth) return <AuthLoadingScreen />
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isCheckingAuth } = useAuth()

  if (isCheckingAuth) return <AuthLoadingScreen />
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />
}
