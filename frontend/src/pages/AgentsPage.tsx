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
    <div className="page-stack">
      <div className="page-header">
        <div>
          <h2>Agent 配置</h2>
          <p>统一管理模型提供商、参数与启用状态。</p>
        </div>
        <div className="status-chip">共 {items.length} 个 Agent</div>
      </div>

      <Card>
      <h3>配置表单</h3>
      <p className="notice">当前版本不支持执行测试任务，仅支持配置与管理。</p>
      <p className="tips">可参考下方说明填写配置字段，避免字段含义不清导致配置错误。</p>
      <div className="form-grid two-col">
        <div className="field-item">
          <label className="field-label">Agent名称（agent_name）</label>
          <Input placeholder="如：qa-assistant" value={form.agent_name} onChange={(e) => setForm({ ...form, agent_name: e.target.value })} />
          <small className="field-help">用于区分不同Agent的显示名称，建议使用有业务含义的英文标识。</small>
        </div>

        <div className="field-item">
          <label className="field-label">服务提供商（provider）</label>
          <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })} options={[{ label: 'OpenAI', value: 'openai' }, { label: 'Azure', value: 'azure' }]} />
          <small className="field-help">选择模型来源平台，不同平台对应的模型名称格式可能不同。</small>
        </div>

        <div className="field-item">
          <label className="field-label">模型名称（model）</label>
          <Input placeholder="如：gpt-4o-mini" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <small className="field-help">填写平台实际可用的模型ID，需与provider匹配。</small>
        </div>

        <div className="field-item">
          <label className="field-label">随机性（temperature）</label>
          <Input placeholder="建议 0~1" type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: Number(e.target.value) })} />
          <small className="field-help">值越低回答越稳定，值越高回答越发散；常用范围 0~1。</small>
        </div>

        <div className="field-item">
          <label className="field-label">最大输出长度（max_tokens）</label>
          <Input placeholder="如：2048" type="number" value={form.max_tokens} onChange={(e) => setForm({ ...form, max_tokens: Number(e.target.value) })} />
          <small className="field-help">限制单次生成的最大token数，数值越大响应可能越长、成本越高。</small>
        </div>

        <div className="field-item">
          <label className="field-label">是否启用（enabled）</label>
          <Switch checked={form.enabled} onCheckedChange={(checked) => setForm({ ...form, enabled: checked })} />
          <small className="field-help">关闭后该Agent配置不会被用于业务流程。</small>
        </div>

        <div className="action-row">
          <Button onClick={() => void save()}>{editingId ? '更新配置' : '新增配置'}</Button>
          {editingId && <Button onClick={() => { setEditingId(null); setForm(emptyAgent) }}>取消编辑</Button>}
        </div>
      </div>
      </Card>

      <Card>
        <h3>Agent 列表</h3>
      <Table>
        <thead><tr><th>agent_name</th><th>provider</th><th>model</th><th>temperature</th><th>max_tokens</th><th>enabled</th><th>操作</th></tr></thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.agent_name}</td><td>{item.provider}</td><td>{item.model}</td><td>{item.temperature}</td><td>{item.max_tokens}</td><td>{item.enabled ? '是' : '否'}</td>
              <td><div className="action-row compact">
                <Button onClick={() => { setEditingId(item.id ?? null); setForm(item) }}>编辑</Button>
                <Button onClick={() => item.id && agentService.remove(item.id).then(refresh)}>删除</Button>
              </div></td>
            </tr>
          ))}
        </tbody>
      </Table>
      </Card>
    </div>
  )
}
