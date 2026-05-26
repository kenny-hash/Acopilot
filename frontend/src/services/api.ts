const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000'

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = options?.body instanceof FormData
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { ...(isFormData ? {} : { 'Content-Type': 'application/json' }), ...(options?.headers ?? {}) },
    ...options
  })

  if (!res.ok) {
    let detail = `API error ${res.status}`
    try {
      const data = (await res.json()) as { detail?: string }
      if (typeof data?.detail === 'string' && data.detail.trim()) detail = data.detail
    } catch {
      // ignore non-json response
    }
    throw new Error(detail)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}
