import { request } from './api'

export interface ParsedEndpoint {
  method: string
  path: string
  summary?: string
  params?: unknown
  body?: unknown
  responses?: unknown
}

export interface ParseApiResponse {
  items: ParsedEndpoint[]
  warnings?: string[]
}

interface ParseApiPayload {
  content: string
  format_hint?: string
}

export class ParseApiError extends Error {
  detail: string

  constructor(detail: string) {
    super(detail)
    this.detail = detail
  }
}

export async function parseApi(content: string, formatHint?: string): Promise<ParseApiResponse> {
  try {
    return await request<ParseApiResponse>('/parser/parse', {
      method: 'POST',
      body: JSON.stringify({ content, format_hint: formatHint } satisfies ParseApiPayload)
    })
  } catch (error) {
    const detail = error instanceof Error ? error.message : '解析失败'
    throw new ParseApiError(detail)
  }
}
