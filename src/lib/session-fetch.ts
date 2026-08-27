export const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api"
export const AUTH_EXPIRED_EVENT = "life-stack:auth-expired"

let refreshPromise: Promise<boolean> | null = null

async function requestRefresh() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
    if (response.ok) return true
  } catch {
    // The auth provider handles the expired event below.
  }

  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT))
  return false
}

async function refreshSession() {
  if (!refreshPromise) {
    const refresh = async () => {
      if ("locks" in navigator) {
        return navigator.locks.request("life-stack-session-refresh", requestRefresh)
      }
      return requestRefresh()
    }
    refreshPromise = refresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function authenticatedFetch(path: string, init?: RequestInit) {
  const request = () => fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...init,
  })
  const response = await request()

  if (response.status !== 401 || path === "/auth/refresh") return response
  if (!await refreshSession()) return response

  return request()
}
