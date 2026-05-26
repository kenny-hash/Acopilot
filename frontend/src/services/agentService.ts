import { request } from './api'

export interface AgentConfig {
  id?: number
  agent_name: string
  provider: string
  model: string
  temperature: number
  max_tokens: number
  enabled: boolean
}

export const agentService = {
  list: () => request<AgentConfig[]>('/agents'),
  create: (payload: AgentConfig) => request<AgentConfig>('/agents', { method: 'POST', body: JSON.stringify(payload) }),
  update: (id: number, payload: AgentConfig) => request<AgentConfig>(`/agents/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  remove: (id: number) => request<void>(`/agents/${id}`, { method: 'DELETE' })
}
