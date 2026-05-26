import { request } from './api'

export interface TestEnvironment {
  id?: number
  name: string
  base_url: string
  auth_type: 'none' | 'bearer'
  token: string
  verify_tls: boolean
  timeout_seconds: number
  enabled: boolean
  description: string
}

export const environmentService = {
  list: () => request<TestEnvironment[]>('/environments'),
  create: (payload: TestEnvironment) => request<TestEnvironment>('/environments', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: TestEnvironment) => request<TestEnvironment>(`/environments/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/environments/${id}`, { method: 'DELETE' }),
}
