import { request } from './api'

export interface CaseItem {
  id?: number
  name: string
  code: string
  precondition: string
  steps: string
  expected: string
}

export const caseService = {
  list: () => request<CaseItem[]>('/cases'),
  create: (payload: CaseItem) => request<CaseItem>('/cases', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: CaseItem) => request<CaseItem>(`/cases/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/cases/${id}`, { method: 'DELETE' })
}
