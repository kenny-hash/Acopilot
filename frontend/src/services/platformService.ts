import { request } from './api'

export type TestCollection = { id?: number; name: string; version: string; source: string; status: string; description: string }
export type TestStrategy = { id?: number; name: string; strategy_type: string; collection_id: number; case_ids: number[]; risk_only: boolean }
export type TestTask = {
  id?: number; name: string; environment: string; collection_id: number; strategy_id?: number | null; case_ids: number[];
  allow_high_risk: boolean; auto_cleanup: boolean; retry_on_fail: boolean; status?: string; summary?: Record<string, number>
}

export const platformService = {
  listCollections: () => request<TestCollection[]>('/collections'),
  createCollection: (payload: TestCollection) => request<TestCollection>('/collections', { method: 'POST', body: JSON.stringify(payload) }),
  listStrategies: () => request<TestStrategy[]>('/strategies'),
  createStrategy: (payload: TestStrategy) => request<TestStrategy>('/strategies', { method: 'POST', body: JSON.stringify(payload) }),
  listTasks: () => request<TestTask[]>('/tasks'),
  runTask: (payload: TestTask) => request<TestTask>('/tasks', { method: 'POST', body: JSON.stringify(payload) }),
}
