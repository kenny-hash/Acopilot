import { Fragment, useMemo, useState } from 'react'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Table } from '../components/ui/table'
import { Textarea } from '../components/ui/textarea'
import { parseApi, ParsedEndpoint } from '../services/parserService'

const exampleTemplate = `curl -X GET 'https://api.example.com/users?page=1' \\
  -H 'accept: application/json'`

export default function ApiParserPage() {
  const [content, setContent] = useState('')
  const [formatHint, setFormatHint] = useState('')
  const [items, setItems] = useState<ParsedEndpoint[]>([])
  const [warnings, setWarnings] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const canParse = useMemo(() => content.trim().length > 0 && !loading, [content, loading])

  const onParse = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await parseApi(content, formatHint || undefined)
      setItems(result.items ?? [])
      setWarnings(result.warnings ?? [])
      setExpandedRows({})
    } catch (e) {
      setItems([])
      setWarnings([])
      setError(e instanceof Error ? e.message : '解析失败')
    } finally {
      setLoading(false)
    }
  }

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <Card>
      <h2>API 解析</h2>
      <p className="tips">支持粘贴 OpenAPI JSON 或 cURL 命令，点击“解析”后生成接口清单。</p>
      <div className="form-grid">
        <Textarea placeholder="粘贴 OpenAPI JSON 或 cURL" value={content} onChange={(e) => setContent(e.target.value)} style={{ minHeight: 180 }} />
        <Input placeholder="formatHint（可选，如 openapi/json/curl）" value={formatHint} onChange={(e) => setFormatHint(e.target.value)} />
        <div className="action-row">
          <Button disabled={!canParse} onClick={() => void onParse()}>{loading ? '解析中...' : '解析'}</Button>
          <Button onClick={() => setContent(exampleTemplate)}>示例模板</Button>
          <Button onClick={() => { setContent(''); setFormatHint(''); setItems([]); setWarnings([]); setError('') }}>清空</Button>
        </div>
      </div>

      {warnings.length > 0 && (
        <div className="notice warning-notice">
          <strong>提示：</strong>
          <ul>
            {warnings.map((warning, idx) => (<li key={`${warning}-${idx}`}>{warning}</li>))}
          </ul>
        </div>
      )}

      {error && <p className="error-text">解析失败：{error}</p>}

      <Table>
        <thead><tr><th>Method</th><th>Path</th><th>Summary</th><th>详情</th></tr></thead>
        <tbody>
          {items.map((item, index) => (
            <Fragment key={`${item.method}-${item.path}-${index}`}>
              <tr>
                <td>{item.method}</td>
                <td>{item.path}</td>
                <td>{item.summary || '-'}</td>
                <td><Button onClick={() => toggleRow(index)}>{expandedRows[index] ? '收起' : '展开'}</Button></td>
              </tr>
              {expandedRows[index] && (
                <tr key={`detail-${item.method}-${item.path}-${index}`}>
                  <td colSpan={4}>
                    <div className="detail-block">
                      <h4>Params</h4>
                      <pre>{JSON.stringify(item.params ?? {}, null, 2)}</pre>
                      <h4>Body</h4>
                      <pre>{JSON.stringify(item.body ?? {}, null, 2)}</pre>
                      <h4>Responses</h4>
                      <pre>{JSON.stringify(item.responses ?? {}, null, 2)}</pre>
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
