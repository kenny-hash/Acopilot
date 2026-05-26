import { useEffect, useState } from 'react'
import { AgentConfig, agentService } from '../services/agentService'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Select } from '../components/ui/select'
import { Switch } from '../components/ui/switch'
import { Table } from '../components/ui/table'

const emptyAgent: AgentConfig = {
  agent_name: '', provider: 'openai', model: '', temperature: 0.7, max_tokens: 2048, enabled: true
}

export default function AgentsPage() {
  const [items, setItems] = useState<AgentConfig[]>([])
  const [form, setForm] = useState<AgentConfig>(emptyAgent)
  const [editingId, setEditingId] = useState<number | null>(null)

  const refresh = async () => setItems(await agentService.list().catch(() => []))
  useEffect(() => { void refresh() }, [])

  const save = async () => {
    if (editingId) await agentService.update(editingId, form)
    else await agentService.create(form)
    setForm(emptyAgent)
    setEditingId(null)
    await refresh()
  }

  return (
    <Card>
      <h2>Agent配置</h2>
      <p className="notice">当前版本不支持执行测试任务，仅支持配置与管理。</p>
      <div className="form-grid">
        <Input placeholder="agent_name" value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} />
        <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })} options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Azure', value: 'azure' }]} />
        <Input placeholder="model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
        <Input placeholder="temperature" type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} />
        <Input placeholder="max_tokens" type="number" value={form.max_tokens} onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} />
        <Switch checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} />
        <Button onClick={() => void save()}>{editingId ? '更新' : '新增'}</Button>
      </div>
      <Table>
        <thead><tr><th>agent_name</th><th>provider</th><th>model</th><th>temperature</th><th>max_tokens</th><th>enabled</th><th>操作</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.agent_name}</td><td>{item.provider}</td><td>{item.model}</td><td>{item.temperature}</td><td>{item.max_tokens}</td><td>{item.enabled ? '是' : '否'}</td>
              <td>
                <Button onClick={() => { setEditingId(item.id ?? null); setForm(item) }}>编辑</Button>
                <Button onClick={() => item.id && agentService.remove(item.id).then(refresh)}>删除</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Card>
  )
}
