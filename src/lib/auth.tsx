import * as React from "react"

import type { UserProfile } from "src/lib/api"
import { API_BASE_URL, AUTH_EXPIRED_EVENT, authenticatedFetch } from "src/lib/session-fetch"

type AuthContextValue = {
  isAuthenticated: boolean
  isCheckingAuth: boolean
  user: AuthUser | null
  updateUser: (user: AuthUser) => void
  establishSession: () => Promise<boolean>
  logout: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export type AuthUser = UserProfile

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true)

  React.useEffect(() => {
    const controller = new AbortController()

    async function checkSession() {
      try {
        const response = await authenticatedFetch("/auth/me", {
          signal: controller.signal,
        })

        if (!response.ok) {
          setUser(null)
          return
        }

        setUser((await response.json()) as AuthUser)
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
        setUser(null)
      } finally {
        if (!controller.signal.aborted) setIsCheckingAuth(false)
      }
    }

    void checkSession()
    return () => controller.abort()
  }, [])

  React.useEffect(() => {
    const handleExpiredSession = () => setUser(null)
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpiredSession)
  }, [])

  async function establishSession() {
    try {
      const response = await authenticatedFetch("/auth/me")

      if (!response.ok) {
        setUser(null)
        return false
      }

      setUser((await response.json()) as AuthUser)
      return true
    } catch {
      setUser(null)
      return false
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: user !== null,
        isCheckingAuth,
        user,
        updateUser: setUser,
        establishSession,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// The provider and its hook intentionally share this module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = React.useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}
